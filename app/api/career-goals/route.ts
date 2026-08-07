import { NextResponse } from "next/server";
import { careerGoalRequestSchema } from "../../../lib/validation";
import { applyCareerPlan, generateCareerPlan } from "../../../lib/career-setup";
import { careerPrompt } from "../../../lib/prompts";
import { prisma } from "../../../lib/prisma";
import { apiUser } from "../../../lib/session";
import { buildProfileEvidence, resumeTextFromEvidence } from "../../../lib/profile-evidence";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Switch career goal. Reuses the résumé already on file, so the learner does
 * not have to re-upload it just to explore a different path.
 */
export async function POST(request: Request) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { career } = careerGoalRequestSchema.parse(await request.json());

    const target = careerPrompt(career); // throws on unknown or disabled slug

    const activeGoal = await prisma.careerGoal.findFirst({
      where: { userId: user.id, isActive: true },
      orderBy: { createdAt: "desc" },
    });
    const currentRole = activeGoal?.roleId
      ? await prisma.role.findUnique({ where: { id: activeGoal.roleId } })
      : null;
    if (currentRole?.slug === career)
      return NextResponse.json(
        { error: `${target.title} is already your career goal` },
        { status: 400 },
      );

    const evidence = await buildProfileEvidence(user.id);
    const resume = resumeTextFromEvidence(evidence);
    if (!resume)
      return NextResponse.json(
        { error: "We need your résumé on file to rebuild a roadmap. Please re-run onboarding." },
        { status: 400 },
      );

    const plan = await generateCareerPlan(user.id, career, evidence);
    await applyCareerPlan({
      userId: user.id,
      careerSlug: career,
      plan,
      source: { kind: "existing", id: resume.id },
      generationContext: { evidenceSourceIds: evidence.sources.map(source => source.id), jobGaps: evidence.jobGaps },
      reason: `Career goal changed to ${target.title}`,
    });

    return NextResponse.json({ ok: true, career: target.title });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not change career goal" },
      { status: 400 },
    );
  }
}
