"use client";

import { useRouter } from "next/navigation";
import { Logo } from "./components/logo";
import { ThemeToggle } from "./components/theme-toggle";
import {
  RoleIcon,
  roleIconColors,
  type RoleColor,
  type RoleIconName,
} from "./components/role-icon";
import { RoadmapIllustration, STEP_ART } from "./components/illustrations";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const NAV_LINKS: Array<[string, string]> = [
  ["#problem", "Why Lenni"],
  ["#features", "Features"],
  ["#pricing", "Pricing"],
  ["#faq", "FAQ"],
];

// Header subjects dropdown — recommended label: "Subjects" (fits curriculum context)
// Alternative considered: "Explore" — more discovery-oriented but less explicit for students/parents.
// Only Mathematics is live; others show "Coming soon".
const SUBJECTS: Array<{
  label: string;
  icon: string;
  desc: string;
  available: boolean;
}> = [
  { label: "Mathematics", icon: "∑", desc: "WAEC, Grade 7–12 · Available now", available: true },
  { label: "Physics", icon: "◈", desc: "Mechanics, waves & energy", available: false },
  { label: "Chemistry", icon: "⬡", desc: "Atoms, reactions & lab skills", available: false },
  { label: "Biology", icon: "◎", desc: "Cells, systems & evolution", available: false },
  { label: "English", icon: "✎", desc: "Grammar, writing & comprehension", available: false },
  { label: "Computer Science", icon: "▣", desc: "Algorithms & programming", available: false },
  { label: "AI", icon: "◇", desc: "Models, prompting & agents", available: false },
  { label: "Blockchain", icon: "⬢", desc: "Bitcoin, protocols & apps", available: false },
];

const features = [
  [
    "◆",
    "Aligned with your curriculum",
    "Select your country and class. Learning builds a path that matches exactly what you are studying in school.",
  ],
  [
    "◇",
    "Step-by-step guidance",
    "Unlike ChatGPT, Learning doesn't just give answers. It guides you through the reasoning so you truly understand.",
  ],
  [
    "✎",
    "Practice until mastery",
    "Every concept ends with interactive exercises. You don't move on until you've proven you understand.",
  ],
  [
    "○",
    "Track your progress",
    "See exactly which concepts you've mastered and where you need more practice. Visualize your growth.",
  ],
  [
    "△",
    "Real-world context",
    "Understand why math matters. See how concepts apply to business, construction, and daily life in Africa.",
  ],
  [
    "▣",
    "Two ways to learn",
    "Follow the full school curriculum chapter-by-chapter, or jump in to solve a specific problem instantly.",
  ],
];

const faqs = [
  [
    "Is this just ChatGPT for math?",
    "No. ChatGPT is a chatbot that gives answers. Learning is a structured tutor that guides you, checks your understanding, and follows your school curriculum.",
  ],
  [
    "Which countries and classes are supported?",
    "We are launching with curricula for major African education systems. You can select your country and class during onboarding.",
  ],
  [
    "How do credits work?",
    "1 credit = 1 concept lesson or practice session. You get 20 free credits to start. Buy more packs anytime — credits never expire.",
  ],
  [
    "Can I use it just for homework help?",
    "Yes! Use 'Quick Concept Mode' to ask about a specific problem (like fractions or derivatives) and get an instant, structured explanation.",
  ],
  [
    "What's free and what needs credits?",
    "Curriculum browsing, progress tracking, and concept selection are always free. Consuming content (lessons, guided solving, exercises) costs 1 credit each.",
  ],
  [
    "Does it give me the answers?",
    "Learning is designed to teach you how to solve problems, not just give you the result. It will guide you step-by-step.",
  ],
  [
    "Is there a free plan?",
    "Yes — you get 20 free credits, full curriculum access, and progress tracking. No credit card required.",
  ],
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
// HERO UI ILLUSTRATION — Math Tutor Interface
// Shows the "Quick Concept" mode solving an equation step-by-step
// ---------------------------------------------------------------------------
function HeroUIIllustration() {
  const [activeTab, setActiveTab] = useState<"lesson" | "exercise" | "chat">(
    "lesson",
  );
  const [chosen, setChosen] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const tabs: Array<"lesson" | "exercise" | "chat"> = [
      "lesson",
      "exercise",
      "chat",
    ];
    const t = setInterval(() => {
      setTick((n) => {
        const next = n + 1;
        setActiveTab(tabs[next % tabs.length]);
        if (tabs[next % tabs.length] !== "exercise") setChosen(null);
        return next;
      });
    }, 4200);
    return () => clearInterval(t);
  }, []);

  const chapters = [
    { id: 1, title: "Algebra Basics", lessons: 4, done: true },
    { id: 2, title: "Linear Equations", lessons: 5, done: true },
    {
      id: 3,
      title: "Quadratic Functions",
      lessons: 6,
      done: false,
      active: true,
      progress: 2,
    },
    { id: 4, title: "Geometry", lessons: 4, done: false },
    { id: 5, title: "Statistics", lessons: 2, done: false },
  ];

  const quizOptions = [
    "x = 2",
    "x = 4",
    "x = -4",
    "x = 8",
  ];

  return (
    <div className="relative mx-auto mt-10 w-full max-w-5xl px-4 sm:px-6">
      {/* ── Outer app shell ── */}
      <div className="overflow-hidden rounded-[20px] border border-ui-border-subtle bg-page shadow-[0_32px_80px_-12px_rgba(0,0,0,0.18)]">
        {/* ── Title bar ── */}
        <div className="flex items-center gap-2.5 border-b border-ui-border-subtle bg-ui-raised px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <div className="mx-3 flex flex-1 items-center gap-2 rounded-md border border-ui-border-subtle bg-page px-3 py-1">
            <svg
              className="size-3 shrink-0 text-subtle"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="2" y="6" width="12" height="8" rx="1.5" />
              <path d="M5 6V4.5a3 3 0 016 0V6" />
            </svg>
            <span className="font-mono text-label text-subtle">
              learning.app/grade-10/algebra/lesson-3
            </span>
          </div>
          <div className="flex size-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            S
          </div>
        </div>

        {/* ── App body ── */}
        <div className="flex h-130 max-[640px]:h-auto max-[640px]:flex-col">
          {/* ── Left sidebar ── */}
          <aside className="flex w-52 shrink-0 flex-col border-r border-ui-border-subtle bg-ui-raised/50 max-[640px]:hidden">
            <div className="border-b border-ui-border-subtle px-4 py-3">
              <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-subtle">
                Current Path
              </div>
              <div className="mt-0.5 text-body-s font-bold leading-tight">
                Grade 10 · Mathematics
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-ui-border-subtle">
                <div className="h-full w-[42%] rounded-full bg-accent" />
              </div>
              <div className="mt-1 flex justify-between font-mono text-[9px] text-subtle">
                <span>42% complete</span>
                <span>11 / 21</span>
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
              {chapters.map((ch) => (
                <div
                  key={ch.id}
                  className={`rounded-lg px-2.5 py-2 transition-all cursor-default
                    ${ch.active ? "bg-accent/10" : ch.done ? "opacity-50" : "opacity-40"}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex size-4.5 shrink-0 items-center justify-center rounded-full border text-[8px] font-bold
                      ${
                        ch.done
                          ? "border-positive bg-positive/10 text-positive"
                          : ch.active
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-ui-border-subtle text-subtle"
                      }`}
                    >
                      {ch.done ? "✓" : ch.id}
                    </span>
                    <span
                      className={`text-label font-semibold leading-tight
                      ${ch.active ? "text-accent" : "text-foreground"}`}
                    >
                      {ch.title}
                    </span>
                  </div>
                  {ch.active && (
                    <div className="ml-6.5 mt-1.5 h-0.5 overflow-hidden rounded-full bg-ui-border-subtle">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{
                          width: `${(ch.progress! / ch.lessons) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                  <div className="ml-6.5 mt-0.5 font-mono text-[9px] text-subtle">
                    {ch.active
                      ? `${ch.progress} / ${ch.lessons} concepts`
                      : `${ch.lessons} concepts`}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-ui-border-subtle px-2 py-3">
              {[
                { icon: "◈", label: "My Curriculum" },
                { icon: "◎", label: "Progress" },
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

          {/* ── Main content ── */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Content header */}
            <div className="flex items-center justify-between border-b border-ui-border-subtle px-5 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-subtle">
                    Chapter 3 · Concept 3
                  </span>
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[9px] font-bold text-accent">
                    IN PROGRESS
                  </span>
                </div>
                <div className="mt-0.5 text-body-s font-bold">
                  Solving Quadratic Equations
                </div>
              </div>

              {/* Tab switcher */}
              <div className="flex items-center gap-0.5 rounded-lg border border-ui-border-subtle bg-ui-raised p-0.5">
                {(["lesson", "exercise", "chat"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab !== "exercise") setChosen(null);
                    }}
                    className={`rounded-md px-3 py-1 font-mono text-label font-semibold transition-all capitalize
                      ${
                        activeTab === tab
                          ? "bg-page text-foreground shadow-sm"
                          : "text-subtle hover:text-muted"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* ── LESSON TAB — Math Explanation ── */}
            {activeTab === "lesson" && (
              <div className="flex flex-1 overflow-hidden">
                {/* Course content */}
                <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
                  {/* Lesson intro */}
                  <p className="text-body-s leading-relaxed text-muted">
                    A quadratic equation is any equation that can be rearranged
                    in standard form as <code className="font-mono bg-ui-raised px-1 rounded">ax² + bx + c = 0</code>.
                    To solve it, we need to find the values of <code className="font-mono bg-ui-raised px-1 rounded">x</code> that make the equation true.
                  </p>

                  {/* Section heading */}
                  <div className="mt-5 mb-2 flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                      1
                    </span>
                    <h4 className="text-body-s font-bold text-foreground">
                      The Quadratic Formula
                    </h4>
                  </div>
                  <p className="text-body-s leading-relaxed text-muted">
                    The most reliable way to solve any quadratic equation is using the quadratic formula:
                  </p>

                  {/* Visual: Formula */}
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-ui-border-subtle bg-ui-raised px-4 py-4">
                     <span className="font-mono text-body-l text-foreground">
                      x = <span className="text-accent">-b ± √(b² - 4ac)</span>
                      <span className="block text-center border-t border-ui-border-subtle mt-1 pt-1">2a</span>
                    </span>
                  </div>

                  {/* Section heading */}
                  <div className="mt-5 mb-2 flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                      2
                    </span>
                    <h4 className="text-body-s font-bold text-foreground">
                      Step-by-Step Example
                    </h4>
                  </div>
                  <p className="text-body-s leading-relaxed text-muted">
                    Let's solve: <code className="font-mono bg-ui-raised px-1 rounded">x² - 5x + 6 = 0</code>
                  </p>

                  {/* Key concept callout */}
                  <div className="mt-4 flex gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
                    <span className="mt-0.5 text-accent">◆</span>
                    <div className="text-body-s leading-relaxed text-muted">
                      <span className="font-semibold text-foreground">
                        Identify a, b, and c:{" "}
                      </span>
                      In this equation, a=1, b=-5, and c=6. Plug these into the formula to find x.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── EXERCISE TAB ── */}
            {activeTab === "exercise" && (
              <div className="flex flex-1 flex-col overflow-y-auto">
                <div className="flex-1 px-5 py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[9px] font-semibold text-accent">
                        QUIZ · Chapter 3 · Concept 3
                      </div>
                      <div className="mt-0.5 text-body-s font-bold">
                        Question 2 of 4
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((n) => (
                        <span
                          key={n}
                          className={`size-2 rounded-full
                          ${n === 2 ? "bg-accent" : n < 2 ? "bg-positive" : "bg-ui-border-subtle"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-4 rounded-xl border border-ui-border-subtle bg-ui-raised px-4 py-3 text-body-s font-semibold leading-snug">
                    Solve for x: <span className="font-mono">2x + 8 = 16</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {quizOptions.map((opt, i) => (
                      <button
                        key={opt}
                        onClick={() => setChosen(i)}
                        className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-body-s transition-all
                          ${
                            chosen === null
                              ? "border-ui-border-subtle hover:border-accent hover:bg-accent/5"
                              : i === 1
                                ? "border-positive bg-positive/8 font-semibold"
                                : chosen === i
                                  ? "border-negative bg-negative/8 opacity-80"
                                  : "border-ui-border-subtle opacity-40"
                          }`}
                      >
                        <span
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] font-bold
                          ${
                            chosen !== null && i === 1
                              ? "border-positive bg-positive text-white"
                              : chosen === i && i !== 1
                                ? "border-negative bg-negative text-white"
                                : "border-ui-border-subtle text-subtle"
                          }`}
                        >
                          {chosen !== null && i === 1
                            ? "✓"
                            : chosen === i && i !== 1
                              ? "✕"
                              : String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>

                  {chosen !== null && (
                    <div
                      className={`mt-4 rounded-xl border px-4 py-3 text-body-s leading-relaxed
                      ${
                        chosen === 1
                          ? "border-positive/30 bg-positive/6"
                          : "border-ui-border-subtle bg-ui-raised text-muted"
                      }`}
                    >
                      <span
                        className={`font-semibold ${chosen === 1 ? "text-positive" : "text-accent"}`}
                      >
                        {chosen === 1 ? "Correct! " : "Not quite — "}
                      </span>
                      Subtract 8 from both sides (2x = 8), then divide by 2.
                    </div>
                  )}
                </div>

                {chosen !== null && (
                  <div className="border-t border-ui-border-subtle px-5 py-3 flex justify-end">
                    <button className="btn btn-primary btn-sm">
                      Next question →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── CHAT TAB ── */}
            {activeTab === "chat" && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
                  {[
                    {
                      role: "user" as const,
                      text: "I don't get why we subtract 5 first.",
                    },
                    {
                      role: "learning" as const,
                      text: "Good question. We want to isolate x. Since +5 is added to 2x, we do the opposite (subtract 5) to cancel it out on that side.",
                    },
                    {
                      role: "user" as const,
                      text: "Okay, so 2x = 8. Then I divide by 2?",
                    },
                    {
                      role: "learning" as const,
                      text: "Exactly! You're getting it. What is 8 divided by 2?",
                    },
                  ].map((m, i) => (
                    <div
                      key={i}
                      className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold
                        ${m.role === "learning" ? "bg-accent text-white" : "bg-ui-raised border border-ui-border-subtle text-muted"}`}
                      >
                        {m.role === "learning" ? "L" : "S"}
                      </div>
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-body-s leading-relaxed
                        ${
                          m.role === "learning"
                            ? "rounded-tl-sm bg-ui-raised text-foreground"
                            : "rounded-tr-sm bg-accent text-white"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-end gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                      L
                    </div>
                    <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-ui-raised px-4 py-3">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="size-1.5 animate-bounce rounded-full bg-muted"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="border-t border-ui-border-subtle px-4 py-3">
                  <div className="flex items-center gap-2.5 rounded-xl border border-ui-border-subtle bg-ui-raised px-3.5 py-2.5">
                    <span className="flex-1 text-body-s text-subtle">
                      Ask about this step…
                    </span>
                    <button className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
                      <svg
                        viewBox="0 0 16 16"
                        className="size-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M8 12V4M4 8l4-4 4 4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right stats panel ── */}
          <aside className="flex w-44 shrink-0 flex-col gap-3 border-l border-ui-border-subtle px-3 py-4 max-[900px]:hidden">
            <div>
              <div className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-subtle">
                Class Level
              </div>
              <div className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-positive" />
                  <span className="text-label font-semibold">Grade 10</span>
                </div>
                <div className="mt-0.5 font-mono text-[9px] text-subtle">
                  Curriculum: WAEC
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-subtle">
                Today
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "Concepts learned", value: "2" },
                  { label: "Quiz score", value: "90%" },
                  { label: "Time spent", value: "25 min" },
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

            <div className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-sun/30 bg-sun/5 px-3 py-2">
              <svg
                viewBox="0 0 24 24"
                className="size-3.5 shrink-0 text-sun"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 2s-4.8 4.3-4.8 8.8c0 1.1.3 2.1.85 3-.35-.28-.95-.85-1.25-1.85 0 0-1.05 1.95.45 4.1.68 1 1.6 1.72 2.45 2.18.35.19.7.32.95.37.05.01.1.01.15.01s.1 0 .15-.01c.25-.05.6-.18.95-.37.85-.46 1.77-1.18 2.45-2.18 1.5-2.15.45-4.1.45-4.1-.3 1-.9 1.57-1.25 1.85.55-.9.85-1.9.85-3C16.8 6.3 12 2 12 2Z"
                  fill="currentColor"
                />
                <path
                  d="M12 14.6s-.85.85-1.15 1.85c-.1.35-.12.75.08 1.1.18.32.52.58.87.7.07.02.14.03.2.03s.13-.01.2-.03c.35-.12.69-.38.87-.7.2-.35.18-.75.08-1.1-.3-1-1.15-1.85-1.15-1.85Z"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
              <span className="font-mono text-label font-bold text-sun">
                5 day streak
              </span>
            </div>

            <div>
              <div className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-subtle">
                Skills
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { name: "Algebra", pct: 72 },
                  { name: "Geometry", pct: 45 },
                  { name: "Statistics", pct: 30 },
                ].map(({ name, pct }) => (
                  <div key={name}>
                    <div className="mb-0.5 flex justify-between font-mono text-[9px] text-subtle">
                      <span>{name}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-ui-border-subtle">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lesson nav buttons */}
            <div className="mt-auto flex flex-col gap-1.5">
              <button className="btn btn-secondary btn-sm w-full text-[10px]">
                ← Previous
              </button>
              <button className="btn btn-primary btn-sm w-full text-[10px]">
                Next concept →
              </button>
            </div>
          </aside>
        </div>

        {/* ── Bottom lesson nav bar ── */}
        <div className="flex items-center justify-between border-t border-ui-border-subtle bg-ui-raised/60 px-5 py-2.5">
          <button className="flex items-center gap-1.5 font-mono text-label text-subtle hover:text-muted transition">
            <svg
              className="size-3"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M8 2L4 6l4 4" />
            </svg>
            Previous concept
          </button>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <span
                key={n}
                className={`size-1.5 rounded-full transition-all
                ${n <= 2 ? "bg-positive" : n === 3 ? "bg-accent" : "bg-ui-border-subtle"}`}
              />
            ))}
          </div>
          <button className="flex items-center gap-1.5 font-mono text-label text-accent hover:text-accent/80 transition font-semibold">
            Take exercise
            <svg
              className="size-3"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M4 2l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FEATURE ILLUSTRATION: Learning Plan (Curriculum)
// Shows a generated math curriculum
// ---------------------------------------------------------------------------
function PlanIllustration() {
  const chapters = [
    { n: 1, title: "Number Systems", lessons: 4, hrs: 2, done: true },
    { n: 2, title: "Algebraic Expressions", lessons: 5, hrs: 3, done: true },
    {
      n: 3,
      title: "Linear Equations",
      lessons: 6,
      hrs: 3.5,
      done: false,
      active: true,
    },
    { n: 4, title: "Geometry & Shapes", lessons: 4, hrs: 2.5, done: false },
    { n: 5, title: "Statistics", lessons: 2, hrs: 1, done: false },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-subtle bg-page shadow-lg">
      <div className="border-b border-ui-border-subtle bg-ui-raised px-4 py-2.5">
        <div className="font-mono text-label font-semibold text-subtle">
          YOUR CURRICULUM · Grade 10
        </div>
      </div>
      <div className="divide-y divide-ui-border-subtle">
        {chapters.map((ch) => (
          <div
            key={ch.n}
            className={`flex items-center gap-3 px-4 py-3 transition-all
              ${ch.active ? "bg-accent/6" : ch.done ? "opacity-55" : ""}`}
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-body-s font-bold
              ${
                ch.done
                  ? "border-positive bg-positive/10 text-positive"
                  : ch.active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-ui-border-subtle text-subtle"
              }`}
            >
              {ch.done ? "✓" : ch.n}
            </span>
            <div className="flex-1">
              <div
                className={`text-body-s font-semibold ${ch.active ? "text-accent" : "text-foreground"}`}
              >
                {ch.title}
                {ch.active && (
                  <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[9px] text-accent">
                    IN PROGRESS
                  </span>
                )}
              </div>
              <div className="font-mono text-label text-subtle">
                {ch.lessons} concepts · {ch.hrs} hrs
              </div>
            </div>
            {/* Mini progress bar */}
            <div className="w-16 overflow-hidden rounded-full bg-ui-border-subtle h-1">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: ch.done ? "100%" : ch.active ? "45%" : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-ui-border-subtle bg-ui-raised px-4 py-2.5">
        <span className="font-mono text-label text-subtle">
          21 concepts · ~12 hours total
        </span>
        <span className="font-mono text-label font-semibold text-accent">
          40% complete
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FEATURE ILLUSTRATION: Level Check
// Shows how Learning identifies the student's level
// ---------------------------------------------------------------------------
function SkillIntakeIllustration() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((n) => (n + 1) % 3), 2400);
    return () => clearInterval(t);
  }, []);

  const sources = [
    {
      icon: "◈",
      label: "Select Class",
      lines: ["Country: Nigeria", "Class: SS2", "Curriculum: WAEC"],
      color: "text-accent",
    },
    {
      icon: "◉",
      label: "Diagnostic Test",
      lines: ["Scored 65 / 100", "Strong: Algebra", "Weak: Geometry"],
      color: "text-positive",
    },
    {
      icon: "▤",
      label: "Past Results",
      lines: [
        "Last Term: B+",
        "Struggled with Calculus",
        "Good at Statistics",
      ],
      color: "text-sun",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-subtle bg-page shadow-lg">
      <div className="border-b border-ui-border-subtle bg-ui-raised px-4 py-2.5">
        <div className="font-mono text-label font-semibold text-subtle">
          LEVEL DETECTION
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 p-3">
        {sources.map((s, i) => (
          <div
            key={s.label}
            className={`rounded-xl border p-3 transition-all duration-500
              ${
                i === active
                  ? "border-accent bg-accent/6 shadow-sm"
                  : "border-ui-border-subtle opacity-50"
              }`}
          >
            <div
              className={`mb-1 flex items-center gap-1.5 font-mono text-label font-bold ${i === active ? s.color : "text-subtle"}`}
            >
              <span>{s.icon}</span>
              {s.label}
              {i === active && (
                <span className="ml-auto rounded-full bg-accent/10 px-1.5 py-0.5 text-[8px] font-bold text-accent">
                  ACTIVE
                </span>
              )}
            </div>
            {s.lines.map((l) => (
              <div key={l} className="font-mono text-label text-subtle">
                {l}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-ui-border-subtle bg-accent/5 px-4 py-3">
        <div className="font-mono text-label font-semibold text-accent">
          LEARNING CONCLUSION
        </div>
        <div className="mt-1 text-body-s text-muted">
          Intermediate level detected. Your path starts at{" "}
          <strong className="text-foreground">Algebra II</strong>, skipping
          basics you already know.
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FEATURE ILLUSTRATION: Lesson + Chat
// Shows AI guiding a student through a math problem
// ---------------------------------------------------------------------------
function LessonChatIllustration() {
  const messages = [
    {
      role: "learning",
      text: "To find the area of a triangle, we use the formula: Area = ½ × base × height. Do you know which numbers represent the base and height here?",
    },
    { role: "user", text: "Is the base 10cm?" },
    {
      role: "learning",
      text: "Yes, exactly! The bottom side is 10cm. Now, look at the vertical line. What is the height?",
    },
    {
      role: "user",
      text: "Oh, it's 6cm. So 0.5 * 10 * 6?",
    },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-subtle bg-page shadow-lg">
      <div className="border-b border-ui-border-subtle bg-ui-raised px-4 py-2.5 flex items-center gap-3">
        <div>
          <div className="font-mono text-label text-subtle">
            Chapter 4 · Lesson 1
          </div>
          <div className="text-body-s font-bold">Area of Triangles</div>
        </div>
        <span className="ml-auto rounded-full border border-ui-border-subtle px-2 py-0.5 font-mono text-[9px] text-subtle">
          Chat to ask anything
        </span>
      </div>
      <div className="flex flex-col gap-3 px-4 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold
              ${m.role === "learning" ? "bg-accent text-white" : "bg-ui-raised text-muted border border-ui-border-subtle"}`}
            >
              {m.role === "learning" ? "L" : "S"}
            </div>
            <div
              className={`max-w-[82%] rounded-xl px-3 py-2 text-body-s leading-relaxed
              ${m.role === "learning" ? "bg-ui-raised text-foreground" : "bg-accent text-white"}`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {/* Typing */}
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            L
          </div>
          <div className="flex gap-1 rounded-xl bg-ui-raised px-3 py-2.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 animate-bounce rounded-full bg-muted"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-ui-border-subtle px-4 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-ui-border-subtle bg-ui-raised px-3 py-2">
          <span className="flex-1 text-body-s text-subtle">
            Ask about this step…
          </span>
          <span className="flex size-5 items-center justify-center rounded bg-accent text-white text-[10px]">
            ↑
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FEATURE ILLUSTRATION: Exercise / Quiz
// Shows a math problem with feedback
// ---------------------------------------------------------------------------
function ExerciseIllustration() {
  const [chosen, setChosen] = useState<number | null>(null);
  const options = [
    "x = 5",
    "x = 10",
    "x = 2",
    "x = 8",
  ];
  const correct = 2;
  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-subtle bg-page shadow-lg">
      <div className="border-b border-ui-border-subtle bg-ui-raised px-4 py-2.5 flex items-center justify-between">
        <div>
          <div className="font-mono text-label text-subtle">
            EXERCISE · Chapter 2
          </div>
          <div className="text-body-s font-bold">AI-generated quiz</div>
        </div>
        <span className="rounded-full border border-ui-border-subtle px-2 py-0.5 font-mono text-[9px] text-subtle">
          Q 2 of 5
        </span>
      </div>
      <div className="px-4 pt-4 pb-2">
        <div className="mb-3 text-body font-semibold leading-snug">
          Solve for x: <span className="font-mono">3x - 4 = 2</span>
        </div>
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <button
              key={opt}
              onClick={() => setChosen(i)}
              className={`w-full rounded-lg border px-3 py-2.5 text-left text-body-s transition
                ${
                  chosen === null
                    ? "border-ui-border-subtle hover:border-accent hover:bg-accent/5"
                    : i === correct
                      ? "border-positive bg-positive/8 font-semibold text-foreground"
                      : chosen === i
                        ? "border-negative bg-negative/8 text-muted"
                        : "border-ui-border-subtle opacity-40"
                }`}
            >
              <span className="mr-2 font-mono text-label text-subtle">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
              {chosen !== null && i === correct && (
                <span className="ml-1.5 text-positive">✓</span>
              )}
              {chosen !== null && chosen === i && i !== correct && (
                <span className="ml-1.5 text-negative">✕</span>
              )}
            </button>
          ))}
        </div>
      </div>
      {chosen !== null ? (
        <div
          className={`mx-4 mb-4 mt-2 rounded-lg px-4 py-3 text-body-s leading-relaxed
          ${chosen === correct ? "bg-positive/8 text-positive" : "bg-ui-raised text-muted"}`}
        >
          {chosen === correct
            ? "Correct! Add 4 to both sides (3x = 6), then divide by 3."
            : "Not quite. Try adding 4 to both sides first to isolate the 3x term."}
        </div>
      ) : (
        <div className="mx-4 mb-4 mt-2 font-mono text-label text-subtle">
          Select an answer to see feedback.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FEATURE ILLUSTRATION: Progress tracking
// ---------------------------------------------------------------------------
function ProgressIllustration() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const bars = [55, 70, 48, 85, 92, 60, 78];
  const skills = [
    { name: "Algebra", pct: 82 },
    { name: "Geometry", pct: 70 },
    { name: "Calculus", pct: 55 },
    { name: "Statistics", pct: 38 },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-subtle bg-page shadow-lg">
      <div className="border-b border-ui-border-subtle bg-ui-raised px-4 py-2.5">
        <div className="font-mono text-label font-semibold text-subtle">
          PROGRESS TRACKER
        </div>
      </div>
      <div className="px-4 py-4">
        {/* Stat row */}
        <div className="mb-4 grid grid-cols-4 gap-2">
          {[
            { v: "14", l: "Concepts", c: "text-accent" },
            { v: "11", l: "Quizzes", c: "text-positive" },
            { v: "82%", l: "Avg score", c: "text-positive" },
            { v: "7d", l: "Streak", c: "text-sun" },
          ].map(({ v, l, c }) => (
            <div
              key={l}
              className="rounded-lg border border-ui-border-subtle bg-ui-raised px-2 py-2 text-center"
            >
              <div className={`font-mono text-body-l font-bold ${c}`}>{v}</div>
              <div className="font-mono text-[9px] text-subtle">{l}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="mb-1 font-mono text-label font-semibold text-subtle">
          DAILY ACTIVITY
        </div>
        <div className="mb-4 flex items-end gap-1.5 rounded-lg border border-ui-border-subtle bg-ui-raised px-4 py-3">
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

        {/* Skill growth */}
        <div className="mb-2 font-mono text-label font-semibold text-subtle">
          MASTERY BY TOPIC
        </div>
        <div className="flex flex-col gap-2">
          {skills.map(({ name, pct }) => (
            <div key={name} className="flex items-center gap-2">
              <span className="w-28 shrink-0 text-body-s text-muted">
                {name}
              </span>
              <div className="flex-1 overflow-hidden rounded-full bg-ui-border-subtle h-1.5">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right font-mono text-label text-subtle">
                {pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function Home() {
  const [faq, setFaq] = useState(-1),
    [menu, setMenu] = useState(false),
    [step, setStep] = useState(0);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [mobileSubjectsOpen, setMobileSubjectsOpen] = useState(false);
  const router = useRouter();
  const subjectScrollRef = useRef<HTMLDivElement>(null);
  const subjectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 3200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!subjectsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (subjectsRef.current && !subjectsRef.current.contains(e.target as Node)) setSubjectsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSubjectsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [subjectsOpen]);

  const start = useCallback(() => router.push("/waitlist"), [router]);

  return (
    <>
      <Contours />
      <main id="landing" className="relative z-1 flex min-h-screen flex-col">
        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-30 border-b border-transparent bg-page/80 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-6 lg:px-11">
            <Logo />
            <div className="hidden items-center gap-7 md:flex">
              {/* Subjects dropdown — "Subjects" recommended; "Explore" is a more generic alternative */}
              <div ref={subjectsRef} className="relative">
                <button
                  aria-expanded={subjectsOpen}
                  aria-haspopup="menu"
                  onClick={() => setSubjectsOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-body-s font-semibold text-muted transition hover:text-accent"
                  type="button"
                >
                  Subjects
                  <svg
                    className={`size-3.5 shrink-0 transition-transform ${subjectsOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </button>
                {subjectsOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 top-full z-40 mt-3 w-[360px] overflow-hidden rounded-2xl border border-ui-border-subtle bg-page p-2 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.18)]"
                  >
                    <div className="px-3 pb-2 pt-1">
                      <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-subtle">Choose a subject</div>
                    </div>
                    <div className="grid gap-1">
                      {SUBJECTS.map((s) => (
                        <button
                          key={s.label}
                          role="menuitem"
                          disabled={!s.available}
                          onClick={() => {
                            if (!s.available) return;
                            setSubjectsOpen(false);
                            const el = document.getElementById("features");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                            else start();
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                            s.available
                              ? "hover:bg-accent/8 hover:text-accent"
                              : "cursor-not-allowed opacity-60"
                          }`}
                          type="button"
                        >
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-lg border text-[13px] font-bold ${
                              s.available
                                ? "border-accent/20 bg-accent/10 text-accent"
                                : "border-ui-border-subtle bg-ui-raised text-subtle"
                            }`}
                          >
                            {s.icon}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block text-body-s font-semibold leading-none ${s.available ? "text-foreground" : "text-muted"}`}>
                              {s.label}
                            </span>
                            <span className="block truncate font-mono text-[10px] leading-none text-subtle mt-1">{s.desc}</span>
                          </span>
                          {s.available ? (
                            <span className="shrink-0 rounded-full bg-positive/10 px-2 py-0.5 font-mono text-[9px] font-bold text-positive">Live</span>
                          ) : (
                            <span className="shrink-0 rounded-full border border-ui-border-subtle bg-ui-raised px-2 py-0.5 font-mono text-[9px] font-bold text-subtle">Coming soon</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 rounded-xl bg-ui-raised px-3 py-2.5">
                      <div className="font-mono text-[10px] font-semibold text-subtle">Not seeing your subject?</div>
                      <button onClick={() => { setSubjectsOpen(false); start(); }} className="mt-1 text-body-s font-semibold text-accent hover:underline" type="button">Join waitlist →</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-8 [&_a]:text-body-s [&_a]:font-semibold [&_a]:text-muted [&_a:hover]:text-accent">
                {NAV_LINKS.map(([href, label]) => (
                  <a href={href} key={href}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 md:flex">
                <ThemeToggle compact />
                <button className="btn btn-primary" onClick={start}>
                  Start learning
                </button>
              </div>
              <button
                aria-controls="mobile-navigation"
                aria-expanded={menu}
                aria-label={menu ? "Close menu" : "Open menu"}
                className="btn btn-ghost -mr-1 p-2 md:hidden"
                onClick={() => setMenu(!menu)}
                type="button"
              >
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.9"
                  viewBox="0 0 24 24"
                >
                  {menu ? (
                    <path d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {menu && (
            <div
              className="border-t border-ui-border-subtle bg-page px-4 pb-5 pt-2 md:hidden"
              id="mobile-navigation"
            >
              {/* Mobile Subjects */}
              <button
                onClick={() => setMobileSubjectsOpen((v) => !v)}
                aria-expanded={mobileSubjectsOpen}
                className="flex w-full items-center justify-between rounded-chip px-3 py-3 text-body font-semibold text-muted transition hover:bg-ui-raised hover:text-foreground"
                type="button"
              >
                <span className="flex items-center gap-2">Subjects</span>
                <svg
                  className={`size-4 shrink-0 transition-transform ${mobileSubjectsOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              {mobileSubjectsOpen && (
                <div className="mb-2 ml-1 grid gap-1 rounded-xl border border-ui-border-subtle bg-ui-raised/50 p-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s.label}
                      disabled={!s.available}
                      onClick={() => {
                        if (!s.available) return;
                        setMenu(false);
                        setMobileSubjectsOpen(false);
                        const el = document.getElementById("features");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                        else start();
                      }}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left ${s.available ? "bg-page shadow-sm" : "opacity-60"}`}
                      type="button"
                    >
                      <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg border text-[12px] font-bold ${s.available ? "border-accent/20 bg-accent/10 text-accent" : "border-ui-border-subtle bg-page text-subtle"}`}>{s.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-body-s font-semibold leading-none ${s.available ? "text-foreground" : "text-muted"}`}>{s.label}</span>
                        <span className="block truncate font-mono text-[10px] text-subtle">{s.available ? "Available now" : "Coming soon"}</span>
                      </span>
                      {!s.available && <span className="rounded-full bg-page px-2 py-0.5 font-mono text-[9px] font-bold text-subtle border border-ui-border-subtle">Soon</span>}
                    </button>
                  ))}
                </div>
              )}
              {NAV_LINKS.map(([href, label]) => (
                <a
                  className="block rounded-chip px-3 py-3 text-body font-semibold text-muted transition hover:bg-ui-raised hover:text-foreground"
                  href={href}
                  key={href}
                  onClick={() => setMenu(false)}
                >
                  {label}
                </a>
              ))}
              <div className="mt-2 border-t border-ui-border-subtle pt-4">
                <button
                  className="btn btn-primary w-full"
                  onClick={() => {
                    setMenu(false);
                    start();
                  }}
                  type="button"
                >
                  Start learning
                </button>
                <div className="mt-4 px-1">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section>
          <div className="mx-auto mt-14 w-full px-6 text-center">
            <div className="mb-4 kicker text-accent justify-center text-center">
              AI Mathematics Tutor
            </div>
            <div className="relative inline-block w-full">
              <h1 className="mx-auto font-heading text-display-m md:text-display-2xl">
                <span className="block">Understand Math.</span>
                <span className="block">
                  Your{" "}
                  <span className="animate-stamp-in edge [--edge-color:var(--color-success-strong)] mx-auto mt-2 inline-block w-fit -rotate-2 rounded-[20px] bg-positive px-5 pb-2.5 pt-1 text-white md:mx-0">
                    way.
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
              Learning helps you master mathematics step-by-step. Aligned with
              your school curriculum, it explains concepts clearly and guides
              you until you truly understand.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button className="btn btn-primary btn-lg" onClick={start}>
                Start learning
              </button>
              <a className="btn btn-secondary btn-lg" href="#how-it-works">
                See how it works
              </a>
            </div>
            <div className="mt-4 text-body-s text-subtle">
              20 free credits · Aligned with African Curricula · No subscription
            </div>
          </div>

          {/* Hero UI illustration */}
          <HeroUIIllustration />
        </section>

        {/* ── Problem ─────────────────────────────────────────────────────── */}
        <Section
          id="problem"
          kicker="The problem"
          title="Chatbots give answers. Tutors teach understanding."
          sub="Students often use generic AI to solve math problems. But getting the answer isn't learning. You need a guide who explains the 'why', checks your work, and follows your school curriculum."
        >
          <div className="mt-11 grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
            {[
              "Generic AI gives the answer immediately, skipping the learning process",
              "Explanations are often too advanced or don't match your class level",
              "No structure — just a messy chat history with no progress tracking",
              "No connection to your actual school curriculum or exams",
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

        {/* ── Solution ────────────────────────────────────────────────────── */}
        <Section
          id="solution"
          kicker="The Learning way"
          title="More than a calculator. A dedicated math tutor."
          sub="Learning turns AI into a structured learning experience. It doesn't just solve the equation; it teaches you how to solve it yourself."
        >
          <div className="mt-11 grid grid-cols-[1fr_auto_1fr] items-center gap-5 max-[760px]:grid-cols-1">
            <Compare
              label="Asking ChatGPT"
              quote="Here is the answer: x = 4."
              items={[
                "One-off answers with no context",
                "No memory of your progress",
                "Often hallucinates or makes calculation errors",
                "You have to prompt it perfectly to get good help",
              ]}
              old
            />
            <div className="text-display-s font-bold text-subtle max-[760px]:hidden">
              →
            </div>
            <Compare
              label="Learning with Learning"
              quote="Let's solve this step-by-step."
              items={[
                "Guides you through the reasoning process",
                "Adapts explanations to your class level (e.g. Grade 10)",
                "Checks your understanding with quizzes",
                "Tracks your mastery of every concept",
              ]}
            />
          </div>
        </Section>

        {/* ── Features — with per-feature illustrations ────────────────────── */}
        <Section
          id="features"
          kicker="What Learning does"
          title="Everything you need to master mathematics."
        >
          {/* Feature cards row */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map(([icon, title, text]) => (
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

          {/* ── Deep-dive illustrations ────────────────────────────────────── */}

          {/* 1. Curriculum Alignment */}
          <div className="mt-20 grid grid-cols-[1fr_1fr] items-center gap-10 max-[760px]:grid-cols-1">
            <div>
              <div className="mb-3 kicker text-accent">Curriculum Mode</div>
              <h3 className="font-display text-display-s font-bold leading-snug md:text-display-m">
                Follow your school's path.
              </h3>
              <p className="mt-3 text-body leading-relaxed text-muted">
                Select your country and class. Learning generates a complete
                mathematics curriculum broken into chapters and concepts,
                matching exactly what you study in school.
              </p>
              <ul className="mt-5 flex flex-col gap-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
                <li>Aligned with WAEC, NECO, and local curricula</li>
                <li>Structured chapters and concepts</li>
                <li>Track progress from Chapter 1 to Finals</li>
                <li>Never miss a topic again</li>
              </ul>
            </div>
            <PlanIllustration />
          </div>

          {/* 2. Level Check */}
          <div className="mt-20 grid grid-cols-[1fr_1fr] items-center gap-10 max-[760px]:grid-cols-1">
            <div className="order-2 max-[760px]:order-1">
              <SkillIntakeIllustration />
            </div>
            <div className="order-1 max-[760px]:order-2">
              <div className="mb-3 kicker text-accent">Smart Detection</div>
              <h3 className="font-display text-display-s font-bold leading-snug md:text-display-m">
                Learning meets you where you are.
              </h3>
              <p className="mt-3 text-body leading-relaxed text-muted">
                Not sure where to start? Learning analyzes your class level or
                runs a quick diagnostic test to identify your strengths and
                weaknesses. It builds a path that skips what you know and
                focuses on what you need.
              </p>
              <ul className="mt-5 flex flex-col gap-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
                <li>Select your Country and Class</li>
                <li>Optional diagnostic test</li>
                <li>Identifies weak areas instantly</li>
                <li>Personalized starting point</li>
              </ul>
            </div>
          </div>

          {/* 3. Lesson + Chat */}
          <div className="mt-20 grid grid-cols-[1fr_1fr] items-center gap-10 max-[760px]:grid-cols-1">
            <div>
              <div className="mb-3 kicker text-accent">Guided Learning</div>
              <h3 className="font-display text-display-s font-bold leading-snug md:text-display-m">
                Learn, then ask. Without losing your place.
              </h3>
              <p className="mt-3 text-body leading-relaxed text-muted">
                Each concept is explained clearly with examples. Stuck on a
                step? Ask the AI tutor. It answers in context, guiding you
                without just giving the solution away.
              </p>
              <ul className="mt-5 flex flex-col gap-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
                <li>Clear, step-by-step explanations</li>
                <li>Ask questions without losing context</li>
                <li>Real-world examples (Business, Construction, etc.)</li>
                <li>Adapts to your learning speed</li>
              </ul>
            </div>
            <LessonChatIllustration />
          </div>

          {/* 4. Exercise / evaluation */}
          <div className="mt-20 grid grid-cols-[1fr_1fr] items-center gap-10 max-[760px]:grid-cols-1">
            <div className="order-2 max-[760px]:order-1">
              <ExerciseIllustration />
            </div>
            <div className="order-1 max-[760px]:order-2">
              <div className="mb-3 kicker text-accent">
                Practice & Mastery
              </div>
              <h3 className="font-display text-display-s font-bold leading-snug md:text-display-m">
                Don't just read it. Prove you learned it.
              </h3>
              <p className="mt-3 text-body leading-relaxed text-muted">
                Every concept ends with AI-generated quizzes. Learning evaluates
                your answers, explains mistakes, and only marks a topic complete
                when you've demonstrated understanding.
              </p>
              <ul className="mt-5 flex flex-col gap-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
                <li>Quizzes generated per concept</li>
                <li>Instant feedback on every answer</li>
                <li>Retake until you master it</li>
                <li>Score history kept on your profile</li>
              </ul>
            </div>
          </div>

          {/* 5. Progress tracking */}
          <div className="mt-20 grid grid-cols-[1fr_1fr] items-center gap-10 max-[760px]:grid-cols-1">
            <div>
              <div className="mb-3 kicker text-accent">Progress tracking</div>
              <h3 className="font-display text-display-s font-bold leading-snug md:text-display-m">
                See exactly how far you've come.
              </h3>
              <p className="mt-3 text-body leading-relaxed text-muted">
                Learning tracks every concept mastered and quiz score. Your
                dashboard shows which math topics are growing and where you need
                more practice — so you always know what to study next.
              </p>
              <ul className="mt-5 flex flex-col gap-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
                <li>Concept mastery tracking</li>
                <li>Topic-specific skill growth</li>
                <li>Daily activity and streaks</li>
                <li>Full history across all your paths</li>
              </ul>
            </div>
            <ProgressIllustration />
          </div>
        </Section>

        {/* ── How it works ────────────────────────────────────────────────── */}
        <Section
          id="how-it-works"
          kicker="How it works"
          title="From confusion to mastery in four steps."
        >
          <div className="mt-11 flex flex-col md:flex-row items-stretch gap-4">
            {[
              [
                "Select your class",
                "\u201CI am in Grade 10, Nigeria.\u201D Tell Learning your context.",
              ],
              [
                "Get your learning path",
                "A structured curriculum built for your specific class level.",
              ],
              [
                "Learn & Practice",
                "Understand concepts with AI guidance and solve exercises.",
              ],
              [
                "Track mastery",
                "Quizzes validate it. Your path updates as you progress.",
              ],
            ].map(([t, d], i) => (
              <button
                data-active={step === i}
                className={`w-full relative overflow-hidden card px-5 pb-6 pt-6 text-left transition ${step === i ? "active -translate-y-1 border-accent opacity-100 card-featured" : "border-ui-border-subtle opacity-70"}`}
                onClick={() => setStep(i)}
                key={t}
              >
                <div className="absolute inset-x-0 top-0 h-0.75 bg-ui-border-subtle">
                  <div className="h-full w-0 bg-accent transition-[width] duration-3200 in-[.active]:w-full" />
                </div>
                <div className="mb-2 font-mono text-body-s font-bold text-subtle in-[.active]:text-accent">
                  0{i + 1}
                </div>
                <div className="mb-1 text-body font-bold">{t}</div>
                <div className="text-body-s leading-normal text-muted">{d}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* ── Your AI ─────────────────────────────────────────────────────── */}
        <Section
          id="your-ai"
          kicker="Powered by the best AI"
          title="Enterprise-grade AI, focused on Mathematics."
          sub="Learning uses top-tier AI models to generate personalised lessons, quizzes, and exercises. No configuration needed — just start learning."
        >
          <div className="mt-11 grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
            {[
              ["Pedagogy-First", "AI trained to teach, not just answer. It guides you step-by-step."],
              ["Curriculum Aware", "Knows what Grade 10 students should know vs Grade 12."],
              [
                "No setup required",
                "We handle the AI infrastructure. You just focus on math.",
              ],
              ["Always improving", "New models and features are added as Learning grows."],
            ].map(([t, d]) => (
              <div className="card px-6 py-5" key={t}>
                <div className="text-body font-semibold">{t}</div>
                <div className="mt-1 text-body-s leading-normal text-muted">
                  {d}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Pricing ─────────────────────────────────────────────────────── */}
        <Section
          id="pricing"
          kicker="Pricing"
          title="Pay for what you use."
          sub="Start free. Buy credits when you need them. No subscription required."
        >
          {/* Credit packs */}
          <div className="mt-10">
            <div className="mb-4 text-center font-mono text-label font-semibold text-subtle">
              CREDIT PACKS
            </div>
            <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
              <Price
                name="Starter"
                desc="Enough for one full chapter."
                price="$9"
                billed="100 credits · never expire"
                features={[
                  "100 credits",
                  "1 credit = 1 concept lesson or quiz",
                  "Credits never expire",
                  "Use across any learning path",
                ]}
                action="Start learning"
                start={start}
              />
              <Price
                featured
                name="Pro"
                desc="Best value for serious students."
                price="$19"
                billed="300 credits · never expire"
                features={[
                  "300 credits",
                  "1 credit = 1 concept lesson or quiz",
                  "Credits never expire",
                  "Save 33% vs Starter",
                  "Priority AI responses",
                ]}
                note="Most popular."
                action="Start learning"
                start={start}
              />
              <Price
                name="Pay-as-you-go"
                desc="Buy exactly what you need."
                price="$0.10"
                period="/ credit"
                billed="Minimum 10 credits"
                features={[
                  "Pay per credit, no bundle",
                  "1 credit = 1 concept lesson or quiz",
                  "Credits never expire",
                  "Add more anytime",
                ]}
                action="Start learning"
                start={start}
              />
            </div>
          </div>

          {/* What you get free */}
          <div className="mt-12">
            <div className="mb-4 text-center font-mono text-label font-semibold text-subtle">
              ALWAYS FREE — NO CREDITS NEEDED
            </div>
            <div className="mx-auto grid max-w-3xl grid-cols-3 gap-3 max-[760px]:grid-cols-1">
              {[
                [
                  "◆",
                  "Curriculum Access",
                  "Browse full math curricula for your country and class.",
                ],
                [
                  "◇",
                  "Progress Tracking",
                  "Track what you've learned across all your paths.",
                ],
                [
                  "✎",
                  "Quick Concept Mode",
                  "Ask one-off questions and get instant explanations.",
                ],
              ].map(([icon, title, text]) => (
                <div
                  className="rounded-card border border-ui-border-subtle bg-ui-raised/50 px-5 py-4"
                  key={title}
                >
                  <div className="mb-2 text-display-s text-accent">{icon}</div>
                  <div className="text-body font-semibold">{title}</div>
                  <div className="mt-1 text-body-s leading-relaxed text-muted">
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extra paths */}
          <div className="mt-8 text-center">
            <p className="text-body-s text-muted">
              Free plan includes{" "}
              <strong className="text-foreground">1 learning path</strong>. Need
              more? Add additional paths (e.g., extra subjects) for{" "}
              <strong className="text-foreground">$5 each</strong> — one-time,
              yours forever.
            </p>
          </div>
        </Section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <Section id="faq" kicker="FAQ" title="Questions people actually ask.">
          <div className="mt-11 flex flex-col gap-2">
            {faqs.map(([q, a], i) => (
              <article
                className={`overflow-hidden card ${faq === i ? "open" : ""}`}
                key={q}
              >
                <button
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-body font-semibold"
                  onClick={() => setFaq(faq === i ? -1 : i)}
                >
                  <span>{q}</span>
                  <span className="text-display-s text-accent transition in-[.open]:rotate-45">
                    +
                  </span>
                </button>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] in-[.open]:grid-rows-[1fr] [&_p]:overflow-hidden [&_p]:px-6 [&_p]:text-body-s [&_p]:leading-[1.6] [&_p]:text-muted [.open_&_p]:pb-5">
                  <p>{a}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section className="mx-auto mt-24 w-full max-w-205 px-6">
          <div className="rounded-card bg-linear-to-br from-accent to-accent-strong px-10 py-14 text-center [&_h2]:font-display [&_h2]:text-display-m [&_h2]:text-white [&_p]:mx-auto [&_p]:mb-7 [&_p]:mt-3 [&_p]:text-body [&_p]:text-white/85 [&_.btn]:border-white [&_.btn]:bg-white [&_.btn]:text-accent [&_.btn]:shadow-[0_4px_0_var(--color-brand-subtle)] md:[&_h2]:text-display-l">
            <h2>Start mastering mathematics.</h2>
            <p>Select your class. Learning builds your path. You master it.</p>
            <button className="btn btn-primary btn-lg" onClick={start}>
              Start learning →
            </button>
          </div>
        </section>

        <Footer start={start} />
      </main>
    </>
  );
}

// ── Shared primitives ────────────────────────────────────────────────────────

function Spark({
  className,
  color,
  circle,
}: {
  className: string;
  color: RoleColor;
  circle?: boolean;
}) {
  return (
    <svg
      className={`absolute h-5 w-5 animate-pulse ${className}`}
      viewBox="0 0 24 24"
    >
      <g fill={`var(--${color})`}>
        {circle ? (
          <circle cx="12" cy="12" r="5" />
        ) : (
          <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
        )}
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

function Compare({
  label,
  quote,
  items,
  old = false,
}: {
  label: string;
  quote: string;
  items: string[];
  old?: boolean;
}) {
  return (
    <article className={`card p-6 ${old ? "" : "card-featured"}`}>
      <div className="mb-2 kicker text-subtle">{label}</div>
      <div className="mb-4 font-display text-display-s font-bold">{quote}</div>
      <ul
        className={`flex list-none flex-col gap-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:leading-normal [&_li]:text-muted
        ${
          old
            ? "[&_li]:before:font-bold [&_li]:before:text-negative [&_li]:before:content-['✕']"
            : "[&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']"
        }`}
      >
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </article>
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
          Most popular
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
            Your AI mathematics tutor — a structured path, not just a
            one-time answer.
          </p>
        </div>
        <div className="[&_a]:mb-3 [&_a]:block [&_a]:text-body-s [&_a]:text-muted [&_button]:mb-3 [&_button]:block [&_button]:text-body-s [&_button]:text-muted">
          <div className="mb-3 kicker text-subtle">Product</div>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="[&_a]:mb-3 [&_a]:block [&_a]:text-body-s [&_a]:text-muted [&_button]:mb-3 [&_button]:block [&_button]:text-body-s [&_button]:text-muted">
          <div className="mb-3 kicker text-subtle">Company</div>
          <a href="#problem">Why Lenni</a>
          <a href="#how-it-works">How it works</a>
        </div>
        <div className="[&_a]:mb-3 [&_a]:block [&_a]:text-body-s [&_a]:text-muted [&_button]:mb-3 [&_button]:block [&_button]:text-body-s [&_button]:text-muted">
          <div className="mb-3 kicker text-subtle">Get started</div>
          <button onClick={start}>Start learning</button>
        </div>
      </div>
      <div className="flex justify-between gap-2 pt-6 [&_span]:text-body-s [&_span]:text-subtle">
        <span>&copy; {year} Learning. All rights reserved.</span>
        <span>Made for African students.</span>
      </div>
    </footer>
  );
}