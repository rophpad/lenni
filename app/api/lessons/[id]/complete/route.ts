import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { apiUser } from "../../../../../lib/session";

export async function PATCH(_:Request,{params}:{params:Promise<{id:string}>}){
 const user=await apiUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 const progress=await prisma.lessonProgress.findUnique({where:{userId_lessonId:{userId:user.id,lessonId:id}}});
 if(!progress)return NextResponse.json({error:"Lesson not found"},{status:404});
 const lesson=await prisma.lesson.findUnique({where:{id}});
 const module=lesson?await prisma.module.findUnique({where:{id:lesson.moduleId}}):null;
 const milestone=module?await prisma.milestone.findUnique({where:{id:module.milestoneId}}):null;
 const roadmap=milestone?await prisma.roadmap.findUnique({where:{id:milestone.roadmapId}}):null;
 if(!lesson||!module||!milestone||roadmap?.userId!==user.id)return NextResponse.json({error:"Forbidden"},{status:403});
 const nextLesson=await prisma.lesson.findFirst({where:{moduleId:module.id,position:{gt:lesson.position}},orderBy:{position:"asc"}});
 const nextModule=!nextLesson?await prisma.module.findFirst({where:{milestoneId:milestone.id,position:{gt:module.position}},orderBy:{position:"asc"}}):null;
 const nextMilestone=!nextLesson&&!nextModule?await prisma.milestone.findFirst({where:{roadmapId:roadmap.id,position:{gt:milestone.position}},orderBy:{position:"asc"}}):null;
 const nextMilestoneModule=nextMilestone?await prisma.module.findFirst({where:{milestoneId:nextMilestone.id},orderBy:{position:"asc"}}):null;
 const nextModuleLesson=nextModule?await prisma.lesson.findFirst({where:{moduleId:nextModule.id},orderBy:{position:"asc"}}):nextMilestoneModule?await prisma.lesson.findFirst({where:{moduleId:nextMilestoneModule.id},orderBy:{position:"asc"}}):null;
 await prisma.$transaction(async tx=>{
  await tx.lessonProgress.update({where:{id:progress.id},data:{status:"completed",progressPercent:100,completedAt:new Date()}});
  await tx.dailyTask.updateMany({where:{lessonId:id,completedAt:null},data:{completedAt:new Date()}});
  const upcoming=nextLesson??nextModuleLesson;
  if(upcoming)await tx.lessonProgress.upsert({where:{userId_lessonId:{userId:user.id,lessonId:upcoming.id}},create:{userId:user.id,lessonId:upcoming.id,status:"available"},update:{status:"available"}});
  if(!nextLesson)await tx.module.update({where:{id:module.id},data:{status:"completed",completedAt:new Date()}});
  if(nextModule)await tx.module.update({where:{id:nextModule.id},data:{status:"available"}});
  if(nextMilestone){
   await tx.milestone.update({where:{id:milestone.id},data:{status:"completed",completedAt:new Date()}});
   await tx.milestone.update({where:{id:nextMilestone.id},data:{status:"available"}});
   if(nextMilestoneModule)await tx.module.update({where:{id:nextMilestoneModule.id},data:{status:"available"}});
  }
 });
 return NextResponse.json({completed:true});
}
