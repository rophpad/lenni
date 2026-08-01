import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Log in — Lenni" };

export default function LoginPage() {
  return (
    <section className="rounded-xl border border-ui-border-subtle bg-ui-surface p-8 shadow-(--shadow) max-[400px]:p-6">
      <h1 className="mb-2 font-display text-[23px] font-semibold">Welcome back</h1>
      <p className="mb-6.5 text-sm leading-[1.55] text-muted">Log in to continue your roadmap where you left off.</p>
      <form action="/dashboard">
        <label className="mb-4 block"><span className="mb-1.5 block text-[12.5px] font-medium text-subtle">Email</span><input className="w-full rounded-lg border border-ui-border bg-page-subtle px-3.25 py-2.75 text-sm outline-none focus:border-accent" name="email" type="email" autoComplete="email" placeholder="maya@email.com" required/></label>
        <label className="mb-2 block"><span className="mb-1.5 block text-[12.5px] font-medium text-subtle">Password</span><input className="w-full rounded-lg border border-ui-border bg-page-subtle px-3.25 py-2.75 text-sm outline-none focus:border-accent" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required/></label>
        <div className="flex justify-end"><a className="text-xs text-subtle transition hover:text-accent" href="/forgot-password">Forgot password?</a></div>
        <button className="mt-6.5 inline-flex w-full items-center justify-center rounded-2xl border-2 border-accent bg-accent px-6 py-3.25 text-[13.5px] font-extrabold uppercase tracking-[.03em] text-white shadow-[0_4px_0_var(--color-brand-strong)] transition hover:border-accent-hover hover:bg-accent-hover active:translate-y-0.75 active:shadow-[0_1px_0_var(--color-brand-strong)]" type="submit">Log in</button>
      </form>
      <p className="mt-6 text-center text-[13px] text-subtle">New to Lenni? <Link className="font-semibold text-accent hover:underline" href="/register">Create an account</Link></p>
    </section>
  );
}
