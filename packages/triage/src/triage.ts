
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
] as const;

const URGENCY_THRESHOLD = 0.5;

interface ClefAssessment {
  urgent: boolean;
  team: string;
  severity: IncidentSeverity;
}

interface ClefAnswer {
  type: string;
  noul?: unknown;
  choice?: unknown;
  confidence?: unknown;
  probabilities?: unknown;
}

interface ClefResponse {
  model: string;
  answers: Record<string, ClefAnswer>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

function extractAssessment(value: unknown): ClefAssessment {
  if (!value || typeof value !== "object") {
    throw new Error("Clef returned an invalid response");
  }

  const response = value as Partial<ClefResponse>;
  const answers = response.answers;

  if (!answers || typeof answers !== "object") {
    throw new Error("Clef response is missing answers");
  }

  const urgencyScore = answers.urgent?.noul;

  if (
    typeof urgencyScore !== "number" ||
    !Number.isFinite(urgencyScore) ||
    urgencyScore < 0 ||
    urgencyScore > 1
  ) {
    throw new Error("Clef returned an invalid urgency score");
  }

  const team = answers.team?.choice;

  if (
    typeof team !== "string" ||
    !Object.hasOwn(TEAM_CRITERIA, team)
  ) {
    throw new Error("Clef returned an unsupported incident team");
  }

  const severity = answers.severity?.choice;

  if (
    typeof severity !== "string" ||
    !(SEVERITY_LEVELS as readonly string[]).includes(severity)
  ) {
    throw new Error("Clef returned an unsupported severity");
  }

  return {
    urgent: urgencyScore >= URGENCY_THRESHOLD,
    team,
    severity: severity as IncidentSeverity,
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
          "Is immediate investigation required to reduce customer impact?",
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
          critical:
            "Severe outage, widespread critical failure, or major business impact.",
        },
      },
    },
  });

  const assessment = extractAssessment(rawAssessment);

  const result = {
    incidentId: randomUUID(),
    severity: assessment.severity,
    team: assessment.team,
    urgent: assessment.urgent,
    summary: `${alert.service}: ${alert.title}`,
    reasoning:
      "AI-generated assessment based on the incident alert and its metadata.",
    status: "open" as const,
    createdAt: new Date(),
  };

  return TriageResultSchema.parse(result);
}
