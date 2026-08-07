import { z } from "zod";
import { generateJson } from "./ai";
import { documentToMarkdown } from "./document-markdown";

const nullableText = z.string().nullish().transform(value => value?.trim() || null);
const stringList = z.array(z.string().nullish()).nullish().transform(values =>
  (values ?? []).flatMap(value => value?.trim() ? [value.trim()] : []),
);
const profileShape = z.object({
  headline: nullableText,
  summary: nullableText,
  location: nullableText,
  currentJobTitle: nullableText,
  yearsExperience: z.coerce.number().min(0).max(80).nullish().catch(null).transform(value => value ?? null),
  experiences: z.array(
    z.object({
      title: nullableText,
      company: nullableText,
      dates: nullableText,
      description: nullableText,
    }),
  ).nullish().transform(values => (values ?? [])
    .filter(item => item.title || item.company)
    .map(item => ({
      ...item,
      title: item.title ?? "Untitled role",
      company: item.company ?? "Unknown company",
    }))),
  education: z.array(
    z.object({ school: nullableText, degree: nullableText }),
  ).nullish().transform(values => (values ?? [])
    .filter(item => item.school || item.degree)
    .map(item => ({ ...item, school: item.school ?? "Unknown school" }))),
  skills: stringList,
  certifications: stringList,
});
export type AnalyzedProfile = z.infer<typeof profileShape>;

async function structureProfile(markdown: string, userId: string) {
  const output = await generateJson<unknown>(
    userId,
    "profile_extraction",
    `Extract a career profile from the supplied document Markdown. Use only supplied evidence. Return {headline,summary,location,currentJobTitle,yearsExperience,experiences:[{title,company,dates,description}],education:[{school,degree}],skills,certifications}. Use null for unknown scalar values. Omit navigation, contact, link, and form blocks that are not real experience or education entries.`,
    { documentMarkdown: markdown },
    { effort: "low", maxOutputTokens: 5000 },
  );
  return profileShape.parse(output);
}
export async function analyzeProfilePdf(file: File, userId: string) {
  const markdown = await documentToMarkdown(file, {maxBytes: 10_000_000});
  return { analysis: await structureProfile(markdown, userId), text: markdown, markdown };
}
export async function analyzeLinkedInPdf(file: File, userId: string) {
  return (await analyzeProfilePdf(file, userId)).analysis;
}
