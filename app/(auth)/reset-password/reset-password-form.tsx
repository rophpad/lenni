"use client";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "../../../lib/auth-client";
import { PasswordInput } from "../../components/password-input";

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
 return <form onSubmit={submit}>{error&&<p className="mb-4 rounded-control bg-negative-subtle px-3 py-2 text-body-s text-negative">{error}</p>}<PasswordInput autoComplete="new-password" label="New password" name="password"/><PasswordInput autoComplete="new-password" label="Confirm password" name="confirmation"/><button disabled={loading} className="mt-2 inline-flex w-full items-center justify-center btn btn-primary disabled:opacity-50" type="submit">{loading?"Saving…":"Reset password"}</button></form>;
}
