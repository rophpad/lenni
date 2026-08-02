import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { apiUser } from "../../../../lib/session";
export async function PATCH(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await apiUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const task = await prisma.dailyTask.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const plan = await prisma.dailyPlan.findUnique({
    where: { id: task.dailyPlanId },
  });
  if (plan?.userId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const updated = await prisma.dailyTask.update({
    where: { id },
    data: { completedAt: task.completedAt ? null : new Date() },
  });
  return NextResponse.json({ done: !!updated.completedAt });
}
