import type { ReactNode } from "react";

/* Line icons for the landing grids. Single stroke weight, 24 viewBox,
   no fills — they sit inside a .tile-mark and should read as one family. */
export type FeatureIconName =
  | "book"
  | "target"
  | "cube"
  | "check"
  | "cycle"
  | "flag";

const paths: Record<FeatureIconName, ReactNode> = {
  book: (
    <>
      <path d="M12 7c-1.4-1.4-3.4-2-6-2H4v13h2c2.6 0 4.6.6 6 2 1.4-1.4 3.4-2 6-2h2V5h-2c-2.6 0-4.6.6-6 2z" />
      <path d="M12 7v13" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
    </>
  ),
  cube: (
    <>
      <path d="M12 3.2l7.5 4.2v9.2L12 20.8l-7.5-4.2V7.4z" />
      <path d="M4.5 7.4l7.5 4.2 7.5-4.2M12 11.6v9.2" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.6 12.2l2.4 2.4 4.4-4.9" />
    </>
  ),
  cycle: (
    <>
      <path d="M4.6 10.6a7.6 7.6 0 0112.6-3.1l2.2 2.1" />
      <path d="M19.4 13.4a7.6 7.6 0 01-12.6 3.1l-2.2-2.1" />
      <path d="M19.4 5.2v4.4H15M4.6 18.8v-4.4H9" />
    </>
  ),
  flag: (
    <>
      <path d="M6 20.5V4.2h11l-2.6 3.7 2.6 3.7H6" />
    </>
  ),
};

export function FeatureIcon({ name }: { name: FeatureIconName }) {
  return (
    <svg
      className="size-4.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
