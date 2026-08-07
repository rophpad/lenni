import {prisma} from "./prisma";

export async function buildProfileEvidence(userId:string){
 const [profile,sources,roadmap,userSkills,learningEvidence]=await Promise.all([
  prisma.profile.findUnique({where:{userId}}),
  prisma.profileSource.findMany({where:{userId,status:"ready"},orderBy:{createdAt:"asc"},select:{id:true,type:true,fileName:true,externalUrl:true,parsedData:true,syncedAt:true}}),
  prisma.roadmap.findFirst({where:{userId,status:"active"},orderBy:{version:"desc"},select:{generationContext:true}}),
  prisma.userSkill.findMany({where:{userId}}),
  prisma.skillEvidence.findMany({where:{userId},orderBy:{createdAt:"desc"},take:100}),
 ]);
 const context=roadmap?.generationContext&&typeof roadmap.generationContext==="object"&&!Array.isArray(roadmap.generationContext)?roadmap.generationContext as Record<string,unknown>:{};
 const skillIds=[...new Set([...userSkills.map(item=>item.skillId),...learningEvidence.map(item=>item.skillId)])];
 const skillRecords=skillIds.length?await prisma.skill.findMany({where:{id:{in:skillIds}}}):[];
 const skillNames=new Map(skillRecords.map(skill=>[skill.id,{name:skill.name,slug:skill.slug}]));
 return {
  profile,
  assessedSkills:userSkills.map(item=>({...skillNames.get(item.skillId),score:Number(item.score),confidence:Number(item.confidence),level:item.level,lastAssessedAt:item.lastAssessedAt})),
  learningEvidence:learningEvidence.map(item=>({...skillNames.get(item.skillId),evidence:item.evidenceText,score:item.score==null?null:Number(item.score),confidence:item.confidence==null?null:Number(item.confidence),createdAt:item.createdAt,metadata:item.metadata})),
  sources:sources.map(source=>({id:source.id,type:source.type,fileName:source.fileName,externalUrl:source.externalUrl,syncedAt:source.syncedAt,data:source.parsedData})),
  jobGaps:Array.isArray(context.jobGaps)?context.jobGaps:[],
 };
}

export function resumeTextFromEvidence(evidence:Awaited<ReturnType<typeof buildProfileEvidence>>){
 for(const source of [...evidence.sources].reverse()){
  if(source.type!=="resume"||!source.data||typeof source.data!=="object"||Array.isArray(source.data))continue;
  const text=(source.data as {text?:unknown}).text;
  if(typeof text==="string"&&text.trim().length>=100)return {id:source.id,text};
 }
 return null;
}
