/**
 * Every career Lenni advertises, in one place — the landing page, the career
 * picker, and the roles table all read from here so they cannot drift.
 *
 * Deliberately free of server imports (no Prisma, no prompts) so client
 * components can use it without pulling the prompt text into the browser
 * bundle. `enabled` is UI-only: the real gate is `careerPrompt()`, which throws
 * for any slug without benchmark/analysis/roadmap prompts written.
 */
export type CareerCatalogEntry = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  iconKey: string;
  colorKey: string;
  enabled: boolean;
};

export const CAREER_CATALOG: CareerCatalogEntry[] = [
  { slug: "ai-engineer", title: "AI Engineer", tagline: "Foundations → LLMs", description: "Build and deploy production AI systems", iconKey: "network", colorKey: "iris", enabled: true },
  { slug: "bitcoin-developer", title: "Bitcoin Developer", tagline: "Protocol → Lightning", description: "Build secure, open-source Bitcoin software", iconKey: "server", colorKey: "sun", enabled: true },
  { slug: "product-manager", title: "Product Manager", tagline: "Discovery → Strategy", description: "Find the problem worth solving and ship it", iconKey: "flag", colorKey: "pine", enabled: false },
  { slug: "product-designer", title: "Product Designer", tagline: "Craft → Systems", description: "Design products end to end, from flow to pixel", iconKey: "pen", colorKey: "ember", enabled: false },
  { slug: "ux-designer", title: "UX Designer", tagline: "Research → Flows", description: "Turn user research into flows people understand", iconKey: "layout", colorKey: "iris", enabled: false },
  { slug: "frontend-engineer", title: "Frontend Engineer", tagline: "JS → Frameworks", description: "Build fast, accessible interfaces on the web", iconKey: "browser", colorKey: "pine", enabled: false },
  { slug: "backend-engineer", title: "Backend Engineer", tagline: "APIs → Systems", description: "Design APIs and systems that hold up under load", iconKey: "server", colorKey: "sun", enabled: false },
  { slug: "data-scientist", title: "Data Scientist", tagline: "Stats → Modeling", description: "Turn messy data into decisions and models", iconKey: "chart", colorKey: "iris", enabled: false },
  { slug: "devops-engineer", title: "DevOps Engineer", tagline: "CI/CD → Cloud", description: "Ship and run software reliably in the cloud", iconKey: "infinity", colorKey: "pine", enabled: false },
];

export function careerCatalog(): CareerCatalogEntry[] {
  return CAREER_CATALOG;
}

/** Careers a user can actually be switched to right now. */
export function availableCareers(): CareerCatalogEntry[] {
  return CAREER_CATALOG.filter(entry => entry.enabled);
}

export function careerMeta(slug: string) {
  return CAREER_CATALOG.find(entry => entry.slug === slug);
}
