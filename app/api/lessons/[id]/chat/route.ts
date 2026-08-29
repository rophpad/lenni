import { NextResponse } from "next/server";
import { getSession } from "../../../../../lib/session";
import { prisma } from "../../../../../lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: lessonId } = await params;
    const { message, history } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Verify user has access to this lesson
    const progress = await prisma.lessonProgress.findFirst({
      where: {
        userId: session.user.id,
        lessonId,
        status: { in: ["available", "in_progress", "completed"] },
      },
    });

    if (!progress) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Get lesson content for context
    const lessonData = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    const lesson = lessonData as unknown as {
      id: string;
      title: string;
      body: any;
      objectives: string[];
      estimatedMinutes: number;
      moduleId: string;
    } | null;

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Get module and milestone separately
    const moduleData = await prisma.module.findUnique({
      where: { id: lesson.moduleId },
    });

    const module = moduleData as unknown as {
      id: string;
      title: string;
      milestoneId: string | null;
    } | null;

    let milestone: { id: string; title: string } | null = null;
    if (module?.milestoneId) {
      const milestoneData = await prisma.milestone.findUnique({
        where: { id: module.milestoneId },
      });
      milestone = milestoneData as unknown as { id: string; title: string } | null;
    }

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Build context for AI
    const lessonBody = Array.isArray(lesson.body) ? lesson.body : [];
    const textContent = lessonBody
      .filter((block: any) => block.type === "text" || block.type === "heading")
      .map((block: any) => block.content || "")
      .join("\n\n");

    const objectives = Array.isArray(lesson.objectives) ? lesson.objectives : [];
    const objectivesText = objectives.join("\n");

    const systemPrompt = `You are Lenni, an AI learning assistant helping a student with their lesson. 

Lesson: "${lesson.title}"
Module: "${module?.title || "N/A"}"
Milestone: "${milestone?.title || "N/A"}"

Lesson Objectives:
${objectivesText}

Lesson Content:
${textContent.slice(0, 3000)}

Guidelines:
- Be helpful, encouraging, and concise
- Explain concepts clearly with examples
- Ask follow-up questions to check understanding
- Don't give away answers to exercises directly - guide instead
- Keep responses focused on the lesson topic`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).slice(-6).map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Call AI API (using OpenRouter or similar)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lenni.app",
        "X-Title": "Lenni",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      console.error("AI API error:", error);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}