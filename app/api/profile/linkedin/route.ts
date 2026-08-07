import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { apiUser } from "../../../../lib/session";
import { analyzeLinkedInPdf } from "../../../../lib/profile-analysis";
import { featuresReleased, releaseUnavailable } from "../../../../lib/release";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const user = await apiUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!featuresReleased())
    return NextResponse.json(releaseUnavailable, { status: 403 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File))
      return NextResponse.json(
        { error: "Choose your LinkedIn profile PDF." },
        { status: 400 },
      );
    const analysis = await analyzeLinkedInPdf(file, user.id);
    const existing = await prisma.profileSource.findFirst({
      where: { userId: user.id, type: "linkedin" },
    });
    const data = {
      status: "ready" as const,
      fileName: file.name,
      parsedData: analysis,
      externalUrl: "https://www.linkedin.com/",
      syncedAt: new Date(),
      errorMessage: null,
    };
    const source = existing
      ? await prisma.profileSource.update({ where: { id: existing.id }, data })
      : await prisma.profileSource.create({
          data: { userId: user.id, type: "linkedin", ...data },
        });
    const current = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        headline: analysis.headline,
        currentJobTitle: analysis.currentJobTitle,
        yearsExperience: analysis.yearsExperience,
        location: analysis.location,
        bio: analysis.summary,
      },
      update: {
        headline: current?.headline ?? analysis.headline,
        currentJobTitle: current?.currentJobTitle ?? analysis.currentJobTitle,
        yearsExperience: current?.yearsExperience ?? analysis.yearsExperience,
        location: current?.location ?? analysis.location,
        bio: current?.bio ?? analysis.summary,
      },
    });
    return NextResponse.json({ source, analysis });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to analyze this LinkedIn PDF.",
      },
      { status: 400 },
    );
  }
}
