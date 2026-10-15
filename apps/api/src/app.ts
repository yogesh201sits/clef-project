import { Hono } from "hono";
import { cors } from "hono/cors";
import { IncidentAlertSchema } from "@nova/shared";
import { triageIncident } from "@nova/triage";

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: process.env.PLAYGROUND_ORIGIN ?? "http://localhost:3001",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "nova-api",
  });
});

app.post("/incidents/triage", async (c) => {
  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    return c.json(
      { error: "Request body must contain valid JSON" },
      400,
    );
  }

  const parsed = IncidentAlertSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        error: "Invalid incident alert",
        details: parsed.error.flatten(),
      },
      400,
    );
  }

  try {
    const result = await triageIncident(parsed.data);
    return c.json({ data: result }, 200);
  } catch (error) {
    // Keep internal details out of production responses.
    console.error("Incident triage failed:", error);

    return c.json(
      {
        error: "Incident triage failed",
        message:
          process.env.NODE_ENV === "development" &&
          error instanceof Error
            ? error.message
            : "Unable to analyze the incident. Please try again.",
      },
      502,
    );
  }
});

app.notFound((c) => {
  return c.json({ error: "Route not found" }, 404);
});
