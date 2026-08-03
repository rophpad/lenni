"use client";

import { useEffect, useState } from "react";

export type Theme = "system" | "light" | "dark";

/** Runs before paint (see layout.tsx) so the first frame is already correct. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("lenni-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
  try {
    if (theme === "system") localStorage.removeItem("lenni-theme");
    else localStorage.setItem("lenni-theme", theme);
  } catch {
    /* private mode — the in-memory state still works for this session */
  }
}

const OPTIONS: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
  {
    value: "light",
    label: "Light",
    icon: (
      <>
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
      </>
    ),
  },
  {
    value: "system",
    label: "System",
    icon: (
      <>
        <rect x="2.5" y="4" width="19" height="13" rx="2" />
        <path d="M8 20.5h8" />
      </>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    icon: <path d="M20 13.4A8.2 8.2 0 1 1 10.6 4a6.6 6.6 0 0 0 9.4 9.4z" />,
  },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("lenni-theme");
    } catch {
      /* ignore */
    }
    setTheme(stored === "light" || stored === "dark" ? stored : "system");
    setReady(true);
  }, []);

  function pick(next: Theme) {
    setTheme(next);
    apply(next);
  }

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-ui-border-subtle bg-page-subtle p-1 ${compact ? "" : "w-full justify-between"}`}
      role="radiogroup"
      aria-label="Color theme"
    >
      {OPTIONS.map(({ value, label, icon }) => {
        const active = ready && theme === value;
        return (
          <button
            aria-checked={active}
            aria-label={label}
            className={`flex flex-1 items-center justify-center rounded-full p-2 transition ${
              active
                ? "bg-ui-surface text-accent shadow-(--shadow-stamp)"
                : "text-subtle hover:text-foreground"
            }`}
            key={value}
            onClick={() => pick(value)}
            role="radio"
            title={label}
            type="button"
          >
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              {icon}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
