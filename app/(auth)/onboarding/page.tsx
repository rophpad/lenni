"use client";

import Link from "next/link";
import { useState } from "react";
import {
  RoleIcon,
  roleIconColors,
  type RoleColor,
  type RoleIconName,
} from "../../components/role-icon";
import { useAuthProgress } from "../auth-progress";

const jobs: Array<{ title: string; color: RoleColor; icon: RoleIconName }> = [
  { title: "AI Engineer", color: "blue", icon: "network" },
  { title: "Product Manager", color: "teal", icon: "flag" },
  { title: "Product Designer", color: "amber", icon: "pen" },
  { title: "Data Scientist", color: "blue", icon: "chart" },
];
const button =
  "relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-transparent px-6 py-3.25 text-[13.5px] font-extrabold uppercase tracking-[.03em] transition disabled:cursor-not-allowed disabled:opacity-45";

export default function OnboardingPage() {
  const [step, setStep] = useState(2);
  const [resume, setResume] = useState<File | null>(null);
  const [goal, setGoal] = useState("AI Engineer");
  const [customGoal, setCustomGoal] = useState(false);
  const [loading, setLoading] = useState(false);
  useAuthProgress(step);

  const analyze = () => {
    setStep(4);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 2200);
  };
  const card =
    "rounded-xl border border-ui-border-subtle bg-ui-surface p-8 shadow-(--shadow) max-[400px]:p-6";

  if (step === 2)
    return (
      <section className={card}>
        <h1 className="mb-2 font-display text-[23px] font-semibold">
          Import your profile
        </h1>
        <p className="mb-6.5 text-sm leading-[1.55] text-muted">
          Upload your résumé so Lenni can retrieve your experience and start
          from where you are.
        </p>
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] p-4 ${resume ? "border-positive bg-positive-subtle" : "border-dashed border-ui-border"}`}
        >
          <span className="flex size-8.5 items-center justify-center rounded-[9px] bg-(--color-surface-raised)">
            ↑
          </span>
          <span className="flex-1">
            <span className="block text-[13.5px] font-semibold">
              {resume?.name ?? "Upload résumé"}
            </span>
            <span className="text-xs text-subtle">PDF or DOCX, up to 10MB</span>
          </span>
          <span
            className={`font-mono text-[10.5px] uppercase ${resume ? "text-positive" : "text-subtle"}`}
          >
            {resume ? "Added" : "Required"}
          </span>
          <input
            className="sr-only"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) => setResume(event.target.files?.[0] ?? null)}
          />
        </label>
        <p className="mt-3 text-xs leading-relaxed text-subtle">
          LinkedIn and GitHub are optional and can be connected later.
        </p>
        <div className="mt-6.5 flex justify-between">
          <Link
            className={`${button} border-ui-border bg-ui-surface text-muted shadow-[0_4px_0_var(--color-border)]`}
            href="/register"
          >
            Back
          </Link>
          <button
            className={`${button} border-accent bg-accent text-white shadow-[0_4px_0_var(--color-brand-strong)] hover:border-accent-hover hover:bg-accent-hover active:translate-y-0.75 active:shadow-[0_1px_0_var(--color-brand-strong)]`}
            disabled={!resume}
            onClick={() => setStep(3)}
          >
            Continue
          </button>
        </div>
      </section>
    );

  if (step === 3)
    return (
      <section className={card}>
        <h1 className="mb-2 font-display text-[23px] font-semibold">
          What’s the goal?
        </h1>
        <p className="mb-6.5 text-sm leading-[1.55] text-muted">
          Choose a suggestion or enter exactly what you want to become.
        </p>
        <div className="mb-2 grid grid-cols-2 gap-2.5 max-[400px]:grid-cols-1">
          {jobs.map((job) => (
            <button
              className={`rounded-xl border p-3.5 text-left transition ${!customGoal && goal === job.title ? "border-accent bg-accent-subtle" : "border-ui-border bg-page-subtle hover:border-subtle"}`}
              onClick={() => {
                setCustomGoal(false);
                setGoal(job.title);
              }}
              key={job.title}
            >
              <span
                className={`mb-4 flex size-11.5 items-center justify-center rounded-[13px] [&_svg]:size-5.75 ${roleIconColors[job.color]}`}
              >
                <RoleIcon name={job.icon} />
              </span>
              <span className="text-[13.5px] font-semibold">{job.title}</span>
            </button>
          ))}
          <button
            className={`col-span-2 flex items-center gap-2.5 rounded-xl border p-3.5 text-left transition max-[400px]:col-span-1 ${customGoal ? "border-accent bg-accent-subtle" : "border-ui-border bg-page-subtle hover:border-subtle"}`}
            onClick={() => {
              setCustomGoal(true);
              setGoal("");
            }}
          >
            <span className="text-[19px]">+</span>
            <span className="text-[13.5px] font-semibold">
              I want to become…
            </span>
          </button>
        </div>
        {customGoal && (
          <label className="mb-4 block">
            <input
              autoFocus
              className="w-full rounded-lg border border-ui-border bg-page-subtle px-3.25 py-2.75 text-sm outline-none focus:border-accent"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder="I want to become..."
            />
          </label>
        )}
        <div className="mt-6.5 flex justify-between">
          <button
            className={`${button} border-ui-border bg-ui-surface text-muted shadow-[0_4px_0_var(--color-border)]`}
            onClick={() => setStep(2)}
          >
            Back
          </button>
          <button
            className={`${button} border-accent bg-accent text-white shadow-[0_4px_0_var(--color-brand-strong)] hover:border-accent-hover hover:bg-accent-hover active:translate-y-0.75 active:shadow-[0_1px_0_var(--color-brand-strong)]`}
            disabled={!goal.trim()}
            onClick={analyze}
          >
            Analyze profile
          </button>
        </div>
      </section>
    );

  return (
    <section className={card}>
      {loading ? (
        <div className="px-1.5 py-5 text-center">
          <div className="mx-auto mb-6.5 grid size-30 place-items-center rounded-full border-2 border-ui-border">
            <span className="size-3.5 animate-pulse rounded-full bg-accent" />
          </div>
          <h1 className="font-display text-[23px] font-semibold">
            Mapping your path
          </h1>
          <p className="mt-2 font-mono text-[12.5px] text-subtle">
            Comparing your résumé against {goal} benchmarks…
          </p>
        </div>
      ) : (
        <div>
          <h1 className="mb-2 font-display text-[23px] font-semibold">
            Here’s the gap
          </h1>
          <p className="mb-6.5 text-sm text-muted">
            Between your résumé and <strong>{goal}</strong>.
          </p>
          {[
            ["Python programming", "Have it"],
            ["SQL & data handling", "Have it"],
            ["Machine learning fundamentals", "Missing"],
            ["LLMs & AI agents", "Missing"],
            ["Model deployment", "Missing"],
          ].map(([skill, status]) => (
            <div
              className="flex items-center justify-between border-b border-ui-border-subtle py-2.5 text-[13.5px]"
              key={skill}
            >
              <span>{skill}</span>
              <span
                className={`rounded-md px-2.25 py-0.75 font-mono text-[11px] ${status === "Have it" ? "bg-positive-subtle text-positive" : "bg-negative-subtle text-negative"}`}
              >
                {status}
              </span>
            </div>
          ))}
          <Link
            className={`${button} mt-6 w-full border-accent bg-accent text-white shadow-[0_4px_0_var(--color-brand-strong)] hover:border-accent-hover hover:bg-accent-hover active:translate-y-0.75 active:shadow-[0_1px_0_var(--color-brand-strong)]`}
            href="/dashboard"
          >
            Build my roadmap →
          </Link>
        </div>
      )}
    </section>
  );
}
