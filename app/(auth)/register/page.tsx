import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Create your account — Lenni" };

export default function RegisterPage() {
  return (
    <section className="rounded-xl border border-ui-border-subtle bg-ui-surface p-8 shadow-(--shadow) max-[400px]:p-6">
      <h1 className="mb-2 font-display text-[23px] font-semibold">Create your account</h1>
      <p className="mb-6.5 text-sm leading-[1.55] text-muted">One profile, one guided path to the career you want.</p>
      <AuthForm mode="register" />
    </section>
  );
}
