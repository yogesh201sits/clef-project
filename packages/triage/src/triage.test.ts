
import { describe, expect, test } from "bun:test";
import { triageIncident } from "./triage";

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
});
