
import { afterEach, describe, expect, test } from "bun:test";
import { triageIncident } from "./triage";

const originalFetch = globalThis.fetch;
const originalAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const originalApiToken = process.env.CLOUDFLARE_API_TOKEN;

function mockClefUrgency(urgent: string) {
  process.env.CLOUDFLARE_ACCOUNT_ID = "test-account";
  process.env.CLOUDFLARE_API_TOKEN = "test-token";
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        success: true,
        result: {
          urgent,
          team: "backend",
          severity: "high",
        },
        errors: [],
        messages: [],
      }),
      { headers: { "Content-Type": "application/json" } },
    );
}

afterEach(() => {
  globalThis.fetch = originalFetch;

  if (originalAccountId === undefined) {
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
  } else {
    process.env.CLOUDFLARE_ACCOUNT_ID = originalAccountId;
  }

  if (originalApiToken === undefined) {
    delete process.env.CLOUDFLARE_API_TOKEN;
  } else {
    process.env.CLOUDFLARE_API_TOKEN = originalApiToken;
  }
});

describe("@nova/triage", () => {
  test("rejects an invalid incident before calling Clef", async () => {
    await expect(
      triageIncident({
        title: "",
        description: "Checkout is failing",
        source: "monitor",
        service: "checkout",
        severity: "high",
        environment: "production",
        metadata: {},
      }),
    ).rejects.toThrow();
  });

  test("accepts a yes/no text answer for urgency", async () => {
    mockClefUrgency("Yes, immediate investigation is required.");

    const result = await triageIncident({
      title: "Checkout errors",
      description: "Checkout is failing for multiple customers.",
      source: "monitor",
      service: "checkout",
    });
    expect(result.urgent).toBe(true);
    expect(result.urgent).toBe(true);
  });

  test("converts a negative urgency answer to false", async () => {
    mockClefUrgency("No, normal handling is sufficient.");

    const result = await triageIncident({
      title: "Minor checkout delay",
      description: "Checkout is responding slightly slower than usual.",
      source: "monitor",
      service: "checkout",
    });
    expect(result.urgent).toBe(false);
    expect(result.urgent).toBe(false);
  });
});
