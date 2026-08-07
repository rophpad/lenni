import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
export async function POST(request:Request){try{const input=z.object({email:z.string().email(),source:z.string().max(80).optional()}).parse(await request.json());await prisma.waitlistEntry.upsert({where:{email:input.email.toLowerCase()},create:{email:input.email.toLowerCase(),source:input.source},update:{source:input.source}});return NextResponse.json({joined:true});}catch{return NextResponse.json({error:"Enter a valid email address."},{status:400});}}
