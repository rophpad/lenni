import type { ReactNode } from "react";
import { ConnectedShell } from "./connected-shell";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { getSession } from "../../lib/session";
export default async function ConnectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  const goal = await prisma.careerGoal.findFirst({ where: { userId: session.user.id, isActive: true } });
  const roadmap = await prisma.roadmap.findFirst({ where: { userId: session.user.id, status: "active" } });
  if (!profile?.onboardingCompletedAt || !goal || !roadmap) redirect("/onboarding");
  const role = goal?.roleId ? await prisma.role.findUnique({ where: { id: goal.roleId } }) : null;
  return (
    <ConnectedShell user={{ name: session.user.name, career: role?.title ?? "Choose a career" }}>
      {children}
    </ConnectedShell>
  );
}
