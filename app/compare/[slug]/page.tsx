import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { COMPARE_PAGES, comparePage, type CompareBlock } from "../../../lib/compare";
import { LandingFooter } from "../../components/landing-footer";
import { LandingNav } from "../../components/landing-nav";
import { Flow } from "../../components/marketing";

export function generateStaticParams() {
  return COMPARE_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const page = comparePage((await params).slug);
  if (!page) return {};
  return {
    title: `${page.title} — Lenni`,
    description: page.lede,
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const page = comparePage((await params).slug);
  if (!page) notFound();

  const others = COMPARE_PAGES.filter((p) => p.slug !== page.slug);

  return (
    <main className="flex min-h-screen flex-col">
      <LandingNav />

      <header className="mx-auto w-full max-w-190 px-6 pt-20 md:pt-24">
        <div className="mb-3 kicker text-subtle">Compare</div>
        <h1 className="font-heading text-display-m md:text-display-xl">
          {page.title}
        </h1>
        <p className="mt-5 max-w-130 text-body text-muted md:text-body-l">
          {page.lede}
        </p>
      </header>

      <article className="mx-auto w-full max-w-190 px-6">
        {page.blocks.map((block, i) => (
          <Block block={block} key={i} />
        ))}
      </article>

      {/* Every comparison page is a doorway to the others. */}
      <section className="mx-auto mt-28 w-full max-w-190 px-6">
        <div className="mb-4 kicker text-subtle">Keep comparing</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {others.map((other) => (
            <Link
              className="tile text-body transition-colors hover:text-accent"
              href={`/compare/${other.slug}`}
              key={other.slug}
            >
              {other.navLabel}
            </Link>
          ))}
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}

/* ---------- Block renderers ----------
   One visual treatment per block kind, so the seven comparison pages read
   as one document set rather than seven one-off layouts. */

function Block({ block }: { block: CompareBlock }) {
  switch (block.kind) {
    case "prose":
      return (
        <div className="mt-8 flex flex-col gap-4">
          {block.lines.map((line) => (
            <p className="text-body leading-[1.7] text-muted" key={line}>
              {line}
            </p>
          ))}
        </div>
      );

    case "heading":
      return (
        <div className="mt-20">
          <h2 className="font-display text-display-m md:text-display-l">
            {block.text}
          </h2>
          {block.sub && (
            <p className="mt-3 text-body leading-[1.7] text-muted">
              {block.sub}
            </p>
          )}
        </div>
      );

    case "quote":
      return (
        <blockquote className="mt-8 border-l-2 border-accent pl-5 font-display text-display-s">
          {block.text}
        </blockquote>
      );

    case "list": {
      /* The marker carries meaning — earned, missing, or neutral — so it
         stays, but it never outweighs the label next to it. */
      const marker =
        block.tone === "cross"
          ? "[&_li]:before:text-negative [&_li]:before:content-['✕']"
          : block.tone === "plain"
            ? "[&_li]:before:text-subtle [&_li]:before:content-['–']"
            : "[&_li]:before:text-positive [&_li]:before:content-['✓']";
      return (
        <ul
          className={`mt-8 grid list-none grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 [&_li]:flex [&_li]:gap-2.5 [&_li]:text-body [&_li]:leading-normal [&_li]:text-muted ${marker}`}
        >
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    }

    case "flow":
      return (
        <div className="mt-8">
          <Flow steps={block.steps} />
        </div>
      );

    case "columns":
      return (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {block.columns.map((column) => (
            <article
              className={`card p-6 ${column.featured ? "card-featured" : ""}`}
              key={column.label}
            >
              <div
                className={`mb-4 kicker ${column.featured ? "text-accent" : "text-subtle"}`}
              >
                {column.label}
              </div>
              <ul
                className={`flex list-none flex-col gap-2 [&_li]:flex [&_li]:gap-2.5 [&_li]:text-body [&_li]:leading-normal [&_li]:text-muted ${
                  column.featured
                    ? "[&_li]:before:text-positive [&_li]:before:content-['✓']"
                    : "[&_li]:before:text-subtle [&_li]:before:content-['–']"
                }`}
              >
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      );

    case "steps":
      return (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {block.items.map(([title, desc]) => (
            <div className="tile" key={title}>
              <div className="mb-1 text-body font-semibold">{title}</div>
              <div className="text-body-s leading-normal text-muted">
                {desc}
              </div>
            </div>
          ))}
        </div>
      );

    case "table":
      return (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-140 border-collapse text-left">
            <thead>
              <tr className="[&_th]:border-b [&_th]:border-ui-border [&_th]:px-4 [&_th]:pb-3 [&_th]:kicker [&_th]:text-subtle">
                <th scope="col">{block.head[0]}</th>
                <th scope="col">{block.head[1]}</th>
                <th className="text-accent" scope="col">
                  {block.head[2]}
                </th>
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr
                  className="[&_td]:border-b [&_td]:border-ui-border-subtle [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-body-s"
                  key={row[0]}
                >
                  <th
                    className="border-b border-ui-border-subtle px-4 py-3.5 text-body-s font-semibold"
                    scope="row"
                  >
                    {row[0]}
                  </th>
                  <td className="text-muted">{row[1]}</td>
                  <td className="font-semibold text-accent">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "cta":
      return (
        <div className="mt-10">
          <Link className="btn btn-primary btn-lg" href="/register">
            {block.label}
          </Link>
        </div>
      );
  }
}
