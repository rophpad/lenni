"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "../components/logo";
import { ThemeToggle } from "../components/theme-toggle";

export default function WaitlistPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"learner" | "creator" | "">("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  async function join() {
    setState("saving");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: role || "waitlist-page" }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page px-4">
      {/* Nav */}
      <nav className="fixed top-0 z-30 w-full border-b border-transparent bg-page/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-content items-center justify-between px-4 py-4 sm:px-8 sm:py-6 lg:px-11">
          <button onClick={() => router.push("/")} className="flex items-center">
            <Logo />
          </button>
          <ThemeToggle compact />
        </div>
      </nav>

      <main className="relative z-1 mt-16 w-full max-w-lg">
        <div className="mb-8 text-center">
          <p className="kicker text-accent">Coming soon</p>
          <h1 className="mt-3 font-heading text-display-m font-bold">
            Join the waitlist
          </h1>
          <p className="mt-3 text-body leading-relaxed text-muted">
            Lenni is launching soon. Be among the first to try it — we'll let
            you know the moment it's ready.
          </p>
        </div>

        {state === "done" ? (
          <div className="rounded-card border border-positive/20 bg-positive/5 px-6 py-8 text-center">
            <div className="mb-2 text-display-s text-positive">✓</div>
            <h2 className="font-display text-display-s font-bold text-foreground">
              You're on the list!
            </h2>
            <p className="mt-2 text-body-s text-muted">
              We'll reach out as soon as Lenni is ready. In the meantime, check
              your inbox for a confirmation.
            </p>
            <button
              className="btn btn-secondary mt-6"
              onClick={() => router.push("/")}
            >
              Back to home
            </button>
          </div>
        ) : (
          <form
            className="rounded-card border border-ui-border-subtle bg-ui-raised px-6 py-8 shadow-lg"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes("@") && role) join();
            }}
          >
            <div className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block font-mono text-label font-semibold text-subtle"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full rounded-control border border-ui-border bg-page px-4 py-3 text-body outline-none transition focus:border-accent"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block font-mono text-label font-semibold text-subtle"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full rounded-control border border-ui-border bg-page px-4 py-3 text-body outline-none transition focus:border-accent"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setState("idle");
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-label font-semibold text-subtle">
                  I'm interested as a
                </label>
                <div className="flex gap-3">
                  {[
                    { value: "learner", label: "Learner" },
                    { value: "creator", label: "Creator / Business" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value as "learner" | "creator")}
                      className={`flex-1 rounded-control border px-4 py-3 text-body-s font-semibold transition
                        ${
                          role === value
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-ui-border-subtle bg-page text-muted hover:border-accent/50"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {state === "error" && (
              <p className="mt-3 text-body-s text-negative">
                Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary mt-6 w-full"
              disabled={state === "saving" || !email.includes("@") || !role}
            >
              {state === "saving" ? "Joining…" : "Join waitlist"}
            </button>

            <p className="mt-3 text-center text-body-s text-subtle">
              No spam. Just a heads-up when we launch.
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
