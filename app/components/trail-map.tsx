import Link from "next/link";

export type TrailStatus = "complete" | "current" | "locked";
export type TrailNode = {
  id: string;
  title: string;
  status: TrailStatus;
  caption?: string;
  /** Module titles shown as chips under the level (full variant only). */
  modules?: string[];
  /** Makes the row a link — used for the level the learner can act on. */
  href?: string;
};

/** DB ContentStatus -> the three states the map draws. */
export function toTrailStatus(status: string): TrailStatus {
  if (status === "completed") return "complete";
  if (status === "locked") return "locked";
  return "current";
}

function Lock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor" stroke="none" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" strokeLinecap="round" />
    </svg>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
      viewBox="0 0 24 24"
    >
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

function Badge({
  node,
  index,
  size,
  glyph,
}: {
  node: TrailNode;
  index: number;
  size: string;
  glyph: string;
}) {
  const done = node.status === "complete";
  const current = node.status === "current";
  return (
    <span className="relative shrink-0">
      {current && (
        <span
          aria-hidden
          className={`trail-halo absolute inset-0 rounded-full bg-accent ${size}`}
        />
      )}
      <span
        className={`relative flex ${size} items-center justify-center rounded-full border-2 font-mono text-body-s font-semibold ${
          done
            ? "border-positive-strong bg-positive text-white"
            : current
              ? "border-accent-strong bg-accent text-white shadow-(--shadow)"
              : "border-dashed border-ui-border bg-ui-raised text-subtle"
        }`}
      >
        {done ? (
          <Check className={glyph} />
        ) : node.status === "locked" ? (
          <Lock className={glyph} />
        ) : (
          index + 1
        )}
      </span>
    </span>
  );
}

/**
 * Horizontal badge-only track for the dashboard: milestone state at a glance,
 * no titles. Titles live on the roadmap page, where there is room for them.
 */
function HorizontalTrail({ nodes, className }: { nodes: TrailNode[]; className?: string }) {
  return (
    <ol className={`flex items-center ${className ?? ""}`}>
      {nodes.map((node, i) => {
        const last = i === nodes.length - 1;
        return (
          <li
            className={last ? "shrink-0" : "flex min-w-0 flex-1 items-center"}
            key={node.id}
            /* the only place the milestone name survives in this variant */
            title={node.title}
          >
            <Badge glyph="size-4" index={i} node={node} size="size-7 sm:size-8" />
            {!last && (
              <span
                aria-hidden
                className={`mx-1 min-w-1 flex-1 sm:mx-1.5 sm:min-w-2 ${
                  node.status === "complete"
                    ? "h-0.5 rounded-full bg-positive"
                    : "h-0 border-t-2 border-dashed border-ui-border"
                }`}
              />
            )}
            <span className="sr-only">
              {node.title} — {node.status}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Vertical linear track for the roadmap page. Rows size to their content, so
 * the list grows the page rather than trapping milestones behind a scrollbar.
 */
function VerticalTrail({ nodes, className }: { nodes: TrailNode[]; className?: string }) {
  return (
    <ol className={`relative flex flex-col ${className ?? ""}`}>
      {nodes.map((node, i) => {
        const done = node.status === "complete";
        const current = node.status === "current";
        const last = i === nodes.length - 1;

        const row = (
          <>
            <Badge glyph="size-5" index={i} node={node} size="size-11" />
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p
                  className={`text-body font-semibold ${node.status === "locked" ? "text-subtle" : "text-foreground"}`}
                >
                  {node.title}
                </p>
                {current && (
                  <span className="rounded-chip bg-accent-faint px-2 py-0.5 kicker text-accent">
                    Here
                  </span>
                )}
              </div>
              {node.caption && (
                <p className="mt-1 text-body-s text-muted">{node.caption}</p>
              )}
              {node.modules && node.modules.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {node.modules.map(title => (
                    <span
                      className="rounded-chip border border-ui-border-subtle bg-ui-raised px-2 py-1 text-label text-muted"
                      key={title}
                    >
                      {title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        );

        return (
          <li className={`relative ${last ? "" : "pb-8"}`} key={node.id}>
            {/* rail segment to the next level: solid once travelled, dashed ahead */}
            {!last && (
              <span
                aria-hidden
                className={`absolute bottom-0 left-[21px] top-11 -translate-x-1/2 ${
                  done ? "w-0.5 bg-positive" : "w-0 border-l-2 border-dashed border-ui-border"
                }`}
              />
            )}
            {node.href ? (
              <Link
                className="-m-2 flex gap-4 rounded-control p-2 transition hover:bg-ui-raised"
                href={node.href}
              >
                {row}
              </Link>
            ) : (
              <div className="flex gap-4">{row}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function TrailMap({
  nodes,
  variant = "full",
  className = "",
}: {
  nodes: TrailNode[];
  variant?: "compact" | "full";
  className?: string;
}) {
  if (nodes.length === 0) return null;
  return variant === "compact" ? (
    <HorizontalTrail className={className} nodes={nodes} />
  ) : (
    <VerticalTrail className={className} nodes={nodes} />
  );
}
