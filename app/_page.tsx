"use client";

import { useRouter } from "next/navigation";
import { Logo } from "./components/logo";
import { ThemeToggle } from "./components/theme-toggle";
import { CAREER_CATALOG } from "../lib/careers";
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
  ["/creators", "For Creators"],
];

const subjects: Array<[string, string, RoleColor, RoleIconName]> =
  CAREER_CATALOG.map((subject) => [
    subject.title,
    subject.tagline,
    subject.colorKey as RoleColor,
    subject.iconKey as RoleIconName,
  ]);

const features = [
  [
    "◆",
    "A path built from you",
    "Lenni starts from what you already know and plots the shortest real path to your goal — no generic curriculum.",
  ],
  [
    "◇",
    "Powered by the best AI models",
    "Lenni uses top-tier AI models to generate lessons, quizzes, and exercises tailored to your exact level.",
  ],
  [
    "✎",
    "Learn, then prove it",
    "Every topic ends with a quiz or exercise Lenni generates for you, so you validate what you learned, not just read it.",
  ],
  [
    "○",
    "Progress you can see",
    "Completed, current, and upcoming topics update automatically, so you always know exactly where you stand.",
  ],
  [
    "△",
    "One place, not one chat",
    "No more starting a new conversation every time. Your goal, resources, practice, and history all live together.",
  ],
  [
    "▣",
    "Learn almost anything",
    "Technology, business, creative skills, languages — tell Lenni the goal and it builds the path around it.",
  ],
];

const faqs = [
  [
    "Do I need to already know the subject to start?",
    "No. Lenni starts from your current level, whatever that is, and builds the path from there — beginner or advanced.",
  ],
  [
    "How do credits work?",
    "1 credit = 1 lesson, quiz, or exercise. You get 20 free credits to start. Buy more packs anytime — credits never expire.",
  ],
  [
    "What's free and what needs credits?",
    "Skill detection, curriculum generation, and progress tracking are always free. Consuming content (lessons, quizzes, exercises) costs 1 credit each.",
  ],
  [
    "Can I change what I'm learning later?",
    "Yes. Your first learning path is free. Set a new goal anytime, or add additional paths for $5 each.",
  ],
  [
    "How is this different from asking ChatGPT or Claude directly?",
    "A chat gives you an answer and forgets it. Lenni keeps a persistent path, tracks what you've actually learned, and knows what's next — closer to a structured course than a chat window.",
  ],
  [
    "Is there a free plan?",
    "Yes — you get 20 free credits, 1 learning path, skill detection, and curriculum generation. No credit card required.",
  ],
  [
    "What can I actually learn on Lenni?",
    "Almost anything — programming languages, AI engineering, cybersecurity, product management, marketing, entrepreneurship, and more. If you can name the goal, Lenni can build the path.",
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
// HERO UI ILLUSTRATION — realistic connected app UI
// Lesson tab shows a real course layout, not a chat
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
    { id: 1, title: "Foundations", lessons: 4, done: true },
    { id: 2, title: "Core Concepts", lessons: 5, done: true },
    {
      id: 3,
      title: "Applied Practice",
      lessons: 6,
      done: false,
      active: true,
      progress: 2,
    },
    { id: 4, title: "Advanced Topics", lessons: 4, done: false },
    { id: 5, title: "Capstone Project", lessons: 2, done: false },
  ];

  const quizOptions = [
    "It increases the model's accuracy unconditionally",
    "It controls how large each parameter update step is",
    "It determines the number of training epochs",
    "It sets the initial weights of the network",
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
              lenni.app/paths/ai-engineering/lesson/3-3
            </span>
          </div>
          <div className="flex size-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            A
          </div>
        </div>

        {/* ── App body ── */}
        <div className="flex h-130 max-[640px]:h-auto max-[640px]:flex-col">
          {/* ── Left sidebar ── */}
          <aside className="flex w-52 shrink-0 flex-col border-r border-ui-border-subtle bg-ui-raised/50 max-[640px]:hidden">
            <div className="border-b border-ui-border-subtle px-4 py-3">
              <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-subtle">
                Current path
              </div>
              <div className="mt-0.5 text-body-s font-bold leading-tight">
                AI Engineering
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
                      ? `${ch.progress} / ${ch.lessons} lessons`
                      : `${ch.lessons} lessons`}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-ui-border-subtle px-2 py-3">
              {[
                { icon: "◈", label: "My paths" },
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
                    Chapter 3 · Lesson 3
                  </span>
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[9px] font-bold text-accent">
                    IN PROGRESS
                  </span>
                </div>
                <div className="mt-0.5 text-body-s font-bold">
                  Backpropagation & Gradient Flow
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

            {/* ── LESSON TAB — real course layout ── */}
            {activeTab === "lesson" && (
              <div className="flex flex-1 overflow-hidden">
                {/* Course content */}
                <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
                  {/* Lesson intro */}
                  <p className="text-body-s leading-relaxed text-muted">
                    Backpropagation is the algorithm that makes neural networks
                    learn. It computes how much each weight in the network
                    contributed to the final error, then nudges every weight in
                    the direction that reduces it.
                  </p>

                  {/* Section heading */}
                  <div className="mt-5 mb-2 flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                      1
                    </span>
                    <h4 className="text-body-s font-bold text-foreground">
                      The forward pass
                    </h4>
                  </div>
                  <p className="text-body-s leading-relaxed text-muted">
                    Data flows forward through every layer. Each neuron computes
                    a weighted sum of its inputs and passes the result through
                    an activation function. The final layer produces a
                    prediction.
                  </p>

                  {/* Visual: forward pass diagram */}
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-ui-border-subtle bg-ui-raised px-4 py-4">
                    {["Input", "Hidden 1", "Hidden 2", "Output"].map(
                      (label, i, arr) => (
                        <div key={label} className="flex items-center gap-2">
                          <div className="flex flex-col items-center gap-1">
                            {Array.from({
                              length: i === 0 || i === arr.length - 1 ? 2 : 3,
                            }).map((_, j) => (
                              <div
                                key={j}
                                className={`flex size-6 items-center justify-center rounded-full border text-[8px] font-bold
                                ${
                                  i === arr.length - 1
                                    ? "border-accent bg-accent/10 text-accent"
                                    : i === 0
                                      ? "border-ui-border-subtle bg-ui-raised text-subtle"
                                      : "border-positive/40 bg-positive/8 text-positive"
                                }`}
                              >
                                {i === 0
                                  ? "x"
                                  : i === arr.length - 1
                                    ? "ŷ"
                                    : "h"}
                              </div>
                            ))}
                            <span className="font-mono text-[8px] text-subtle mt-0.5">
                              {label}
                            </span>
                          </div>
                          {i < arr.length - 1 && (
                            <div className="flex flex-col gap-1 items-center">
                              {Array.from({ length: 2 }).map((_, j) => (
                                <svg
                                  key={j}
                                  className="size-4 text-subtle"
                                  viewBox="0 0 16 8"
                                  fill="none"
                                >
                                  <path
                                    d="M0 4h14M10 1l4 3-4 3"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              ))}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>

                  {/* Section heading */}
                  <div className="mt-5 mb-2 flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                      2
                    </span>
                    <h4 className="text-body-s font-bold text-foreground">
                      Computing the loss
                    </h4>
                  </div>
                  <p className="text-body-s leading-relaxed text-muted">
                    After the forward pass, we compare the prediction{" "}
                    <code className="rounded bg-ui-raised px-1 font-mono text-[10px]">
                      ŷ
                    </code>{" "}
                    to the true label{" "}
                    <code className="rounded bg-ui-raised px-1 font-mono text-[10px]">
                      y
                    </code>{" "}
                    using a loss function. Mean squared error is common for
                    regression:
                  </p>

                  {/* Formula block */}
                  <div className="mt-3 flex items-center justify-center rounded-xl border border-ui-border-subtle bg-ui-raised px-4 py-3">
                    <span className="font-mono text-body-s text-foreground">
                      L = <span className="text-accent">½</span> · (ŷ − y)
                      <span className="text-accent align-super text-[9px]">
                        2
                      </span>
                    </span>
                  </div>

                  {/* Section heading */}
                  <div className="mt-5 mb-2 flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                      3
                    </span>
                    <h4 className="text-body-s font-bold text-foreground">
                      The backward pass
                    </h4>
                  </div>
                  <p className="text-body-s leading-relaxed text-muted">
                    Backprop uses the chain rule to compute the gradient of the
                    loss with respect to every weight — layer by layer, working
                    backwards from the output.
                  </p>

                  {/* Key concept callout */}
                  <div className="mt-4 flex gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
                    <span className="mt-0.5 text-accent">◆</span>
                    <div className="text-body-s leading-relaxed text-muted">
                      <span className="font-semibold text-foreground">
                        Key insight:{" "}
                      </span>
                      The gradient tells each weight: "move this much, in this
                      direction, to reduce the loss." That's the entire learning
                      signal.
                    </div>
                  </div>
                </div>

                {/* Lesson nav footer */}
                <div className="absolute bottom-0 right-0 hidden" />
              </div>
            )}

            {/* ── EXERCISE TAB ── */}
            {activeTab === "exercise" && (
              <div className="flex flex-1 flex-col overflow-y-auto">
                <div className="flex-1 px-5 py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[9px] font-semibold text-accent">
                        QUIZ · Chapter 3 · Lesson 3
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
                    What does the{" "}
                    <span className="rounded bg-accent/10 px-1 text-accent">
                      learning rate
                    </span>{" "}
                    control during gradient descent?
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
                      The learning rate controls the step size for each weight
                      update. Too high and training overshoots; too low and it
                      stalls.
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
                      text: "Can you give me a concrete example of backprop with actual numbers?",
                    },
                    {
                      role: "lenni" as const,
                      text: "Sure. Say weight w = 0.3, input x = 2, true label y = 1. Output = 0.6, loss = ½(0.6 − 1)² = 0.08. Gradient of loss w.r.t. w = (0.6 − 1) × 2 = −0.8. With learning rate 0.1: w_new = 0.3 − 0.1 × (−0.8) = 0.38.",
                    },
                    {
                      role: "user" as const,
                      text: "So the weight moved toward producing the right answer?",
                    },
                    {
                      role: "lenni" as const,
                      text: "Exactly. Each update is a small step in the direction that reduces the loss. Do this thousands of times across all weights and the network learns.",
                    },
                  ].map((m, i) => (
                    <div
                      key={i}
                      className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold
                        ${m.role === "lenni" ? "bg-accent text-white" : "bg-ui-raised border border-ui-border-subtle text-muted"}`}
                      >
                        {m.role === "lenni" ? "L" : "A"}
                      </div>
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-body-s leading-relaxed
                        ${
                          m.role === "lenni"
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
                      Ask anything about this lesson…
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
                AI Provider
              </div>
              <div className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-positive" />
                  <span className="text-label font-semibold">OpenRouter</span>
                </div>
                <div className="mt-0.5 font-mono text-[9px] text-subtle">
                  claude-3.5-sonnet
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-subtle">
                Today
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "Lessons read", value: "2" },
                  { label: "Quiz score", value: "82%" },
                  { label: "Time spent", value: "34 min" },
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
                7 day streak
              </span>
            </div>

            <div>
              <div className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-subtle">
                Skills
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { name: "ML Theory", pct: 72 },
                  { name: "Python", pct: 85 },
                  { name: "Optimisers", pct: 40 },
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
                Next lesson →
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
            Previous lesson
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
// FEATURE ILLUSTRATION: Learning Plan
// Shows a generated multi-chapter plan with estimated times
// ---------------------------------------------------------------------------
function PlanIllustration() {
  const chapters = [
    { n: 1, title: "Foundations", lessons: 4, hrs: 2, done: true },
    { n: 2, title: "Core Concepts", lessons: 5, hrs: 3, done: true },
    {
      n: 3,
      title: "Applied Practice",
      lessons: 6,
      hrs: 3.5,
      done: false,
      active: true,
    },
    { n: 4, title: "Advanced Topics", lessons: 4, hrs: 2.5, done: false },
    { n: 5, title: "Final Project", lessons: 2, hrs: 1, done: false },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-subtle bg-page shadow-lg">
      <div className="border-b border-ui-border-subtle bg-ui-raised px-4 py-2.5">
        <div className="font-mono text-label font-semibold text-subtle">
          YOUR LEARNING PLAN · AI-generated
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
                {ch.lessons} lessons · {ch.hrs} hrs
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
          21 lessons · ~12 hours total
        </span>
        <span className="font-mono text-label font-semibold text-accent">
          40% complete
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FEATURE ILLUSTRATION: Skill Intake
// Shows how Lenni reads the user's level from GitHub / LinkedIn / Resume / Test
// ---------------------------------------------------------------------------
function SkillIntakeIllustration() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((n) => (n + 1) % 4), 2400);
    return () => clearInterval(t);
  }, []);

  const sources = [
    {
      icon: "◈",
      label: "GitHub",
      lines: ["12 public repos", "Python · JS · Rust", "ML projects detected"],
      color: "text-accent",
    },
    {
      icon: "◉",
      label: "LinkedIn",
      lines: ["3 yrs experience", "Software Engineer", "2 ML-related roles"],
      color: "text-positive",
    },
    {
      icon: "▤",
      label: "Resume",
      lines: [
        "BSc Computer Science",
        "PyTorch · TensorFlow",
        "Deployed 2 models",
      ],
      color: "text-sun",
    },
    {
      icon: "◎",
      label: "Skill test",
      lines: ["Scored 74 / 100", "Strong: data structures", "Weak: optimisers"],
      color: "text-ember",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-subtle bg-page shadow-lg">
      <div className="border-b border-ui-border-subtle bg-ui-raised px-4 py-2.5">
        <div className="font-mono text-label font-semibold text-subtle">
          SKILL LEVEL DETECTION
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
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
                  READING
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
          LENNI CONCLUSION
        </div>
        <div className="mt-1 text-body-s text-muted">
          Intermediate level detected. Your path starts at{" "}
          <strong className="text-foreground">Chapter 2</strong>, skipping
          basics you already know.
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FEATURE ILLUSTRATION: Lesson + Chat
// Shows AI-generated lesson content and inline Q&A
// ---------------------------------------------------------------------------
function LessonChatIllustration() {
  const messages = [
    {
      role: "lenni",
      text: "Attention lets the model weigh every token against every other — that's why Transformers capture long-range dependencies so well.",
    },
    { role: "user", text: "Why can't RNNs do the same thing?" },
    {
      role: "lenni",
      text: "RNNs pass context through a hidden state, so distant information gets diluted. Attention looks at everything at once, no forgetting.",
    },
    {
      role: "user",
      text: "That makes sense. What's the time complexity trade-off?",
    },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-subtle bg-page shadow-lg">
      <div className="border-b border-ui-border-subtle bg-ui-raised px-4 py-2.5 flex items-center gap-3">
        <div>
          <div className="font-mono text-label text-subtle">
            Chapter 4 · Lesson 1
          </div>
          <div className="text-body-s font-bold">Attention Mechanisms</div>
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
              ${m.role === "lenni" ? "bg-accent text-white" : "bg-ui-raised text-muted border border-ui-border-subtle"}`}
            >
              {m.role === "lenni" ? "L" : "U"}
            </div>
            <div
              className={`max-w-[82%] rounded-xl px-3 py-2 text-body-s leading-relaxed
              ${m.role === "lenni" ? "bg-ui-raised text-foreground" : "bg-accent text-white"}`}
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
            Ask anything about this lesson…
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
// Shows an AI-generated quiz with evaluation feedback
// ---------------------------------------------------------------------------
function ExerciseIllustration() {
  const [chosen, setChosen] = useState<number | null>(null);
  const options = [
    "Quadratic in sequence length — O(n²)",
    "Linear in sequence length — O(n)",
    "Logarithmic — O(log n)",
    "Constant — O(1)",
  ];
  const correct = 0;
  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-subtle bg-page shadow-lg">
      <div className="border-b border-ui-border-subtle bg-ui-raised px-4 py-2.5 flex items-center justify-between">
        <div>
          <div className="font-mono text-label text-subtle">
            EXERCISE · Chapter 4
          </div>
          <div className="text-body-s font-bold">AI-generated quiz</div>
        </div>
        <span className="rounded-full border border-ui-border-subtle px-2 py-0.5 font-mono text-[9px] text-subtle">
          Q 2 of 5
        </span>
      </div>
      <div className="px-4 pt-4 pb-2">
        <div className="mb-3 text-body font-semibold leading-snug">
          What is the time complexity of the self-attention mechanism with
          respect to sequence length?
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
            ? "Correct! Self-attention computes pairwise scores between all tokens — O(n²) time and memory, which is why efficient variants like FlashAttention matter."
            : "Not quite. Self-attention scores every pair of tokens, giving O(n²) complexity — the main scalability challenge for long sequences."}
        </div>
      ) : (
        <div className="mx-4 mb-4 mt-2 font-mono text-label text-subtle">
          Select an answer to see Lenni's feedback.
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
    { name: "ML Theory", pct: 82 },
    { name: "Python / NumPy", pct: 70 },
    { name: "Model Training", pct: 55 },
    { name: "Evaluation", pct: 38 },
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
            { v: "14", l: "Lessons", c: "text-accent" },
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
          SKILL GROWTH
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
  const router = useRouter();
  const subjectScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 3200);
    return () => clearInterval(t);
  }, []);

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
                  Join waitlist
                </button>
                <div className="mt-4 px-1">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Gradient glow behind hero */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/8 blur-[120px]" />
            <div className="absolute right-0 top-20 h-[300px] w-[400px] rounded-full bg-positive/6 blur-[100px]" />
          </div>

          <div className="relative z-1 mx-auto mt-20 w-full px-6 text-center md:mt-28">
            {/* Pill badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ui-border-subtle bg-ui-raised/80 px-4 py-1.5 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-positive animate-pulse" />
              <span className="font-mono text-label font-semibold text-subtle">
                20 free credits · No subscription
              </span>
            </div>

            <h1 className="mx-auto max-w-4xl font-heading text-display-l font-extrabold leading-[1.05] tracking-tight md:text-display-2xl">
              Learn anything.
              <br />
              <span className="text-accent">Your way.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-body leading-relaxed text-muted md:text-body-l">
              Lenni reads your skills, builds a personalised learning path with
              chapters and exercises, and tracks your growth — powered by the
              best AI models.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button className="btn btn-primary btn-lg" onClick={start}>
                Join waitlist
              </button>
              <a className="btn btn-secondary btn-lg" href="#how-it-works">
                See how it works →
              </a>
            </div>

            <p className="mt-5 text-body-s text-subtle">
              1 credit = 1 lesson, quiz, or exercise · Credits never expire
            </p>
          </div>

          {/* Hero UI illustration */}
          <HeroUIIllustration />
        </section>

        {/* ── Problem ─────────────────────────────────────────────────────── */}
        <Section
          id="problem"
          kicker="The problem"
          title="AI can answer questions. But can it teach you?"
          sub="ChatGPT, Claude, Gemini — great at explaining. But learning needs structure, practice, and progress tracking."
        >
          <div className="mt-11 grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
            {[
              "No memory — every chat starts from scratch",
              "No structure — just answers, no learning path",
              "No practice — you read, but never prove it",
              "No progress — you never know where you stand",
            ].map((x) => (
              <div
                className="flex items-start gap-4 rounded-card border border-ui-border-subtle bg-ui-raised/50 px-6 py-5"
                key={x}
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-negative-subtle text-body-s font-bold text-negative">
                  ✕
                </div>
                <div className="pt-0.5 text-body leading-snug text-muted">
                  {x}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Solution ────────────────────────────────────────────────────── */}
        <Section
          id="solution"
          kicker="The Lenni way"
          title="More than an AI chatbot."
          sub="Chat with AI and you get an answer. Learn with Lenni and you build knowledge — Lenni turns AI into a structured learning experience."
        >
          <div className="mt-11 grid grid-cols-[1fr_auto_1fr] items-center gap-5 max-[760px]:grid-cols-1">
            <Compare
              label="A chat with AI"
              quote="Heres your answer."
              items={[
                "One-off, disconnected replies",
                "No memory of your goal",
                "No sense of your progress",
                "You have to structure it yourself",
              ]}
              old
            />
            <div className="text-display-s font-bold text-subtle max-[760px]:hidden">
              →
            </div>
            <Compare
              label="Learning with Lenni"
              quote="Lets build your path."
              items={[
                "Built from your goal and current level",
                "One place for your whole journey",
                "Tracks what you've learned and proven",
                "Quizzes and exercises to validate it",
              ]}
            />
          </div>
        </Section>

        {/* ── Features — with per-feature illustrations ────────────────────── */}
        <Section
          id="features"
          kicker="What Lenni does"
          title="Everything you need to learn smarter."
        >
          {/* Feature cards row */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map(([icon, title, text]) => (
              <article
                className="group rounded-card border border-ui-border-subtle bg-ui-raised/50 p-6 transition-all hover:border-accent/30 hover:bg-accent/3"
                key={title}
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  {icon}
                </div>
                <h3 className="mb-2 font-display text-body-l font-bold">
                  {title}
                </h3>
                <p className="text-body-s leading-relaxed text-muted">{text}</p>
              </article>
            ))}
          </div>

          {/* ── Deep-dive illustrations ────────────────────────────────────── */}

          {/* 1. Skill intake */}
          <div className="mt-20 grid grid-cols-[1fr_1fr] items-center gap-10 max-[760px]:grid-cols-1">
            <div>
              <div className="mb-3 kicker text-accent">Skill detection</div>
              <h3 className="font-display text-display-s font-bold leading-snug md:text-display-m">
                Lenni meets you where you are.
              </h3>
              <p className="mt-3 text-body leading-relaxed text-muted">
                Connect your GitHub, LinkedIn, or resume — or take a quick
                adaptive test. Lenni analyses your actual skills and builds a
                path that starts from your real level, not a generic beginner
                course.
              </p>
              <ul className="mt-5 flex flex-col gap-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
                <li>GitHub repos & language detection</li>
                <li>LinkedIn work history & seniority</li>
                <li>Resume parsing for skills & education</li>
                <li>Adaptive skill test if you prefer</li>
              </ul>
            </div>
            <SkillIntakeIllustration />
          </div>

          {/* 2. Learning plan */}
          <div className="mt-20 grid grid-cols-[1fr_1fr] items-center gap-10 max-[760px]:grid-cols-1">
            <div className="order-2 max-[760px]:order-1">
              <PlanIllustration />
            </div>
            <div className="order-1 max-[760px]:order-2">
              <div className="mb-3 kicker text-accent">Learning plan</div>
              <h3 className="font-display text-display-s font-bold leading-snug md:text-display-m">
                A structured path, not a pile of links.
              </h3>
              <p className="mt-3 text-body leading-relaxed text-muted">
                Lenni generates a complete curriculum broken into chapters and
                lessons, with estimated time for each. The plan adapts as you
                learn — finish a chapter early, and the next one updates
                automatically.
              </p>
              <ul className="mt-5 flex flex-col gap-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
                <li>Chapters and lessons generated for your goal</li>
                <li>Time estimates per topic</li>
                <li>Plan updates as you complete lessons</li>
                <li>Skip what you already know</li>
              </ul>
            </div>
          </div>

          {/* 3. Lesson + Chat */}
          <div className="mt-20 grid grid-cols-[1fr_1fr] items-center gap-10 max-[760px]:grid-cols-1">
            <div>
              <div className="mb-3 kicker text-accent">AI lessons + chat</div>
              <h3 className="font-display text-display-s font-bold leading-snug md:text-display-m">
                Learn, then ask. Without losing your place.
              </h3>
              <p className="mt-3 text-body leading-relaxed text-muted">
                Each lesson is generated by your chosen AI model, tailored to
                your level. Got a question mid-lesson? Just ask — Lenni answers
                in context and keeps the lesson on track.
              </p>
              <ul className="mt-5 flex flex-col gap-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
                <li>Lessons generated to your exact level</li>
                <li>Ask questions without losing context</li>
                <li>Works with any AI provider</li>
                <li>All history saved — revisit anytime</li>
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
                Exercises & evaluation
              </div>
              <h3 className="font-display text-display-s font-bold leading-snug md:text-display-m">
                Don't just read it. Prove you learned it.
              </h3>
              <p className="mt-3 text-body leading-relaxed text-muted">
                Every chapter ends with AI-generated quizzes and exercises.
                Lenni evaluates your answers, explains what you got wrong, and
                only marks a topic complete when you've actually demonstrated
                understanding.
              </p>
              <ul className="mt-5 flex flex-col gap-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
                <li>Quizzes generated per chapter</li>
                <li>Instant AI feedback on every answer</li>
                <li>Retake until you pass</li>
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
                Lenni tracks every lesson, quiz score, and learning streak. Your
                dashboard shows which skills are growing, where you're
                strongest, and what needs more attention — so you always know
                what to do next.
              </p>
              <ul className="mt-5 flex flex-col gap-2 [&_li]:flex [&_li]:gap-2 [&_li]:text-body-s [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
                <li>Lessons and quiz scores tracked automatically</li>
                <li>Skill growth per topic</li>
                <li>Daily activity and streak</li>
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
          title="From goal to mastery in four steps."
        >
          <div className="mt-11 grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
            {[
              [
                "01",
                "Tell Lenni your goal",
                "\u201CI want to become an AI Engineer.\u201D Lenni maps the path.",
              ],
              [
                "02",
                "Get your learning path",
                "Built from your current knowledge, not a generic curriculum.",
              ],
              [
                "03",
                "Learn with AI",
                "Lessons, quizzes, and exercises — all tailored to you.",
              ],
              [
                "04",
                "Track your progress",
                "See skills grow, streaks build, and knowledge compound.",
              ],
            ].map(([n, t, d]) => (
              <div
                className="rounded-card border border-ui-border-subtle bg-ui-raised/50 px-6 py-5 transition-all hover:border-accent/30"
                key={n}
              >
                <div className="mb-2 font-mono text-body-s font-bold text-accent">
                  {n}
                </div>
                <div className="mb-1.5 text-body font-bold">{t}</div>
                <div className="text-body-s leading-relaxed text-muted">{d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Your AI ─────────────────────────────────────────────────────── */}
        <Section
          id="your-ai"
          kicker="Powered by the best AI"
          title="Enterprise-grade AI, accessible to everyone."
          sub="Top-tier AI models generate personalised lessons, quizzes, and exercises. No configuration needed."
        >
          <div className="mt-11 grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
            {[
              ["Claude & GPT-4", "Industry-leading models power your learning experience."],
              ["Personalised to you", "AI adapts content to your level, pace, and goals."],
              [
                "No setup required",
                "We handle the infrastructure. You just focus on learning.",
              ],
              ["Always improving", "New models and features added as Lenni grows."],
            ].map(([t, d]) => (
              <div
                className="rounded-card border border-ui-border-subtle bg-ui-raised/50 px-6 py-5 transition-all hover:border-accent/30"
                key={t}
              >
                <div className="text-body font-bold">{t}</div>
                <div className="mt-1.5 text-body-s leading-relaxed text-muted">
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
                desc="Enough for one full learning path."
                price="$9"
                billed="100 credits · never expire"
                features={[
                  "100 credits",
                  "1 credit = 1 lesson, quiz, or exercise",
                  "Credits never expire",
                  "Use across any learning path",
                ]}
                action="Join waitlist"
                start={start}
              />
              <Price
                featured
                name="Pro"
                desc="Best value for serious learners."
                price="$19"
                billed="300 credits · never expire"
                features={[
                  "300 credits",
                  "1 credit = 1 lesson, quiz, or exercise",
                  "Credits never expire",
                  "Save 33% vs Starter",
                  "Priority AI responses",
                ]}
                note="Most popular."
                action="Join waitlist"
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
                  "1 credit = 1 lesson, quiz, or exercise",
                  "Credits never expire",
                  "Add more anytime",
                ]}
                action="Join waitlist"
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
                  "Skill detection",
                  "Connect GitHub, LinkedIn, or take a test. AI identifies your level.",
                ],
                [
                  "◇",
                  "Curriculum generation",
                  "AI builds a full learning path with chapters and lesson outlines.",
                ],
                [
                  "✎",
                  "Progress tracking",
                  "Track what you've learned across all your paths.",
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
              more? Add additional paths for{" "}
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
        <section className="mx-auto mt-28 w-full max-w-205 px-6">
          <div className="relative overflow-hidden rounded-[28px] bg-linear-to-br from-accent via-accent to-accent-strong px-10 py-20 text-center shadow-[0_20px_60px_-12px_rgba(47,95,245,0.35)] md:py-24">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/8 blur-[60px]" />
            </div>
            <div className="relative z-1">
              <h2 className="font-heading text-display-m font-extrabold text-white md:text-display-l">
                Start learning something new.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-body text-white/80">
                Choose a goal. Lenni builds your path. You master it. 20 free
                credits to get started.
              </p>
              <button
                className="btn btn-lg mt-8 border-white bg-white text-accent shadow-[0_4px_0_var(--color-brand-subtle)] hover:bg-white/90"
                onClick={start}
              >
                Join waitlist →
              </button>
            </div>
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
            Your AI learning environment — a structured path, not just a
            one-time answer.
          </p>
        </div>
        <div className="[&_a]:mb-3 [&_a]:block [&_a]:text-body-s [&_a]:text-muted [&_button]:mb-3 [&_button]:block [&_button]:text-body-s [&_button]:text-muted">
          <div className="mb-3 kicker text-subtle">Product</div>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <a href="/creators">For Creators</a>
        </div>
        <div className="[&_a]:mb-3 [&_a]:block [&_a]:text-body-s [&_a]:text-muted [&_button]:mb-3 [&_button]:block [&_button]:text-body-s [&_button]:text-muted">
          <div className="mb-3 kicker text-subtle">Company</div>
          <a href="#problem">Why Lenni</a>
          <a href="#how-it-works">How it works</a>
        </div>
        <div className="[&_a]:mb-3 [&_a]:block [&_a]:text-body-s [&_a]:text-muted [&_button]:mb-3 [&_button]:block [&_button]:text-body-s [&_button]:text-muted">
          <div className="mb-3 kicker text-subtle">Get started</div>
          <button onClick={start}>Join waitlist</button>
        </div>
      </div>
      <div className="flex justify-between gap-2 pt-6 [&_span]:text-body-s [&_span]:text-subtle">
        <span>&copy; {year} Lenni. All rights reserved.</span>
        <span>Made for self learners.</span>
      </div>
    </footer>
  );
}
