import { TrailMap, type TrailNode } from "../../components/trail-map";
import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/session";
import { featuresReleased } from "../../../lib/release";
import { RegenerateRoadmap } from "./regenerate-roadmap";

export default async function RoadmapPage() {
  const session = await getSession();
  const sourceCount=await prisma.profileSource.count({where:{userId:session!.user.id,status:"ready"}});
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

  const context=roadmap?.generationContext&&typeof roadmap.generationContext==="object"&&!Array.isArray(roadmap.generationContext)?roadmap.generationContext as Record<string,unknown>:{};
  const jobGapGroups=Array.isArray(context.jobGaps)?context.jobGaps.flatMap(item=>item&&typeof item==="object"?[item as {jobEvaluationId?:string;title?:string;gaps?:unknown}]:[]):[];

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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div>
        <p className="mb-2 kicker text-accent">Roadmap</p>
        <h1 className="font-display text-display-m md:text-display-l font-bold">
          {roadmap?.title ?? "Your career roadmap"}
        </h1>
        <p className="mt-1 max-w-130 text-body leading-normal text-muted">
          Built from your résumé, LinkedIn and GitHub — reordered as you complete
          milestones and as new gaps appear.
        </p></div><RegenerateRoadmap released={featuresReleased()} sourceCount={sourceCount}/>
      </div>

      {jobGapGroups.length>0&&<section className="card mb-5 p-6"><p className="kicker text-accent">From job analyses</p><h2 className="mt-2 font-display text-display-s font-bold">Gaps added to your roadmap</h2><p className="mt-1 text-body-s text-muted">Use these priorities as you work through your next lessons and projects.</p><div className="mt-4 space-y-4">{jobGapGroups.map((group,index)=><div className="rounded-control bg-page-subtle p-4" key={group.jobEvaluationId??index}><h3 className="font-semibold">{group.title??"Evaluated role"}</h3><div className="mt-2 flex flex-wrap gap-2">{(Array.isArray(group.gaps)?group.gaps:[]).filter((gap):gap is string=>typeof gap==="string").map(gap=><span className="rounded-chip bg-negative-subtle px-3 py-1 text-label text-negative" key={gap}>{gap}</span>)}</div></div>)}</div></section>}

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
