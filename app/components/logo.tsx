import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 font-display text-display-s"
    >
      <span className="size-2 rounded-full bg-accent" />
      Lenni
    </Link>
  );
}
