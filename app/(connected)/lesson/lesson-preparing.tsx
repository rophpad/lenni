"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const STAGES = [
  "Reading your roadmap position…",
  "Checking what you already know…",
  "Writing the lesson…",
  "Building the checkpoints…",
];

/** Lessons are written on first open, so the roadmap can be planned quickly and
 *  each lesson still gets a full generation budget. */
export function LessonPreparing({ lessonId, title }: { lessonId: string; title: string }) {
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    const timer = setInterval(
      () => setStage(s => Math.min(s + 1, STAGES.length - 1)),
      6000,
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // React 18+ dev mode mounts effects twice; without this the lesson is
    // generated (and billed) twice.
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/generate`, {
          method: "POST",
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.error ?? "Could not build this lesson");
        router.refresh();
      } catch (problem) {
        setError(problem instanceof Error ? problem.message : "Something went wrong");
      }
    })();
  }, [lessonId, router]);

  return (
    <div className="max-w-prose">
      <p className="mb-2 kicker text-accent">Preparing</p>
      <h1 className="font-display text-display-l font-semibold">{title}</h1>

      {error ? (
        <div className="mt-8 card p-6">
          <p className="text-body text-negative">{error}</p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => {
              started.current = false;
              setError("");
              router.refresh();
            }}
            type="button"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="mt-8 card p-6">
          <div className="flex items-center gap-3">
            <span className="size-2 animate-pulse rounded-full bg-accent" />
            <p className="text-body text-muted">{STAGES[stage]}</p>
          </div>
          <div className="mt-5 flex flex-col gap-3" aria-hidden>
            {[92, 78, 96, 64, 88].map((width, i) => (
              <div
                className="h-3 animate-pulse rounded-full bg-ui-raised"
                key={i}
                style={{ width: `${width}%`, animationDelay: `${i * 140}ms` }}
              />
            ))}
          </div>
          <p className="mt-5 text-body-s text-subtle">
            This takes about a minute. Your lesson is written for your current
            level, so it is not a stock article.
          </p>
        </div>
      )}
    </div>
  );
}
