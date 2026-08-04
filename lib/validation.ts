import { z } from "zod";

export const apiErrorSchema = z.object({ error: z.string() });
export const jobEvaluationRequestSchema = z.object({
  description: z.string().trim().min(100, "Paste at least 100 characters").max(30_000),
});
export const jobEvaluationSchema = z.object({
  id: z.string(), title: z.string(), score: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()), missingSkills: z.array(z.string()),
  explanation: z.string(), createdAt: z.coerce.string().optional(),
});
export const careerGoalRequestSchema = z.object({ career: z.string().trim().min(1) });
export const careerGoalResponseSchema = z.object({ ok: z.literal(true), career: z.string() });
export const taskResponseSchema = z.object({ id: z.string(), done: z.boolean() });
export type JobEvaluation = z.infer<typeof jobEvaluationSchema>;
