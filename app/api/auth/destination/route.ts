import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { apiUser } from "../../../../lib/session";

export async function GET() {
  const user = await apiUser();
  if (!user) return NextResponse.json({ destination: "/login" }, { status: 401 });

  const [profile, goal, roadmap] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.careerGoal.findFirst({ where: { userId: user.id, isActive: true } }),
    prisma.roadmap.findFirst({ where: { userId: user.id, status: "active" } }),
  ]);
  const onboardingComplete = Boolean(profile?.onboardingCompletedAt && goal && roadmap);
  return NextResponse.json({
    onboardingComplete,
    destination: onboardingComplete ? "/dashboard" : "/onboarding",
  });
}
