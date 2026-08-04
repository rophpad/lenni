import type { ReactNode } from "react";
import { ConnectedShell } from "./connected-shell";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { getSession } from "../../lib/session";

type ConnectedState = {
  onboardingCompletedAt: Date | null;
  careerGoalId: string | null;
  roadmapId: string | null;
  roleTitle: string | null;
};

export default async function ConnectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  // This gate used to make four database round trips (three in parallel, then
  // the role). A single parameterized join returns the same small state.
  const [state] = await prisma.$queryRaw<ConnectedState[]>`
    SELECT
      p.onboarding_completed_at AS "onboardingCompletedAt",
      cg.id AS "careerGoalId",
      rm.id AS "roadmapId",
      r.title AS "roleTitle"
    FROM profiles p
    LEFT JOIN career_goals cg
      ON cg.user_id = p.user_id AND cg.is_active = true
    LEFT JOIN roadmaps rm
      ON rm.user_id = p.user_id AND rm.status = 'active'
    LEFT JOIN roles r ON r.id = cg.role_id
    WHERE p.user_id = ${session.user.id}::uuid
    ORDER BY cg.created_at DESC, rm.version DESC
    LIMIT 1
  `;
  if (!state?.onboardingCompletedAt || !state.careerGoalId || !state.roadmapId)
    redirect("/onboarding");
  return (
    <ConnectedShell user={{ name: session.user.name, career: state.roleTitle ?? "Choose a career" }}>
      {children}
    </ConnectedShell>
  );
}
