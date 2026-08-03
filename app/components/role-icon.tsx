import type { ReactNode } from "react";

/* Palette roles, not raw hues — see design-tokens.css.
   ember = action, pine = earned, iris = machine, sun = momentum. */
export type RoleColor = "iris" | "pine" | "sun" | "ember";
export type RoleIconName =
  | "network"
  | "flag"
  | "pen"
  | "layout"
  | "browser"
  | "server"
  | "chart"
  | "infinity";

export const roleIconColors: Record<RoleColor, string> = {
  iris: "bg-machine-subtle text-machine",
  pine: "bg-positive-subtle text-positive",
  sun: "bg-caution-subtle text-caution",
  ember: "bg-accent-faint text-accent",
};

const paths: Record<RoleIconName, ReactNode> = {
  network: (
    <>
      <circle cx="6" cy="6" r="2.3" />
      <circle cx="18" cy="6" r="2.3" />
      <circle cx="12" cy="18" r="2.3" />
      <path d="M7.7 7.6L11 16.2M16.3 7.6L13 16.2M8.3 6h7.4" />
    </>
  ),
  flag: <path d="M5 21V4h11l-2.5 3.5L16 11H5" />,
  pen: (
    <>
      <path d="M3 21l4-1L18 9l-3-3L4 17l-1 4z" />
      <path d="M14 6l3 3" />
    </>
  ),
  layout: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M3 9h18M9 9v12" />
    </>
  ),
  browser: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
    </>
  ),
  server: (
    <>
      <rect x="4" y="4" width="16" height="6" rx="1.5" />
      <rect x="4" y="14" width="16" height="6" rx="1.5" />
    </>
  ),
  chart: (
    <>
      <circle cx="6" cy="16" r="1.4" />
      <circle cx="10" cy="9" r="1.4" />
      <circle cx="14" cy="13" r="1.4" />
      <circle cx="18" cy="6" r="1.4" />
      <path d="M2.5 20.5h19" />
    </>
  ),
  infinity: (
    <path d="M7 9a3 3 0 100 6 5 5 0 004-2 5 5 0 004 2 3 3 0 100-6 5 5 0 00-4 2 5 5 0 00-4-2z" />
  ),
};

export function RoleIcon({ name }: { name: RoleIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
