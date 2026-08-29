"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LessonBody, type LessonBlock } from "./lesson-blocks";
import { ChatInterface } from "./chat-interface";

export type Exercise = {
  id: string;
  prompt: string;
  hint: string | null;
  explanation: string | null;
  options: Array<{ id: string; label: string }>;
};

type Result = { correct: boolean; correctOptionId: string; explanation: string | null };

/** One checkpoint question. The learner picks, then confirms — grading never
 *  fires on selection alone, so a mis-tap is not a wrong answer. */
function Checkpoint({
  exercise,
  index,
  total,
  onGraded,
}: {
  exercise: Exercise;
  index: number;
  total: number;
  onGraded: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [checking, setChecking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState("");

  async function check() {
    if (!selected || result || checking) return;
    setChecking(true);
    setError("");
    try {
      const response = await fetch(`/api/exercises/${exercise.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selected }),
      });
      if (!response.ok) throw new Error("Could not check that answer");
      const graded: Result = await response.json();
      setResult(graded);
      onGraded(graded.correct);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Something went wrong");
    } finally {
      setChecking(false);
    }
  }

  return (
    <section className="card min-w-0 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="kicker text-accent">
          Checkpoint {index + 1} of {total}
        </p>
        {result && (
          <span
            className={`rounded-chip px-2 py-1 kicker ${result.correct ? "bg-positive-subtle text-positive" : "bg-caution-subtle text-caution"}`}
          >
            {result.correct ? "Correct" : "Not quite"}
          </span>
        )}
      </div>

      <h3 className="mb-4 break-words whitespace-pre-wrap font-display text-display-s font-bold">
        {exercise.prompt}
      </h3>

      <div className="flex flex-col gap-2">
        {exercise.options.map(option => {
          const isCorrect = result?.correctOptionId === option.id;
          const isPicked = selected === option.id;
          const tone = result
            ? isCorrect
              ? "border-positive bg-positive-subtle"
              : isPicked
                ? "border-negative bg-negative-subtle"
                : "border-ui-border-subtle opacity-60"
            : isPicked
              ? "border-accent bg-accent-faint"
              : "border-ui-border hover:border-subtle";
          return (
            <button
              aria-pressed={isPicked}
              className={`flex items-start gap-3 rounded-control border px-4 py-3 text-left text-body transition ${tone}`}
              disabled={!!result}
              key={option.id}
              onClick={() => setSelected(option.id)}
              type="button"
            >
              <span
                aria-hidden
                className={`mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[10px] text-white ${
                  result && isCorrect
                    ? "border-positive bg-positive"
                    : result && isPicked
                      ? "border-negative bg-negative"
                      : isPicked
                        ? "border-accent bg-accent"
                        : "border-ui-border"
                }`}
              >
                {result && isCorrect ? "✓" : result && isPicked ? "✕" : ""}
              </span>
              <span className="min-w-0 break-words">{option.label}</span>
            </button>
          );
        })}
      </div>

      {!result && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            className="btn btn-primary"
            disabled={!selected || checking}
            onClick={check}
            type="button"
          >
            {checking ? "Checking…" : "Check answer"}
          </button>
          {exercise.hint && !showHint && (
            <button
              className="btn btn-ghost"
              onClick={() => setShowHint(true)}
              type="button"
            >
              Show hint
            </button>
          )}
          {!selected && (
            <span className="text-body-s text-subtle">Pick an answer first</span>
          )}
        </div>
      )}

      {showHint && !result && exercise.hint && (
        <p className="mt-3 rounded-control bg-caution-subtle px-4 py-3 text-body-s text-foreground">
          {exercise.hint}
        </p>
      )}

      {error && <p className="mt-3 text-body-s text-negative">{error}</p>}

      {result && (result.explanation || exercise.explanation) && (
        <div className="mt-4 rounded-control border border-ui-border-subtle bg-page-subtle px-4 py-4">
          <p className="kicker mb-2 text-subtle">Why</p>
          <p className="text-body leading-relaxed">
            {result.explanation ?? exercise.explanation}
          </p>
        </div>
      )}
    </section>
  );
}

export function LessonView({
  context,
  lesson,
  exercises,
}: {
  context: string;
  lesson: { id: string; title: string; minutes: number; body: LessonBlock[]; objectives: string[] };
  exercises: Exercise[];
}) {
  const router = useRouter();
  const [graded, setGraded] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const answered = Object.keys(graded).length;
  const allAnswered = answered >= exercises.length;
  const correctCount = Object.values(graded).filter(Boolean).length;

  async function complete() {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    const response = await fetch(`/api/lessons/${lesson.id}/complete`, { method: "PATCH" });
    if (response.ok) {
      router.push("/dashboard");
      router.refresh();
    } else setSubmitting(false);
  }

  return (
    <div className="min-w-0 max-w-full md:max-w-prose">
      <p className="mb-2 kicker text-accent">{context}</p>
      <h1 className="break-words font-display text-display-m font-bold md:text-display-l">{lesson.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="rounded-chip bg-accent-faint px-2 py-1 kicker text-accent">
          Lesson
        </span>
        <span className="text-body-s text-subtle">{lesson.minutes} min</span>
        {exercises.length > 0 && (
          <span className="text-body-s text-subtle">
            · {exercises.length} checkpoints
          </span>
        )}
      </div>

      {lesson.objectives.length > 0 && (
        <section className="mt-6 rounded-card border border-ui-border-subtle bg-page-subtle px-5 py-4">
          <p className="kicker mb-3 text-subtle">By the end you will be able to</p>
          <ul className="flex flex-col gap-2">
            {lesson.objectives.map(objective => (
              <li className="flex gap-3 text-body leading-relaxed" key={objective}>
                <span aria-hidden className="mt-1 text-accent">
                  →
                </span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <LessonBody blocks={lesson.body} />

      {exercises.length > 0 && (
        <div className="mt-10 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-display-s md:text-display-m font-bold">
              Check your understanding
            </h2>
            <span className="kicker text-subtle">
              {answered}/{exercises.length}
            </span>
          </div>
          {exercises.map((exercise, i) => (
            <Checkpoint
              exercise={exercise}
              index={i}
              key={exercise.id}
              onGraded={correct =>
                setGraded(previous => ({ ...previous, [i]: correct }))
              }
              total={exercises.length}
            />
          ))}
        </div>
      )}

      {allAnswered && exercises.length > 0 && (
        <p className="mt-6 rounded-control bg-positive-subtle px-4 py-3 text-body text-positive">
          {correctCount} of {exercises.length} correct — review anything you missed
          above before moving on.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Link className="btn btn-secondary" href="/roadmap">
          Back to roadmap
        </Link>
        <button
          className="btn btn-primary"
          disabled={!allAnswered || submitting}
          onClick={complete}
          title={allAnswered ? undefined : "Answer every checkpoint first"}
          type="button"
        >
          {submitting ? "Saving…" : "Mark complete →"}
        </button>
      </div>
      <ChatInterface lessonId={lesson.id} />
    </div>
  );
}
