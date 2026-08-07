"use client";
import { useState } from "react";

export function WaitlistModal({ open, onClose, source = "release-gate" }: { open: boolean; onClose: () => void; source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle"|"saving"|"done"|"error">("idle");
  if (!open) return null;
  async function join() {
    setState("saving");
    const response=await fetch("/api/waitlist",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,source})});
    setState(response.ok?"done":"error");
  }
  return <div className="fixed inset-0 z-60 flex items-center justify-center bg-(--color-scrim) p-4 backdrop-blur-[2px]" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section aria-modal="true" role="dialog" className="w-full max-w-120 rounded-card border border-ui-border-subtle bg-ui-surface p-6 shadow-(--shadow-lift)"><div className="flex items-start justify-between gap-4"><div><p className="kicker text-accent">Coming soon</p><h2 className="mt-2 font-display text-display-s font-bold">Be first to try it</h2></div><button aria-label="Close" className="flex size-8 items-center justify-center rounded-full text-subtle hover:bg-ui-raised" onClick={onClose}>✕</button></div><p className="mt-3 text-body leading-normal text-muted">GitHub connection, LinkedIn analysis, and detailed job matching are being prepared. Join the waitlist and we’ll let you know when they open.</p>{state==="done"?<p className="mt-5 rounded-control bg-positive-subtle p-4 text-body-s text-positive">You’re on the list. We’ll be in touch.</p>:<div className="mt-5 flex flex-col gap-2 sm:flex-row"><input aria-label="Email address" className="min-w-0 flex-1 rounded-control border border-ui-border bg-page-subtle px-4 py-3 outline-none focus:border-accent" type="email" placeholder="you@example.com" value={email} onChange={event=>{setEmail(event.target.value);setState("idle")}}/><button className="btn btn-primary" disabled={state==="saving"||!email.includes("@")} onClick={join}>{state==="saving"?"Joining…":"Join waitlist"}</button></div>}{state==="error"&&<p className="mt-2 text-body-s text-negative">We couldn’t save your email. Please try again.</p>}</section></div>;
}
