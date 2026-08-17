"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

/* Anchors are absolute so the same nav works from /compare/* pages. */
const NAV_LINKS: Array<[string, string]> = [
  ["/#how-it-works", "How it works"],
  ["/#features", "What you get"],
  ["/compare/chatgpt-and-claude", "Compare"],
  ["/#pricing", "Pricing"],
];

export function LandingNav() {
  const [menu, setMenu] = useState(false);
  const router = useRouter();
  const start = useCallback(() => router.push("/register"), [router]);

  return (
    <nav className="sticky top-0 z-30 border-b border-ui-border-subtle bg-page/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-6 lg:px-11">
        {/* Logo is its own link to "/" — do not wrap it in another. */}
        <Logo />
        <div className="hidden items-center gap-7 md:flex [&_a]:text-body-s [&_a]:text-muted [&_a]:transition-colors [&_a:hover]:text-foreground">
          {NAV_LINKS.map(([href, label]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle compact />
            <button className="btn btn-primary" onClick={start}>
              Start free
            </button>
          </div>
          <button
            aria-controls="mobile-navigation"
            aria-expanded={menu}
            aria-label={menu ? "Close menu" : "Open menu"}
            className="btn btn-ghost -mr-1 p-2 md:hidden"
            onClick={() => setMenu(!menu)}
            type="button"
          >
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.9"
              viewBox="0 0 24 24"
            >
              {menu ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {menu && (
        <div
          className="border-t border-ui-border-subtle bg-page px-4 pb-5 pt-2 md:hidden"
          id="mobile-navigation"
        >
          {NAV_LINKS.map(([href, label]) => (
            <Link
              className="block rounded-chip px-3 py-2.5 text-body text-muted transition hover:bg-ui-raised hover:text-foreground"
              href={href}
              key={href}
              onClick={() => setMenu(false)}
            >
              {label}
            </Link>
          ))}
          <div className="mt-2 border-t border-ui-border-subtle pt-4">
            <button
              className="btn btn-primary w-full"
              onClick={() => {
                setMenu(false);
                start();
              }}
              type="button"
            >
              Start free
            </button>
            <div className="mt-4 px-1">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
