import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { apiUser } from "../../../../lib/session";
import { featuresReleased, releaseUnavailable } from "../../../../lib/release";
const headersFor = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});
export async function POST() {
  const user = await apiUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!featuresReleased())
    return NextResponse.json(releaseUnavailable, { status: 403 });
  const account = await prisma.betterAuthAccount.findFirst({
    where: { userId: user.id, providerId: "github" },
    select: { accessToken: true },
  });
  if (!account?.accessToken)
    return NextResponse.json(
      { error: "Connect your GitHub account first." },
      { status: 409 },
    );
  const [profileResponse, reposResponse] = await Promise.all([
    fetch("https://api.github.com/user", {
      headers: headersFor(account.accessToken),
      cache: "no-store",
    }),
    fetch(
      "https://api.github.com/user/repos?affiliation=owner,collaborator,organization_member&sort=updated&per_page=100",
      { headers: headersFor(account.accessToken), cache: "no-store" },
    ),
  ]);
  if (!profileResponse.ok || !reposResponse.ok)
    return NextResponse.json(
      {
        error:
          "GitHub could not be synced. Reconnect your account and try again.",
      },
      { status: 502 },
    );
  const profile = await profileResponse.json();
  const repos = (
    (await reposResponse.json()) as Array<Record<string, unknown>>
  ).map((repo) => ({
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    isFork: repo.fork,
    updatedAt: repo.updated_at,
  }));
  const parsedData = {
    profile: {
      login: profile.login,
      name: profile.name,
      bio: profile.bio,
      location: profile.location,
      company: profile.company,
      website: profile.blog,
      avatarUrl: profile.avatar_url,
    },
    repositories: repos,
  };
  const parsedJson = parsedData as unknown as Prisma.InputJsonValue;
  const existing = await prisma.profileSource.findFirst({
    where: { userId: user.id, type: "github" },
  });
  const data = {
    status: "ready" as const,
    externalUrl: profile.html_url as string,
    parsedData: parsedJson,
    syncedAt: new Date(),
    errorMessage: null,
  };
  const source = existing
    ? await prisma.profileSource.update({ where: { id: existing.id }, data })
    : await prisma.profileSource.create({
        data: { userId: user.id, type: "github", ...data },
      });
  const current = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      headline: profile.bio,
      location: profile.location,
      bio: profile.bio,
    },
    update: {
      headline: current?.headline ?? profile.bio,
      location: current?.location ?? profile.location,
      bio: current?.bio ?? profile.bio,
    },
  });
  return NextResponse.json({ source, repositoryCount: repos.length });
}
