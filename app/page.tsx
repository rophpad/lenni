import Link from "next/link";
import type { ReactNode } from "react";

import { FeatureIcon, type FeatureIconName } from "./components/feature-icon";
import { LandingFooter } from "./components/landing-footer";
import { LandingNav } from "./components/landing-nav";
import { Flow, Section } from "./components/marketing";

/* Three steps, not four. Everything Lenni does before you study anything
   collapses into: read you, compare you, plan you. */
const steps: Array<[string, string]> = [
  ["Upload your CV", "Lenni reads it and maps what you can already do."],
  [
    "Name your target role",
    "It compares your profile against what that role actually requires.",
  ],
  [
    "Follow the plan",
    "A roadmap ordered around your experience, with one clear next step.",
  ],
];

/* Four pillars. Each one absorbs several features rather than listing them:
   a landing page sells the capability, the product page sells the checklist. */
const pillars: Array<[FeatureIconName, string, string]> = [
  [
    "cube",
    "Learn by building",
    "Lessons and exercises aimed at your gaps, then projects that prove you can do the work.",
  ],
  [
    "cycle",
    "A roadmap that adapts",
    "Finish a project, fail an assessment, get rejected — the plan re-orders around what just happened.",
  ],
  [
    "check",
    "Readiness you can see",
    "Skills, projects and assessments scored against real job requirements, not a completion percentage.",
  ],
  [
    "target",
    "Wired to the job market",
    "Match against live roles, see what’s missing, and turn each gap into the next thing you learn.",
  ],
];

const alreadyKnow = ["JavaScript", "TypeScript", "React", "APIs"];
const needNext = [
  "Python for AI",
  "LLM applications",
  "RAG & agents",
  "Evals & infra",
];

const faqs: Array<[string, string]> = [
  [
    "Who is Lenni for right now?",
    "Tech professionals moving into AI — software engineers, developers, data and infrastructure people. Other paths will follow; everything shipping today is tuned for that one move.",
  ],
  [
    "Do I have to start from scratch?",
    "No. Lenni maps what you already know first and plans only around the gaps, so you skip the beginner curriculum you don’t need.",
  ],
  [
    "How is this different from asking ChatGPT or Claude?",
    "A general assistant answers what you think to ask. Lenni keeps a persistent picture of your experience, gaps, projects and progress, and decides what comes next for you.",
  ],
  [
    "How do I know when I’m ready to apply?",
    "Lenni scores you against real job requirements, so instead of guessing you see which roles you’re ready for and what’s missing for the rest.",
  ],
];

export default function Home() {
  return (
    <main id="landing" className="flex min-h-screen flex-col">
      <LandingNav />

      {/* ---------- Hero ---------- */}
      <section className="mx-auto w-full max-w-260 px-6 pt-16 text-center md:pt-24">
        <h1 className="mx-auto max-w-3xl font-heading text-display-l md:text-display-xl">
          The AI career transition platform for tech professionals.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-body text-muted md:text-body-l">
          Tell Lenni where you are and where you want to go. It finds what’s
          missing, builds your plan, and guides you until you’re ready for the
          job.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-primary btn-lg" href="/register">
            Start your transition
          </Link>
          <Link className="btn btn-secondary btn-lg" href="#how-it-works">
            See how it works
          </Link>
        </div>
        <p className="mt-4 text-body-s text-subtle">
          Free to start. No credit card required.
        </p>
        <div className="mt-14">
          <Flow
            steps={[
              "Your experience",
              "Your skill gap",
              "Your roadmap",
              "Your next job",
            ]}
          />
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <Section
        id="how-it-works"
        title="Built around you, not a generic curriculum."
        sub="You already have skills. You just don’t know which ones are missing."
      >
        <div className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-3">
          {steps.map(([title, desc], i) => (
            <Tile
              key={title}
              mark={
                <span className="font-mono text-body-s">
                  {String(i + 1).padStart(2, "0")}
                </span>
              }
              title={title}
            >
              {desc}
            </Tile>
          ))}
        </div>
      </Section>

      {/* ---------- The core objection: "do I start over?" ---------- */}
      <Section
        id="shortest-path"
        title="Learn less. Build more."
        sub="If you’re already a software engineer, Lenni won’t walk you through a beginner curriculum. It starts from what you know and builds the shortest credible path to the role."
      >
        <div className="mx-auto mt-12 max-w-180 card overflow-hidden">
          <div className="border-b border-ui-border-subtle px-6 py-3.5 text-center text-body font-medium">
            Frontend Engineer <span className="text-subtle">→</span>{" "}
            <span className="text-accent">AI Engineer</span>
          </div>
          <div className="grid gap-8 p-6 sm:grid-cols-2 md:gap-12 md:p-8">
            <div>
              <div className="mb-4 kicker text-subtle">You already know</div>
              <ul className="flex list-none flex-col gap-2 text-body text-muted">
                {alreadyKnow.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-4 kicker text-accent">What you need next</div>
              <ul className="flex list-none flex-col gap-2 text-body">
                {needNext.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- What you get ---------- */}
      <Section
        id="features"
        title="It doesn’t stop at the roadmap."
        sub="Lenni stays with you for the whole transition."
      >
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
          {pillars.map(([icon, title, desc]) => (
            <Tile key={title} mark={<FeatureIcon name={icon} />} title={title}>
              {desc}
            </Tile>
          ))}
        </div>
      </Section>

      {/* ---------- Pricing ---------- */}
      <Section
        id="pricing"
        title="Simple pricing."
        sub="Start free. Upgrade when you’re serious about the transition."
      >
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          <Price
            name="Free"
            desc="Understand where you stand."
            price="$0"
            billed="Forever free"
            features={[
              "Career assessment",
              "Skill-gap analysis",
              "Your first roadmap",
              "Daily learning guidance",
            ]}
            action="Start for free"
          />
          <Price
            featured
            name="Pro"
            desc="For people serious about the move."
            price="$19"
            period="/ month"
            billed="Cancel anytime"
            features={[
              "Everything in Free",
              "Unlimited roadmap updates",
              "AI career coach",
              "Project & skill assessments",
              "Unlimited job matching",
              "Career readiness insights",
            ]}
            action="Start your transition"
          />
        </div>
      </Section>

      {/* ---------- FAQ ---------- */}
      <Section id="faq" title="Questions people actually ask.">
        <div className="mx-auto mt-12 max-w-180 border-t border-ui-border-subtle">
          {faqs.map(([q, a]) => (
            <details className="group border-b border-ui-border-subtle" key={q}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-body font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <span
                  aria-hidden
                  className="text-body text-subtle transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 pr-8 text-body-s leading-[1.7] text-muted">
                {a}
              </p>
            </details>
          ))}
        </div>
      </Section>

      {/* ---------- Closing ---------- */}
      <section className="mx-auto mt-24 w-full max-w-260 px-6 text-center">
        <h2 className="mx-auto max-w-150 font-display text-display-s md:text-display-m">
          Your current skills are not your destination.
        </h2>
        <Link className="btn btn-primary btn-lg mt-8" href="/register">
          Start your transition
        </Link>
      </section>

      <LandingFooter />
    </main>
  );
}

/* A grid cell: an optional mark (index or icon), a title, one line of body. */
function Tile({
  mark,
  title,
  children,
}: {
  mark?: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="tile">
      {mark && <div className="tile-mark mb-4">{mark}</div>}
      <h3 className="mb-1.5 text-body font-semibold">{title}</h3>
      <p className="text-body-s leading-[1.6] text-muted">{children}</p>
    </div>
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
}: {
  name: string;
  desc: string;
  price: string;
  period?: string;
  billed: string;
  features: string[];
  featured?: boolean;
  action: string;
}) {
  return (
    <article
      className={`card flex flex-col p-6 ${featured ? "card-featured" : ""}`}
    >
      <div className="text-body font-semibold">{name}</div>
      <div className="mt-1 text-body-s text-subtle">{desc}</div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="font-mono text-display-l">{price}</span>
        {period && <span className="text-body-s text-subtle">{period}</span>}
      </div>
      <div className="mb-6 mt-1 text-body-s text-subtle">{billed}</div>
      <ul className="mb-8 flex flex-1 list-none flex-col gap-2.5 text-body-s leading-normal text-muted">
        {features.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <Link
        className={`btn w-full ${featured ? "btn-primary" : "btn-secondary"}`}
        href="/register"
      >
        {action}
      </Link>
    </article>
  );
}
