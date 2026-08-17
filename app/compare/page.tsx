import type { Metadata } from "next";
import Link from "next/link";

import { COMPARE_PAGES } from "../../lib/compare";
import { LandingFooter } from "../components/landing-footer";
import { LandingNav } from "../components/landing-nav";

export const metadata: Metadata = {
  title: "Compare Lenni — Lenni",
  description:
    "How Lenni compares to ChatGPT, bootcamps, online courses, career coaches, job boards and figuring it out yourself.",
};

export default function CompareIndex() {
  return (
    <main className="flex min-h-screen flex-col">
      <LandingNav />

      <header className="mx-auto w-full max-w-190 px-6 pt-20 md:pt-24">
        <div className="mb-3 kicker text-subtle">Compare</div>
        <h1 className="font-heading text-display-m md:text-display-xl">
          There are plenty of ways to learn. Fewer that get you there.
        </h1>
        <p className="mt-5 max-w-130 text-body text-muted md:text-body-l">
          Lenni isn’t a course, a chatbot or a job board. Here’s how it sits
          next to each of them.
        </p>
      </header>

      <section className="mx-auto mt-14 w-full max-w-190 px-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {COMPARE_PAGES.map((page) => (
            <Link
              className="tile group"
              href={`/compare/${page.slug}`}
              key={page.slug}
            >
              <div className="mb-1.5 text-body font-semibold transition-colors group-hover:text-accent">
                {page.navLabel}
              </div>
              <div className="text-body-s leading-normal text-muted">
                {page.lede}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
