import { AiOperation } from "@prisma/client";
import { prisma } from "./prisma";
import { PROMPT_VERSION, SYSTEM_PROMPT } from "./prompts";

const baseUrl = process.env.IMOLE_BASE_URL ?? "https://api.imole.app/v1";
const model = process.env.IMOLE_MODEL ?? "gpt-5.6-luna";

function extractJson(text: string) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const object = cleaned.match(/\{[\s\S]*\}/);
    if (!object) throw new Error("Imole response did not contain JSON");
    return JSON.parse(object[0]);
  }
}

function responseText(payload: unknown) {
  const data = payload as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ type?: unknown; text?: unknown }> }>;
  };
  if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  if (!Array.isArray(data.output)) return undefined;
  const text = data.output
    .flatMap(item => Array.isArray(item.content) ? item.content : [])
    .filter(item => item.type === "output_text" && typeof item.text === "string")
    .map(item => item.text)
    .join("");
  return text.trim() || undefined;
}

export async function generateJson<T>(userId: string, operation: AiOperation, prompt: string, input: unknown): Promise<T> {
  if (!process.env.IMOLE_API_KEY) throw new Error("IMOLE_API_KEY is not configured");
  const run = await prisma.aiRun.create({ data: { userId, operation, status: "running", provider: "imole", model, promptVersion: PROMPT_VERSION, inputData: input as object, startedAt: new Date() } });
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/responses`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.IMOLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, instructions: SYSTEM_PROMPT, input: `${prompt}\n\nINPUT JSON:\n${JSON.stringify(input)}`, stream: false, reasoning: { effort: "low" } }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message ?? `Imole request failed (${response.status})`);
    const text = responseText(payload);
    if (!text) throw new Error("Imole returned no text output");
    const output = extractJson(text) as T;
    await prisma.aiRun.update({ where: { id: run.id }, data: { status: "succeeded", outputData: output as object, inputTokens: payload.usage?.input_tokens, outputTokens: payload.usage?.output_tokens, completedAt: new Date() } });
    return output;
  } catch (error) {
    await prisma.aiRun.update({ where: { id: run.id }, data: { status: "failed", errorMessage: error instanceof Error ? error.message : "Unknown AI error", completedAt: new Date() } });
    throw error;
  }
}
