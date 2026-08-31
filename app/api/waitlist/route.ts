import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";

const waitlistSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  name: z.string().trim().min(1, "Name is required.").max(80).optional().or(z.literal("")),
  role: z.enum(["learner", "creator"]).optional(),
  source: z.string().max(120).optional(),
  subjects: z.array(z.string().max(40)).max(12).optional(),
  interests: z.array(z.string().max(40)).max(12).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = waitlistSchema.parse(body);

    const email = input.email.toLowerCase().trim();
    const name = input.name?.trim() || null;
    // role maps to enum, fallback to source if old clients send role as source
    const role = input.role ?? null;
    const baseSource = input.source ?? (role || "waitlist-page");
    const subjects = input.subjects ?? input.interests ?? [];
    // Encode subjects into source for now (keeps existing schema without migration)
    // e.g. "waitlist-page:Mathematics,AI"
    const source = subjects.length ? `${baseSource}:${subjects.join(",")}` : baseSource;

    const entry = await prisma.waitlistEntry.upsert({
      where: { email },
      create: { email, name, role: role as any, source },
      update: { name, role: role as any, source },
    });

    return NextResponse.json({ joined: true, id: entry.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }
    console.error("[waitlist] error", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await prisma.waitlistEntry.count();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
