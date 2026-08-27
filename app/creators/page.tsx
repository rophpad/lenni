"use client";

import { useRouter } from "next/navigation";
import { Logo } from "../components/logo";
import { ThemeToggle } from "../components/theme-toggle";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const NAV_LINKS: Array<[string, string]> = [
  ["#features", "Features"],
  ["#how-it-works", "How it works"],
  ["#pricing", "Pricing"],
  ["/", "For Learners"],
];

// ---------------------------------------------------------------------------
// Canvas background
// ---------------------------------------------------------------------------
function Contours() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const draw = () => {
      c.width = innerWidth;
      c.height = innerHeight;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-contour")
        .trim();
      ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        const yb = c.height * 0.15 * i + 40;
        ctx.moveTo(-50, yb);
        for (let x = -50; x < c.width + 50; x += 60)
          ctx.lineTo(
            x,
            yb +
              Math.sin(x * 0.006 + i) * 40 +
              Math.cos(x * 0.003 + i * 2) * 20,
          );
        ctx.stroke();
      }
    };
    draw();
    addEventListener("resize", draw);
    return () => removeEventListener("resize", draw);
  }, []);
  return (
    <canvas
      className="pointer-events-none fixed inset-0 z-0 opacity-60"
      ref={ref}
    />
  );
}

// ---------------------------------------------------------------------------
// Hero Course Builder Illustration
// ---------------------------------------------------------------------------
function CourseBuilderIllustration() {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveStep((n) => (n + 1) % 4), 3000);
    return () => clearInterval(t);
  }, []);

  const modules = [
    { id: 1, title: "Introduction to UX Design", lessons: 6, type: "video", done: true },
    { id: 2, title: "User Research Methods", lessons: 8, type: "text", done: true },
    { id: 3, title: "Wireframing & Prototyping", lessons: 5, type: "interactive", active: true },
    { id: 4, title: "Usability Testing", lessons: 4, type: "quiz" },
    { id: 5, title: "Final Project", lessons: 3, type: "mixed" },
  ];

  return (
    <div className="relative mx-auto mt-10 w-full max-w-5xl px-4 sm:px-6">
      <div className="overflow-hidden rounded-[20px] border border-ui-border-subtle bg-page shadow-[0_32px_80px_-12px_rgba(0,0,0,0.18)]">
        {/* Title bar */}
        <div className="flex items-center gap-2.5 border-b border-ui-border-subtle bg-ui-raised px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <div className="mx-3 flex flex-1 items-center gap-2 rounded-md border border-ui-border-subtle bg-page px-3 py-1">
            <span className="font-mono text-label text-subtle">
              lenni.app/studio/course/ux-design
            </span>
          </div>
          <div className="flex size-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            C
          </div>
        </div>

        {/* Body */}
        <div className="flex h-110 max-[640px]:h-auto max-[640px]:flex-col">
          {/* Left sidebar */}
          <aside className="flex w-56 shrink-0 flex-col border-r border-ui-border-subtle bg-ui-raised/50 max-[640px]:hidden">
            <div className="border-b border-ui-border-subtle px-4 py-3">
              <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-subtle">
                Course
              </div>
              <div className="mt-0.5 text-body-s font-bold leading-tight">
                UX Design Masterclass
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-ui-border-subtle">
                <div className="h-full w-[42%] rounded-full bg-accent" />
              </div>
              <div className="mt-1 flex justify-between font-mono text-[9px] text-subtle">
                <span>14 / 26 lessons</span>
                <span>54%</span>
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
              {modules.map((mod) => (
                <div
                  key={mod.id}
                  className={`rounded-lg px-2.5 py-2 transition-all cursor-default
                    ${mod.active ? "bg-accent/10" : mod.done ? "opacity-50" : "opacity-40"}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex size-4.5 shrink-0 items-center justify-center rounded-full border text-[8px] font-bold
                      ${
                        mod.done
                          ? "border-positive bg-positive/10 text-positive"
                          : mod.active
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-ui-border-subtle text-subtle"
                      }`}
                    >
                      {mod.done ? "✓" : mod.id}
                    </span>
                    <span
                      className={`text-label font-semibold leading-tight
                      ${mod.active ? "text-accent" : "text-foreground"}`}
                    >
                      {mod.title}
                    </span>
                  </div>
                  <div className="ml-6.5 mt-0.5 flex items-center gap-2 font-mono text-[9px] text-subtle">
                    <span>{mod.lessons} lessons</span>
                    <span className="rounded-full bg-ui-border-subtle px-1.5 py-0.5 text-[7px] uppercase">
                      {mod.type}
                    </span>
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-ui-border-subtle px-2 py-3">
              {[
                { icon: "◈", label: "My courses" },
                { icon: "◎", label: "Analytics" },
                { icon: "◉", label: "Settings" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-label text-subtle cursor-default hover:bg-ui-raised"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-ui-border-subtle px-5 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-subtle">
                    Module 3 · Lesson 2
                  </span>
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[9px] font-bold text-accent">
                    AI GENERATED
                  </span>
                </div>
                <div className="mt-0.5 text-body-s font-bold">
                  Low-Fidelity Wireframes
                </div>
              </div>
            </div>

            {/* AI Course Builder Preview */}
            <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
              <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-accent">◆</span>
                  <span className="font-mono text-label font-semibold text-accent">
                    AI COURSE BUILDER
                  </span>
                </div>
                <p className="mt-2 text-body-s leading-relaxed text-muted">
                  Lenni is generating this lesson based on your expertise in UX
                  design. Content is tailored for intermediate learners with
                  hands-on project requirements.
                </p>
              </div>

              {/* Content format selector */}
              <div className="mb-4 flex gap-2">
                {[
                  { label: "Video", active: false },
                  { label: "Text", active: true },
                  { label: "Interactive", active: false },
                  { label: "Quiz", active: false },
                ].map(({ label, active }) => (
                  <span
                    key={label}
                    className={`rounded-full px-3 py-1 font-mono text-[9px] font-semibold
                      ${active ? "bg-accent/10 text-accent" : "bg-ui-raised text-subtle"}`}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Generated lesson content */}
              <div className="rounded-xl border border-ui-border-subtle bg-ui-raised p-4">
                <div className="mb-3 text-body-s font-bold">
                  What are low-fidelity wireframes?
                </div>
                <p className="text-body-s leading-relaxed text-muted">
                  Low-fidelity wireframes are simple, hand-drawn or basic
                  digital sketches that outline the structure and layout of a
                  page or screen. They focus on functionality and content
                  hierarchy rather than visual design details.
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-ui-border-subtle bg-page px-3 py-2">
                  <span className="text-subtle">▶</span>
                  <span className="font-mono text-[9px] text-subtle">
                    VIDEO: "Creating your first wireframe in 5 minutes"
                  </span>
                  <span className="ml-auto rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[8px] text-accent">
                    4:32
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <aside className="flex w-44 shrink-0 flex-col gap-3 border-l border-ui-border-subtle px-3 py-4 max-[900px]:hidden">
            <div>
              <div className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-subtle">
                Course stats
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "Enrolled", value: "1,247" },
                  { label: "Completion", value: "68%" },
                  { label: "Rating", value: "4.8 ★" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-lg bg-ui-raised px-2.5 py-1.5"
                  >
                    <span className="font-mono text-[9px] text-subtle">
                      {label}
                    </span>
                    <span className="font-mono text-label font-bold">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-subtle">
                AI activity
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "Lessons gen.", value: "26" },
                  { label: "Quizzes gen.", value: "12" },
                  { label: "This month", value: "847" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-lg bg-ui-raised px-2.5 py-1.5"
                  >
                    <span className="font-mono text-[9px] text-subtle">
                      {label}
                    </span>
                    <span className="font-mono text-label font-bold">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-center">
              <div className="font-mono text-body-l font-bold text-accent">
                $2,340
              </div>
              <div className="font-mono text-[9px] text-subtle">revenue</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature illustrations for creators
// ---------------------------------------------------------------------------
function CourseBuilderFeature() {
  const steps = [
    { n: 1, title: "Describe your expertise", desc: "Tell Lenni what you know and want to teach." },
    { n: 2, title: "AI builds your curriculum", desc: "Chapters, lessons, quizzes — generated from your knowledge." },
    { n: 3, title: "Customise the format", desc: "Video, text, interactive, quizzes — your call, per lesson." },
    { n: 4, title: "Publish & grow", desc: "Your course is live. Track enrollment, completion, and revenue." },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-subtle bg-page shadow-lg">
      <div className="border-b border-ui-border-subtle bg-ui-raised px-4 py-2.5">
        <div className="font-mono text-label font-semibold text-subtle">
          AI COURSE BUILDER
        </div>
      </div>
      <div className="divide-y divide-ui-border-subtle">
        {steps.map((s) => (
          <div key={s.n} className="flex items-start gap-3 px-4 py-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-accent bg-accent/10 text-body-s font-bold text-accent">
              {s.n}
            </span>
            <div>
              <div className="text-body-s font-semibold text-foreground">
                {s.title}
              </div>
              <div className="font-mono text-label text-subtle">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformBuilderIllustration() {
  const formats = [
    { icon: "▶", label: "Video lessons", desc: "Upload or link your video content" },
    { icon: "✎", label: "Text & articles", desc: "Rich text with code blocks & media" },
    { icon: "◈", label: "Interactive quizzes", desc: "AI-generated questions & feedback" },
    { icon: "○", label: "Projects & exercises", desc: "Hands-on assignments with rubrics" },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-subtle bg-page shadow-lg">
      <div className="border-b border-ui-border-subtle bg-ui-raised px-4 py-2.5">
        <div className="font-mono text-label font-semibold text-subtle">
          PLATFORM BUILDER
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        {formats.map((f) => (
          <div
            key={f.label}
            className="rounded-xl border border-ui-border-subtle p-3 transition-all hover:border-accent hover:bg-accent/5"
          >
            <div className="mb-1 flex items-center gap-1.5 font-mono text-label font-bold text-foreground">
              <span className="text-accent">{f.icon}</span>
              {f.label}
            </div>
            <div className="font-mono text-label text-subtle">{f.desc}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-ui-border-subtle bg-accent/5 px-4 py-3">
        <div className="font-mono text-label font-semibold text-accent">
          MIX & MATCH
        </div>
        <div className="mt-1 text-body-s text-muted">
          Combine formats in any order. Each lesson can be a different type —
          video intro, text deep-dive, then a quiz.
        </div>
      </div>
    </div>
  );
}

function AnalyticsIllustration() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const bars = [45, 62, 38, 78, 85, 52, 70];
  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-subtle bg-page shadow-lg">
      <div className="border-b border-ui-border-subtle bg-ui-raised px-4 py-2.5">
        <div className="font-mono text-label font-semibold text-subtle">
          CREATOR ANALYTICS
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="mb-4 grid grid-cols-3 gap-2">
          {[
            { v: "1,247", l: "Students" },
            { v: "68%", l: "Completion" },
            { v: "4.8 ★", l: "Rating" },
          ].map(({ v, l }) => (
            <div
              key={l}
              className="rounded-lg border border-ui-border-subtle bg-ui-raised px-2 py-2 text-center"
            >
              <div className="font-mono text-body-l font-bold text-accent">
                {v}
              </div>
              <div className="font-mono text-[9px] text-subtle">{l}</div>
            </div>
          ))}
        </div>
        <div className="mb-1 font-mono text-label font-semibold text-subtle">
          WEEKLY ENROLLMENTS
        </div>
        <div className="flex items-end gap-1.5 rounded-lg border border-ui-border-subtle bg-ui-raised px-4 py-3">
          {bars.map((pct, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full overflow-hidden rounded-sm bg-ui-border-subtle"
                style={{ height: 44 }}
              >
                <div
                  className="w-full rounded-sm bg-accent"
                  style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                />
              </div>
              <span className="font-mono text-[9px] text-subtle">
                {days[i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------
function Spark({
  className,
  color,
}: {
  className: string;
  color: string;
}) {
  return (
    <svg
      className={`absolute h-5 w-5 animate-pulse ${className}`}
      viewBox="0 0 24 24"
    >
      <g fill={color === "sun" ? "var(--color-sun)" : "var(--color-ember)"}>
        <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
      </g>
    </svg>
  );
}

function Section({
  id,
  kicker,
  title,
  sub,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="mx-auto mt-25 w-full max-w-260 scroll-mt-8 px-6"
      id={id}
    >
      <div className="mb-4 text-center kicker text-accent">{kicker}</div>
      <h2 className="mx-auto max-w-160 text-center font-display text-display-m font-bold tracking-[-.01em] md:text-display-l">
        {title}
      </h2>
      {sub && (
        <p className="mx-auto mt-3 max-w-130 text-center text-body leading-[1.6] text-muted">
          {sub}
        </p>
      )}
      {children}
    </section>
  );
}

function Price({
  name,
  desc,
  price,
  period,
  billed,
  features,
  note,
  featured,
  action,
  start,
}: {
  name: string;
  desc: string;
  price: string;
  period?: string;
  billed: string;
  features: string[];
  note?: string;
  featured?: boolean;
  action: string;
  start: () => void;
}) {
  return (
    <article
      className={`card flex flex-col px-6 py-7 ${featured ? "relative card-featured" : ""}`}
    >
      {featured && (
        <div className="absolute -top-3.25 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-3 py-1 kicker font-semibold text-white">
          Best value
        </div>
      )}
      <div className="font-display text-display-s font-bold">{name}</div>
      <div className="mt-1 min-h-8 text-body-s text-subtle">{desc}</div>
      <div className="mb-1 mt-5 flex items-baseline gap-1">
        <span className="font-mono text-display-l font-semibold md:text-display-xl">
          {price}
        </span>
        {period && <span className="text-body-s text-subtle">{period}</span>}
      </div>
      <div className="mb-5 min-h-4 text-label text-subtle">{billed}</div>
      <ul className="mb-6 flex flex-1 list-none flex-col gap-3 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:leading-[1.4] [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
        {features.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <button
        className={`btn w-full ${featured ? "btn-primary" : "btn-secondary"}`}
        onClick={start}
      >
        {action}
      </button>
      {note && (
        <div className="mt-4 text-center text-body-s text-subtle">{note}</div>
      )}
    </article>
  );
}

function Footer({ start }: { start: () => void }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mx-auto mt-20 w-full max-w-content px-11 pb-8 pt-12">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 border-b border-ui-border-subtle pb-9 max-[760px]:grid-cols-2">
        <div className="[&_p]:max-w-55 [&_p]:text-body-s [&_p]:leading-[1.6] [&_p]:text-subtle">
          <Logo />
          <p>
            Build and sell AI-powered courses. Lenni handles the curriculum,
            you share the expertise.
          </p>
        </div>
        <div className="[&_a]:mb-3 [&_a]:block [&_a]:text-body-s [&_a]:text-muted [&_button]:mb-3 [&_button]:block [&_button]:text-body-s [&_button]:text-muted">
          <div className="mb-3 kicker text-subtle">Product</div>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="/">For Learners</a>
        </div>
        <div className="[&_a]:mb-3 [&_a]:block [&_a]:text-body-s [&_a]:text-muted [&_button]:mb-3 [&_button]:block [&_button]:text-body-s [&_button]:text-muted">
          <div className="mb-3 kicker text-subtle">Resources</div>
          <a href="#how-it-works">How it works</a>
          <a href="#features">Creator guide</a>
        </div>
        <div className="[&_a]:mb-3 [&_a]:block [&_a]:text-body-s [&_a]:text-muted [&_button]:mb-3 [&_button]:block [&_button]:text-body-s [&_button]:text-muted">
          <div className="mb-3 kicker text-subtle">Get started</div>
          <button onClick={start}>Join waitlist</button>
        </div>
      </div>
      <div className="flex justify-between gap-2 pt-6 [&_span]:text-body-s [&_span]:text-subtle">
        <span>&copy; {year} Lenni. All rights reserved.</span>
        <span>Built for creators.</span>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function CreatorsPage() {
  const router = useRouter();
  // const start = useCallback(() => router.push("/register"), [router]);
  const start = useCallback(() => router.push("/waitlist"), [router]);

  return (
    <>
      <Contours />
      <main id="landing" className="relative z-1 flex min-h-screen flex-col">
        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-30 border-b border-transparent bg-page/80 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-6 lg:px-11">
            <Logo />
            <div className="hidden items-center gap-8 md:flex [&_a]:text-body-s [&_a]:font-semibold [&_a]:text-muted [&_a:hover]:text-accent">
              {NAV_LINKS.map(([href, label]) => (
                <a href={href} key={href}>
                  {label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 md:flex">
                <ThemeToggle compact />
                <button className="btn btn-primary" onClick={start}>
                  Join waitlist
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section>
          <div className="mx-auto mt-14 w-full px-6 text-center">
            <div className="mb-4 kicker text-accent justify-center text-center">
              Lenni for Creators
            </div>
            <div className="relative inline-block w-full">
              <h1 className="mx-auto font-heading text-display-m md:text-display-2xl">
                <span className="block">Turn your expertise</span>
                <span className="block">
                  into an{" "}
                  <span className="animate-stamp-in edge [--edge-color:var(--color-success-strong)] mx-auto mt-2 inline-block w-fit -rotate-2 rounded-[20px] bg-positive px-5 pb-2.5 pt-1 text-white md:mx-0">
                    AI course.
                  </span>
                </span>
              </h1>
              <Spark className="-top-4 right-8 md:right-36" color="sun" />
              <Spark
                className="bottom-2 left-12 size-4 md:left-48"
                color="ember"
              />
            </div>
            <p className="mx-auto mt-6 max-w-sm text-body text-muted md:max-w-md md:text-body-l">
              Lenni helps you build a complete e-learning platform from your
              expertise. AI generates the curriculum, lessons, quizzes, and
              exercises — you shape the content and format.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button className="btn btn-primary btn-lg" onClick={start}>
                Join waitlist
              </button>
              <a className="btn btn-secondary btn-lg" href="#how-it-works">
                See how it works
              </a>
            </div>
            <div className="mt-4 text-body-s text-subtle">
              No coding required · Video, text, quizzes & more
            </div>
          </div>

          <CourseBuilderIllustration />
        </section>

        {/* ── Problem ─────────────────────────────────────────────────────── */}
        <Section
          id="problem"
          kicker="The problem"
          title="Creating courses is hard. Lenni makes it effortless."
          sub="You have the expertise. But building a structured course with lessons, quizzes, and a learning platform takes weeks. Lenni does it in minutes."
        >
          <div className="mt-11 grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
            {[
              "Hours spent writing outlines, lesson plans, and quiz questions from scratch",
              "Hard to know what format works best — video, text, interactive?",
              "No easy way to turn knowledge into a polished e-learning experience",
              "Tracking student progress and engagement requires separate tools",
            ].map((x) => (
              <div className="flex items-start gap-3 card px-6 py-5" key={x}>
                <div className="flex size-6.5 shrink-0 items-center justify-center rounded-full bg-negative-subtle text-body-s font-extrabold text-negative">
                  ✕
                </div>
                <div className="pt-1 text-body leading-normal">{x}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Features ────────────────────────────────────────────────────── */}
        <Section
          id="features"
          kicker="What Lenni does for creators"
          title="Your expertise. AI-built courses."
        >
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              [
                "◆",
                "AI course builder",
                "Describe your expertise and Lenni generates a complete curriculum — chapters, lessons, quizzes, and exercises.",
              ],
              [
                "◇",
                "Flexible content formats",
                "Video lessons, text articles, interactive exercises, or quizzes — choose per lesson or let Lenni suggest the best format.",
              ],
              [
                "✎",
                "Your own e-learning platform",
                "A branded course platform with enrollment, progress tracking, and analytics — all built into Lenni.",
              ],
              [
                "○",
                "Smart student analytics",
                "See enrollment numbers, completion rates, quiz scores, and which lessons need improvement.",
              ],
              [
                "△",
                "AI-powered student support",
                "Students can ask questions during lessons. Lenni answers in context, using your course content.",
              ],
              [
                "▣",
                "Monetise your knowledge",
                "Set pricing, offer free previews, and earn from your expertise. Lenni handles the platform.",
              ],
            ].map(([icon, title, text]) => (
              <article
                className="card p-6 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-body-l [&_h3]:font-bold [&_p]:text-body-s [&_p]:leading-[1.55] [&_p]:text-muted"
                key={title}
              >
                <div className="mb-3 text-display-s text-accent">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>

          {/* Deep-dive: Course builder */}
          <div className="mt-20 grid grid-cols-[1fr_1fr] items-center gap-10 max-[760px]:grid-cols-1">
            <div>
              <div className="mb-3 kicker text-accent">AI course builder</div>
              <h3 className="font-display text-display-s font-bold leading-snug md:text-display-m">
                From expertise to course in minutes.
              </h3>
              <p className="mt-3 text-body leading-relaxed text-muted">
                Tell Lenni what you know and want to teach. AI generates a
                complete curriculum with chapters, lessons, quizzes, and
                exercises — structured for maximum learning outcomes.
              </p>
              <ul className="mt-5 flex flex-col gap-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
                <li>Describe your topic and target audience</li>
                <li>AI generates chapter structure and lesson outlines</li>
                <li>Quizzes and exercises auto-created per lesson</li>
                <li>Edit and refine anything AI produces</li>
              </ul>
            </div>
            <CourseBuilderFeature />
          </div>

          {/* Deep-dive: Platform builder */}
          <div className="mt-20 grid grid-cols-[1fr_1fr] items-center gap-10 max-[760px]:grid-cols-1">
            <div className="order-2 max-[760px]:order-1">
              <PlatformBuilderIllustration />
            </div>
            <div className="order-1 max-[760px]:order-2">
              <div className="mb-3 kicker text-accent">Platform builder</div>
              <h3 className="font-display text-display-s font-bold leading-snug md:text-display-m">
                Your course, your format.
              </h3>
              <p className="mt-3 text-body leading-relaxed text-muted">
                Mix video lessons with text articles, interactive exercises,
                and quizzes. Lenni helps you choose the best format for each
                topic and builds the platform around it.
              </p>
              <ul className="mt-5 flex flex-col gap-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
                <li>Video, text, interactive, or quiz per lesson</li>
                <li>Branded course player with your look & feel</li>
                <li>Student enrollment and access management</li>
                <li>Mobile-responsive by default</li>
              </ul>
            </div>
          </div>

          {/* Deep-dive: Analytics */}
          <div className="mt-20 grid grid-cols-[1fr_1fr] items-center gap-10 max-[760px]:grid-cols-1">
            <div>
              <div className="mb-3 kicker text-accent">Creator analytics</div>
              <h3 className="font-display text-display-s font-bold leading-snug md:text-display-m">
                Know what's working. Improve what's not.
              </h3>
              <p className="mt-3 text-body leading-relaxed text-muted">
                Track enrollment, completion rates, quiz scores, and student
                engagement. See which lessons resonate and which need
                refinement — all in one dashboard.
              </p>
              <ul className="mt-5 flex flex-col gap-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
                <li>Enrollment and revenue tracking</li>
                <li>Per-lesson completion and drop-off rates</li>
                <li>Student quiz performance by topic</li>
                <li>AI suggestions for course improvements</li>
              </ul>
            </div>
            <AnalyticsIllustration />
          </div>
        </Section>

        {/* ── How it works ────────────────────────────────────────────────── */}
        <Section
          id="how-it-works"
          kicker="How it works"
          title="From expertise to live course in four steps."
        >
          <div className="mt-11 grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
            {[
              [
                "01",
                "Describe your expertise",
                "Tell Lenni what you know, who you're teaching, and what outcomes you want.",
              ],
              [
                "02",
                "AI builds your curriculum",
                "Lenni generates chapters, lessons, quizzes, and exercises tailored to your topic.",
              ],
              [
                "03",
                "Customise & refine",
                "Adjust content, choose formats (video, text, interactive), and make it yours.",
              ],
              [
                "04",
                "Publish & earn",
                "Your course is live. Students enroll, learn, and you track everything.",
              ],
            ].map(([n, t, d]) => (
              <div className="card px-6 py-5" key={n}>
                <div className="mb-2 font-mono text-body-s font-bold text-accent">
                  {n}
                </div>
                <div className="mb-1 text-body font-bold">{t}</div>
                <div className="text-body-s leading-normal text-muted">{d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Pricing ─────────────────────────────────────────────────────── */}
        <Section
          id="pricing"
          kicker="Pricing"
          title="Pay once. Teach forever."
          sub="No subscription. Pay for platform access, use credits for AI, earn from your courses."
        >
          {/* Platform access */}
          <div className="mt-10">
            <div className="mb-4 text-center font-mono text-label font-semibold text-subtle">
              PLATFORM ACCESS — ONE-TIME FEE
            </div>
            <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
              <Price
                name="Free"
                desc="Build and publish your first course."
                price="$0"
                billed="1 course · 25 students · 10% revenue share"
                features={[
                  "1 course",
                  "Up to 25 students",
                  "All content formats",
                  "Basic analytics",
                  "Lenni branding",
                ]}
                note="No credit card required."
                action="Join waitlist"
                start={start}
              />
              <Price
                featured
                name="Starter"
                desc="For creators growing their audience."
                price="$24"
                billed="One-time · 5 courses · 200 students · 5% revenue share"
                features={[
                  "Up to 5 courses",
                  "Up to 200 students",
                  "All content formats",
                  "Custom branding",
                  "Advanced analytics",
                  "AI student support",
                ]}
                note="Pay once, use forever."
                action="Join waitlist"
                start={start}
              />
              <Price
                name="Pro"
                desc="Everything you need to scale."
                price="$59"
                billed="One-time · Unlimited courses & students · 0% revenue share"
                features={[
                  "Unlimited courses",
                  "Unlimited students",
                  "All content formats",
                  "Custom branding",
                  "Advanced analytics",
                  "Revenue dashboard",
                  "Priority support",
                ]}
                note="You keep 100% of your earnings."
                action="Join waitlist"
                start={start}
              />
              <Price
                name="Scale"
                desc="For schools, companies & large teams."
                price="$119"
                billed="One-time · White-label · API · 0% revenue share"
                features={[
                  "Everything in Pro",
                  "API access",
                  "White-label option",
                  "Dedicated account manager",
                  "SSO & team management",
                  "Custom integrations",
                ]}
                note="Volume discounts available."
                action="Contact us"
                start={start}
              />
            </div>
          </div>

          {/* AI credits for creators */}
          <div className="mt-12">
            <div className="mb-4 text-center font-mono text-label font-semibold text-subtle">
              AI COURSE BUILDER — CREDITS
            </div>
            <div className="mx-auto max-w-2xl grid grid-cols-3 gap-3 max-[760px]:grid-cols-1">
              {[
                { credits: "100", price: "$9", label: "Starter pack" },
                { credits: "300", price: "$19", label: "Best value", featured: true },
                { credits: "10", price: "$1", label: "Pay-as-you-go" },
              ].map(({ credits, price, label, featured }) => (
                <div
                  key={credits}
                  className={`rounded-card border px-5 py-4 text-center
                    ${featured ? "border-accent bg-accent/5" : "border-ui-border-subtle"}`}
                >
                  <div className="font-mono text-display-l font-bold text-foreground">
                    {credits}
                  </div>
                  <div className="font-mono text-label text-subtle">credits</div>
                  <div className="mt-2 font-display text-body font-bold">
                    {price}
                  </div>
                  <div className="mt-1 font-mono text-[9px] text-subtle">
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-body-s text-muted">
              1 credit = 1 AI-generated lesson, quiz, or exercise. Credits never
              expire.
            </p>
          </div>

          {/* Revenue share callout */}
          <div className="mt-10 mx-auto max-w-2xl rounded-card border border-accent/20 bg-accent/5 px-6 py-5 text-center">
            <div className="font-display text-body font-bold text-foreground">
              Lenni only earns when you earn
            </div>
            <p className="mt-2 text-body-s leading-relaxed text-muted">
              On Free, Lenni takes 10% of course sales. On Starter, 5%. On Pro
              and Scale, you keep{" "}
              <strong className="text-foreground">100% of your revenue</strong>.
            </p>
          </div>
        </Section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section className="mx-auto mt-24 w-full max-w-205 px-6">
          <div className="rounded-card bg-linear-to-br from-accent to-accent-strong px-10 py-14 text-center [&_h2]:font-display [&_h2]:text-display-m [&_h2]:text-white [&_p]:mx-auto [&_p]:mb-7 [&_p]:mt-3 [&_p]:text-body [&_p]:text-white/85 [&_.btn]:border-white [&_.btn]:bg-white [&_.btn]:text-accent [&_.btn]:shadow-[0_4px_0_var(--color-brand-subtle)] md:[&_h2]:text-display-l">
            <h2>Ready to turn expertise into income?</h2>
            <p>
              Build your first AI-powered course in minutes. No coding, no
              setup headaches.
            </p>
            <button className="btn btn-primary btn-lg" onClick={start}>
              Join waitlist →
            </button>
          </div>
        </section>

        <Footer start={start} />
      </main>
    </>
  );
}
