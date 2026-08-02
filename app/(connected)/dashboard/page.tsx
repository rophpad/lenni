import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/session";
import { TaskList } from "./task-list";

const card="rounded-xl border border-ui-border-subtle bg-ui-surface p-6 shadow-(--shadow)";

function CompactRoadmap({milestones}:{milestones:Array<{id:string;title:string;status:string}>}){
 const count=Math.max(milestones.length,1);
 const points=Array.from({length:count},(_,i)=>({x:count===1?230:6+i*(448/(count-1)),y:[30,10,34,14][i%4]}));
 const route=points.slice(1).reduce((path,point,i)=>{const previous=points[i];const middle=(previous.x+point.x)/2;return `${path} C ${middle} ${previous.y}, ${middle} ${point.y}, ${point.x} ${point.y}`;},`M ${points[0].x} ${points[0].y}`);
 const activeIndex=milestones.findIndex(m=>m.status==="available"||m.status==="in_progress");
 const currentIndex=Math.max(0,activeIndex>=0?activeIndex:milestones.filter(m=>m.status==="completed").length-1);
 const routeProgress=count===1?0:(currentIndex/(count-1))*100;
 return <svg viewBox="0 0 460 46" className="h-11.5 w-full"><path d={route} fill="none" stroke="var(--color-border)" strokeWidth="2" strokeLinecap="round" pathLength="100"/><path d={route} fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" pathLength="100" strokeDasharray={`${routeProgress} 100`}/>{milestones.map((milestone,i)=>{const point=points[i];const complete=milestone.status==="completed";const current=i===currentIndex&&!complete;return <g key={milestone.id}>{current&&<circle cx={point.x} cy={point.y} r="8" fill="var(--color-brand-subtle)"/>}<circle cx={point.x} cy={point.y} r={current?5.5:4.5} fill={complete?"var(--color-success)":current?"var(--color-brand)":"#c7ccd6"} stroke={current?"white":"none"} strokeWidth={current?2:0}/></g>})}</svg>;
}

export default async function DashboardPage(){
 const session=await getSession();
 const uid=session!.user.id;
 const today=new Date();
 today.setUTCHours(0,0,0,0);
 const [roadmap,plan,streak,coach,currentProgress]=await Promise.all([
  prisma.roadmap.findFirst({where:{userId:uid,status:"active"},orderBy:{version:"desc"}}),
  prisma.dailyPlan.findUnique({where:{userId_planDate:{userId:uid,planDate:today}}}),
  prisma.streak.findUnique({where:{userId:uid}}),
  prisma.coachMessage.findFirst({where:{userId:uid,triggerType:{not:"onboarding"}},orderBy:{createdAt:"desc"}}),
  prisma.lessonProgress.findFirst({where:{userId:uid,status:{in:["available","in_progress"]}},orderBy:{updatedAt:"asc"}}),
 ]);
 const [milestones,tasks,currentLesson]=await Promise.all([
  roadmap?prisma.milestone.findMany({where:{roadmapId:roadmap.id},orderBy:{position:"asc"}}):[],
  plan?prisma.dailyTask.findMany({where:{dailyPlanId:plan.id},orderBy:{position:"asc"}}):[],
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
 return <><div className="mb-7 flex flex-wrap items-start justify-between gap-3.5"><div><p className="mb-2.5 font-mono text-[11px] font-medium uppercase tracking-[.14em] text-accent">{date}</p><h1 className="font-display text-[32px] font-semibold tracking-[-.01em]">{greeting}, {name}</h1></div><div className="flex items-center gap-2 rounded-full border border-ui-border-subtle bg-ui-surface px-4 py-2.25 font-mono text-[13px]"><span className="text-caution">◆</span><span>{streak?.currentDays??0} day streak</span></div></div>
 <div className="mb-4.5 grid grid-cols-[1.5fr_1fr] gap-4.5 max-[900px]:grid-cols-1"><article className={`${card} overflow-hidden`}><p className="mb-2.5 font-mono text-[11px] uppercase tracking-[.14em] text-accent">Career goal</p><h2 className="mb-4.5 font-display text-[26px] font-semibold">{roadmap?.title??"Your career roadmap"}</h2><div className="flex items-center gap-5"><div className="relative size-22 shrink-0"><svg className="size-full -rotate-90" viewBox="0 0 88 88"><circle cx="44" cy="44" r="38" fill="none" stroke="var(--color-border)" strokeWidth="7"/><circle cx="44" cy="44" r="38" fill="none" stroke="var(--color-brand)" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference*(1-progress/100)}/></svg><span className="absolute inset-0 flex items-center justify-center font-mono text-lg font-semibold">{Math.round(progress)}%</span></div><div><p className="text-xs text-subtle">Current milestone</p><p className="mt-0.75 text-[14.5px] font-semibold">{currentMilestone?.title??"Getting started"}</p><p className="mt-2.5 text-xs text-subtle">Modules left</p><p className="mt-0.75 text-[14.5px] font-semibold">{Math.max(0,modules.length-completedModules)} of {modules.length}</p></div></div><div className="mt-5 border-t border-ui-border-subtle pt-4.5"><p className="mb-2.5 font-mono text-[11.5px] uppercase tracking-[.08em] text-subtle">Path so far</p><CompactRoadmap milestones={milestones}/></div></article>
 <article className={`${card} flex flex-col gap-3.5`}><div className="flex items-center gap-2.5"><span className="flex size-7 items-center justify-center rounded-lg bg-accent-subtle text-accent">◇</span><span className="text-[12.5px] font-semibold text-muted">AI Coach</span></div><p className="text-sm leading-normal">{coachMessage}</p><Link className="mt-auto rounded-2xl border-2 border-ui-border bg-white px-6 py-3.25 text-center text-[13.5px] font-extrabold uppercase tracking-[.03em] text-muted shadow-[0_4px_0_var(--color-border)]" href="/progress">See weekly summary</Link></article></div>
 <article className={card}><p className="mb-2.5 font-mono text-[11px] uppercase tracking-[.14em] text-accent">Today’s plan · {planMinutes} min</p><TaskList tasks={displayTasks.map(task=>({id:task.id,title:task.title,minutes:task.estimatedMinutes,done:!!task.completedAt}))}/></article>
 <div className="mt-6 flex items-center justify-between rounded-xl border border-ui-border-subtle bg-gradient-to-br from-accent-subtle to-ui-surface px-6.5 py-5.5"><div><p className="mb-1 font-mono text-[11px] uppercase tracking-[.08em] text-subtle">Continue where you left off</p><h3 className="font-display text-[19px] font-semibold">{lessonTitle}</h3></div><Link className="rounded-2xl border-2 border-accent bg-accent px-6 py-3.25 text-[13.5px] font-extrabold uppercase tracking-[.03em] text-white shadow-[0_4px_0_var(--color-brand-strong)]" href="/lesson">Continue learning →</Link></div></>;
}
