import type { ReactNode } from "react";

/** Standard marketing section: headline, optional sub, then content. */
export function Section({
  id,
  kicker,
  title,
  sub,
  children,
}: {
  id?: string;
  kicker?: string;
  title: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto mt-24 w-full max-w-260 scroll-mt-20 px-6" id={id}>
      {kicker && (
        <div className="mb-3 text-center kicker text-subtle">{kicker}</div>
      )}
      {/* 48 / 28 / 15 — the h1 is the only thing on the site that shouts. */}
      <h2 className="mx-auto max-w-150 text-center font-display text-display-s md:text-display-m">
        {title}
      </h2>
      {sub && (
        <p className="mx-auto mt-4 max-w-130 text-center text-body leading-[1.7] text-muted">
          {sub}
        </p>
      )}
      {children}
    </section>
  );
}

/**
 * The arrow chain — "your experience → your gap → your roadmap".
 * It is the one motif every marketing page shares, so it lives here rather
 * than being re-typed per page.
 */
export function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
      {steps.map((step, i) => (
        <li className="flex items-center gap-2" key={step}>
          {i > 0 && (
            <span aria-hidden className="text-body-s text-subtle">
              →
            </span>
          )}
          <span className="rounded-chip border border-ui-border-subtle px-3 py-1.5 text-body-s text-muted">
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
