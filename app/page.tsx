"use client";

import { useRouter } from "next/navigation";
import { Logo } from "./components/logo";
import {
  RoleIcon,
  roleIconColors,
  type RoleColor,
  type RoleIconName,
} from "./components/role-icon";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const roles: Array<[string, string, RoleColor, RoleIconName]> = [
  ["AI Engineer", "Foundations → LLMs", "blue", "network"],
  ["Product Manager", "Discovery → Strategy", "teal", "flag"],
  ["Product Designer", "Craft → Systems", "amber", "pen"],
  ["UX Designer", "Research → Flows", "blue", "layout"],
  ["Frontend Engineer", "JS → Frameworks", "teal", "browser"],
  ["Backend Engineer", "APIs → Systems", "amber", "server"],
  ["Data Scientist", "Stats → Modeling", "blue", "chart"],
  ["DevOps Engineer", "CI/CD → Cloud", "teal", "infinity"],
];
const features = [
  [
    "◆",
    "A roadmap built from you",
    "Lenni reads your résumé, LinkedIn and GitHub, then plots the shortest real path from where you are to your goal.",
  ],
  [
    "◇",
    "One plan a day",
    "No deciding what to study. Every morning, Lenni hands you today’s lesson and exercise — usually 45 minutes.",
  ],
  [
    "✎",
    "Lessons that stick",
    "Short, practical lessons paired with an exercise at the end, so every session ends with something reinforced.",
  ],
  [
    "○",
    "Progress you can see",
    "Skills, streaks and milestones update automatically, so you always know exactly how far you’ve come.",
  ],
  [
    "△",
    "A coach that notices",
    "Missed three days? Finished a milestone? Lenni says something about it — like a coach would, not a chatbot.",
  ],
  [
    "▣",
    "Real job matching",
    "See how you’d score against open roles today, and paste any job description to fold its gaps straight into your roadmap.",
  ],
];
const faqs = [
  [
    "Do I need to know how to code to use Lenni?",
    "No. Lenni supports career-agnostic goals like Product Manager or UX Designer just as much as AI Engineer — the roadmap and lessons adapt to whatever role you pick.",
  ],
  [
    "What if I don't have a LinkedIn or GitHub profile?",
    "Only a résumé is required so Lenni has something to build from. LinkedIn and GitHub are optional and can enrich your profile later.",
  ],
  [
    "Can I change my career goal later?",
    "Yes. You can update your goal at any point, and your roadmap re-plans around whatever skills you’ve already built.",
  ],
  [
    "How is this different from asking ChatGPT or Claude?",
    "A chat assistant gives you a one-time answer and forgets it. Lenni keeps a persistent profile, tracks what you’ve actually learned, and comes back every day with what’s next — closer to a coach than a chatbot.",
  ],
  [
    "Is there a free plan?",
    "Yes — the Free plan includes one active roadmap with daily lessons, no credit card required. Upgrade to Pro when you want unlimited job matching and the full skills profile.",
  ],
  [
    "How long until I'm ready for the role?",
    "It depends on your starting point and the goal — Lenni’s whole job is to shorten that path based on what you already know, and show you the estimate right on your roadmap.",
  ],
];

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

export default function Home() {
  const [annual, setAnnual] = useState(false),
    [faq, setFaq] = useState(-1),
    [step, setStep] = useState(0);
  const router = useRouter();
  const roleScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 3200);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const scroller = roleScrollRef.current;
    if (
      !scroller ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let paused = false;
    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };
    const advance = () => {
      if (paused) return;
      const firstCard = scroller.firstElementChild as HTMLElement | null;
      if (!firstCard) return;
      const gap = Number.parseFloat(getComputedStyle(scroller).columnGap) || 0;
      const atEnd =
        scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 2;
      scroller.scrollTo({
        left: atEnd ? 0 : scroller.scrollLeft + firstCard.offsetWidth + gap,
        behavior: "smooth",
      });
    };

    scroller.addEventListener("pointerenter", pause);
    scroller.addEventListener("pointerleave", resume);
    scroller.addEventListener("focusin", pause);
    scroller.addEventListener("focusout", resume);
    const timer = window.setInterval(advance, 2600);

    return () => {
      window.clearInterval(timer);
      scroller.removeEventListener("pointerenter", pause);
      scroller.removeEventListener("pointerleave", resume);
      scroller.removeEventListener("focusin", pause);
      scroller.removeEventListener("focusout", resume);
    };
  }, []);
  const start = useCallback(() => router.push("/register"), [router]);
  return (
    <>
      <Contours />
      <main id="landing" className="relative z-1 flex min-h-screen flex-col">
        <nav className="mx-auto flex w-full max-w-295 items-center justify-between px-11 py-5.5 max-[760px]:px-4.5 max-[760px]:py-5">
          <Logo />
          <div className="flex items-center gap-7.5 max-[760px]:hidden [&_a]:text-[13.5px] [&_a]:font-semibold [&_a]:text-muted [&_a]:transition-colors [&_a:hover]:text-accent">
            <a href="#problem">Why Lenni</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <button
            className="btn relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-transparent px-6 py-3.25 text-xs font-extrabold uppercase tracking-[.03em] transition disabled:cursor-not-allowed disabled:opacity-45 border-accent bg-accent text-white shadow-[0_4px_0_var(--color-brand-strong)] hover:border-accent-hover hover:bg-accent-hover active:translate-y-0.75 active:shadow-[0_1px_0_var(--color-brand-strong)]"
            onClick={start}
          >
            Start your roadmap
          </button>
        </nav>
        <section className="">
          <div className="mx-auto mt-14 w-full px-6 text-center">
            <div className="mb-4 text-[11px] font-medium uppercase tracking-[.14em] text-accent justify-center text-center">
              Your AI Career Copilot
            </div>
            <div className="w-full relative inline-block">
              <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.12] tracking-[-.02em] mx-auto">
                <span className="block whitespace-nowrap">
                  The <span className="text-accent">roadmap</span>{" "}
                  <br className="" /> that gets you
                </span>
                <span className="block whitespace-nowrap">
                  <span className="mt-2.5 inline-block -rotate-3 rounded-[18px] bg-positive px-5 pb-2.5 pt-0.5 text-white shadow-[0_6px_0_var(--color-success-strong)] animate-pulse">
                    hired.
                  </span>
                </span>
              </h1>
              <Spark className="-top-3.5 right-8 md:right-36" color="amber" />
              <Spark
                className="bottom-1.5 left-12 md:left-48 size-3.75 "
                color="blue"
              />
            </div>
            <p className="mx-auto mt-6 max-w-sm md:max-w-md text-sm md:text-base leading-[1.65] text-muted">
              Lenni turns "become an AI Engineer" into a roadmap built from your
              actual profile then walks it with you, one lesson at a time, until
              you get there.
            </p>
          </div>

          <div className="relative mx-auto mt-6 w-full max-w-260">
            {/*<div className="mb-3.5 font-mono text-[11px] uppercase tracking-[.08em] text-subtle justify-center text-center">
              Whatever the goal, Lenni builds the roadmap
            </div>*/}
            <div
              ref={roleScrollRef}
              className="flex snap-x gap-3.5 overflow-x-auto px-11 pb-4.5 pt-1.5 [scrollbar-width:none] max-[760px]:px-4.5 [&::-webkit-scrollbar]:hidden"
            >
              {roles.map(([title, tag, color, icon]) => (
                <article
                  className="w-43 shrink-0 snap-start rounded-xl border border-ui-border-subtle bg-ui-surface px-4.5 py-5 text-left shadow-(--shadow) transition hover:-translate-y-0.75 hover:shadow-[0_10px_26px_var(--color-text-10)]"
                  key={title}
                >
                  <div
                    className={`mb-4 flex size-11.5 items-center justify-center rounded-[13px] [&_svg]:size-5.75 ${roleIconColors[color]}`}
                  >
                    <RoleIcon name={icon} />
                  </div>
                  <div className="text-sm font-bold leading-[1.3]">{title}</div>
                  <div className="mt-1.5 font-mono text-[10.5px] text-subtle">
                    {tag}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-190 px-6 text-center">
            <div className="mt-8 flex justify-center gap-3">
              <button
                className="btn relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-transparent px-6 py-3.25 text-xs font-extrabold uppercase tracking-[.03em] transition disabled:cursor-not-allowed disabled:opacity-45 border-accent bg-accent text-white shadow-[0_4px_0_var(--color-brand-strong)] hover:border-accent-hover hover:bg-accent-hover active:translate-y-0.75 active:shadow-[0_1px_0_var(--color-brand-strong)]"
                onClick={start}
              >
                Start your roadmap →
              </button>
            </div>
            <div className="mt-4 text-[12.5px] text-subtle">
              Free to start · No credit card required
            </div>
          </div>
        </section>

        <Section
          id="problem"
          kicker="The problem"
          title="Generic advice doesn’t get you hired."
          sub="Everyone’s using AI to figure out their next career move. Almost none of it actually moves them."
        >
          <div className="mt-11 grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1">
            {[
              "Roadmaps that ignore your actual background and start you from zero",
              "AI chats that forget everything the moment you close the tab",
              "No way to tell if you’re actually improving, week over week",
              "Learning that never ties back to a real job you could get",
            ].map((x) => (
              <div
                className="flex items-start gap-3.5 rounded-xl border border-ui-border-subtle bg-ui-surface px-5.5 py-5 shadow-(--shadow)"
                key={x}
              >
                <div className="flex size-6.5 shrink-0 items-center justify-center rounded-full bg-negative-subtle text-[13px] font-extrabold text-negative">
                  ✕
                </div>
                <div className="pt-0.5 text-[14.5px] leading-normal">{x}</div>
              </div>
            ))}
          </div>
        </Section>
        <Section
          id="solution"
          kicker="The Lenni way"
          title="A copilot, not another chatbot."
          sub="Traditional AI hands you a plan and moves on. Lenni sticks around until you’ve actually reached the goal."
        >
          <div className="mt-11 grid grid-cols-[1fr_auto_1fr] items-center gap-5 max-[760px]:grid-cols-1">
            <Compare
              label="Other AI tools"
              quote="“Here’s your roadmap.”"
              items={[
                "One-time, generic answer",
                "No memory of who you are",
                "No sense of your progress",
                "You’re on your own after that",
              ]}
              old
            />
            <div className="text-[22px] font-bold text-subtle max-[760px]:hidden">
              →
            </div>
            <Compare
              label="Lenni"
              quote="“I’ll guide you until you reach your goal.”"
              items={[
                "Built from your résumé and history",
                "Remembers every lesson you’ve done",
                "Tracks skills, streaks and milestones",
                "Shows up daily until you get there",
              ]}
            />
          </div>
        </Section>
        <Section
          id="features"
          kicker="What Lenni does"
          title="Everything you need, nothing you have to plan yourself."
        >
          <div className="h-8" />
          <div className="flex flex-col md:flex-row items-center gap-4">
            {features.map(([icon, title, text]) => (
              <article
                className="rounded-xl border border-ui-border-subtle bg-ui-surface p-6 shadow-(--shadow) [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-[17px] [&_h3]:font-semibold [&_p]:text-[13.5px] [&_p]:leading-[1.55] [&_p]:text-muted"
                key={title}
              >
                <div className="mb-3.5 text-[22px] text-accent">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </Section>
        <Section
          id="how-it-works"
          kicker="How it starts"
          title="From résumé to roadmap in four steps."
        >
          <div className="mt-11 flex flex-col md:flex-row items-center gap-4">
            {[
              ["Import your profile", "LinkedIn and résumé, GitHub optional."],
              ["Name your goal", "Pick a role, or type your own."],
              ["See the gap", "Lenni compares you to the role."],
              ["Walk the roadmap", "Daily lessons until you arrive."],
            ].map(([t, d], i) => (
              <button
                className={`w-full relative overflow-hidden rounded-xl border-[1.5px] bg-ui-surface px-5 pb-6 pt-5.5 text-left shadow-(--shadow) transition ${step === i ? "active -translate-y-1 border-accent opacity-100 shadow-[0_0_0_3px_var(--color-brand-subtle),var(--shadow)]" : "border-ui-border-subtle opacity-70"}`}
                onClick={() => setStep(i)}
                key={t}
              >
                <div className="absolute inset-x-0 top-0 h-0.75 bg-ui-border-subtle">
                  <div className="h-full w-0 bg-accent transition-[width] duration-3200 `in-[.active]:w-full" />
                </div>
                <div className="mb-4 mt-3.5 font-mono text-[26px] font-semibold text-ui-border in-[.active]:text-accent">
                  0{i + 1}
                </div>
                <div className="mb-1.5 text-[15px] font-bold">{t}</div>
                <div className="text-[13px] leading-normal text-muted">{d}</div>
              </button>
            ))}
          </div>
        </Section>
        <Section
          id="pricing"
          kicker="Pricing"
          title="Start free. Upgrade when the roadmap gets real."
          sub="No credit card to start. Cancel anytime."
        >
          <div className="mx-auto mt-8 flex items-center justify-center gap-3 text-[13px] font-semibold text-subtle">
            <span className={!annual ? "text-foreground" : ""}>Monthly</span>
            <button
              aria-label="Toggle annual pricing"
              className={`relative h-6.25 w-11 rounded-full after:absolute after:left-0.75 after:top-0.75 after:size-4.75 after:rounded-full after:bg-white after:shadow-[0_1px_3px_var(--color-black-27)] after:transition ${annual ? "bg-accent after:translate-x-4.75" : "bg-ui-border"}`}
              onClick={() => setAnnual(!annual)}
            />
            <span className={annual ? "text-foreground" : ""}>Annual</span>
            <span className="rounded-md bg-positive-subtle px-2 py-0.5 font-mono text-[10.5px] font-semibold text-positive">
              Save 20%
            </span>
          </div>
          <div className="mt-11 grid grid-cols-3 gap-4 max-[760px]:grid-cols-1">
            <Price
              name="Free"
              desc="Try the roadmap, no strings attached."
              price="$0"
              billed="Forever free"
              features={[
                "1 active career roadmap",
                "Daily lesson & exercise",
                "Basic progress tracking",
                "3 job matches / month",
              ]}
              action="Start free"
              start={start}
            />
            <Price
              featured
              name="Pro"
              desc="For anyone serious about the switch."
              price={annual ? "$15" : "$19"}
              period="/ mo"
              billed={annual ? "Billed annually" : "Billed monthly"}
              features={[
                "Everything in Free",
                "Unlimited roadmap updates",
                "Full skills profile & AI coach",
                "Unlimited job matching & JD evaluator",
                "Weekly AI progress summaries",
              ]}
              action="Start your roadmap"
              start={start}
            />
            <Price
              name="Teams"
              desc="For companies upskilling a team."
              price={annual ? "$12" : "$15"}
              period="/ seat / mo"
              billed={annual ? "Billed annually" : "Billed monthly"}
              features={[
                "Everything in Pro",
                "Team dashboards",
                "Manager progress insights",
                "Custom career tracks",
                "Dedicated onboarding",
              ]}
              action="Contact sales"
              start={start}
            />
          </div>
        </Section>
        <Section id="faq" kicker="FAQ" title="Questions people actually ask.">
          <div className="mt-11 flex flex-col gap-2.5">
            {faqs.map(([q, a], i) => (
              <article
                className={`overflow-hidden rounded-xl border border-ui-border-subtle bg-ui-surface shadow-(--shadow) ${faq === i ? "open" : ""}`}
                key={q}
              >
                <button
                  className="flex w-full items-center justify-between gap-4 px-5.5 py-4.75 text-left text-[14.5px] font-semibold"
                  onClick={() => setFaq(faq === i ? -1 : i)}
                >
                  <span>{q}</span>
                  <span className="text-lg text-accent transition in-[.open]:rotate-45">
                    +
                  </span>
                </button>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] in-[.open]:grid-rows-[1fr] [&_p]:overflow-hidden [&_p]:px-5.5 [&_p]:text-[13.5px] [&_p]:leading-[1.6] [&_p]:text-muted [.open_&_p]:pb-5">
                  <p>{a}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>
        <section className="mx-auto mt-27.5 w-full max-w-205 px-6">
          <div className="rounded-xl bg-linear-to-br from-accent to-(--color-brand-strong) px-10 py-14 text-center [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-white [&_p]:mx-auto [&_p]:mb-6.5 [&_p]:mt-3 [&_p]:text-[14.5px] [&_p]:text-white/85 [&_.btn]:border-white [&_.btn]:bg-white [&_.btn]:text-accent">
            <h2>Ready to know what’s next?</h2>
            <p>
              Import your profile, pick a goal, and get your first lesson today.
            </p>
            <button
              className="btn relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-transparent px-6 py-3.25 text-xs font-extrabold uppercase tracking-[.03em] transition disabled:cursor-not-allowed disabled:opacity-45 border-accent bg-accent text-white shadow-[0_4px_0_var(--color-brand-strong)] hover:border-accent-hover hover:bg-accent-hover active:translate-y-0.75 active:shadow-[0_1px_0_var(--color-brand-strong)]"
              onClick={start}
            >
              Start your roadmap →
            </button>
          </div>
        </section>
        <Footer start={start} />
      </main>
    </>
  );
}

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
      className="mx-auto mt-25 w-full max-w-260 scroll-mt-7.5 px-6"
      id={id}
    >
      <div className="mb-4 text-center font-mono text-[11px] font-medium uppercase tracking-[.14em] text-accent">
        {kicker}
      </div>
      <h2 className="mx-auto max-w-160 text-center font-display text-[34px] font-bold tracking-[-.01em]">
        {title}
      </h2>
      {sub && (
        <p className="mx-auto mt-3.5 max-w-130 text-center text-[15px] leading-[1.6] text-muted">
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
    <article
      className={`rounded-xl border bg-ui-surface p-6.5 shadow-(--shadow) ${old ? "border-ui-border-subtle" : "border-accent shadow-[0_0_0_3px_var(--color-brand-subtle),var(--shadow)]"}`}
    >
      <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[.08em] text-subtle">
        {label}
      </div>
      <div className="mb-4 font-display text-lg font-semibold">{quote}</div>
      <ul
        className={`flex list-none flex-col gap-2.5 [&_li]:flex [&_li]:gap-2.5 [&_li]:text-[13.5px] [&_li]:leading-normal [&_li]:text-muted ${old ? "[&_li]:before:font-bold [&_li]:before:text-negative [&_li]:before:content-['✕']" : "[&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']"}`}
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
  featured?: boolean;
  action: string;
  start: () => void;
}) {
  return (
    <article
      className={`flex flex-col rounded-xl border bg-ui-surface px-6 py-7 shadow-(--shadow) ${featured ? "relative border-accent shadow-[0_0_0_3px_var(--color-brand-subtle),var(--shadow)]" : "border-ui-border-subtle"}`}
    >
      {featured && (
        <div className="absolute -top-3.25 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-3.5 py-1.25 font-mono text-[10.5px] font-bold uppercase tracking-[.06em] text-white">
          Most popular
        </div>
      )}
      <div className="font-display text-lg font-semibold">{name}</div>
      <div className="mt-1 min-h-8 text-[13px] text-subtle">{desc}</div>
      <div className="mb-1 mt-5 flex items-baseline gap-1.25">
        <span className="font-mono text-[38px] font-semibold">{price}</span>
        {period && <span className="text-[13px] text-subtle">{period}</span>}
      </div>
      <div className="mb-5 min-h-4 text-xs text-subtle">{billed}</div>
      <ul className="mb-6 flex flex-1 list-none flex-col gap-2.75 [&_li]:flex [&_li]:gap-2.25 [&_li]:text-[13.5px] [&_li]:leading-[1.4] [&_li]:text-muted [&_li]:before:font-bold [&_li]:before:text-positive [&_li]:before:content-['✓']">
        {features.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <button
        className={`relative inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 px-6 py-3.25 text-[13.5px] font-extrabold uppercase tracking-[.03em] transition ${featured ? "border-accent bg-accent text-white shadow-[0_4px_0_var(--color-brand-strong)] hover:border-accent-hover hover:bg-accent-hover" : "border-ui-border bg-ui-surface text-muted shadow-[0_4px_0_var(--color-border)]"}`}
        onClick={start}
      >
        {action}
      </button>
    </article>
  );
}
function Footer({ start }: { start: () => void }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mx-auto mt-20 w-full max-w-295 px-11 pb-8.5 pt-12.5">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-7.5 border-b border-ui-border-subtle pb-9 max-[760px]:grid-cols-2">
        <div className="[&_p]:max-w-55 [&_p]:text-[13px] [&_p]:leading-[1.6] [&_p]:text-subtle">
          <Logo />
          <p>
            The AI Career Copilot that guides you until you reach your goal not
            just a one-time answer.
          </p>
        </div>
        <div className="[&_a]:mb-2.75 [&_a]:block [&_a]:text-[13.5px] [&_a]:text-muted [&_button]:mb-2.75 [&_button]:block [&_button]:text-[13.5px] [&_button]:text-muted">
          <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[.06em] text-subtle">
            Product
          </div>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="[&_a]:mb-2.75 [&_a]:block [&_a]:text-[13.5px] [&_a]:text-muted [&_button]:mb-2.75 [&_button]:block [&_button]:text-[13.5px] [&_button]:text-muted">
          <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[.06em] text-subtle">
            Company
          </div>
          <a href="#problem">Why Lenni</a>
          <a href="#how-it-works">How it works</a>
        </div>
        <div className="[&_a]:mb-2.75 [&_a]:block [&_a]:text-[13.5px] [&_a]:text-muted [&_button]:mb-2.75 [&_button]:block [&_button]:text-[13.5px] [&_button]:text-muted">
          <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[.06em] text-subtle">
            Get started
          </div>
          <button onClick={start}>Start your roadmap</button>
        </div>
      </div>
      <div className="flex justify-between gap-2.5 pt-5.5 [&_span]:text-[12.5px] [&_span]:text-subtle">
        <span>© {year} Lenni. All rights reserved.</span>
        <span>Made for self learner.</span>
      </div>
    </footer>
  );
}
