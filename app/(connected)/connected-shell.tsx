"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { authClient } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "../components/theme-toggle";

const nav = [
  ["/dashboard", "Dashboard", <path key="d" d="M3 12l9-9 9 9M5 10v10h14V10" />],
  [
    "/roadmap",
    "Roadmap",
    <>
      <path key="r" d="M3 20c4-8 6 4 10-4s4-8 8-8" />
      <circle
        key="a"
        cx="3"
        cy="20"
        r="1.5"
        fill="currentColor"
        stroke="none"
      />
      <circle
        key="b"
        cx="21"
        cy="8"
        r="1.5"
        fill="currentColor"
        stroke="none"
      />
    </>,
  ],
  [
    "/lesson",
    "Learn",
    <>
      <path
        key="l"
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z"
      />
      <path key="ll" d="M4 19.5V6.5" />
    </>,
  ],
  ["/progress", "Progress", <path key="p" d="M3 3v18h18M7 15l4-5 3 3 5-7" />],
  [
    "/jobs",
    "Jobs",
    <>
      <rect key="j" x="2" y="7" width="20" height="14" rx="2" />
      <path key="jj" d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>,
  ],
  [
    "/profile",
    "Profile",
    <>
      <circle key="u" cx="12" cy="8" r="4" />
      <path key="uu" d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </>,
  ],
] as const;

export function ConnectedShell({ children, user }: { children: ReactNode; user: { name: string; career: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="relative z-1 flex min-h-screen">
      {/* Desktop side rail; mobile bottom tab bar with labels + safe-area inset */}
      <aside className="sticky top-0 z-20 flex h-screen w-59 shrink-0 flex-col border-r border-ui-border-subtle bg-page-subtle px-4 py-7 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:h-auto max-md:w-full max-md:flex-row max-md:border-r-0 max-md:border-t max-md:bg-page-subtle/95 max-md:px-1 max-md:py-1 max-md:pb-[max(0.25rem,env(safe-area-inset-bottom))] max-md:backdrop-blur-md">
        <Link
          href="/dashboard"
          className="flex items-baseline gap-2 px-2 pb-2 font-display text-display-s font-bold max-md:hidden"
        >
          <span className="text-accent">●</span> Lenni
        </Link>
        <nav className="mt-9 flex flex-col gap-1 max-md:mt-0 max-md:w-full max-md:flex-row max-md:gap-0">
          {nav.map(([href, label, icon]) => {
            const active = pathname === href;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-body font-medium transition max-md:min-w-0 max-md:flex-1 max-md:flex-col max-md:gap-1 max-md:rounded-chip max-md:px-0.5 max-md:py-2 ${active ? "bg-(--color-surface-raised) text-accent" : "text-muted hover:bg-ui-surface hover:text-foreground"}`}
                href={href}
                key={href}
              >
                <svg
                  className="size-4.5 shrink-0 max-md:size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  {icon}
                </svg>
                <span className="max-md:text-[10px] max-md:leading-none">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-ui-border-subtle px-3 py-3 max-md:hidden">
          <div className="mb-3">
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2">
            <span className="flex size-8.5 items-center justify-center rounded-full bg-linear-to-br from-accent to-positive font-display text-sm font-bold text-white">
              {user.name.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase()}
            </span>
            <div>
              <p className="text-body-s font-semibold">{user.name}</p>
              <p className="text-label text-subtle">→ {user.career}</p>
            </div>
          </div>
          <button
            type="submit"
            onClick={async () => { await authClient.signOut(); router.push("/login"); router.refresh(); }}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-body-s font-medium text-muted transition hover:bg-negative-subtle hover:text-negative"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 17l5-5-5-5M15 12H3" />
              <path d="M14 3h5a2 2 0 012 2v14a2 2 0 01-2 2h-5" />
            </svg>
            Log out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-8 sm:pt-9 md:px-11 md:pb-20">
        <div className="max-w-content">{children}</div>
      </main>
    </div>
  );
}
