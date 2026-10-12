
import { RunnableLambda } from "@langchain/core/runnables";

export type ClefState =
  | string
  | Record<string, unknown>
  | unknown[];

export interface NoulQuestion {
  type: "noul";
  instructions: string;
}

export interface ChoiceQuestion {
  type: "choice";
  instructions: string;
  criteria: Record<string, string>;
}

export interface ScoreQuestion {
  type: "score";
  instructions: string;
  criteria: string[];
}

export type ClefQuestion =
  | NoulQuestion
  | ChoiceQuestion
  | ScoreQuestion;

export type ClefQuestions = Record<string, ClefQuestion>;

export interface ClefInput {
  state: ClefState;
  questions: ClefQuestions;
}

interface CloudflareResponse<T> {
  success: boolean;
  result: T;
  errors: unknown[];
  messages: unknown[];
}

export function createClefRunnable() {
  return new RunnableLambda<ClefInput, unknown>({
    func: async (input: ClefInput) => {
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const apiToken = process.env.CLOUDFLARE_API_TOKEN;

      if (!accountId) {
        throw new Error("CLOUDFLARE_ACCOUNT_ID is missing");
      }

      if (!apiToken) {
        throw new Error("CLOUDFLARE_API_TOKEN is missing");
      }

      const url =
        `https://api.cloudflare.com/client/v4/` +
        `accounts/${accountId}/ai/run/@cf/cloudflare/clef`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: input.state,
          questions: input.questions,
        }),
      });

      let data: CloudflareResponse<unknown>;

      try {
        data = (await response.json()) as CloudflareResponse<unknown>;
      } catch {
        throw new Error(
          `Cloudflare AI returned invalid JSON (HTTP ${response.status})`,
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          `Cloudflare AI request failed: ${JSON.stringify(data)}`,
        );
      }

      return data.result;
    },
  });
}
