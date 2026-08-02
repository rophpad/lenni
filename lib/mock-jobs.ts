export type MockJob = {
  id: string;
  title: string;
  company: string;
  requirements: Array<{ label: string; keywords: string[] }>;
};

export type UserSkillForMatching = {
  name: string;
  slug: string;
  score: number;
};

export const mockJobs: MockJob[] = [
  {
    id: "mock-bitcoin-protocol-engineer",
    title: "Bitcoin Protocol Engineer",
    company: "OpenSats Labs",
    requirements: [
      { label: "Bitcoin protocol", keywords: ["bitcoin protocol", "bitcoin", "consensus"] },
      { label: "Bitcoin Core", keywords: ["bitcoin core", "core"] },
      { label: "C++", keywords: ["c++", "cpp"] },
      { label: "Git", keywords: ["git", "version control"] },
    ],
  },
  {
    id: "mock-lightning-app-engineer",
    title: "Lightning Application Engineer",
    company: "Voltage Works",
    requirements: [
      { label: "Lightning Network", keywords: ["lightning", "lightning network"] },
      { label: "TypeScript", keywords: ["typescript", "javascript"] },
      { label: "Node.js", keywords: ["node.js", "nodejs", "node"] },
      { label: "Bitcoin wallets", keywords: ["wallet", "wallets", "bitcoin"] },
    ],
  },
];

export function matchMockJob(job: MockJob, userSkills: UserSkillForMatching[]) {
  const requirementScores = job.requirements.map(requirement => {
    const match = userSkills
      .filter(skill => {
        const searchable = `${skill.name} ${skill.slug}`.toLowerCase();
        return requirement.keywords.some(keyword => searchable.includes(keyword));
      })
      .sort((a, b) => b.score - a.score)[0];
    return { label: requirement.label, score: match?.score ?? 0 };
  });
  const match = requirementScores.length
    ? Math.round(requirementScores.reduce((total, requirement) => total + requirement.score, 0) / requirementScores.length)
    : 0;
  return {
    id: job.id,
    title: job.title,
    subtitle: job.company,
    match,
    gaps: requirementScores.filter(requirement => requirement.score < 60).map(requirement => requirement.label),
  };
}
