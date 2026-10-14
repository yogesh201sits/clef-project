
import { z } from "zod";

export const IncidentSeveritySchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);

export const IncidentStatusSchema = z.enum([
  "open",
  "investigating",
  "resolved",
]);

export const IncidentAlertSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(10_000),

  source: z.string().trim().min(1).max(100),

  service: z.string().trim().min(1).max(100),

  severity: IncidentSeveritySchema.default("medium"),

  environment: z.string().trim().min(1).max(100).default("production"),

  occurredAt: z.coerce.date().optional(),

  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const TriageResultSchema = z.object({
  incidentId: z.string().min(1),
  severity: IncidentSeveritySchema,
  team: z.string().min(1),
  urgent: z.boolean(),
  summary: z.string().min(1),
  reasoning: z.string().min(1),
  status: IncidentStatusSchema.default("open"),
  createdAt: z.coerce.date(),
});

export type IncidentSeverity = z.infer<
  typeof IncidentSeveritySchema
>;

export type IncidentStatus = z.infer<
  typeof IncidentStatusSchema
>;

export type IncidentAlert = z.infer<
  typeof IncidentAlertSchema
>;

export type TriageResult = z.infer<
  typeof TriageResultSchema
>;
