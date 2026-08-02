import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Choose a new password — Lenni" };

export default async function ResetPasswordPage({searchParams}:{searchParams:Promise<{token?:string;error?:string}>}){
 const {token,error}=await searchParams;
 return <section className="rounded-xl border border-ui-border-subtle bg-ui-surface p-8 shadow-(--shadow) max-[400px]:p-6"><h1 className="mb-2 font-display text-[23px] font-semibold">Choose a new password</h1><p className="mb-6.5 text-sm leading-[1.55] text-muted">Enter a new password for your Lenni account.</p>{token&&!error?<ResetPasswordForm token={token}/>:<p className="rounded-lg bg-negative-subtle px-3 py-2 text-sm text-negative">This reset link is invalid or has expired. <Link className="font-semibold underline" href="/forgot-password">Request a new link</Link>.</p>}</section>;
}
