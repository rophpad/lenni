import type {Prisma,ProficiencyLevel} from "@prisma/client";

type Transaction=Prisma.TransactionClient;
type EvidenceKind="lesson_completed"|"exercise_correct";
const STOP=new Set(["and","the","for","with","from","into","using","use","build","building","introduction","advanced","fundamentals","basics","your","you"]);
function normalized(value:string){return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9+#.]+/g," ").trim()}
function tokens(value:string){return normalized(value).split(/\s+/).filter(token=>token.length>1&&!STOP.has(token))}
function acronym(value:string){return tokens(value).map(token=>token[0]).join("")}
function jsonStrings(value:unknown){return Array.isArray(value)?value.filter((item):item is string=>typeof item==="string"):[]}
function levelFor(score:number):ProficiencyLevel{return score>=85?"expert":score>=65?"advanced":score>=40?"intermediate":score>=20?"beginner":"novice"}

export async function awardLessonSkillEvidence(tx:Transaction,{userId,lessonId,kind,lessonProgressId}:{userId:string;lessonId:string;kind:EvidenceKind;lessonProgressId?:string|null}){
 const lesson=await tx.lesson.findUnique({where:{id:lessonId}});if(!lesson)return [];
 const module=await tx.module.findUnique({where:{id:lesson.moduleId}});if(!module)return [];
 const milestone=await tx.milestone.findUnique({where:{id:module.milestoneId}});if(!milestone)return [];
 const roadmap=await tx.roadmap.findUnique({where:{id:milestone.roadmapId}});if(!roadmap||roadmap.userId!==userId)return [];
 const rows=await tx.userSkill.findMany({where:{userId}});if(!rows.length)return [];
 const records=await tx.skill.findMany({where:{id:{in:rows.map(row=>row.skillId)}}});const recordById=new Map(records.map(record=>[record.id,record]));
 const corpus=normalized([lesson.title,lesson.summary,module.title,module.description,milestone.title,milestone.description,...jsonStrings(lesson.objectives)].filter(Boolean).join(" "));
 const ranked=rows.flatMap(row=>{const skill=recordById.get(row.skillId);if(!skill)return[];const name=normalized(skill.name);const slug=normalized(skill.slug);const words=[...new Set([...tokens(skill.name),...tokens(skill.slug)])];let relevance=0;if(name&&corpus.includes(name))relevance+=10;if(slug&&corpus.includes(slug))relevance+=8;relevance+=words.filter(word=>corpus.includes(word)).length*2;const short=acronym(skill.name);if(short.length>=2&&corpus.split(" ").includes(short))relevance+=6;return relevance>0?[{row,skill,relevance}]:[]}).sort((a,b)=>b.relevance-a.relevance).slice(0,3);
 if(!ranked.length)return[];
 const baseGain=kind==="lesson_completed"?Math.min(6,Math.max(3,Math.round(lesson.estimatedMinutes/8))):1.5;
 const confidenceGain=kind==="lesson_completed"?0.04:0.015;const now=new Date();const updates=[];
 for(const {row,skill,relevance} of ranked){const relevanceFactor=ranked[0].relevance===relevance?1:0.7;const previous=Number(row.score);const score=Math.min(100,Math.round((previous+baseGain*relevanceFactor)*100)/100);const confidence=Math.min(1,Math.round((Number(row.confidence)+confidenceGain*relevanceFactor)*1000)/1000);await tx.userSkill.update({where:{userId_skillId:{userId,skillId:skill.id}},data:{score,confidence,level:levelFor(score),lastAssessedAt:now}});await tx.skillEvidence.create({data:{userId,skillId:skill.id,lessonProgressId:lessonProgressId??null,evidenceText:kind==="lesson_completed"?`Completed lesson: ${lesson.title}`:`Answered a checkpoint correctly in: ${lesson.title}`,score,confidence,metadata:{kind,lessonId,previousScore:previous,gain:score-previous,relevance}}});updates.push({skillId:skill.id,name:skill.name,previousScore:previous,score,gain:score-previous})}
 return updates;
}
