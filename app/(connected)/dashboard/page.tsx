import Link from "next/link";
import { TrailMap, toTrailStatus, type TrailNode } from "../../components/trail-map";
import { ensureDailyPlan } from "../../../lib/daily-plan";
import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/session";
import { TaskList } from "./task-list";

const card="card p-6";

function CompactRoadmap({milestones}:{milestones:Array<{id:string;title:string;status:string}>}){
 // The DB marks every not-yet-reached milestone "locked"; the first non-completed
 // one is the level the player is actually standing on.
 const activeIndex=milestones.findIndex(m=>m.status!=="completed");
 const nodes:TrailNode[]=milestones.map((m,i)=>({
  id:m.id,
  title:m.title,
  status:i===activeIndex&&m.status!=="completed"?"current":toTrailStatus(m.status),
 }));
 return <TrailMap nodes={nodes} variant="compact"/>;
}

export default async function DashboardPage(){
 const session=await getSession();
 const uid=session!.user.id;
 const [roadmap,dailyPlan,streak,coach,currentProgress]=await Promise.all([
  prisma.roadmap.findFirst({where:{userId:uid,status:"active"},orderBy:{version:"desc"}}),
  // Builds today's plan if it does not exist yet, so the card is never empty.
  ensureDailyPlan(uid),
  prisma.streak.findUnique({where:{userId:uid}}),
  prisma.coachMessage.findFirst({where:{userId:uid,triggerType:{not:"onboarding"}},orderBy:{createdAt:"desc"}}),
  prisma.lessonProgress.findFirst({where:{userId:uid,status:{in:["available","in_progress"]}},orderBy:{updatedAt:"asc"}}),
 ]);
 const tasks=dailyPlan.tasks;
 const [milestones,currentLesson]=await Promise.all([
  roadmap?prisma.milestone.findMany({where:{roadmapId:roadmap.id},orderBy:{position:"asc"}}):[],
  currentProgress?prisma.lesson.findUnique({where:{id:currentProgress.lessonId}}):null,
 ]);
 const currentMilestone=milestones.find(m=>m.status==="in_progress"||m.status==="available")??milestones.find(m=>m.status!=="completed")??milestones.at(-1);
 const allModules=milestones.length?await prisma.module.findMany({where:{milestoneId:{in:milestones.map(m=>m.id)}},orderBy:{position:"asc"}}):[];
 const modules=currentMilestone?allModules.filter(module=>module.milestoneId===currentMilestone.id):[];
 const allLessons=allModules.length?await prisma.lesson.findMany({where:{moduleId:{in:allModules.map(module=>module.id)}},select:{id:true}}):[];
 const completedLessons=allLessons.length?await prisma.lessonProgress.count({where:{userId:uid,lessonId:{in:allLessons.map(lesson=>lesson.id)},status:"completed"}}):0;
 const taskLessonIds=tasks.flatMap(task=>task.lessonId?[task.lessonId]:[]);
 const taskLessons=taskLessonIds.length?await prisma.lesson.findMany({where:{id:{in:taskLessonIds}},select:{id:true,title:true}}):[];
 const taskLessonTitles=new Map(taskLessons.map(lesson=>[lesson.id,lesson.title]));
 const displayTasks=tasks.map(task=>({...task,title:task.lessonId&&taskLessonTitles.has(task.lessonId)?`Complete today’s lesson — ${taskLessonTitles.get(task.lessonId)}`:task.title}));
 const completedModules=modules.filter(m=>m.status==="completed").length;
 const progress=allLessons.length?completedLessons/allLessons.length*100:0;
 let planMinutes=0;
 for(const task of tasks)planMinutes+=task.estimatedMinutes;
 const circumference=238.8;
 const now=new Date();
 const hour=now.getHours();
 const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
 const name=session?.user.name?.trim().split(/\s+/)[0]??"there";
 const date=new Intl.DateTimeFormat("en-US",{weekday:"long",month:"long",day:"numeric"}).format(now);
 const lessonTitle=currentLesson?.title??tasks.find(task=>task.lessonId)?.title??"Your next lesson";
 const completedTasks=tasks.filter(task=>task.completedAt).length;
 const coachMessage=coach?.message??(tasks.length>0&&completedTasks===tasks.length
  ?`Excellent work — you completed today’s plan. Your next step is ${lessonTitle}.`
  :completedTasks>0
   ?`Nice progress — ${completedTasks} of ${tasks.length} tasks completed today. Keep going with ${lessonTitle}.`
   :`You’re ${Math.round(progress)}% through your roadmap. Continue ${currentMilestone?.title??"your current milestone"} with ${lessonTitle}.`);
 return <><div className="mb-7 flex flex-wrap items-start justify-between gap-3"><div><p className="mb-2 kicker text-accent">{date}</p><h1 className="font-display text-display-m md:text-display-l font-bold tracking-[-.01em]">{greeting}, {name}</h1></div><div className="flex items-center gap-2 rounded-full border border-ui-border-subtle bg-ui-surface px-4 py-2 font-mono text-body-s"><span className="text-caution">◆</span><span>{streak?.currentDays??0} day streak</span></div></div>
 <div className="mb-4 grid grid-cols-[1.5fr_1fr] gap-4 max-[900px]:grid-cols-1"><article className={`${card} overflow-hidden`}><p className="mb-2 kicker text-accent">Career goal</p><h2 className="mb-4 font-display text-display-s md:text-display-m font-bold">{roadmap?.title??"Your career roadmap"}</h2><div className="flex items-center gap-5"><div className="relative size-22 shrink-0"><svg className="size-full -rotate-90" viewBox="0 0 88 88"><circle cx="44" cy="44" r="38" fill="none" stroke="var(--color-border)" strokeWidth="7"/><circle cx="44" cy="44" r="38" fill="none" stroke="var(--color-brand)" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference*(1-progress/100)}/></svg><span className="absolute inset-0 flex items-center justify-center font-mono text-lg font-semibold">{Math.round(progress)}%</span></div><div><p className="text-xs text-subtle">Current milestone</p><p className="mt-1 text-body font-semibold">{currentMilestone?.title??"Getting started"}</p><p className="mt-2 text-xs text-subtle">Modules left</p><p className="mt-1 text-body font-semibold">{Math.max(0,modules.length-completedModules)} of {modules.length}</p></div></div><div className="mt-5 border-t border-ui-border-subtle pt-4"><p className="mb-3 kicker text-subtle">Path so far</p><CompactRoadmap milestones={milestones}/></div></article>
 <article className={`${card} flex flex-col gap-3`}><div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-lg bg-accent-subtle text-accent">◇</span><span className="text-body-s font-semibold text-muted">AI Coach</span></div><p className="text-sm leading-normal">{coachMessage}</p><Link className="mt-auto btn btn-secondary" href="/progress">See weekly summary</Link></article></div>
 <article className={card}><p className="mb-2 kicker text-accent">Today’s plan{planMinutes>0?` · ${planMinutes} min`:""}</p>{tasks.length>0
  ?<TaskList tasks={displayTasks.map(task=>({id:task.id,title:task.title,minutes:task.estimatedMinutes,done:!!task.completedAt}))}/>
  :<div className="py-2"><p className="text-body text-muted">No tasks yet — your plan appears once your roadmap has a lesson ready.</p><Link className="btn btn-secondary mt-4" href="/roadmap">Open your roadmap</Link></div>}</article>
 <div className="mt-6 flex flex-col gap-4 rounded-card border border-ui-border-subtle bg-linear-to-br from-accent-faint to-ui-surface px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="min-w-0"><p className="mb-1 kicker text-subtle">Continue where you left off</p><h3 className="font-display text-display-s font-bold">{lessonTitle}</h3></div><Link className="btn btn-primary shrink-0 max-sm:w-full" href="/lesson">Continue learning →</Link></div></>;
}
