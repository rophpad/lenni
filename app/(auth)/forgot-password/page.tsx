import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Reset your password — Lenni" };

export default function ForgotPasswordPage() {
  return (
    <section className="card p-8 max-[400px]:p-6">
      <h1 className="mb-2 font-display text-display-m font-bold">Forgot your password?</h1>
      <p className="mb-6 text-sm leading-[1.55] text-muted">Enter your email and we’ll send you a link to reset your password.</p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-body-s text-subtle">Remembered your password? <Link className="font-semibold text-accent hover:underline" href="/login">Login</Link></p>
    </section>
  );
}
