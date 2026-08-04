import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/session";
import type { LessonBlock } from "./lesson-blocks";
import { LessonPreparing } from "./lesson-preparing";
import { LessonView } from "./lesson-view";

function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export default async function LessonPage() {
  const session = await getSession();
  const progress = await prisma.lessonProgress.findFirst({
    where: { userId: session!.user.id, status: { in: ["available", "in_progress"] } },
    orderBy: { updatedAt: "asc" },
  });

  if (!progress)
    return (
      <div className="max-w-prose">
        <p className="mb-2 kicker text-accent">Lesson</p>
        <h1 className="font-display text-display-l font-bold">No lesson available</h1>
        <p className="mt-2 text-body-s text-subtle">
          Your next lesson will appear here when it is unlocked.
        </p>
      </div>
    );

  const lesson = await prisma.lesson.findUnique({ where: { id: progress.lessonId } });
  if (!lesson) return null;

  const body = (Array.isArray(lesson.body) ? lesson.body : []) as unknown as LessonBlock[];

  // Curriculum stub — the body has not been written yet.
  if (body.length === 0)
    return <LessonPreparing lessonId={lesson.id} title={lesson.title} />;

  const [module, exercises] = await Promise.all([
    prisma.module.findUnique({ where: { id: lesson.moduleId } }),
    prisma.exercise.findMany({ where: { lessonId: lesson.id }, orderBy: { position: "asc" } }),
  ]);
  const [milestone, options] = await Promise.all([
    module ? prisma.milestone.findUnique({ where: { id: module.milestoneId } }) : null,
    exercises.length
      ? prisma.exerciseOption.findMany({
          where: { exerciseId: { in: exercises.map(e => e.id) } },
          orderBy: [{ exerciseId: "asc" }, { position: "asc" }],
        })
      : [],
  ]);
  const moduleCount = milestone
    ? await prisma.module.count({ where: { milestoneId: milestone.id } })
    : 0;

  return (
    <LessonView
      context={`${milestone?.title ?? "Roadmap"} · Module ${(module?.position ?? 0) + 1} of ${moduleCount}`}
      exercises={exercises.map(exercise => ({
        id: exercise.id,
        prompt: exercise.prompt,
        hint: exercise.hint,
        explanation: exercise.explanation,
        options: options
          .filter(option => option.exerciseId === exercise.id)
          .map(option => ({ id: option.id, label: option.label })),
      }))}
      lesson={{
        id: lesson.id,
        title: lesson.title,
        minutes: lesson.estimatedMinutes,
        body,
        objectives: asStrings(lesson.objectives),
      }}
    />
  );
}
