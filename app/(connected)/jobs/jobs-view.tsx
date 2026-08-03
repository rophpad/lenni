"use client";
import Link from "next/link";
import { useState } from "react";

type Job={id:string;title:string;subtitle:string;match:number;gaps:string[]};
type Evaluation={id:string;title:string;score:number;matchedSkills:string[];missingSkills:string[];explanation:string;createdAt?:string};

// Match strength reads on the palette's own scale: pine = strong, sun = partial,
// clay = weak. Ember is reserved for actions, so it never appears here.
function ringColor(value:number){return value>=70?"var(--color-success)":value>=40?"var(--color-warning)":"var(--color-danger)"}

function Ring({value}:{value:number}){return <div className="relative size-16 shrink-0"><svg className="size-full -rotate-90" viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="none" stroke="var(--color-border)" strokeWidth="6"/><circle cx="32" cy="32" r="27" fill="none" stroke={ringColor(value)} strokeWidth="6" strokeLinecap="round" strokeDasharray="169.6" strokeDashoffset={169.6*(1-value/100)}/></svg><span className="absolute inset-0 flex items-center justify-center font-mono text-body-s font-semibold">{value}%</span></div>}

export function JobsView({initialJobs}:{initialJobs:Job[]}){
 const [jobs,setJobs]=useState(initialJobs);
 const [open,setOpen]=useState(false);
 const [text,setText]=useState("");
 const [evaluation,setEvaluation]=useState<Evaluation|null>(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 async function evaluate(){
  if(loading)return;
  setLoading(true);setError("");setEvaluation(null);
  const response=await fetch("/api/jobs/evaluate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({description:text})});
  const data=await response.json();
  setLoading(false);
  if(!response.ok){setError(data.error??"Evaluation failed");return;}
  const result=data as Evaluation;
  setEvaluation(result);
  setJobs(current=>[{id:result.id,title:result.title,subtitle:"Evaluated just now",match:Math.round(result.score),gaps:result.missingSkills},...current]);
 }
 return <><header className="flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 kicker text-accent">Jobs</p><h1 className="font-display text-display-l font-semibold">Where you’d fit today</h1><p className="mt-1 max-w-130 text-body leading-normal text-muted">Matched against your current skills profile. Gaps here get folded straight back into your roadmap.</p></div><button className="btn btn-primary max-sm:w-full" onClick={()=>setOpen(true)}>▣ Evaluate a job description</button></header>
 <div className="mt-6 flex flex-col gap-3">{jobs.map(job=>
  <article className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6" key={job.id}>
   {/* ring + title share a row on mobile so the score stays next to what it scores */}
   <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
    <Ring value={job.match}/>
    <div className="min-w-0 flex-1">
     <h2 className="font-display text-body-l font-semibold">{job.title}</h2>
     <p className="mt-1 text-body-s text-subtle">{job.subtitle}</p>
     <div className="mt-2 flex flex-wrap gap-1">{job.gaps.map(gap=><span className="rounded-chip bg-negative-subtle px-2 py-1 font-mono text-label text-negative" key={gap}>{gap}</span>)}</div>
    </div>
   </div>
   <Link className="btn btn-secondary shrink-0 max-sm:w-full" href="/roadmap">Add gaps to roadmap</Link>
  </article>)}
 </div>{open&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-(--color-scrim) p-4 backdrop-blur-[2px] sm:p-6" onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false)}}><section aria-modal="true" role="dialog" className="max-h-[88vh] w-full max-w-140 overflow-y-auto rounded-card border border-ui-border-subtle bg-ui-surface p-5 shadow-(--shadow-lift) sm:p-7"><div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-display-s font-semibold">Evaluate a job description</h2><p className="mt-1 text-body text-muted">Paste a posting and Lenni checks it against your current skills profile.</p></div><button aria-label="Close" className="flex size-8 shrink-0 items-center justify-center rounded-full text-subtle transition hover:bg-ui-raised hover:text-foreground" onClick={()=>setOpen(false)}>✕</button></div><textarea className="mt-6 min-h-30 w-full resize-y rounded-control border border-ui-border bg-page-subtle px-4 py-3 text-body leading-relaxed text-foreground outline-none transition placeholder:text-subtle focus:border-accent" placeholder="Paste the job description here…" value={text} onChange={event=>{setText(event.target.value);setEvaluation(null);setError("")}}/><div className="mt-3 flex justify-end"><button className="btn btn-primary max-sm:w-full" disabled={loading||text.trim().length<100} onClick={evaluate}>{loading?"Evaluating…":"Evaluate match"}</button></div>{error&&<p className="mt-4 text-body-s text-negative">{error}</p>}{evaluation&&<div className="mt-4 flex flex-wrap items-center gap-4 border-t border-ui-border-subtle pt-4 sm:gap-5"><Ring value={Math.round(evaluation.score)}/><div className="min-w-40 flex-1"><h3 className="font-display text-body-l font-semibold">Match against your profile</h3><p className="mt-1 text-body-s text-subtle">{evaluation.matchedSkills.length+evaluation.missingSkills.length} tracked skills detected</p><div className="mt-2 flex gap-1">{evaluation.missingSkills.map(skill=><span className="rounded-md bg-negative-subtle px-2 py-1 font-mono text-label text-negative" key={skill}>{skill}</span>)}</div></div></div>}</section></div>}</>;
}
