import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { applyCareerPlan, generateCareerPlan } from "../../../lib/career-setup";
import { careerPrompt } from "../../../lib/prompts";
import { apiUser } from "../../../lib/session";
import { documentToMarkdown } from "../../../lib/document-markdown";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("resume");
    const careerSlug = String(form.get("career") ?? "");
    if (!(file instanceof File) || file.size === 0 || file.size > 10_000_000)
      throw new Error("Choose a résumé up to 10MB");

    const text = await documentToMarkdown(file, { maxBytes: 10_000_000, maxCharacters: 90_000 });
    if (text.trim().length < 100)
      throw new Error("We could not read enough text from this résumé");

    // Validates the slug before spending an AI call on it.
    careerPrompt(careerSlug);

    const plan = await generateCareerPlan(user.id, careerSlug, {sources:[{type:"resume",fileName:file.name,data:{text}}]});
    await applyCareerPlan({
      userId: user.id,
      careerSlug,
      plan,
      source: {
        kind: "new",
        fileName: file.name,
        checksum: createHash("sha256").update(text).digest("hex"),
        text,
      },
      reason: "Initial résumé analysis",
    });

    return NextResponse.json({
      skills: plan.skills.map(s => ({ name: s.name, missing: s.missing })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Onboarding failed" },
      { status: 400 },
    );
  }
}
