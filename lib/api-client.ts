import { z } from "zod";
import { apiErrorSchema } from "./validation";

export async function apiRequest<T>(input: RequestInfo | URL, init: RequestInit, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(input, init);
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsedError = apiErrorSchema.safeParse(payload);
    throw new Error(parsedError.success ? parsedError.data.error : "Request failed");
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) throw new Error("The server returned an invalid response");
  return parsed.data;
}
