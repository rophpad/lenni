import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="mb-1 inline-block font-display text-display-m font-bold"
    >
      <span className="text-accent">●</span> Lenni
    </Link>
  );
}
