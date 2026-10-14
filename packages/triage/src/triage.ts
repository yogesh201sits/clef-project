
import { randomUUID } from "node:crypto";
import { createClefRunnable } from "@nova/clef";
import {
  IncidentAlertSchema,
  TriageResultSchema,
  type IncidentAlert,
  type IncidentSeverity,
  type TriageResult,
} from "@nova/shared";

const clef = createClefRunnable();

const TEAM_CRITERIA = {
  platform: "Infrastructure, deployment, networking, and availability",
  backend: "APIs, application logic, and server-side failures",
  payments: "Payments, checkout, billing, and transaction failures",
  database: "Database availability, query failures, and data integrity",
} as const;

const SEVERITY_LEVELS = [
  "low",
  "medium",
  "high",
  "critical",
];

interface ClefAssessment {
  urgent: boolean;
  team: string;
  severity: IncidentSeverity;
}

function extractAssessment(value: unknown): ClefAssessment {
  if (!value || typeof value !== "object") {
    throw new Error("Clef returned an invalid assessment");
  }

  const result = value as Record<string, unknown>;

  // Validate Clef's actual output shape before using it.
  if (typeof result.urgent !== "boolean") {
    throw new Error("Clef did not return a valid urgency assessment");
  }

  if (
    typeof result.team !== "string" ||
    !(result.team in TEAM_CRITERIA)
  ) {
    throw new Error("Clef returned an unsupported incident team");
  }

  if (
    typeof result.severity !== "string" ||
    !SEVERITY_LEVELS.includes(result.severity)
  ) {
    throw new Error("Clef returned an unsupported severity");
  }

  return {
    urgent: result.urgent,
    team: result.team,
    severity: result.severity as IncidentSeverity,
  };
}

export async function triageIncident(
  input: IncidentAlert,
): Promise<TriageResult> {
  const alert = IncidentAlertSchema.parse(input);

  const rawAssessment = await clef.invoke({
    state: {
      title: alert.title,
      description: alert.description,
      source: alert.source,
      service: alert.service,
      reportedSeverity: alert.severity,
      environment: alert.environment,
      metadata: alert.metadata,
    },
    questions: {
      urgent: {
        type: "noul",
        instructions:
          "Is immediate investigation required to reduce customer impact? Return a boolean.",
      },
      team: {
        type: "choice",
        instructions:
          "Choose the single most appropriate owning team. Return its exact key.",
        criteria: TEAM_CRITERIA,
      },
      severity: {
        type: "choice",
        instructions:
          "Choose the incident severity based on actual impact. Return the exact severity key.",
        criteria: {
          low: "Minimal impact; no significant service disruption.",
          medium: "Limited degradation affecting some users or functionality.",
          high: "Major degradation or widespread user impact.",
          critical: "Severe outage, widespread critical failure, or major business impact.",
        },
      },
    },
  });

  const assessment = extractAssessment(rawAssessment);

  const summary = `${alert.service}: ${alert.title}`;

  const result = {
    incidentId: randomUUID(),
    severity: assessment.severity,
    team: assessment.team,
    urgent: assessment.urgent,
    summary,
    reasoning:
      "AI-generated assessment based on the alert description and metadata.",
    status: "open" as const,
    createdAt: new Date(),
  };

  return TriageResultSchema.parse(result);
}
