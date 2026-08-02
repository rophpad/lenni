"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";

const input =
  "w-full rounded-lg border border-ui-border bg-page-subtle px-3.25 py-2.75 text-sm outline-none focus:border-accent";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function destination() {
    const response = await fetch("/api/auth/destination", { cache: "no-store" });
    if (!response.ok) return "/login";
    return (await response.json()).destination as "/dashboard" | "/onboarding";
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    const result =
      mode === "register"
        ? await authClient.signUp.email({
            name: String(data.get("name")),
            email,
            password,
          })
        : await authClient.signIn.email({ email, password });
    if (result.error) {
      if (mode === "register") {
        const existingLogin = await authClient.signIn.email({ email, password });
        if (!existingLogin.error) {
          const next = await destination();
          if (next === "/onboarding") {
            setLoading(false);
            router.push(next);
            router.refresh();
            return;
          }
          await authClient.signOut();
          setLoading(false);
          router.push(`/login?email=${encodeURIComponent(email)}&reason=existing`);
          return;
        }
      }
      setLoading(false);
      return setError(result.error.message ?? "Authentication failed");
    }
    const next = mode === "register" ? "/onboarding" : await destination();
    setLoading(false);
    router.push(next);
    router.refresh();
  }
  return (
    <form onSubmit={submit}>
      {error && (
        <p className="mb-4 rounded-lg bg-negative-subtle px-3 py-2 text-sm text-negative">
          {error}
        </p>
      )}
      {mode === "register" && (
        <label className="mb-4 block">
          <span className="mb-1.5 block text-[12.5px] font-medium text-subtle">
            Full name
          </span>
          <input className={input} name="name" autoComplete="name" required />
        </label>
      )}
      <label className="mb-4 block">
        <span className="mb-1.5 block text-[12.5px] font-medium text-subtle">
          Email
        </span>
        <input
          className={input}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <label className="mb-2 block">
        <span className="mb-1.5 block text-[12.5px] font-medium text-subtle">
          Password
        </span>
        <input
          className={input}
          name="password"
          type="password"
          autoComplete={
            mode === "register" ? "new-password" : "current-password"
          }
          minLength={8}
          required
        />
      </label>
      <div className={mode === "register" ? "mt-6.5 flex items-center justify-between" : ""}>
      {mode === "register" && <span className="text-[13px] text-subtle">Already have an account? <a className="font-semibold text-accent hover:underline" href="/login">Login</a></span>}
      <button
        disabled={loading}
        className={`${mode === "login" ? "mt-6.5 w-full" : ""} relative inline-flex items-center justify-center rounded-2xl border-2 border-accent bg-accent px-6 py-3.25 text-[13.5px] font-extrabold uppercase tracking-[.03em] text-white shadow-[0_4px_0_var(--color-brand-strong)] transition hover:border-accent-hover hover:bg-accent-hover active:translate-y-0.75 active:shadow-[0_1px_0_var(--color-brand-strong)] disabled:opacity-50`}
        type="submit"
      >
        {loading ? "Please wait…" : mode === "register" ? "Continue" : "Log in"}
      </button>
      </div>
    </form>
  );
}
