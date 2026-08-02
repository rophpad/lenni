"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LessonBlock={type:"paragraph"|"callout";text:string};
type Exercise={id:string;prompt:string;explanation:string|null;options:Array<{id:string;label:string}>};

export function LessonView({context,lesson,exercise}:{context:string;lesson:{id:string;title:string;minutes:number;body:LessonBlock[]};exercise:Exercise|null}){
 const router=useRouter();
 const [selected,setSelected]=useState<string|null>(null);
 const [result,setResult]=useState<{correct:boolean;correctOptionId:string;explanation:string|null}|null>(null);
 const [submitting,setSubmitting]=useState(false);
 async function choose(optionId:string){
  if(result)return;
  setSelected(optionId);
  const response=await fetch(`/api/exercises/${exercise!.id}/attempt`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({optionId})});
  if(response.ok)setResult(await response.json());
 }
 async function complete(){
  if(!result||submitting)return;
  setSubmitting(true);
  const response=await fetch(`/api/lessons/${lesson.id}/complete`,{method:"PATCH"});
  if(response.ok){router.push("/dashboard");router.refresh();}else setSubmitting(false);
 }
 return <div className="max-w-170"><p className="mb-2.5 font-mono text-[11px] uppercase tracking-[.14em] text-accent">{context}</p><h1 className="font-display text-[32px] font-semibold tracking-[-.01em]">{lesson.title}</h1><div className="mt-2.5 flex items-center gap-2.5"><span className="font-mono text-[11px] uppercase tracking-[.08em] text-accent">Lesson</span><span className="text-[12.5px] text-subtle">{lesson.minutes} min read</span></div><article className="my-5.5 text-[15.5px] leading-[1.75] [&_p]:mb-4">{lesson.body.map((block,i)=>block.type==="callout"?<aside className="my-5 rounded-r-lg border-l-3 border-accent bg-ui-surface px-4.5 py-3.5 text-sm text-muted" key={i}>{block.text}</aside>:<p key={i}>{block.text}</p>)}</article>{exercise&&<section className="mt-7.5 rounded-xl border border-ui-border-subtle bg-ui-surface p-6 shadow-(--shadow)"><p className="mb-2.5 font-mono text-[11px] uppercase tracking-[.08em] text-positive">Exercise</p><h2 className="mb-4 font-display text-base font-semibold">{exercise.prompt}</h2><div className="flex flex-col gap-2">{exercise.options.map(option=>{const correct=result?.correctOptionId===option.id;const state=result?(correct?"border-positive bg-positive-subtle":selected===option.id?"border-negative bg-negative-subtle":"border-ui-border"):selected===option.id?"border-accent bg-accent-subtle":"border-ui-border hover:border-subtle";return <button className={`flex items-center gap-3 rounded-lg border-[1.5px] px-3.75 py-3.25 text-left text-sm transition ${state}`} disabled={!!result} onClick={()=>choose(option.id)} key={option.id}><span className={`size-4 rounded-full border-[1.5px] ${result&&correct?"border-positive bg-positive":result&&selected===option.id?"border-negative bg-negative":selected===option.id?"border-accent bg-accent":"border-ui-border"}`}/>{option.label}</button>})}</div>{result&&<p className={`mt-4 rounded-lg px-4 py-3.5 text-[13.5px] ${result.correct?"bg-positive-subtle text-positive":"bg-negative-subtle text-negative"}`}>{result.explanation}</p>}</section>}<div className="mt-7.5 flex items-center justify-between"><Link className="rounded-2xl border-2 border-ui-border bg-white px-6 py-3.25 text-[13.5px] font-extrabold uppercase tracking-[.03em] text-muted shadow-[0_4px_0_var(--color-border)]" href="/roadmap">Back to roadmap</Link><button aria-disabled={!result} className={`rounded-2xl border-2 border-accent bg-accent px-6 py-3.25 text-[13.5px] font-extrabold uppercase tracking-[.03em] text-white shadow-[0_4px_0_var(--color-brand-strong)] ${result?"":"pointer-events-none opacity-45"}`} disabled={!result||submitting} onClick={complete}>{submitting?"Saving…":"Mark complete →"}</button></div></div>;
}
