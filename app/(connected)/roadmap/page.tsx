import { TrailMap, type TrailNode } from "../../components/trail-map";
import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/session";

export default async function RoadmapPage() {
  const session = await getSession();
  const roadmap = await prisma.roadmap.findFirst({
    where: { userId: session!.user.id, status: "active" },
    orderBy: { version: "desc" },
  });
  const records = roadmap
    ? await prisma.milestone.findMany({
        where: { roadmapId: roadmap.id },
        orderBy: { position: "asc" },
      })
    : [];
  const moduleRecords = records.length
    ? await prisma.module.findMany({
        where: { milestoneId: { in: records.map(m => m.id) } },
        orderBy: [{ milestoneId: "asc" }, { position: "asc" }],
      })
    : [];

  const nodes: TrailNode[] = records.map(m => {
    const modules = moduleRecords.filter(module => module.milestoneId === m.id);
    const completed = modules.filter(module => module.status === "completed").length;
    const status =
      m.status === "completed" ? "complete" : m.status === "locked" ? "locked" : "current";
    return {
      id: m.id,
      title: m.title,
      status,
      caption:
        status === "current"
          ? `${completed} of ${modules.length} modules complete — today’s lesson continues here`
          : (m.description ?? undefined),
      modules: modules.map(module => module.title),
      href: status === "current" ? "/lesson" : undefined,
    };
  });

  const doneCount = nodes.filter(n => n.status === "complete").length;
  const total = nodes.length || 1;

  return (
    <>
      <div className="mb-6">
        <p className="mb-2 kicker text-accent">Roadmap</p>
        <h1 className="font-display text-display-l font-bold">
          {roadmap?.title ?? "Your career roadmap"}
        </h1>
        <p className="mt-1 max-w-130 text-body leading-normal text-muted">
          Built from your résumé, LinkedIn and GitHub — reordered as you complete
          milestones and as new gaps appear.
        </p>
      </div>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ui-border-subtle px-5 py-4 sm:px-6">
          <p className="kicker text-subtle">
            Level {Math.min(doneCount + 1, total)} of {total}
          </p>
          <p className="kicker text-positive">{doneCount} cleared</p>
        </div>
        <div className="px-5 py-6 sm:px-6">
          <TrailMap nodes={nodes} variant="full" />
        </div>
      </section>
    </>
  );
}
