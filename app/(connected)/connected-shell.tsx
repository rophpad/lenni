"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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

export function ConnectedShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="relative z-1 flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-59 shrink-0 flex-col border-r border-ui-border-subtle bg-page-subtle px-4.5 py-7 max-[760px]:fixed max-[760px]:inset-x-0 max-[760px]:bottom-0 max-[760px]:top-auto max-[760px]:z-20 max-[760px]:h-auto max-[760px]:w-full max-[760px]:flex-row max-[760px]:overflow-x-auto max-[760px]:border-r-0 max-[760px]:border-t max-[760px]:px-3.5 max-[760px]:py-2.5">
        <Link
          href="/dashboard"
          className="flex items-baseline gap-2 px-2 pb-2 font-display text-[22px] font-semibold max-[760px]:hidden"
        >
          <span className="text-accent">●</span> Lenni
        </Link>
        <nav className="mt-9 flex flex-col gap-0.5 max-[760px]:mt-0 max-[760px]:flex-row max-[760px]:gap-1">
          {nav.map(([href, label, icon]) => {
            const active = pathname === href;
            return (
              <Link
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] font-medium transition ${active ? "bg-(--color-surface-raised) text-accent" : "text-muted hover:bg-ui-surface hover:text-foreground"}`}
                href={href}
                key={href}
              >
                <svg
                  className="size-4.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  {icon}
                </svg>
                <span className="max-[760px]:hidden">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-ui-border-subtle px-3 py-3.5 max-[760px]:hidden">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8.5 items-center justify-center rounded-full bg-linear-to-br from-accent to-positive font-display text-sm font-semibold text-white">
              MT
            </span>
            <div>
              <p className="text-[13.5px] font-semibold">Maya Torres</p>
              <p className="text-[11.5px] text-subtle">→ AI Engineer</p>
            </div>
          </div>
          <Link
            href="/login"
            className="mt-3 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] font-medium text-muted transition hover:bg-negative-subtle hover:text-negative"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 17l5-5-5-5M15 12H3" />
              <path d="M14 3h5a2 2 0 012 2v14a2 2 0 01-2 2h-5" />
            </svg>
            Log out
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-11 pb-20 pt-9 max-[760px]:px-4.5 max-[760px]:pb-25 max-[760px]:pt-6">
        <div className="max-w-295">{children}</div>
      </main>
    </div>
  );
}
