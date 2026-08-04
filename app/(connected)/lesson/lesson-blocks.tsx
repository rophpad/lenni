export type LessonBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "analogy"; text: string }
  | { type: "code"; language?: string; code: string; caption?: string | null }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "callout"; variant?: "tip" | "warning" | "insight"; title?: string; text: string }
  | { type: "example"; title?: string; text: string }
  | { type: "takeaways"; items: string[] };
/* Legacy rows (plain paragraph/callout with only `text`) still parse: the
   callout member's variant and title are optional. */

const CALLOUT = {
  tip: { ring: "border-positive/40 bg-positive-subtle", label: "text-positive", icon: "✦" },
  warning: { ring: "border-caution/40 bg-caution-subtle", label: "text-caution", icon: "▲" },
  insight: { ring: "border-machine/40 bg-machine-subtle", label: "text-machine", icon: "◈" },
} as const;

export function LessonBody({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <article className="mt-8 flex flex-col gap-5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                className="mt-4 font-display text-display-s font-bold first:mt-0"
                key={i}
              >
                {block.text}
              </h2>
            );

          case "analogy":
            return (
              <p
                className="border-l-2 border-accent/50 pl-4 text-body-l italic leading-relaxed text-muted"
                key={i}
              >
                {block.text}
              </p>
            );

          case "code": {
            const lang = block.language?.trim() || "text";
            return (
              <figure key={i}>
                <div className="overflow-hidden rounded-control border border-ui-border-subtle bg-page-subtle">
                  <div className="flex items-center justify-between border-b border-ui-border-subtle px-4 py-2">
                    <span className="kicker text-subtle">{lang}</span>
                  </div>
                  <pre className="overflow-x-auto px-4 py-4">
                    <code className="font-mono text-body-s leading-relaxed">
                      {block.code}
                    </code>
                  </pre>
                </div>
                {block.caption && (
                  <figcaption className="mt-2 text-body-s text-subtle">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case "list":
            return block.ordered ? (
              <ol
                className="ml-5 flex list-decimal flex-col gap-2 text-body leading-relaxed marker:font-mono marker:text-subtle"
                key={i}
              >
                {block.items.map((item, n) => (
                  <li key={n}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul
                className="ml-5 flex list-disc flex-col gap-2 text-body leading-relaxed marker:text-accent"
                key={i}
              >
                {block.items.map((item, n) => (
                  <li key={n}>{item}</li>
                ))}
              </ul>
            );

          case "callout": {
            const tone = CALLOUT[block.variant ?? "tip"] ?? CALLOUT.tip;
            return (
              <aside
                className={`rounded-control border px-5 py-4 ${tone.ring}`}
                key={i}
              >
                <p className={`kicker mb-2 ${tone.label}`}>
                  {tone.icon} {block.title || (block.variant ?? "tip")}
                </p>
                <p className="text-body leading-relaxed">{block.text}</p>
              </aside>
            );
          }

          case "example":
            return (
              <section className="card p-5" key={i}>
                <p className="kicker mb-2 text-accent">
                  {block.title || "Worked example"}
                </p>
                <p className="whitespace-pre-wrap text-body leading-relaxed">
                  {block.text}
                </p>
              </section>
            );

          case "takeaways":
            return (
              <section
                className="rounded-card border border-positive/30 bg-positive-subtle px-5 py-5"
                key={i}
              >
                <p className="kicker mb-3 text-positive">Key takeaways</p>
                <ul className="flex flex-col gap-2">
                  {block.items.map((item, n) => (
                    <li className="flex gap-3 text-body leading-relaxed" key={n}>
                      <span aria-hidden className="mt-1 text-positive">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );

          default:
            return (
              <p className="text-body-l leading-relaxed" key={i}>
                {block.text}
              </p>
            );
        }
      })}
    </article>
  );
}
