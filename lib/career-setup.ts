import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { generateJson } from "./ai";
import { planDateFor } from "./daily-plan";
import { careerMeta } from "./careers";
import { careerPrompt } from "./prompts";
import { prisma } from "./prisma";

/**
 * Shared by first-time onboarding and by switching career goals later. Both
 * produce the same thing — a benchmark, a scored skill profile, and a roadmap
 * skeleton — the only difference is where the résumé text comes from.
 */

const level = z.enum(["novice", "beginner", "intermediate", "advanced", "expert"]);

export const careerPlanSchema = z.object({
  profile: z.object({
    currentJobTitle: z.string().nullable().optional(),
    yearsExperience: z.number().min(0).nullable().optional(),
    headline: z.string().nullable().optional(),
  }),
  skills: z
    .array(
      z.object({
        slug: z.string(),
        name: z.string(),
        category: z.string(),
        score: z.number().min(0).max(100),
        confidence: z.number().min(0).max(1),
        level,
        targetLevel: level,
        requirement: z.enum(["required", "preferred"]),
        weight: z.number().positive(),
        evidence: z.string(),
        missing: z.boolean(),
      }),
    )
    .min(5),
  milestones: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        modules: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              estimatedMinutes: z.number().int().positive(),
              lessons: z
                .array(
                  z.object({
                    slug: z.string(),
                    title: z.string(),
                    summary: z.string(),
                    estimatedMinutes: z.number().int().positive(),
                    objectives: z.array(z.string()).min(1).max(5),
                  }),
                )
                .min(1),
            }),
          )
          .min(1),
      }),
    )
    .min(3),
});

export type CareerPlan = z.infer<typeof careerPlanSchema>;

export { availableCareers, careerCatalog, type CareerCatalogEntry } from "./careers";

const SHAPE = `{ "profile": {"currentJobTitle": string|null,"yearsExperience":number|null,"headline":string|null}, "skills": [{"slug":string,"name":string,"category":string,"score":0-100,"confidence":0-1,"level":"novice|beginner|intermediate|advanced|expert","targetLevel":same,"requirement":"required|preferred","weight":number,"evidence":string,"missing":boolean}], "milestones": [{"title":string,"description":string,"modules":[{"title":string,"description":string,"estimatedMinutes":number,"lessons":[{"slug":string,"title":string,"summary":string,"estimatedMinutes":number,"objectives":[string]}]}]}] }`;

export async function generateCareerPlan(
  userId: string,
  careerSlug: string,
  evidence: unknown,
): Promise<CareerPlan> {
  const prompt = careerPrompt(careerSlug);
  const generationPrompt = `${prompt.benchmark}\n${prompt.profileAnalysis}\n${prompt.roadmap}
Treat every supplied ready source as candidate evidence. Resume, LinkedIn, GitHub, tracked profile data, and added job gaps must all influence the skill assessment and roadmap when present. Prefer concrete project and experience evidence over unsupported claims, never invent missing facts, and make job gaps explicit curriculum priorities.
Plan the curriculum only — do NOT write lesson content or exercises here.
For each lesson provide a specific title, a one-sentence summary of what it teaches, a realistic
estimatedMinutes (15-45), and 1-5 concrete learning objectives phrased as things the learner will
be able to DO afterwards. Lesson titles must be specific ("Validate a PSBT before signing"), never
generic ("Introduction", "Part 1", "Advanced topics").
Return this exact JSON shape: ${SHAPE}`;

  let raw = await generateJson<unknown>(userId, "profile_extraction", generationPrompt, {
    career: prompt.title,
    evidence,
  });
  let parsed = careerPlanSchema.safeParse(raw);
  if (!parsed.success) {
    raw = await generateJson<unknown>(
      userId,
      "profile_extraction",
      `${generationPrompt}\nThe previous response failed validation. Return a complete corrected response. Validation errors: ${JSON.stringify(parsed.error.issues)}`,
      { career: prompt.title, evidence, previousResponse: raw },
    );
    parsed = careerPlanSchema.safeParse(raw);
  }
  if (!parsed.success) throw parsed.error;
  return parsed.data;
}

type SourceInput =
  | { kind: "new"; fileName: string; checksum: string; text: string }
  | { kind: "existing"; id: string };

export async function applyCareerPlan({
  userId,
  careerSlug,
  plan,
  source,
  reason,
  generationContext,
}: {
  userId: string;
  careerSlug: string;
  plan: CareerPlan;
  source: SourceInput;
  reason: string;
  generationContext?: Record<string, unknown>;
}) {
  const career = careerPrompt(careerSlug);
  const meta = careerMeta(careerSlug);

  // Everything belonging to the roadmap being replaced, gathered before the
  // transaction so we can retire it cleanly.
  const previousRoadmap = await prisma.roadmap.findFirst({
    where: { userId, status: "active" },
    orderBy: { version: "desc" },
  });
  let previousLessonIds: string[] = [];
  if (previousRoadmap) {
    const milestones = await prisma.milestone.findMany({
      where: { roadmapId: previousRoadmap.id },
      select: { id: true },
    });
    const modules = milestones.length
      ? await prisma.module.findMany({
          where: { milestoneId: { in: milestones.map(m => m.id) } },
          select: { id: true },
        })
      : [];
    previousLessonIds = modules.length
      ? (
          await prisma.lesson.findMany({
            where: { moduleId: { in: modules.map(m => m.id) } },
            select: { id: true },
          })
        ).map(l => l.id)
      : [];
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { timezone: true },
  });
  const planDate = planDateFor(profile?.timezone);

  return prisma.$transaction(
    async tx => {
      const sourceId =
        source.kind === "existing"
          ? source.id
          : (
              await tx.profileSource.create({
                data: {
                  userId,
                  type: "resume",
                  status: "ready",
                  fileName: source.fileName,
                  storageKey: `database://${userId}/${source.checksum}`,
                  checksum: source.checksum,
                  parsedData: { text: source.text },
                  syncedAt: new Date(),
                },
              })
            ).id;

      await tx.profile.update({
        where: { userId },
        data: { ...plan.profile, onboardingCompletedAt: new Date() },
      });

      // Retire the outgoing goal and roadmap.
      if (previousRoadmap) {
        await tx.roadmap.update({
          where: { id: previousRoadmap.id },
          data: { status: "archived" },
        });
        // Otherwise /lesson and the daily plan keep serving the old career's
        // lesson, because both look up progress by status, not by roadmap.
        if (previousLessonIds.length)
          await tx.lessonProgress.updateMany({
            where: {
              userId,
              lessonId: { in: previousLessonIds },
              status: { in: ["available", "in_progress"] },
            },
            data: { status: "locked" },
          });
      }
      await tx.careerGoal.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });

      // Today's plan belongs to the old roadmap; drop it so the dashboard
      // rebuilds one against the new lessons.
      const stalePlan = await tx.dailyPlan.findUnique({
        where: { userId_planDate: { userId, planDate } },
      });
      if (stalePlan) {
        await tx.dailyTask.deleteMany({ where: { dailyPlanId: stalePlan.id } });
        await tx.dailyPlan.delete({ where: { id: stalePlan.id } });
      }

      const role = await tx.role.upsert({
        where: { slug: careerSlug },
        update: {},
        create: {
          slug: careerSlug,
          title: career.title,
          description: meta?.description,
          iconKey: meta?.iconKey,
          colorKey: meta?.colorKey,
        },
      });
      const goal = await tx.careerGoal.create({
        data: { userId, roleId: role.id, isActive: true },
      });

      for (const item of plan.skills) {
        const skill = await tx.skill.upsert({
          where: { slug: item.slug },
          update: { name: item.name, category: item.category },
          create: { slug: item.slug, name: item.name, category: item.category },
        });
        await tx.careerGoalSkill.create({
          data: {
            careerGoalId: goal.id,
            skillId: skill.id,
            requirement: item.requirement,
            targetLevel: item.targetLevel,
            weight: item.weight,
            rationale: item.evidence,
          },
        });
        await tx.userSkill.upsert({
          where: { userId_skillId: { userId, skillId: skill.id } },
          update: {
            score: item.score,
            confidence: item.confidence,
            level: item.level,
            lastAssessedAt: new Date(),
          },
          create: {
            userId,
            skillId: skill.id,
            score: item.score,
            confidence: item.confidence,
            level: item.level,
            lastAssessedAt: new Date(),
          },
        });
      }

      const roadmap = await tx.roadmap.create({
        data: {
          userId,
          careerGoalId: goal.id,
          previousRoadmapId: previousRoadmap?.id,
          title: `Become a ${career.title}`,
          status: "active",
          generationStatus: "succeeded",
          generationReason: reason,
          activatedAt: new Date(),
          generationContext: { ...generationContext, sourceId, careerSlug, evidenceSourceIds: generationContext?.evidenceSourceIds ?? [sourceId] } as Prisma.InputJsonValue,
        },
      });

      let firstLesson: string | null = null;
      for (let mi = 0; mi < plan.milestones.length; mi++) {
        const m = plan.milestones[mi];
        const milestone = await tx.milestone.create({
          data: {
            roadmapId: roadmap.id,
            title: m.title,
            description: m.description,
            position: mi,
            status: mi === 0 ? "available" : "locked",
          },
        });
        for (let mo = 0; mo < m.modules.length; mo++) {
          const mod = m.modules[mo];
          const module = await tx.module.create({
            data: {
              milestoneId: milestone.id,
              title: mod.title,
              description: mod.description,
              position: mo,
              estimatedMinutes: mod.estimatedMinutes,
              status: mi === 0 && mo === 0 ? "available" : "locked",
            },
          });
          for (let li = 0; li < mod.lessons.length; li++) {
            const lesson = mod.lessons[li];
            const saved = await tx.lesson.create({
              data: {
                moduleId: module.id,
                slug: lesson.slug,
                title: lesson.title,
                summary: lesson.summary,
                body: [],
                objectives: lesson.objectives,
                position: li,
                estimatedMinutes: lesson.estimatedMinutes,
              },
            });
            firstLesson ??= saved.id;
          }
        }
      }

      if (firstLesson)
        await tx.lessonProgress.upsert({
          where: { userId_lessonId: { userId, lessonId: firstLesson } },
          create: { userId, lessonId: firstLesson, status: "available" },
          update: { status: "available" },
        });

      await tx.streak.upsert({ where: { userId }, create: { userId }, update: {} });
      await tx.coachMessage.create({
        data: {
          userId,
          message: previousRoadmap
            ? `Your ${career.title} roadmap is ready. Anything you already proved carries over — the path starts from what you can do today.`
            : `Your ${career.title} roadmap is ready. Start with the first lesson—your path will adapt as you demonstrate new skills.`,
          triggerType: previousRoadmap ? "career_change" : "onboarding",
        },
      });

      return { roadmapId: roadmap.id, firstLesson };
    },
    { timeout: 60000 },
  );
}
