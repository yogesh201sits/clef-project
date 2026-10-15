
import { describe, expect, test } from "bun:test";
import { app } from "./app";

describe("@nova/api", () => {
  test("GET /health returns service status", async () => {
    const response = await app.request("/health");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("nova-api");
  });

  test("POST /incidents/triage rejects invalid alerts", async () => {
    const response = await app.request("/incidents/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "",
        description: "Checkout is failing",
        source: "monitor",
        service: "checkout",
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid incident alert");
  });

  test("unknown routes return 404", async () => {
    const response = await app.request("/unknown");

    expect(response.status).toBe(404);
  });
});
