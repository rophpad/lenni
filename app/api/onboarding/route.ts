import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson } from "../../../lib/ai";
import { careerPrompt } from "../../../lib/prompts";
import { prisma } from "../../../lib/prisma";
import { apiUser } from "../../../lib/session";

export const runtime = "nodejs";
const resultSchema = z.object({
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
        level: z.enum([
          "novice",
          "beginner",
          "intermediate",
          "advanced",
          "expert",
        ]),
        targetLevel: z.enum([
          "novice",
          "beginner",
          "intermediate",
          "advanced",
          "expert",
        ]),
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
                    body: z.array(
                      z.object({
                        type: z.enum(["paragraph", "callout"]),
                        text: z.string(),
                      }),
                    ),
                    exercise: z.object({
                      prompt: z.string(),
                      explanation: z.string(),
                      options: z
                        .array(
                          z.object({ label: z.string(), correct: z.boolean() }),
                        )
                        .length(4),
                    }),
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

async function resumeText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (file.name.toLowerCase().endsWith(".pdf")) {
    const PDFParser = (await import("pdf2json")).default;
    return new Promise<string>((resolve, reject) => {
      const parser = new PDFParser(null, true);
      let settled = false;
      const settle = (callback: () => void) => {
        if (settled) return;
        settled = true;
        callback();
        parser.destroy();
      };
      parser.on("pdfParser_dataError", error => {
        const cause = error && typeof error === "object" && "parserError" in error ? error.parserError : error;
        settle(() => reject(cause instanceof Error ? cause : new Error(String(cause))));
      });
      parser.on("pdfParser_dataReady", () => settle(() => resolve(parser.getRawTextContent())));
      try {
        parser.parseBuffer(buffer, 0);
      } catch (error) {
        settle(() => reject(error));
      }
    });
  }
  if (/\.docx?$/i.test(file.name))
    return (await (await import("mammoth")).extractRawText({ buffer })).value;
  throw new Error("Only PDF, DOC, and DOCX résumés are supported");
}

export async function POST(request: Request) {
  const user = await apiUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("resume");
    const careerSlug = String(form.get("career") ?? "");
    if (!(file instanceof File) || file.size === 0 || file.size > 10_000_000)
      throw new Error("Choose a résumé up to 10MB");
    const text = (await resumeText(file)).slice(0, 60000);
    if (text.trim().length < 100)
      throw new Error("We could not read enough text from this résumé");
    const prompt = careerPrompt(careerSlug);
    const shape = `{ "profile": {"currentJobTitle": string|null,"yearsExperience":number|null,"headline":string|null}, "skills": [{"slug":string,"name":string,"category":string,"score":0-100,"confidence":0-1,"level":"novice|beginner|intermediate|advanced|expert","targetLevel":same,"requirement":"required|preferred","weight":number,"evidence":string,"missing":boolean}], "milestones": [{"title":string,"description":string,"modules":[{"title":string,"description":string,"estimatedMinutes":number,"lessons":[{"slug":string,"title":string,"summary":string,"estimatedMinutes":number,"body":[{"type":"paragraph|callout","text":string}],"exercise":{"prompt":string,"explanation":string,"options":[{"label":string,"correct":boolean},{"label":string,"correct":boolean},{"label":string,"correct":boolean},{"label":string,"correct":boolean}]}}]}]}] }`;
    const generationPrompt = `${prompt.benchmark}\n${prompt.profileAnalysis}\n${prompt.roadmap}\nEvery exercise must contain exactly four distinct options, with exactly one option marked correct.\nReturn this exact JSON shape: ${shape}`;
    let raw = await generateJson<unknown>(
      user.id,
      "profile_extraction",
      generationPrompt,
      { career: prompt.title, resumeText: text },
    );
    let parsed = resultSchema.safeParse(raw);
    if (!parsed.success) {
      raw = await generateJson<unknown>(
        user.id,
        "profile_extraction",
        `${generationPrompt}\nThe previous response failed validation. Return a complete corrected response. Validation errors: ${JSON.stringify(parsed.error.issues)}`,
        { career: prompt.title, resumeText: text, previousResponse: raw },
      );
      parsed = resultSchema.safeParse(raw);
    }
    if (!parsed.success) throw parsed.error;
    const result = parsed.data;
    const checksum = createHash("sha256").update(text).digest("hex");
    await prisma.$transaction(
      async (tx) => {
        const source = await tx.profileSource.create({
          data: {
            userId: user.id,
            type: "resume",
            status: "ready",
            fileName: file.name,
            storageKey: `database://${user.id}/${checksum}`,
            checksum,
            parsedData: { text },
            syncedAt: new Date(),
          },
        });
        await tx.profile.update({
          where: { userId: user.id },
          data: { ...result.profile, onboardingCompletedAt: new Date() },
        });
        await tx.careerGoal.updateMany({
          where: { userId: user.id, isActive: true },
          data: { isActive: false },
        });
        const role = await tx.role.upsert({
          where: { slug: careerSlug },
          update: {},
          create: {
            slug: careerSlug,
            title: prompt.title,
            description: careerSlug === "bitcoin-developer" ? "Build secure, open-source Bitcoin software" : "Build and deploy production AI systems",
            iconKey: careerSlug === "bitcoin-developer" ? "server" : "network",
            colorKey: careerSlug === "bitcoin-developer" ? "amber" : "blue",
          },
        });
        const goal = await tx.careerGoal.create({
          data: { userId: user.id, roleId: role.id, isActive: true },
        });
        for (const item of result.skills) {
          const skill = await tx.skill.upsert({
            where: { slug: item.slug },
            update: { name: item.name, category: item.category },
            create: {
              slug: item.slug,
              name: item.name,
              category: item.category,
            },
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
            where: { userId_skillId: { userId: user.id, skillId: skill.id } },
            update: {
              score: item.score,
              confidence: item.confidence,
              level: item.level,
              lastAssessedAt: new Date(),
            },
            create: {
              userId: user.id,
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
            userId: user.id,
            careerGoalId: goal.id,
            title: `Become a ${prompt.title}`,
            status: "active",
            generationStatus: "succeeded",
            generationReason: "Initial résumé analysis",
            activatedAt: new Date(),
            generationContext: { sourceId: source.id, careerSlug },
          },
        });
        let firstLesson: string | null = null;
        for (let mi = 0; mi < result.milestones.length; mi++) {
          const m = result.milestones[mi];
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
                  body: lesson.body,
                  position: li,
                  estimatedMinutes: lesson.estimatedMinutes,
                },
              });
              firstLesson ??= saved.id;
              const exercise = await tx.exercise.create({
                data: {
                  lessonId: saved.id,
                  prompt: lesson.exercise.prompt,
                  explanation: lesson.exercise.explanation,
                  position: 0,
                },
              });
              for (let oi = 0; oi < 4; oi++)
                await tx.exerciseOption.create({
                  data: {
                    exerciseId: exercise.id,
                    label: lesson.exercise.options[oi].label,
                    isCorrect: lesson.exercise.options[oi].correct,
                    position: oi,
                  },
                });
            }
          }
        }
        if (firstLesson) {
          await tx.lessonProgress.create({
            data: {
              userId: user.id,
              lessonId: firstLesson,
              status: "available",
            },
          });
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);
          const plan = await tx.dailyPlan.create({
            data: { userId: user.id, planDate: today, estimatedMinutes: 45 },
          });
          await tx.dailyTask.create({
            data: {
              dailyPlanId: plan.id,
              type: "lesson",
              title: `Start your first ${prompt.title} lesson`,
              lessonId: firstLesson,
              estimatedMinutes: 30,
              position: 0,
            },
          });
        }
        await tx.streak.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {},
        });
        await tx.coachMessage.create({
          data: {
            userId: user.id,
            message:
              `Your ${prompt.title} roadmap is ready. Start with the first lesson—your path will adapt as you demonstrate new skills.`,
            triggerType: "onboarding",
          },
        });
      },
      { timeout: 60000 },
    );
    return NextResponse.json({
      skills: result.skills.map((s) => ({ name: s.name, missing: s.missing })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Onboarding failed" },
      { status: 400 },
    );
  }
}
