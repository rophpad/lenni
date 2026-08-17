import Link from "next/link";

import { COMPARE_PAGES } from "../../lib/compare";
import { Logo } from "./logo";

/* Only routes that actually exist are linked. The "Compare" column is the
   whole /compare/* set, generated from the same data the pages render from. */
const PRODUCT_LINKS: Array<[string, string]> = [
  ["/#how-it-works", "How Lenni works"],
  ["/#features", "What you get"],
  ["/#pricing", "Pricing"],
  ["/#faq", "FAQ"],
];

export function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mx-auto mt-28 w-full max-w-content px-6 pb-10 pt-12 sm:px-11">
      <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-8 border-b border-ui-border-subtle pb-10 max-[760px]:grid-cols-2">
        <div className="[&_p]:mt-3 [&_p]:max-w-55 [&_p]:text-body-s [&_p]:leading-[1.6] [&_p]:text-subtle">
          <Logo />
          <p>
            The AI career transition platform. Turn the skills you already have
            into the career you want.
          </p>
        </div>
        <FooterColumn title="Compare Lenni">
          {COMPARE_PAGES.map((page) => (
            <Link href={`/compare/${page.slug}`} key={page.slug}>
              {page.navLabel}
            </Link>
          ))}
        </FooterColumn>
        <FooterColumn title="Product">
          {PRODUCT_LINKS.map(([href, label]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
          <Link href="/register">Start free</Link>
        </FooterColumn>
      </div>
      <div className="pt-6 text-body-s text-subtle">
        © {year} Lenni. All rights reserved.
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="[&_a]:mb-3 [&_a]:block [&_a]:text-body-s [&_a]:text-muted [&_a]:transition-colors [&_a:hover]:text-accent">
      <div className="mb-3 kicker text-subtle">{title}</div>
      {children}
    </div>
  );
}
