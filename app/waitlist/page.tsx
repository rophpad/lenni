"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "../components/logo";
import { ThemeToggle } from "../components/theme-toggle";

type Role = "learner" | "creator" | "";

const SUBJECT_OPTIONS: Array<{ label: string; icon: string; desc: string; live: boolean }> = [
  { label: "Mathematics", icon: "∑", desc: "WAEC, Grade 7–12", live: true },
  { label: "Physics", icon: "◈", desc: "Mechanics & energy", live: false },
  { label: "Chemistry", icon: "⬡", desc: "Atoms & reactions", live: false },
  { label: "Biology", icon: "◎", desc: "Cells & systems", live: false },
  { label: "English", icon: "✎", desc: "Writing & comprehension", live: false },
  { label: "Computer Science", icon: "▣", desc: "Algorithms & code", live: false },
  { label: "AI", icon: "◇", desc: "Models & agents", live: false },
  { label: "Blockchain", icon: "⬢", desc: "Bitcoin & protocols", live: false },
];

export default function WaitlistPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("");
  const [subjects, setSubjects] = useState<string[]>(["Mathematics"]);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [touched, setTouched] = useState({ name: false, email: false, role: false, subjects: false });

  // Preselect from ?subject= or ?subjects=Mathematics,AI
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("subject") || params.get("subjects") || "";
    if (!q) return;
    const wanted = q
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => SUBJECT_OPTIONS.find((o) => o.label.toLowerCase() === s.toLowerCase())?.label || s)
      .filter((s) => SUBJECT_OPTIONS.some((o) => o.label === s));
    if (wanted.length) setSubjects(wanted);
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const nameValid = name.trim().length >= 2;
  const roleValid = role === "learner" || role === "creator";
  const subjectsValid = subjects.length > 0;
  const formValid = emailValid && nameValid && roleValid && subjectsValid;

  function toggleSubject(label: string) {
    setSubjects((prev) => (prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]));
    setTouched((p) => ({ ...p, subjects: true }));
    if (state === "error") setState("idle");
  }

  async function join() {
    if (!formValid) {
      setTouched({ name: true, email: true, role: true, subjects: true });
      return;
    }
    setState("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
          source: role,
          subjects,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setState("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page px-4 py-24">
      {/* Nav */}
      <nav className="fixed top-0 z-30 w-full border-b border-transparent bg-page/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-content items-center justify-between px-4 py-4 sm:px-8 sm:py-6 lg:px-11">
          <button onClick={() => router.push("/")} className="flex items-center">
            <Logo />
          </button>
          <ThemeToggle compact />
        </div>
      </nav>

      <main className="relative z-1 w-full max-w-xl">
        <div className="mb-8 text-center">
          <p className="kicker text-accent">Mathematics live · 7 subjects coming soon</p>
          <h1 className="mt-3 font-heading text-display-m font-bold">Join the waitlist</h1>
          <p className="mt-3 text-body leading-relaxed text-muted">
            Pick the subjects you want to learn. We&apos;ll let you know the moment yours is ready — starting with Mathematics.
          </p>
        </div>

        {state === "done" ? (
          <div className="rounded-card border border-positive/20 bg-positive/5 px-6 py-8 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-positive/15 text-display-s text-positive">
              ✓
            </div>
            <h2 className="mt-3 font-display text-display-s font-bold text-foreground">You&apos;re on the list!</h2>
            <p className="mt-2 text-body-s leading-relaxed text-muted">
              Thanks{ name ? `, ${name.trim().split(" ")[0]}` : ""}! We&apos;ll reach out at{" "}
              <span className="font-semibold text-foreground">{email}</span> for:{" "}
              <span className="font-semibold text-foreground">{subjects.join(", ")}</span>.
              {subjects.includes("Mathematics") ? " Mathematics is live — you can start right away after launch." : ""}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {subjects.map((s) => {
                const opt = SUBJECT_OPTIONS.find((o) => o.label === s);
                return (
                  <span
                    key={s}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold ${opt?.live ? "border-positive/20 bg-positive/10 text-positive" : "border-ui-border-subtle bg-page text-subtle"}`}
                  >
                    <span>{opt?.icon}</span> {s} {opt?.live ? "· Live" : "· Soon"}
                  </span>
                );
              })}
            </div>
            <button className="btn btn-secondary mt-6" onClick={() => router.push("/")}>
              Back to home
            </button>
          </div>
        ) : (
          <form
            className="rounded-card border border-ui-border-subtle bg-ui-raised px-6 py-8 shadow-lg"
            onSubmit={(e) => {
              e.preventDefault();
              join();
            }}
            noValidate
          >
            <div className="flex flex-col gap-5">
              <div>
                <label htmlFor="name" className="mb-1 block font-mono text-label font-semibold text-subtle">
                  Name <span className="text-negative">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`w-full rounded-control border bg-page px-4 py-3 text-body outline-none transition focus:border-accent ${
                    touched.name && !nameValid ? "border-negative" : "border-ui-border"
                  }`}
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (state === "error") setState("idle");
                  }}
                  onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                />
                {touched.name && !nameValid && (
                  <p className="mt-1 text-label text-negative">Enter at least 2 characters.</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block font-mono text-label font-semibold text-subtle">
                  Email <span className="text-negative">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`w-full rounded-control border bg-page px-4 py-3 text-body outline-none transition focus:border-accent ${
                    touched.email && !emailValid ? "border-negative" : "border-ui-border"
                  }`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setState("idle");
                    setErrorMsg("");
                  }}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                />
                {touched.email && !emailValid && (
                  <p className="mt-1 text-label text-negative">Enter a valid email address.</p>
                )}
              </div>

              {/* Subjects */}
              <div>
                <label className="mb-2 block font-mono text-label font-semibold text-subtle">
                  Which subjects interest you? <span className="text-negative">*</span>
                  <span className="ml-2 font-mono text-[10px] font-normal normal-case text-subtle">Pick one or more</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECT_OPTIONS.map((opt) => {
                    const selected = subjects.includes(opt.label);
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => toggleSubject(opt.label)}
                        aria-pressed={selected}
                        className={`relative flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition ${
                          selected
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-ui-border-subtle bg-page text-muted hover:border-accent/30 hover:bg-accent/5"
                        }`}
                      >
                        <span
                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg border text-[13px] font-bold ${
                            selected
                              ? "border-accent/20 bg-accent text-white"
                              : opt.live
                                ? "border-accent/20 bg-accent/10 text-accent"
                                : "border-ui-border-subtle bg-ui-raised text-subtle"
                          }`}
                        >
                          {selected ? "✓" : opt.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-body-s font-semibold leading-none ${selected ? "text-accent" : "text-foreground"}`}>{opt.label}</span>
                          <span className="block truncate font-mono text-[10px] leading-none text-subtle mt-0.5">{opt.desc}</span>
                        </span>
                        <span
                          className={`absolute right-2 top-2 rounded-full px-1.5 py-0.5 font-mono text-[8px] font-bold leading-none ${opt.live ? "bg-positive text-white" : "border border-ui-border-subtle bg-page text-subtle"}`}
                        >
                          {opt.live ? "Live" : "Soon"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {touched.subjects && !subjectsValid && (
                  <p className="mt-1.5 text-label text-negative">Pick at least one subject.</p>
                )}
                <p className="mt-2 font-mono text-[10px] leading-snug text-subtle">
                  Mathematics is live now — the rest are coming soon. Your picks help us decide what to launch next.
                </p>
              </div>

              <div>
                <label className="mb-2 block font-mono text-label font-semibold text-subtle">
                  I&apos;m interested as a <span className="text-negative">*</span>
                </label>
                <div className="flex gap-3">
                  {[
                    { value: "learner" as const, label: "Learner", desc: "I want to learn" },
                    { value: "creator" as const, label: "Creator / Business", desc: "I want to teach" },
                  ].map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setRole(value);
                        setTouched((p) => ({ ...p, role: true }));
                        setState("idle");
                        setErrorMsg("");
                      }}
                      className={`flex-1 rounded-control border px-4 py-3 text-left transition
                        ${
                          role === value
                            ? "border-accent bg-accent/10 text-accent"
                            : touched.role && !roleValid
                              ? "border-negative/50 bg-page text-muted"
                              : "border-ui-border-subtle bg-page text-muted hover:border-accent/50"
                        }`}
                    >
                      <span className="block text-body-s font-semibold">{label}</span>
                      <span className="block text-label text-subtle">{desc}</span>
                    </button>
                  ))}
                </div>
                {touched.role && !roleValid && (
                  <p className="mt-1 text-label text-negative">Please choose an option.</p>
                )}
              </div>
            </div>

            {state === "error" && errorMsg && (
              <p className="mt-4 rounded-control border border-negative/20 bg-negative-subtle px-3 py-2 text-body-s text-negative">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary mt-6 w-full"
              disabled={state === "saving"}
            >
              {state === "saving" ? "Joining…" : `Join waitlist${subjects.length ? ` · ${subjects.length} subject${subjects.length > 1 ? "s" : ""}` : ""}`}
            </button>

            <p className="mt-3 text-center text-body-s text-subtle">No spam. Just a heads-up when your subjects are ready.</p>
          </form>
        )}
      </main>
    </div>
  );
}
