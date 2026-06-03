import { z } from "zod";

export const riskEvaluationInputSchema = z.object({
  organization_id: z.string().min(1),
  cart_id: z.string().min(1),
  quote_version: z.string().min(1),
  session_metadata: z.record(z.unknown()).optional(),
  payment_method: z.string().optional(),
  gift_message: z.string().optional(),
});

export const riskEvaluationResultSchema = z.object({
  evaluation_id: z.string().uuid(),
  outcome: z.enum(["allow", "challenge", "review", "block"]),
  score: z.number(),
  hits: z.array(z.string()),
});

export type RiskEvaluationInput = z.infer<typeof riskEvaluationInputSchema>;
export type RiskEvaluationResult = z.infer<typeof riskEvaluationResultSchema>;

export const riskReviewOverrideSchema = z.object({
  reason: z.string().min(1),
  actor_id: z.string().min(1),
  ticket_id: z.string().optional(),
});
