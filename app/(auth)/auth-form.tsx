"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";
import { PasswordInput } from "../components/password-input";

const input = "field";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // State updates are asynchronous, so keep an immediate lock as well. This
  // prevents a fast second click from starting another authentication request.
  const submitting = useRef(false);
  async function destination() {
    const response = await fetch("/api/auth/destination", { cache: "no-store" });
    if (!response.ok) return "/login";
    return (await response.json()).destination as "/dashboard" | "/onboarding";
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
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
            router.push(next);
            return;
          }
          await authClient.signOut();
          router.push(`/login?email=${encodeURIComponent(email)}&reason=existing`);
          return;
        }
      }
      submitting.current = false;
      setLoading(false);
      return setError(result.error.message ?? "Authentication failed");
    }
    // The authenticated layout already decides whether onboarding is required.
    // Going there directly avoids an extra session lookup and three duplicate
    // database queries before navigation can even begin.
    router.replace(mode === "register" ? "/onboarding" : "/dashboard");
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
          <span className="mb-1 block text-body-s font-medium text-subtle">
            Full name
          </span>
          <input className={input} name="name" autoComplete="name" required />
        </label>
      )}
      <label className="mb-4 block">
        <span className="mb-1 block text-body-s font-medium text-subtle">
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
      <PasswordInput
        autoComplete={mode === "register" ? "new-password" : "current-password"}
        label="Password"
        name="password"
      />
      <div className={mode === "register" ? "mt-6 flex items-center justify-between" : ""}>
      {mode === "register" && <span className="text-body-s text-subtle">Already have an account? <a className="font-semibold text-accent hover:underline" href="/login">Login</a></span>}
      <button
        disabled={loading}
        className={`${mode === "login" ? "mt-6 w-full" : ""} relative inline-flex items-center justify-center btn btn-primary disabled:opacity-50`}
        type="submit"
      >
        {loading ? "Please wait…" : mode === "register" ? "Continue" : "Log in"}
      </button>
      </div>
    </form>
  );
}
