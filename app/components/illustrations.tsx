/* Animated landing-page illustrations.
 *
 * Everything here is SVG + CSS keyframes — no animation library, no JS
 * ticker. The keyframes live in globals.css under "Landing illustrations",
 * where a single --rm-cycle drives the whole roadmap timeline so the nodes,
 * the trail and the chips stay in sync by construction.
 *
 * Motion is opt-in: the static styles paint the *finished* state, and the
 * animations only attach inside `prefers-reduced-motion: no-preference`.
 * So a reduced-motion visitor sees a completed roadmap rather than a
 * half-built one frozen mid-cycle.
 */

/** Milestones on the demo trail, bottom to top. */
const NODES = [
  { x: 55, y: 352, label: "Python & data", side: "right" },
  { x: 285, y: 282, label: "ML foundations", side: "left" },
  { x: 55, y: 212, label: "LLM engineering", side: "right" },
  { x: 285, y: 142, label: "Portfolio project", side: "left" },
] as const;

const GOAL = { x: 170, y: 56 };

/* Unit vectors for the celebration burst, every 60°.
   Written out rather than derived from Math.cos/Math.sin: those are
   implementation-defined, so Node and the browser can disagree in the last
   digit and React reports a hydration mismatch. Plain multiplication of
   these literals is IEEE-deterministic, so both sides emit the same string. */
const BURST_DIRS = [
  [1, 0],
  [0.5, 0.866],
  [-0.5, 0.866],
  [-1, 0],
  [-0.5, -0.866],
  [0.5, -0.866],
] as const;

/* One continuous zigzag through every node, ending at the goal. */
const TRAIL =
  "M55,352 C55,317 285,317 285,282 C285,247 55,247 55,212 C55,177 285,177 285,142 C285,107 232,78 170,56";

function check(x: number, y: number) {
  return `M${x - 7},${y + 0.5} l5,5 l9.5,-10.5`;
}

export function RoadmapIllustration() {
  return (
    <div className="rm relative">
      <div className="card relative overflow-hidden px-5 pb-4 pt-5">
        {/* Header: the goal, and how far along the demo learner is */}
        <div className="mb-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-chip bg-accent-faint text-accent">
              <svg className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <circle cx="6" cy="6" r="2.3" />
                <circle cx="18" cy="6" r="2.3" />
                <circle cx="12" cy="18" r="2.3" />
                <path d="M7.7 7.6L11 16.2M16.3 7.6L13 16.2M8.3 6h7.4" />
              </svg>
            </span>
            <div>
              <div className="kicker text-subtle">Career goal</div>
              <div className="text-body font-bold">AI Engineer</div>
            </div>
          </div>
          <span className="rm-badge rounded-chip bg-positive-subtle px-2 py-1 kicker text-positive">
            On track
          </span>
        </div>

        {/* Progress rail — fills in step with the trail below */}
        <div className="mb-1 h-2 overflow-hidden rounded-full bg-ui-raised">
          <div className="rm-bar h-full rounded-full bg-positive" />
        </div>

        <svg
          aria-hidden
          className="rm-svg w-full"
          viewBox="0 0 340 400"
        >
          {/* Trail: a dotted track, overlaid by the travelled portion */}
          <path
            d={TRAIL}
            fill="none"
            stroke="var(--color-border)"
            strokeDasharray="1 11"
            strokeLinecap="round"
            strokeWidth="5"
          />
          <path
            className="rm-progress"
            d={TRAIL}
            fill="none"
            pathLength={100}
            stroke="var(--color-success)"
            strokeLinecap="round"
            strokeWidth="5"
          />

          {NODES.map((n, i) => (
            <g key={n.label}>
              {/* Locked disc, permanently underneath */}
              <circle cx={n.x} cy={n.y + 3} fill="var(--color-border)" r="21" />
              <circle
                cx={n.x}
                cy={n.y}
                fill="var(--color-surface)"
                r="21"
                stroke="var(--color-border)"
                strokeDasharray="4 4"
                strokeWidth="2"
              />
              {/* Completed disc, popped in on top at its turn */}
              <g className={`rm-pop rm-pop-${i}`}>
                <circle cx={n.x} cy={n.y + 4} fill="var(--color-success-strong)" r="21" />
                <circle cx={n.x} cy={n.y} fill="var(--color-success)" r="21" />
                <path
                  d={check(n.x, n.y)}
                  fill="none"
                  stroke="#fff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3.4"
                />
              </g>
              <text
                className="rm-label"
                x={n.side === "right" ? n.x + 34 : n.x - 34}
                y={n.y + 5}
                textAnchor={n.side === "right" ? "start" : "end"}
              >
                {n.label}
              </text>
            </g>
          ))}

          {/* The goal: locked star, then a blue "hired" disc with a burst */}
          <circle cx={GOAL.x} cy={GOAL.y + 3} fill="var(--color-border)" r="25" />
          <circle
            cx={GOAL.x}
            cy={GOAL.y}
            fill="var(--color-surface)"
            r="25"
            stroke="var(--color-border)"
            strokeDasharray="4 4"
            strokeWidth="2"
          />
          <g className="rm-goal">
            <circle cx={GOAL.x} cy={GOAL.y + 4} fill="var(--color-brand-strong)" r="25" />
            <circle cx={GOAL.x} cy={GOAL.y} fill="var(--color-brand)" r="25" />
            <path
              d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"
              fill="#fff"
              transform={`translate(${GOAL.x - 12} ${GOAL.y - 10})`}
            />
          </g>
          {/* Celebration burst */}
          <g className="rm-burst">
            {BURST_DIRS.map(([ux, uy]) => (
              <line
                key={`${ux},${uy}`}
                stroke="var(--color-warning)"
                strokeLinecap="round"
                strokeWidth="3.5"
                x1={GOAL.x + ux * 32}
                x2={GOAL.x + ux * 42}
                y1={GOAL.y + uy * 32}
                y2={GOAL.y + uy * 42}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Skills banked along the way, popping in as their milestone lands.
          They hang off the card on desktop; on narrow screens they tuck back
          in so they never crowd the viewport edge. */}
      <span className="rm-chip rm-chip-0 card absolute left-[2%] top-[46%] px-3 py-1.5 text-body-s font-bold md:-left-[6%]">
        <span className="text-positive">+</span> PyTorch
      </span>
      <span className="rm-chip rm-chip-1 card absolute right-[2%] top-[30%] px-3 py-1.5 text-body-s font-bold md:-right-[6%]">
        <span className="text-positive">+</span> RAG pipelines
      </span>
      <span className="rm-chip rm-chip-2 card absolute left-[3%] top-[15%] px-3 py-1.5 text-body-s font-bold md:-left-[4%]">
        <span className="text-positive">+</span> Deployment
      </span>
    </div>
  );
}

/* ---------- Step illustrations ----------
   Small loops for the "how it starts" cards. Each only animates while its
   card is the active one, so the row never turns into four competing loops. */

function Frame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <svg aria-hidden className={`w-full ${className}`} viewBox="0 0 132 84">
      {children}
    </svg>
  );
}

/** 1 — a résumé being read line by line. */
export function StepImportArt() {
  return (
    <Frame className="si-import">
      <rect
        fill="var(--color-surface)"
        height="72"
        rx="8"
        stroke="var(--color-border)"
        strokeWidth="2"
        width="54"
        x="12"
        y="6"
      />
      <circle cx="26" cy="20" fill="var(--color-brand-faint)" r="6" />
      {[32, 40, 48, 56].map((y, i) => (
        <rect
          key={y}
          fill="var(--color-border)"
          height="4"
          rx="2"
          width={i % 2 ? 26 : 34}
          x="22"
          y={y}
        />
      ))}
      {/* scan bar sweeping the page */}
      <rect className="si-scan" fill="var(--color-brand)" height="3" opacity="0.9" rx="1.5" width="46" x="16" y="10" />
      {/* extracted skills landing on the right */}
      {[
        [0, 18],
        [1, 34],
        [2, 50],
      ].map(([i, y]) => (
        <g className={`si-out si-out-${i}`} key={y}>
          <rect
            fill="var(--color-success-subtle)"
            height="14"
            rx="7"
            width="42"
            x="78"
            y={y}
          />
          <path
            d={`M85,${y + 7} l3,3 l6,-6.5`}
            fill="none"
            stroke="var(--color-success)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
          <rect fill="var(--color-success)" height="3" opacity="0.45" rx="1.5" width="14" x="99" y={y + 5.5} />
        </g>
      ))}
    </Frame>
  );
}

/** 2 — role cards cycling until one is chosen. */
export function StepGoalArt() {
  return (
    <Frame className="si-goal">
      {[0, 1, 2].map(i => (
        <g className={`si-card si-card-${i}`} key={i}>
          <rect
            fill="var(--color-surface)"
            height="20"
            rx="8"
            stroke="var(--color-border)"
            strokeWidth="2"
            width="92"
            x="20"
            y={10 + i * 26}
          />
          <circle cx="34" cy={20 + i * 26} fill="var(--color-brand-faint)" r="6" />
          <rect fill="var(--color-border)" height="4" rx="2" width={i === 1 ? 44 : 32} x="46" y={18 + i * 26} />
          {/* the chosen one */}
          <g className="si-tick">
            <circle cx="100" cy={20 + i * 26} fill="var(--color-brand)" r="7" />
            <path
              d={`M96.5,${20 + i * 26} l2.5,2.5 l5,-5.5`}
              fill="none"
              stroke="#fff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
            />
          </g>
        </g>
      ))}
    </Frame>
  );
}

/** 3 — where you are today vs what the role needs. */
export function StepGapArt() {
  return (
    <Frame className="si-gap">
      <rect fill="var(--color-border-subtle)" height="4" rx="2" width="104" x="14" y="70" />
      {/* "you" column */}
      <rect className="si-bar si-bar-you" fill="var(--color-brand)" height="30" rx="6" width="30" x="20" y="40" />
      {/* "role" column */}
      <rect className="si-bar si-bar-role" fill="var(--color-success)" height="54" rx="6" width="30" x="82" y="16" />
      {/* the gap between them */}
      <rect
        className="si-gapbox"
        fill="none"
        height="26"
        rx="5"
        stroke="var(--color-warning)"
        strokeDasharray="4 4"
        strokeWidth="2"
        width="34"
        x="54"
        y="16"
      />
      <path
        className="si-arrow"
        d="M58,54 L74,54"
        fill="none"
        stroke="var(--color-warning)"
        strokeLinecap="round"
        strokeWidth="2.6"
      />
      <path
        className="si-arrow"
        d="M69,49 L75,54 L69,59"
        fill="none"
        stroke="var(--color-warning)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
    </Frame>
  );
}

/** 4 — one lesson a day, ticking along the trail. */
export function StepWalkArt() {
  const path = "M16,62 C40,62 40,26 66,26 C92,26 92,62 116,62";
  return (
    <Frame className="si-walk">
      <path
        d={path}
        fill="none"
        stroke="var(--color-border)"
        strokeDasharray="1 9"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <path
        className="si-walk-progress"
        d={path}
        fill="none"
        pathLength={100}
        stroke="var(--color-success)"
        strokeLinecap="round"
        strokeWidth="4"
      />
      {[
        [16, 62],
        [66, 26],
        [116, 62],
      ].map(([x, y], i) => (
        <g key={x}>
          <circle cx={x} cy={y} fill="var(--color-surface)" r="9" stroke="var(--color-border)" strokeWidth="2" />
          <g className={`si-step si-step-${i}`}>
            <circle cx={x} cy={y} fill="var(--color-success)" r="9" />
            <path
              d={`M${x - 3.5},${y} l2.5,2.5 l5,-5.5`}
              fill="none"
              stroke="#fff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
            />
          </g>
        </g>
      ))}
    </Frame>
  );
}

export const STEP_ART = [StepImportArt, StepGoalArt, StepGapArt, StepWalkArt];
