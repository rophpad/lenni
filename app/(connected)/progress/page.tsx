import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/session";

export default async function ProgressPage(){
 const session=await getSession();
 const uid=session!.user.id;
 const [roadmap,streak,userSkills,lessonTotals]=await Promise.all([
  prisma.roadmap.findFirst({where:{userId:uid,status:"active"},orderBy:{version:"desc"}}),
  prisma.streak.findUnique({where:{userId:uid}}),
  prisma.userSkill.findMany({where:{userId:uid},orderBy:{score:"desc"}}),
  prisma.lessonProgress.aggregate({where:{userId:uid},_sum:{timeSpentSeconds:true},_count:{_all:true}}),
 ]);
 const milestones=roadmap?await prisma.milestone.findMany({where:{roadmapId:roadmap.id},orderBy:{position:"asc"}}):[];
 const modules=milestones.length?await prisma.module.findMany({where:{milestoneId:{in:milestones.map(milestone=>milestone.id)}}}):[];
 const lessons=modules.length?await prisma.lesson.findMany({where:{moduleId:{in:modules.map(module=>module.id)}},select:{id:true}}):[];
 const completedLessons=lessons.length?await prisma.lessonProgress.count({where:{userId:uid,lessonId:{in:lessons.map(lesson=>lesson.id)},status:"completed"}}):0;
 const roadmapProgress=lessons.length?completedLessons/lessons.length*100:0;
 const skillRecords=userSkills.length?await prisma.skill.findMany({where:{id:{in:userSkills.map(userSkill=>userSkill.skillId)}}}):[];
 const skillNames=new Map(skillRecords.map(skill=>[skill.id,skill.name]));
 const skills=userSkills.map(skill=>[skillNames.get(skill.skillId)??"Skill",Math.round(Number(skill.score)),Number(skill.displayScore).toFixed(1)] as const);
 const weekStart=new Date();
 const day=weekStart.getUTCDay();
 weekStart.setUTCDate(weekStart.getUTCDate()-(day===0?6:day-1));
 weekStart.setUTCHours(0,0,0,0);
 const [weeklyLessons,weeklyMilestones]=await Promise.all([
  prisma.lessonProgress.count({where:{userId:uid,status:"completed",completedAt:{gte:weekStart}}}),
  roadmap?prisma.milestone.findMany({where:{roadmapId:roadmap.id,completedAt:{gte:weekStart}},orderBy:{completedAt:"desc"}}):[],
 ]);
 const currentMilestone=milestones.find(milestone=>milestone.status==="available"||milestone.status==="in_progress")??milestones.find(milestone=>milestone.status!=="completed");
 const learningHours=(lessonTotals._sum.timeSpentSeconds??0)/3600;
 const stats=[[`${Math.round(roadmapProgress)}%`,"Roadmap complete"],[String(completedLessons),"Lessons finished"],[String(streak?.currentDays??0),"Day streak"],[`${learningHours.toFixed(1)}h`,"Time learning"]];
 const weeklySummary=weeklyLessons===0&&weeklyMilestones.length===0
  ?`No lessons completed yet this week. Continue with ${currentMilestone?.title??"your current roadmap milestone"} to keep moving forward.`
  :`You completed ${weeklyLessons} ${weeklyLessons===1?"lesson":"lessons"}${weeklyMilestones.length?` and finished ${weeklyMilestones.map(milestone=>milestone.title).join(", ")}`:""} this week. ${currentMilestone?`${currentMilestone.title} is your current focus.`:"Your roadmap is complete."}`;
 return <><p className="mb-2 kicker text-accent">Progress</p><h1 className="font-display text-display-l font-bold tracking-[-.01em]">You’re moving</h1><p className="mt-1 max-w-130 text-body text-muted">Every lesson and exercise updates your skills profile automatically.</p><div className="my-6 grid grid-cols-4 gap-3 max-[800px]:grid-cols-2">{stats.map(([value,label])=><article className="card p-4" key={label}><strong className="font-mono text-display-m font-semibold text-accent">{value}</strong><p className="mt-1 text-xs text-subtle">{label}</p></article>)}</div><section className="card p-6"><h2 className="mb-3 font-display text-lg font-bold">Skills profile</h2>{skills.map(([name,value,label])=><div className="flex items-center gap-4 border-b border-ui-border-subtle px-1 py-3 last:border-b-0" key={name}><span className="w-40 shrink-0 text-sm font-medium">{name}</span><span className="h-1.5 flex-1 overflow-hidden rounded bg-(--color-surface-raised)"><span className="block h-full rounded bg-gradient-to-r from-accent to-positive" style={{width:`${value}%`}}/></span><span className="w-8.5 text-right font-mono text-body-s text-subtle">{label}</span></div>)}</section><section className="mt-6 card p-6"><h2 className="mb-2 font-display text-body-l font-bold">This week</h2><p className="text-sm leading-relaxed text-muted">{weeklySummary}</p></section></>;
}
