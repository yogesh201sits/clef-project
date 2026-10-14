
import { describe, expect, test } from "bun:test";
import { IncidentAlertSchema } from "./incident";

describe("@nova/shared", () => {
  test("accepts a valid incident alert and applies defaults", () => {
    const result = IncidentAlertSchema.parse({
      title: "Checkout failures",
      description: "Checkout requests are failing.",
      source: "payment-monitor",
      service: "checkout",
    });

    expect(result.severity).toBe("medium");
    expect(result.environment).toBe("production");
    expect(result.metadata).toEqual({});
  });

  test("rejects an alert without a title", () => {
    const result = IncidentAlertSchema.safeParse({
      title: "",
      description: "Checkout requests are failing.",
      source: "payment-monitor",
      service: "checkout",
    });

    expect(result.success).toBe(false);
  });

  test("rejects a title that exceeds the limit", () => {
    const result = IncidentAlertSchema.safeParse({
      title: "a".repeat(201),
      description: "Checkout requests are failing.",
      source: "payment-monitor",
      service: "checkout",
    });

    expect(result.success).toBe(false);
  });
});
