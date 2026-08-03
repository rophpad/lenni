import { Prisma, type DailyPlan, type DailyTask, type TaskType } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Today's plan used to be written once, during onboarding, and never again —
 * so from the next day onward the dashboard showed an empty card forever.
 *
 * This builds the plan on demand, deterministically from roadmap state. No AI
 * call: the dashboard must never be empty and must never depend on a network
 * request that can fail or add a second of latency to a page render.
 */

/** Midnight of the user's local day, as the UTC instant Postgres `date` stores. */
export function planDateFor(timezone = "UTC"): Date {
  let ymd: string;
  try {
    ymd = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    ymd = new Date().toISOString().slice(0, 10);
  }
  return new Date(`${ymd}T00:00:00.000Z`);
}

type Draft = {
  type: TaskType;
  title: string;
  lessonId?: string;
  estimatedMinutes: number;
};

async function draftTasks(userId: string, budget: number): Promise<Draft[]> {
  const drafts: Draft[] = [];
  let remaining = budget;

  // 1. The lesson the learner is actually on.
  const progress = await prisma.lessonProgress.findFirst({
    where: { userId, status: { in: ["available", "in_progress"] } },
    orderBy: { updatedAt: "asc" },
  });
  const lesson = progress
    ? await prisma.lesson.findUnique({ where: { id: progress.lessonId } })
    : null;

  if (lesson) {
    const minutes = Math.max(10, Math.min(lesson.estimatedMinutes, budget));
    drafts.push({
      type: "lesson",
      title: `Complete today’s lesson — ${lesson.title}`,
      lessonId: lesson.id,
      estimatedMinutes: minutes,
    });
    remaining -= minutes;
  }

  // 2. Spaced review of the most recently finished lesson.
  if (remaining >= 10) {
    const done = await prisma.lessonProgress.findFirst({
      where: { userId, status: "completed" },
      orderBy: { completedAt: "desc" },
    });
    const reviewLesson = done
      ? await prisma.lesson.findUnique({ where: { id: done.lessonId } })
      : null;
    if (reviewLesson) {
      drafts.push({
        type: "review",
        title: `Review — ${reviewLesson.title}`,
        estimatedMinutes: 10,
      });
      remaining -= 10;
    }
  }

  // 3. Something to build, tied to the milestone in progress.
  if (remaining >= 10) {
    const roadmap = await prisma.roadmap.findFirst({
      where: { userId, status: "active" },
      orderBy: { version: "desc" },
    });
    const milestone = roadmap
      ? await prisma.milestone.findFirst({
          where: { roadmapId: roadmap.id, status: { not: "completed" } },
          orderBy: { position: "asc" },
        })
      : null;
    if (milestone) {
      drafts.push({
        type: "project",
        title: `Practice — apply what you learned to ${milestone.title}`,
        estimatedMinutes: Math.min(remaining, 20),
      });
    }
  }

  return drafts;
}

export async function ensureDailyPlan(
  userId: string,
): Promise<{ plan: DailyPlan | null; tasks: DailyTask[] }> {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  const planDate = planDateFor(profile?.timezone);

  const existing = await prisma.dailyPlan.findUnique({
    where: { userId_planDate: { userId, planDate } },
  });
  if (existing) {
    const tasks = await prisma.dailyTask.findMany({
      where: { dailyPlanId: existing.id },
      orderBy: { position: "asc" },
    });
    // A plan row with no tasks is as useless as no plan at all, so fall through
    // and fill it rather than returning an empty card.
    if (tasks.length) return { plan: existing, tasks };
  }

  const drafts = await draftTasks(userId, profile?.preferredDailyMinutes ?? 45);
  if (drafts.length === 0) return { plan: existing, tasks: [] };

  const plan =
    existing ??
    (await prisma.dailyPlan
      .create({
        data: {
          userId,
          planDate,
          estimatedMinutes: drafts.reduce((sum, d) => sum + d.estimatedMinutes, 0),
        },
      })
      // Another tab raced us to it; whoever won, reuse their row.
      .catch(async (error: unknown) => {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          return prisma.dailyPlan.findUniqueOrThrow({
            where: { userId_planDate: { userId, planDate } },
          });
        }
        throw error;
      }));

  try {
    await prisma.dailyTask.createMany({
      data: drafts.map((draft, position) => ({
        dailyPlanId: plan.id,
        type: draft.type,
        title: draft.title,
        lessonId: draft.lessonId,
        estimatedMinutes: draft.estimatedMinutes,
        position,
      })),
      skipDuplicates: true,
    });
  } catch (error) {
    // Losing the race here is fine — the winner's tasks are already there.
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
    )
      throw error;
  }

  const tasks = await prisma.dailyTask.findMany({
    where: { dailyPlanId: plan.id },
    orderBy: { position: "asc" },
  });
  return { plan, tasks };
}
