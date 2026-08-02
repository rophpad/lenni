import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/session";
import { matchMockJob, mockJobs } from "../../../lib/mock-jobs";
import { JobsView } from "./jobs-view";

function stringArray(value:unknown){return Array.isArray(value)?value.filter((item):item is string=>typeof item==="string"):[];}

export default async function JobsPage(){
 const session=await getSession();
 const [evaluations,userSkills]=await Promise.all([
  prisma.jobEvaluation.findMany({where:{userId:session!.user.id},orderBy:{createdAt:"desc"}}),
  prisma.userSkill.findMany({where:{userId:session!.user.id}}),
 ]);
 const skillRecords=userSkills.length?await prisma.skill.findMany({where:{id:{in:userSkills.map(skill=>skill.skillId)}}}):[];
 const skillDetails=new Map(skillRecords.map(skill=>[skill.id,skill]));
 const profileSkills=userSkills.flatMap(userSkill=>{const skill=skillDetails.get(userSkill.skillId);return skill?[{name:skill.name,slug:skill.slug,score:Number(userSkill.score)}]:[];});
 const matchedMocks=mockJobs.map(job=>matchMockJob(job,profileSkills));
 const savedEvaluations=evaluations.map(evaluation=>({id:evaluation.id,title:evaluation.detectedTitle??"Evaluated role",subtitle:`Evaluated ${new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"}).format(evaluation.createdAt)}`,match:Math.round(Number(evaluation.score)),gaps:stringArray(evaluation.missingSkills)}));
 return <JobsView initialJobs={[...matchedMocks,...savedEvaluations]}/>;
}
