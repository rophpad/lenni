"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  RoleIcon,
  roleIconColors,
  type RoleColor,
  type RoleIconName,
} from "../../components/role-icon";

export type CareerOption = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  iconKey: string;
  colorKey: string;
  enabled: boolean;
};

function ComingSoon() {
  return (
    <span className="shrink-0 rounded-chip bg-ui-raised px-2 py-0.5 kicker text-subtle">
      Coming soon
    </span>
  );
}

export function CareerGoalPicker({
  careers,
  currentSlug,
  hasResume,
}: {
  careers: CareerOption[];
  currentSlug: string | null;
  hasResume: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function close() {
    if (pending) return;
    setOpen(false);
    setSelected(null);
    setError("");
  }

  async function submit() {
    if (!selected || pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/career-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career: selected }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error ?? "Could not change career goal");
      setOpen(false);
      router.push("/roadmap");
      router.refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Something went wrong");
      setPending(false);
    }
  }

  return (
    <>
      <button className="btn btn-secondary btn-sm" onClick={() => setOpen(true)} type="button">
        Change career
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-(--color-scrim) p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          onMouseDown={event => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section
            aria-modal="true"
            className="flex max-h-[92vh] w-full max-w-150 flex-col rounded-card border border-ui-border-subtle bg-ui-surface shadow-(--shadow-lift) max-sm:rounded-b-none"
            role="dialog"
          >
            <header className="flex items-start justify-between gap-3 border-b border-ui-border-subtle px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-display text-display-s font-semibold">
                  Change your career goal
                </h2>
                <p className="mt-1 text-body-s text-muted">
                  Lenni re-analyses the résumé on file and builds a new roadmap. Your
                  current roadmap is archived, not deleted.
                </p>
              </div>
              <button
                aria-label="Close"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-subtle transition hover:bg-ui-raised hover:text-foreground"
                disabled={pending}
                onClick={close}
                type="button"
              >
                ✕
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              <ul className="flex flex-col gap-2">
                {careers.map(career => {
                  const current = career.slug === currentSlug;
                  const selectable = career.enabled && !current;
                  const chosen = selected === career.slug;
                  return (
                    <li key={career.slug}>
                      <button
                        aria-pressed={chosen}
                        className={`flex w-full items-center gap-3 rounded-control border px-3 py-3 text-left transition ${
                          chosen
                            ? "border-accent bg-accent-faint"
                            : current
                              ? "border-ui-border bg-page-subtle"
                              : selectable
                                ? "border-ui-border-subtle hover:border-subtle hover:bg-ui-raised"
                                : "cursor-not-allowed border-ui-border-subtle opacity-55"
                        }`}
                        disabled={!selectable || pending}
                        onClick={() => setSelected(career.slug)}
                        type="button"
                      >
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-control [&_svg]:size-5 ${
                            roleIconColors[career.colorKey as RoleColor] ?? roleIconColors.iris
                          }`}
                        >
                          <RoleIcon name={career.iconKey as RoleIconName} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-body font-semibold">{career.title}</span>
                            {current && (
                              <span className="shrink-0 rounded-chip bg-accent px-2 py-0.5 kicker text-white">
                                Current
                              </span>
                            )}
                            {!career.enabled && <ComingSoon />}
                          </span>
                          <span className="mt-0.5 block text-body-s text-muted">
                            {career.description}
                          </span>
                        </span>
                        {selectable && (
                          <span
                            aria-hidden
                            className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[10px] text-white ${
                              chosen ? "border-accent bg-accent" : "border-ui-border"
                            }`}
                          >
                            {chosen ? "✓" : ""}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Custom goals need generated prompts per role, which do not exist yet. */}
              <div className="mt-4 rounded-control border border-dashed border-ui-border px-3 py-3 opacity-70">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label
                    className="text-body-s font-semibold text-muted"
                    htmlFor="custom-career"
                  >
                    I want to become…
                  </label>
                  <ComingSoon />
                </div>
                <input
                  className="w-full cursor-not-allowed rounded-control border border-ui-border bg-page-subtle px-3 py-2 text-body text-foreground placeholder:text-subtle"
                  disabled
                  id="custom-career"
                  placeholder="e.g. Security Engineer"
                />
              </div>

              {!hasResume && (
                <p className="mt-4 text-body-s text-caution">
                  We need a résumé on file before we can rebuild a roadmap.
                </p>
              )}
              {error && <p className="mt-4 text-body-s text-negative">{error}</p>}
            </div>

            <footer className="flex flex-col gap-2 border-t border-ui-border-subtle px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                className="btn btn-ghost"
                disabled={pending}
                onClick={close}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={!selected || !hasResume || pending}
                onClick={submit}
                type="button"
              >
                {pending ? "Rebuilding your roadmap…" : "Switch career goal"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
