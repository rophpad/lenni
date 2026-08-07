import {NextResponse} from "next/server";
import {prisma} from "../../../../../lib/prisma";
import {apiUser} from "../../../../../lib/session";
import {awardLessonSkillEvidence} from "../../../../../lib/skill-progression";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await apiUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const{id}=await params;const{optionId}=await request.json();
 const option=await prisma.exerciseOption.findFirst({where:{id:optionId,exerciseId:id}});if(!option)return NextResponse.json({error:"Invalid option"},{status:400});
 const [exercise,correctOption]=await Promise.all([prisma.exercise.findUnique({where:{id}}),prisma.exerciseOption.findFirst({where:{exerciseId:id,isCorrect:true}})]);if(!exercise)return NextResponse.json({error:"Exercise not found"},{status:404});
 const result=await prisma.$transaction(async tx=>{
  const priorCorrect=option.isCorrect?await tx.exerciseAttempt.count({where:{userId:user.id,exerciseId:id,isCorrect:true}}):0;
  await tx.exerciseAttempt.create({data:{userId:user.id,exerciseId:id,selectedOptionId:option.id,isCorrect:option.isCorrect,score:option.isCorrect?1:0,response:{optionId},feedback:exercise.explanation,gradingStatus:"graded",gradedAt:new Date()}});
  if(!option.isCorrect||priorCorrect>0)return[];
  const progress=await tx.lessonProgress.findUnique({where:{userId_lessonId:{userId:user.id,lessonId:exercise.lessonId}},select:{id:true}});
  return awardLessonSkillEvidence(tx,{userId:user.id,lessonId:exercise.lessonId,kind:"exercise_correct",lessonProgressId:progress?.id});
 });
 return NextResponse.json({correct:option.isCorrect,correctOptionId:correctOption?.id,explanation:exercise.explanation,skillUpdates:result});
}
