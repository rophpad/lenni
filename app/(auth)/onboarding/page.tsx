"use client";
import Link from "next/link";
import { useState } from "react";
import { RoleIcon, roleIconColors, type RoleColor, type RoleIconName } from "../../components/role-icon";
import { CAREER_CATALOG, availableCareers } from "../../../lib/careers";
import { useAuthProgress } from "../auth-progress";

type Gap = { name: string; missing: boolean };

export default function OnboardingPage() {
  const [resume, setResume] = useState<File | null>(null);
  const [step, setStep] = useState<2 | 3 | 4>(2);
  const [career, setCareer] = useState(availableCareers()[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState<Gap[]>([]);
  useAuthProgress(step);

  const card = "card p-8 max-[400px]:p-6";

  async function analyze() {
    if (!resume) return;
    setStep(4);
    setLoading(true);
    setError("");
    const data = new FormData();
    data.set("resume", resume);
    data.set("career", career.slug);
    const response = await fetch("/api/onboarding", { method: "POST", body: data });
    const body = await response.json();
    setLoading(false);
    if (!response.ok) return setError(body.error ?? "Analysis failed");
    setSkills(body.skills);
  }

  if (step === 2)
    return (
      <section className={card}>
        <h1 className="mb-2 font-display text-display-s sm:text-display-m font-bold">Import your profile</h1>
        <p className="mb-6 text-body-s text-muted">
          Upload your résumé so Lenni can retrieve demonstrated experience.
        </p>
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-control border-2 p-4 transition ${resume ? "border-positive bg-positive-subtle" : "border-dashed border-ui-border hover:border-accent"}`}
        >
          <span className="flex-1">
            <strong className="block text-body-s">{resume?.name ?? "Upload résumé"}</strong>
            <span className="text-label text-subtle">PDF, Word, or OpenDocument, up to 10MB</span>
          </span>
          <input
            accept=".pdf,.doc,.docx,.docm,.odt,.rtf"
            className="sr-only"
            onChange={e => setResume(e.target.files?.[0] ?? null)}
            type="file"
          />
        </label>
        <button
          className="btn btn-primary mt-6 w-full"
          disabled={!resume}
          onClick={() => setStep(3)}
        >
          Continue
        </button>
      </section>
    );

  if (step === 3)
    return (
      <section className={card}>
        <h1 className="mb-2 font-display text-display-s sm:text-display-m font-bold">Choose your goal</h1>
        <p className="mb-5 text-body-s text-muted">
          Choose the career path Lenni should build around your current experience.
        </p>

        {/* Capped so nine careers do not stretch the card past the viewport. */}
        <ul className="-mr-1 flex max-h-64 flex-col gap-2 overflow-y-auto overscroll-contain pr-1">
          {CAREER_CATALOG.map(item => {
            const chosen = career.slug === item.slug;
            return (
              <li key={item.slug}>
                <button
                  aria-pressed={chosen}
                  className={`flex w-full items-center gap-3 rounded-control border px-3 py-3 text-left transition ${
                    chosen
                      ? "border-accent bg-accent-faint"
                      : item.enabled
                        ? "border-ui-border-subtle bg-page-subtle hover:border-subtle"
                        : "cursor-not-allowed border-ui-border-subtle opacity-55"
                  }`}
                  disabled={!item.enabled}
                  onClick={() => setCareer(item)}
                  type="button"
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-control [&_svg]:size-5 ${
                      roleIconColors[item.colorKey as RoleColor] ?? roleIconColors.iris
                    }`}
                  >
                    <RoleIcon name={item.iconKey as RoleIconName} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-body font-semibold">{item.title}</span>
                      {!item.enabled && (
                        <span className="shrink-0 rounded-chip bg-ui-raised px-2 py-0.5 kicker text-subtle">
                          Coming soon
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-body-s text-muted">
                      {item.description}
                    </span>
                  </span>
                  {item.enabled && (
                    <span
                      aria-hidden
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[10px] text-white ${chosen ? "border-accent bg-accent" : "border-ui-border"}`}
                    >
                      {chosen ? "✓" : ""}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex justify-between gap-3">
          <button className="btn btn-secondary" onClick={() => setStep(2)}>
            Back
          </button>
          <button className="btn btn-primary" disabled={!career} onClick={analyze}>
            Analyze profile
          </button>
        </div>
      </section>
    );

  return (
    <section className={card}>
      {loading ? (
        <div className="py-8 text-center">
          <span className="mx-auto mb-5 block size-4 animate-pulse rounded-full bg-accent" />
          <h1 className="font-display text-display-s sm:text-display-m font-bold">
            Mapping your {career.title} path
          </h1>
          <p className="mt-2 text-body-s text-muted">
            Extracting evidence, comparing the benchmark, and planning your roadmap…
          </p>
        </div>
      ) : error ? (
        <div>
          <h1 className="font-display text-display-s font-bold">
            Analysis couldn’t finish
          </h1>
          <p className="my-4 rounded-control bg-negative-subtle p-3 text-body-s text-negative">
            {error}
          </p>
          <button className="btn btn-secondary" onClick={() => setStep(2)}>
            Try again
          </button>
        </div>
      ) : (
        <div>
          <h1 className="mb-2 font-display text-display-s sm:text-display-m font-bold">
            Here’s your starting point
          </h1>
          <p className="mb-5 text-body-s text-muted">
            Your personalized {career.title} roadmap has been created.
          </p>
          <div className="-mr-1 max-h-72 overflow-y-auto overscroll-contain pr-1">
            {skills.slice(0, 10).map(skill => (
              <div
                className="flex items-center justify-between gap-3 border-b border-ui-border-subtle py-2 text-body-s"
                key={skill.name}
              >
                <span>{skill.name}</span>
                <span
                  className={`shrink-0 rounded-chip px-2 py-1 text-label ${skill.missing ? "bg-negative-subtle text-negative" : "bg-positive-subtle text-positive"}`}
                >
                  {skill.missing ? "Gap" : "Evidence found"}
                </span>
              </div>
            ))}
          </div>
          <Link className="btn btn-primary mt-6 w-full" href="/dashboard">
            Open my roadmap →
          </Link>
        </div>
      )}
    </section>
  );
}
