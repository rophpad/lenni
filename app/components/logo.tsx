import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="mb-1 inline-block font-display text-[26px] font-semibold"
    >
      <span className="text-accent">●</span> Lenni
    </Link>
  );
}
