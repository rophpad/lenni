import Link from "next/link";
import { Logo } from "./components/logo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--color-brand-subtle),transparent_55%)]"/>
      <div className="max-w-130">
        <Logo />
        <p className="mt-10 font-mono text-[11px] font-semibold uppercase tracking-[.14em] text-accent">404 · Page not found</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-[-.02em] max-[400px]:text-3xl">This path isn’t on your roadmap.</h1>
        <p className="mx-auto mt-4 max-w-105 text-[15px] leading-relaxed text-muted">The page may have moved, or the address might be incorrect. Let’s get you back to a path that exists.</p>
        <Link className="mt-8 inline-flex items-center justify-center rounded-2xl border-2 border-accent bg-accent px-6 py-3.25 text-[13.5px] font-extrabold uppercase tracking-[.03em] text-white shadow-[0_4px_0_var(--color-brand-strong)] transition hover:border-accent-hover hover:bg-accent-hover active:translate-y-0.75" href="/">Back to home →</Link>
      </div>
    </main>
  );
}
