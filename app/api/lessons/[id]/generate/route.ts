import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson } from "../../../../../lib/ai";
import { careerPrompt, lessonPrompt } from "../../../../../lib/prompts";
import { prisma } from "../../../../../lib/prisma";
import { apiUser } from "../../../../../lib/session";

export const runtime = "nodejs";
export const maxDuration = 300;

const block = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: z.string().min(1) }),
  z.object({ type: z.literal("paragraph"), text: z.string().min(1) }),
  z.object({ type: z.literal("analogy"), text: z.string().min(1) }),
  z.object({
    type: z.literal("code"),
    language: z.string().default("text"),
    code: z.string().min(1),
    caption: z.string().nullish(),
  }),
  z.object({
    type: z.literal("list"),
    ordered: z.boolean().default(false),
    items: z.array(z.string().min(1)).min(2),
  }),
  z.object({
    type: z.literal("callout"),
    variant: z.enum(["tip", "warning", "insight"]).default("tip"),
    title: z.string().default(""),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal("example"),
    title: z.string().default("Worked example"),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal("takeaways"),
    items: z.array(z.string().min(1)).min(2),
  }),
]);

const schema = z.object({
  body: z.array(block).min(10),
  exercises: z
    .array(
      z.object({
        prompt: z.string().min(1),
        hint: z.string().default(""),
        explanation: z.string().min(1),
        options: z
          .array(z.object({ label: z.string().min(1), correct: z.boolean() }))
          .length(4)
          .refine(o => o.filter(x => x.correct).length === 1, {
            message: "exactly one option must be correct",
          }),
      }),
    )
    .min(1)
    .max(5),
});

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

    // Already written — nothing to do. Keeps double-submits and refreshes cheap.
    if (Array.isArray(lesson.body) && lesson.body.length > 0) {
      return NextResponse.json({ ok: true, cached: true });
    }

    // Only the owner of the roadmap this lesson belongs to may generate it.
    const module = await prisma.module.findUnique({ where: { id: lesson.moduleId } });
    const milestone = module
      ? await prisma.milestone.findUnique({ where: { id: module.milestoneId } })
      : null;
    const roadmap = milestone
      ? await prisma.roadmap.findUnique({ where: { id: milestone.roadmapId } })
      : null;
    if (!roadmap || roadmap.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const goal = await prisma.careerGoal.findFirst({
      where: { userId: user.id, isActive: true },
    });
    const role = goal?.roleId
      ? await prisma.role.findUnique({ where: { id: goal.roleId } })
      : null;
    const career = careerPrompt(role?.slug);

    // Prior lessons in this module, so the lesson can build on what came before
    // instead of re-teaching it.
    const earlier = await prisma.lesson.findMany({
      where: { moduleId: lesson.moduleId, position: { lt: lesson.position } },
      orderBy: { position: "asc" },
      select: { title: true, summary: true },
    });

    // Skills the learner already demonstrated — the lesson should not spend
    // paragraphs re-explaining these.
    const userSkills = await prisma.userSkill.findMany({
      where: { userId: user.id, score: { gte: 60 } },
      orderBy: { score: "desc" },
      take: 12,
    });
    const skillNames = userSkills.length
      ? (
          await prisma.skill.findMany({
            where: { id: { in: userSkills.map(s => s.skillId) } },
            select: { name: true },
          })
        ).map(s => s.name)
      : [];

    const output = schema.parse(
      await generateJson(
        user.id,
        "lesson_generation",
        lessonPrompt(career),
        {
          career: career.title,
          milestone: milestone?.title,
          module: { title: module?.title, description: module?.description },
          lesson: {
            title: lesson.title,
            summary: lesson.summary,
            objectives: lesson.objectives,
            estimatedMinutes: lesson.estimatedMinutes,
          },
          alreadyCoveredInThisModule: earlier,
          learnerAlreadyKnows: skillNames,
        },
        { effort: "medium", maxOutputTokens: 12000 },
      ),
    );

    await prisma.$transaction(
      async tx => {
        await tx.lesson.update({
          where: { id: lesson.id },
          data: { body: output.body, updatedAt: new Date() },
        });
        // Regenerating replaces any partial exercise set.
        await tx.exercise.deleteMany({ where: { lessonId: lesson.id } });
        for (let i = 0; i < output.exercises.length; i++) {
          const item = output.exercises[i];
          const exercise = await tx.exercise.create({
            data: {
              lessonId: lesson.id,
              prompt: item.prompt,
              hint: item.hint || null,
              explanation: item.explanation,
              position: i,
            },
          });
          for (let o = 0; o < item.options.length; o++) {
            await tx.exerciseOption.create({
              data: {
                exerciseId: exercise.id,
                label: item.options[o].label,
                isCorrect: item.options[o].correct,
                position: o,
              },
            });
          }
        }
      },
      { timeout: 30000 },
    );

    return NextResponse.json({ ok: true, blocks: output.body.length, exercises: output.exercises.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lesson generation failed" },
      { status: 400 },
    );
  }
}
