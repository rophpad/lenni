"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

/** Runs before paint (see layout.tsx) so the first frame is already correct. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("lenni-theme");var d=t==="light"||t==="dark"?t:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",d);}catch(e){}})();`;

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("lenni-theme", theme);
  } catch {
    /* private mode — the in-memory state still works for this session */
  }
}

function SunIcon() {
  return (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </>
  );
}

function MoonIcon() {
  return <path d="M20 13.4A8.2 8.2 0 1 1 10.6 4a6.6 6.6 0 0 0 9.4 9.4z" />;
}

export function ThemeToggle({
  className = "",
  compact: _compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
    setReady(true);
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    apply(next);
  }

  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <button
      aria-label={`Switch to ${nextTheme} theme`}
      className={`inline-flex size-8 items-center justify-center rounded-full border border-ui-border-subtle bg-page-subtle text-subtle transition hover:bg-ui-surface hover:text-foreground ${className}`}
      onClick={toggleTheme}
      title={`Switch to ${nextTheme} theme`}
      type="button"
    >
      <svg
        aria-hidden="true"
        className={`size-4 transition-opacity ${ready ? "opacity-100" : "opacity-0"}`}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        {nextTheme === "dark" ? <MoonIcon /> : <SunIcon />}
      </svg>
    </button>
  );
}
