"use client";
import { useState } from "react";
import { authClient } from "../../../lib/auth-client";

export function ForgotPasswordForm(){
 const [loading,setLoading]=useState(false);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setLoading(true);setError("");setMessage("");
  const email=String(new FormData(event.currentTarget).get("email"));
  const result=await authClient.requestPasswordReset({email,redirectTo:"/reset-password"});
  setLoading(false);
  if(result.error)return setError(result.error.message??"Could not send the reset link");
  setMessage("If an account exists for this email, a reset link has been sent.");
 }
 return <form onSubmit={submit}>{error&&<p className="mb-4 rounded-lg bg-negative-subtle px-3 py-2 text-sm text-negative">{error}</p>}{message&&<p className="mb-4 rounded-lg bg-positive-subtle px-3 py-2 text-sm text-positive">{message}</p>}<label className="mb-4 block"><span className="mb-1 block text-body-s font-medium text-subtle">Email</span><input className="w-full rounded-lg border border-ui-border bg-page-subtle px-3 py-3 text-sm outline-none focus:border-accent" name="email" type="email" autoComplete="email" placeholder="maya@email.com" required/></label><button disabled={loading} className="mt-2 inline-flex w-full items-center justify-center btn btn-primary disabled:opacity-50" type="submit">{loading?"Sending…":"Send reset link"}</button></form>;
}
