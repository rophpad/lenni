"use client";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "../../../lib/auth-client";

export function ResetPasswordForm({token}:{token:string}){
 const [loading,setLoading]=useState(false);
 const [complete,setComplete]=useState(false);
 const [error,setError]=useState("");
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setLoading(true);setError("");
  const data=new FormData(event.currentTarget);const password=String(data.get("password"));const confirmation=String(data.get("confirmation"));
  if(password!==confirmation){setLoading(false);return setError("Passwords do not match");}
  const result=await authClient.resetPassword({newPassword:password,token});
  setLoading(false);
  if(result.error)return setError(result.error.message??"Could not reset your password");
  setComplete(true);
 }
 if(complete)return <p className="rounded-lg bg-positive-subtle px-3 py-2 text-sm text-positive">Your password has been reset. <Link className="font-semibold underline" href="/login">Log in</Link>.</p>;
 return <form onSubmit={submit}>{error&&<p className="mb-4 rounded-lg bg-negative-subtle px-3 py-2 text-sm text-negative">{error}</p>}<label className="mb-4 block"><span className="mb-1.5 block text-[12.5px] font-medium text-subtle">New password</span><input className="w-full rounded-lg border border-ui-border bg-page-subtle px-3.25 py-2.75 text-sm outline-none focus:border-accent" name="password" type="password" autoComplete="new-password" minLength={8} required/></label><label className="mb-4 block"><span className="mb-1.5 block text-[12.5px] font-medium text-subtle">Confirm password</span><input className="w-full rounded-lg border border-ui-border bg-page-subtle px-3.25 py-2.75 text-sm outline-none focus:border-accent" name="confirmation" type="password" autoComplete="new-password" minLength={8} required/></label><button disabled={loading} className="mt-2.5 inline-flex w-full items-center justify-center rounded-2xl border-2 border-accent bg-accent px-6 py-3.25 text-[13.5px] font-extrabold uppercase tracking-[.03em] text-white shadow-[0_4px_0_var(--color-brand-strong)] transition hover:border-accent-hover hover:bg-accent-hover active:translate-y-0.75 active:shadow-[0_1px_0_var(--color-brand-strong)] disabled:opacity-50" type="submit">{loading?"Saving…":"Reset password"}</button></form>;
}
