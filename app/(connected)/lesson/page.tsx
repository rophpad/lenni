import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/session";
import { LessonView } from "./lesson-view";

type LessonBlock={type:"paragraph"|"callout";text:string};

export default async function LessonPage(){
 const session=await getSession();
 const progress=await prisma.lessonProgress.findFirst({where:{userId:session!.user.id,status:{in:["available","in_progress"]}},orderBy:{updatedAt:"asc"}});
 if(!progress)return <div className="max-w-170"><p className="mb-2.5 font-mono text-[11px] uppercase tracking-[.14em] text-accent">Lesson</p><h1 className="font-display text-[32px] font-semibold tracking-[-.01em]">No lesson available</h1><p className="mt-2.5 text-[12.5px] text-subtle">Your next lesson will appear here when it is unlocked.</p></div>;
 const lesson=await prisma.lesson.findUnique({where:{id:progress.lessonId}});
 if(!lesson)return null;
 const [module,exercise]=await Promise.all([
  prisma.module.findUnique({where:{id:lesson.moduleId}}),
  prisma.exercise.findFirst({where:{lessonId:lesson.id},orderBy:{position:"asc"}}),
 ]);
 const [milestone,options]=await Promise.all([
  module?prisma.milestone.findUnique({where:{id:module.milestoneId}}):null,
  exercise?prisma.exerciseOption.findMany({where:{exerciseId:exercise.id},orderBy:{position:"asc"}}):[],
 ]);
 const moduleCount=milestone?await prisma.module.count({where:{milestoneId:milestone.id}}):0;
 return <LessonView context={`${milestone?.title??"Roadmap"} · Module ${(module?.position??0)+1} of ${moduleCount}`} lesson={{id:lesson.id,title:lesson.title,minutes:lesson.estimatedMinutes,body:lesson.body as unknown as LessonBlock[]}} exercise={exercise?{id:exercise.id,prompt:exercise.prompt,explanation:exercise.explanation,options:options.map(option=>({id:option.id,label:option.label}))}:null}/>;
}
