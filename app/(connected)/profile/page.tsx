import { careerCatalog } from "../../../lib/career-setup";
import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/session";
import { CareerGoalPicker } from "./career-goal-picker";

export default async function ProfilePage(){
 const session=await getSession();
 const uid=session!.user.id;
 const [profile,goal,roadmap,sources]=await Promise.all([
  prisma.profile.findUnique({where:{userId:uid}}),
  prisma.careerGoal.findFirst({where:{userId:uid,isActive:true},orderBy:{createdAt:"desc"}}),
  prisma.roadmap.findFirst({where:{userId:uid,status:"active"},orderBy:{version:"desc"}}),
  prisma.profileSource.findMany({where:{userId:uid,status:"ready"},orderBy:{createdAt:"asc"}}),
 ]);
 const role=goal?.roleId?await prisma.role.findUnique({where:{id:goal.roleId}}):null;
 const milestones=roadmap?await prisma.milestone.findMany({where:{roadmapId:roadmap.id},select:{id:true}}):[];
 const modules=milestones.length?await prisma.module.findMany({where:{milestoneId:{in:milestones.map(milestone=>milestone.id)}},select:{id:true}}):[];
 const lessons=modules.length?await prisma.lesson.findMany({where:{moduleId:{in:modules.map(module=>module.id)}},select:{id:true}}):[];
 const completedLessons=lessons.length?await prisma.lessonProgress.count({where:{userId:uid,lessonId:{in:lessons.map(lesson=>lesson.id)},status:"completed"}}):0;
 const progress=lessons.length?Math.round(completedLessons/lessons.length*100):0;
 const name=session!.user.name?.trim()||"Lenni learner";
 const initials=name.split(/\s+/).map(part=>part[0]).slice(0,2).join("").toUpperCase();
 const currentRole=profile?.currentJobTitle??"Not provided";
 const experience=profile?.yearsExperience==null?"":`, ${Number(profile.yearsExperience)} ${Number(profile.yearsExperience)===1?"yr":"yrs"}`;
 const careerGoal=role?.title??goal?.customTitle??"Not selected";
 const sourceLabels=sources.map(source=>source.type==="linkedin"?"LinkedIn":source.type==="github"?"GitHub":source.fileName??"Résumé");
 const linkedInUrl=sources.find(source=>source.type==="linkedin")?.externalUrl??"https://www.linkedin.com/";
 const githubUrl=sources.find(source=>source.type==="github")?.externalUrl??"https://github.com/";
 const careers=careerCatalog();
 const hasResume=sources.some(source=>source.type==="resume");
 const details:Array<[string,string,React.ReactNode?]>=[
  ["Email",session!.user.email],
  ["Current role",`${currentRole}${experience}`],
  ["Career goal",careerGoal,<CareerGoalPicker careers={careers} currentSlug={role?.slug??null} hasResume={hasResume} key="picker"/>],
  ["Roadmap progress",`${progress}% complete`],
 ];
 return <><p className="mb-2 kicker text-accent">Profile</p><h1 className="font-display text-display-m md:text-display-l font-bold tracking-[-.01em]">Your details</h1><section className="mt-6 card p-6"><div className="mb-7 flex items-center gap-4"><span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-positive font-display text-xl sm:text-2xl font-bold text-white">{initials}</span><div><h2 className="font-display text-display-s font-bold">{name}</h2><p className="mt-1 text-body-s text-muted">{currentRole} → {careerGoal}</p></div></div>{details.map(([key,value,action])=><div className="flex flex-wrap items-center justify-between gap-2 border-b border-ui-border-subtle px-1 py-3 text-body last:border-b-0" key={key}><span className="text-subtle">{key}</span><span className="flex items-center gap-3"><span className="font-medium">{value}</span>{action}</span></div>)}</section>
 <section className="mt-6 card p-6"><h2 className="mb-3 font-display text-display-s font-bold">Connected sources</h2><div className="flex flex-wrap items-center gap-2">{sourceLabels.map(source=><span className="flex items-center gap-1 rounded-full border border-positive-subtle bg-positive-subtle px-3 py-1 text-body-s text-positive" key={source}>✓ {source}</span>)}<a className="flex items-center gap-1 rounded-full border border-positive-subtle bg-positive-subtle px-3 py-1 text-body-s text-positive" href={linkedInUrl} rel="noreferrer" target="_blank"><span className="font-semibold">+</span> Add LinkedIn Profile</a><a className="flex items-center gap-1 rounded-full border border-positive-subtle bg-positive-subtle px-3 py-1 text-body-s text-positive" href={githubUrl} rel="noreferrer" target="_blank"><span className="font-semibold">+</span> Add GitHub Account</a></div></section></>;
}
