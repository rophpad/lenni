"use client";
import Link from "next/link";
import { useState } from "react";

type Job={id:string;title:string;subtitle:string;match:number;gaps:string[]};
type Evaluation={id:string;title:string;score:number;matchedSkills:string[];missingSkills:string[];explanation:string;createdAt?:string};

function Ring({value}:{value:number}){return <div className="relative size-16 shrink-0"><svg className="size-full -rotate-90" viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="none" stroke="var(--color-border)" strokeWidth="6"/><circle cx="32" cy="32" r="27" fill="none" stroke={value>=70?"var(--color-brand)":"var(--color-danger)"} strokeWidth="6" strokeLinecap="round" strokeDasharray="169.6" strokeDashoffset={169.6*(1-value/100)}/></svg><span className="absolute inset-0 flex items-center justify-center font-mono text-[13px] font-semibold">{value}%</span></div>}

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
 return <><header className="flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2.5 font-mono text-[11px] uppercase tracking-[.14em] text-accent">Jobs</p><h1 className="font-display text-[32px] font-semibold">Where you’d fit today</h1><p className="mt-1.5 max-w-130 text-[14.5px] leading-normal text-muted">Matched against your current skills profile. Gaps here get folded straight back into your roadmap.</p></div><button className="rounded-2xl border-2 border-accent bg-accent px-6 py-3.25 text-[13.5px] font-extrabold uppercase tracking-[.03em] text-white shadow-[0_4px_0_var(--color-brand-strong)]" onClick={()=>setOpen(true)}>▣ Evaluate a job description</button></header><div className="mt-6">{jobs.map(job=><article className="mt-3.5 flex items-center gap-5 rounded-xl border border-ui-border-subtle bg-ui-surface p-5.5 shadow-(--shadow)" key={job.id}><Ring value={job.match}/><div className="min-w-0 flex-1"><h2 className="font-display text-[16.5px] font-semibold">{job.title}</h2><p className="mt-0.5 text-[13px] text-subtle">{job.subtitle}</p><div className="mt-2.5 flex flex-wrap gap-1.5">{job.gaps.map(gap=><span className="rounded-md bg-negative-subtle px-2.25 py-0.75 font-mono text-[11px] text-negative" key={gap}>{gap}</span>)}</div></div><Link className="rounded-2xl border-2 border-ui-border bg-white px-6 py-3.25 text-[13.5px] font-extrabold uppercase tracking-[.03em] text-muted shadow-[0_4px_0_var(--color-border)]" href="/roadmap">Add gaps to roadmap</Link></article>)}</div>{open&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111620]/45 p-6 backdrop-blur-[2px]" onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false)}}><section className="max-h-[88vh] w-full max-w-140 overflow-y-auto rounded-xl bg-white p-7 shadow-[0_24px_64px_rgba(17,22,32,.28)]"><div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-lg font-semibold">Evaluate a job description</h2><p className="mt-1 text-[14.5px] text-muted">Paste a posting and Lenni checks it against your current skills profile.</p></div><button className="flex size-7.5 items-center justify-center rounded-full text-subtle hover:bg-(--color-surface-raised)" onClick={()=>setOpen(false)}>✕</button></div><textarea className="mt-6 min-h-30 w-full resize-y rounded-lg border border-ui-border bg-page-subtle px-3.75 py-3.25 text-sm leading-[1.55] outline-none focus:border-accent" placeholder="Paste the job description here…" value={text} onChange={event=>{setText(event.target.value);setEvaluation(null);setError("")}}/><div className="mt-3 flex justify-end"><button className="rounded-2xl border-2 border-accent bg-accent px-6 py-3.25 text-[13.5px] font-extrabold uppercase text-white shadow-[0_4px_0_var(--color-brand-strong)]" onClick={evaluate}>{loading?"Evaluating…":"Evaluate match"}</button></div>{error&&<p className="mt-4 text-[13px] text-negative">{error}</p>}{evaluation&&<div className="mt-4.5 flex flex-wrap items-center gap-5 border-t border-ui-border-subtle pt-4.5"><Ring value={Math.round(evaluation.score)}/><div className="min-w-50 flex-1"><h3 className="font-display text-[16.5px] font-semibold">Match against your profile</h3><p className="mt-0.5 text-[13px] text-subtle">{evaluation.matchedSkills.length+evaluation.missingSkills.length} tracked skills detected</p><div className="mt-2.5 flex gap-1.5">{evaluation.missingSkills.map(skill=><span className="rounded-md bg-negative-subtle px-2.25 py-0.75 font-mono text-[11px] text-negative" key={skill}>{skill}</span>)}</div></div></div>}</section></div>}</>;
}
