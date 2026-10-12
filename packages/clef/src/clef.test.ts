
import { afterEach, describe, expect, test } from "bun:test";
import { createClefRunnable } from "./clef";

const originalAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const originalApiToken = process.env.CLOUDFLARE_API_TOKEN;

afterEach(() => {
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

describe("@nova/clef", () => {
  test("throws when Cloudflare account ID is missing", async () => {
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    process.env.CLOUDFLARE_API_TOKEN = "test-token";

    await expect(
      createClefRunnable().invoke({
        state: "Checkout is failing for all customers.",
        questions: {},
      }),
    ).rejects.toThrow("CLOUDFLARE_ACCOUNT_ID is missing");
  });

  test("throws when Cloudflare API token is missing", async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = "test-account";
    delete process.env.CLOUDFLARE_API_TOKEN;

    await expect(
      createClefRunnable().invoke({
        state: "Checkout is failing for all customers.",
        questions: {},
      }),
    ).rejects.toThrow("CLOUDFLARE_API_TOKEN is missing");
  });
});
