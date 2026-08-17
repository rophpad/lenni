/**
 * Copy for the /compare/* pages, one entry per competitor category.
 *
 * These pages are all the same argument told six different ways, so they are
 * data rather than seven hand-built layouts: the renderer in
 * app/compare/[slug]/page.tsx walks `blocks` and each block kind has exactly
 * one visual treatment. Adding a comparison means adding an entry here.
 *
 * Deliberately free of JSX and server imports — the footer (a client tree)
 * reads COMPARE_PAGES for its link list.
 */

export type CompareBlock =
  /** Plain paragraphs. Each string is its own <p>. */
  | { kind: "prose"; lines: string[] }
  /** Section break: a bold statement, optionally with a lead-in line under it. */
  | { kind: "heading"; text: string; sub?: string }
  /** The one line on the page we want people to remember. */
  | { kind: "quote"; text: string }
  /** A bullet list. `tone` picks the marker: earned, missing, or neutral. */
  | { kind: "list"; items: string[]; tone?: "check" | "cross" | "plain" }
  /** Arrow chain — the "profile → gap → roadmap" motif. */
  | { kind: "flow"; steps: string[] }
  /** Side-by-side option cards. The last column is always the Lenni one. */
  | {
      kind: "columns";
      columns: Array<{ label: string; items: string[]; featured?: boolean }>;
    }
  /** Title + body cards in a row. */
  | { kind: "steps"; items: Array<[string, string]> }
  /** Three-column capability table. */
  | {
      kind: "table";
      head: [string, string, string];
      rows: Array<[string, string, string]>;
    }
  /** Closing button. */
  | { kind: "cta"; label: string };

export type ComparePage = {
  slug: string;
  /** Footer / nav label. */
  navLabel: string;
  /** <h1> and <title>. */
  title: string;
  /** The one-sentence framing under the h1, and the meta description. */
  lede: string;
  blocks: CompareBlock[];
};

export const COMPARE_PAGES: ComparePage[] = [
  {
    slug: "chatgpt-and-claude",
    navLabel: "Lenni vs ChatGPT & Claude",
    title: "Lenni vs ChatGPT & Claude",
    lede: "ChatGPT and Claude can answer your questions. Lenni helps you change your career.",
    blocks: [
      {
        kind: "prose",
        lines: [
          "ChatGPT and Claude are incredibly powerful general-purpose AI assistants.",
          "You can ask them to analyze your CV, recommend skills, create a roadmap, explain a concept, prepare you for an interview, or review your work.",
          "But there’s a problem. You have to know what to ask.",
          "Lenni is built around a different idea:",
        ],
      },
      {
        kind: "quote",
        text: "Your career transition shouldn’t depend on knowing the right prompt.",
      },
      {
        kind: "heading",
        text: "ChatGPT gives you answers. Lenni gives you a path.",
        sub: "With ChatGPT or Claude, every step is a new conversation you have to start yourself.",
      },
      {
        kind: "steps",
        items: [
          ["“How do I become an AI Engineer?”", "You’ll get an answer."],
          ["“What should I learn first?”", "Another answer."],
          ["“Can you give me a project?”", "Another answer."],
          [
            "“Am I ready to apply for AI Engineer jobs?”",
            "Another conversation.",
          ],
        ],
      },
      {
        kind: "prose",
        lines: [
          "You are still responsible for connecting everything together.",
          "Lenni connects the dots for you.",
        ],
      },
      {
        kind: "flow",
        steps: [
          "Your profile",
          "Your skill gap",
          "Your roadmap",
          "Your learning",
          "Your projects",
          "Your progress",
          "Your job readiness",
        ],
      },
      {
        kind: "heading",
        text: "The difference is context.",
        sub: "ChatGPT and Claude are designed to help with almost anything. Lenni is designed around one thing: your career transition.",
      },
      {
        kind: "list",
        tone: "check",
        items: [
          "Your current experience",
          "Your existing skills",
          "Your target career",
          "Your skill gaps",
          "Your progress",
          "Your projects",
          "Your target jobs",
          "What you’ve already learned",
          "What you need to work on next",
        ],
      },
      {
        kind: "prose",
        lines: ["So you don’t have to keep explaining yourself."],
      },
      {
        kind: "heading",
        text: "You don’t need another chatbot.",
        sub: "You need a system that moves you forward.",
      },
      {
        kind: "table",
        head: ["", "ChatGPT / Claude", "Lenni"],
        rows: [
          ["Ask questions", "✓", "✓"],
          ["Learn concepts", "✓", "✓"],
          ["Analyze your CV", "✓", "✓"],
          ["Create a roadmap", "✓", "✓"],
          ["Understand your career goal", "Limited / manual", "✓"],
          ["Track your skill development", "Manual", "✓"],
          ["Adapt your roadmap", "Manual", "✓"],
          ["Evaluate projects", "General", "Career-focused"],
          ["Connect learning to jobs", "Manual", "✓"],
          ["Track career readiness", "—", "✓"],
          ["Designed for career transitions", "—", "✓"],
        ],
      },
      {
        kind: "prose",
        lines: [
          "ChatGPT and Claude are powerful tools. Lenni is a career system.",
          "Use your favorite AI assistant when you need an answer. Use Lenni when you need to get somewhere.",
        ],
      },
      { kind: "cta", label: "Start your career transition →" },
    ],
  },
  {
    slug: "bootcamps",
    navLabel: "Lenni vs Bootcamps",
    title: "Lenni vs Bootcamps",
    lede: "You don’t need to start your career over.",
    blocks: [
      {
        kind: "prose",
        lines: [
          "Bootcamps can be great. They give you structure, deadlines, instructors, projects and a community.",
          "But they also make one big assumption: everyone starts from roughly the same place.",
          "Your career isn’t generic. Neither should your learning path be.",
        ],
      },
      {
        kind: "heading",
        text: "A bootcamp gives you a curriculum. Lenni gives you a transition plan.",
        sub: "Imagine you’re already a software engineer with five years of experience.",
      },
      {
        kind: "list",
        tone: "check",
        items: [
          "JavaScript",
          "TypeScript",
          "React",
          "APIs",
          "Databases",
          "Software architecture",
        ],
      },
      {
        kind: "prose",
        lines: [
          "You want to become an AI Engineer. A traditional program may still make you spend weeks learning things you already know.",
          "Lenni starts with your existing capabilities. Then asks: what is actually missing?",
        ],
      },
      {
        kind: "heading",
        text: "Learn what you need. Skip what you don’t.",
        sub: "Lenni analyzes your current profile against your target career. Instead of start → complete curriculum → graduate, you get:",
      },
      {
        kind: "flow",
        steps: [
          "Current skills",
          "Skill gap",
          "Personalized path",
          "Build",
          "Evaluate",
          "Improve",
          "Job-ready",
        ],
      },
      {
        kind: "prose",
        lines: [
          "Your roadmap can change as you progress.",
          "Lenni is not trying to replace great bootcamps. It’s for people who don’t want to spend months following someone else’s curriculum.",
        ],
      },
      {
        kind: "columns",
        columns: [
          {
            label: "Choose a bootcamp if you want",
            items: [
              "Live instructors",
              "A fixed schedule",
              "Cohort accountability",
              "A structured classroom",
              "A community",
            ],
          },
          {
            label: "Choose Lenni if you want",
            featured: true,
            items: [
              "A personalized path",
              "Flexible learning",
              "AI guidance",
              "Skill-gap analysis",
              "Projects based on your goals",
              "Continuous assessment",
              "A roadmap adapted to you",
            ],
          },
        ],
      },
      {
        kind: "prose",
        lines: [
          "You can even use both. A bootcamp can teach you. Lenni can help you understand what you personally need next.",
        ],
      },
      { kind: "cta", label: "Build my personalized roadmap →" },
    ],
  },
  {
    slug: "online-courses",
    navLabel: "Lenni vs Online Courses",
    title: "Lenni vs Online Courses",
    lede: "The internet has more courses than ever. That’s the problem.",
    blocks: [
      { kind: "prose", lines: ["You can find hundreds of courses for:"] },
      {
        kind: "list",
        tone: "plain",
        items: [
          "Python",
          "Machine learning",
          "AI agents",
          "RAG",
          "Cloud",
          "Data science",
          "System design",
          "Cybersecurity",
          "Product management",
        ],
      },
      {
        kind: "prose",
        lines: [
          "But which one should you take? And in what order? And when do you stop learning and start building?",
        ],
      },
      {
        kind: "heading",
        text: "Courses teach subjects. Lenni builds your path.",
        sub: "A course starts with “here’s what we’re going to teach.” Lenni starts with “here’s what you already know, here’s where you’re going, here’s what you’re missing.”",
      },
      {
        kind: "prose",
        lines: ["Then it builds the path between them."],
      },
      {
        kind: "heading",
        text: "Don’t collect courses. Build capability.",
        sub: "Lenni can turn a skill gap into:",
      },
      {
        kind: "flow",
        steps: ["Learn", "Practice", "Build", "Evaluate", "Improve"],
      },
      {
        kind: "prose",
        lines: [
          "Because watching a 12-hour course doesn’t prove that you can do the job. Lenni focuses on what you can actually demonstrate.",
          "Your goal isn’t to finish another course. Your goal is to become capable of doing the work.",
        ],
      },
      { kind: "cta", label: "Find your skill gaps →" },
    ],
  },
  {
    slug: "career-coaches",
    navLabel: "Lenni vs Career Coaches",
    title: "Lenni vs Traditional Career Coaching",
    lede: "Great career coaches are valuable. But they’re expensive, difficult to scale, and you can’t talk to them every time you get stuck.",
    blocks: [
      {
        kind: "prose",
        lines: [
          "Lenni brings continuous AI guidance into your career transition.",
        ],
      },
      {
        kind: "heading",
        text: "A career coach gives you advice. Lenni stays with you while you execute.",
        sub: "A traditional coach might help you understand:",
      },
      {
        kind: "list",
        tone: "plain",
        items: [
          "What career to pursue",
          "What skills to develop",
          "How to position yourself",
          "How to approach the job market",
        ],
      },
      {
        kind: "prose",
        lines: ["Lenni turns those decisions into an ongoing system."],
      },
      {
        kind: "flow",
        steps: [
          "Assess",
          "Plan",
          "Learn",
          "Build",
          "Evaluate",
          "Apply",
          "Improve",
        ],
      },
      {
        kind: "heading",
        text: "And Lenni never gets tired of your questions.",
        sub: "Your career context stays with you, whatever happens next.",
      },
      {
        kind: "list",
        tone: "plain",
        items: [
          "Ask at midnight",
          "Change your target career",
          "Fail an assessment",
          "Get rejected from a job",
          "Finish a project",
          "Discover a new weakness",
        ],
      },
      {
        kind: "heading",
        text: "Human coaching and Lenni don’t have to compete.",
        sub: "For people who need deep human guidance, a great coach can be invaluable.",
      },
      {
        kind: "prose",
        lines: [
          "Lenni is for people who want continuous, affordable, personalized support between those conversations — or without a coach at all.",
        ],
      },
      { kind: "cta", label: "Start your transition →" },
    ],
  },
  {
    slug: "job-boards",
    navLabel: "Lenni vs Job Boards",
    title: "Lenni vs Job Boards",
    lede: "Job boards show you where the jobs are. Lenni helps you understand whether you’re ready for them.",
    blocks: [
      {
        kind: "prose",
        lines: [
          "Searching for jobs is easy. Knowing which jobs you should be applying for is harder.",
          "A job board asks: “What job are you looking for?”",
          "Lenni asks: “What career are you building toward?”",
          "Then it connects your development to the opportunities you’re targeting.",
        ],
      },
      {
        kind: "steps",
        items: [
          ["Find a job", "See the requirements."],
          ["Understand the gap", "Know what you’re missing."],
          ["Close the gap", "Build the required skills."],
          ["Become ready", "Apply with confidence."],
        ],
      },
      {
        kind: "heading",
        text: "Don’t just search for jobs. Build toward them.",
      },
      { kind: "cta", label: "Find your next career path →" },
    ],
  },
  {
    slug: "learning-platforms",
    navLabel: "Lenni vs Learning Platforms",
    title: "Lenni vs Learning Platforms",
    lede: "Coursera, Udemy and other learning platforms give you access to knowledge. Lenni helps you decide which knowledge matters for your career.",
    blocks: [
      {
        kind: "prose",
        lines: [
          "The problem isn’t a lack of courses. It’s information overload.",
          "Thousands of courses. One career goal.",
        ],
      },
      {
        kind: "heading",
        text: "Lenni starts with your goal.",
        sub: "Then it determines:",
      },
      {
        kind: "list",
        tone: "check",
        items: [
          "What you already know",
          "What you’re missing",
          "What matters most",
          "What you should learn next",
          "What you should build to prove it",
        ],
      },
      {
        kind: "heading",
        text: "Use the courses you already love.",
        sub: "Lenni doesn’t need to replace your favorite learning platforms. It can sit above them.",
      },
      {
        kind: "prose",
        lines: [
          "Your courses become resources. Lenni becomes the system that tells you why and when to use them.",
        ],
      },
      { kind: "cta", label: "Build my career roadmap →" },
    ],
  },
  {
    slug: "doing-it-yourself",
    navLabel: "Lenni vs Doing It Yourself",
    title: "Lenni vs Figuring It Out Yourself",
    lede: "You can figure out your career transition yourself. Millions of people do.",
    blocks: [
      { kind: "prose", lines: ["You can spend hours researching:"] },
      {
        kind: "list",
        tone: "plain",
        items: [
          "Reddit",
          "YouTube",
          "LinkedIn",
          "GitHub",
          "Courses",
          "Blogs",
          "Job descriptions",
          "AI assistants",
        ],
      },
      {
        kind: "prose",
        lines: [
          "Eventually, you’ll probably find a path.",
          "But how much time will you spend figuring out what to do? And how much conflicting advice will you encounter?",
        ],
      },
      {
        kind: "heading",
        text: "Lenni removes the research loop.",
        sub: "Instead of starting with “what should I learn?”, start with “here’s who I am, here’s where I want to go.” Lenni does the work of turning that into an actionable path.",
      },
      {
        kind: "columns",
        columns: [
          {
            label: "Without Lenni",
            items: [
              "Search",
              "Compare",
              "Ask AI",
              "Watch videos",
              "Change your plan",
              "Start again",
              "Get overwhelmed",
            ],
          },
          {
            label: "With Lenni",
            featured: true,
            items: [
              "Assess",
              "Get your roadmap",
              "Execute",
              "Measure",
              "Adapt",
              "Move forward",
            ],
          },
        ],
      },
      {
        kind: "prose",
        lines: [
          "You could figure it out yourself. Lenni exists because you shouldn’t have to.",
        ],
      },
      { kind: "cta", label: "Start for free →" },
    ],
  },
];

export function comparePage(slug: string): ComparePage | undefined {
  return COMPARE_PAGES.find((page) => page.slug === slug);
}
