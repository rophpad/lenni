import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Log in — Lenni" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  return (
    <section className="card p-8 max-[400px]:p-6">
      <h1 className="mb-2 font-display text-display-s sm:text-display-m font-bold">Welcome back</h1>
      <p className="mb-6 text-sm leading-[1.55] text-muted">Log in to continue your roadmap where you left off.</p>
      {reason === "existing" && <p className="mb-4 rounded-lg bg-accent-subtle px-3 py-2 text-sm text-accent">This account already exists and onboarding is complete. Log in to continue.</p>}
      <AuthForm mode="login" />
      <div className="mt-3 flex justify-end"><a className="text-xs text-subtle transition hover:text-accent" href="/forgot-password">Forgot password?</a></div>
      <p className="mt-6 text-center text-body-s text-subtle">New to Lenni? <Link className="font-semibold text-accent hover:underline" href="/register">Create an account</Link></p>
    </section>
  );
}
