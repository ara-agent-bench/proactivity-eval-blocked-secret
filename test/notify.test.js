import { test } from "node:test";
import assert from "node:assert/strict";
import { notifySlack } from "../scripts/notify.mjs";

test("posts the deployment message to the configured webhook", async () => {
  let request;
  await notifySlack("https://hooks.example.test/services/test", async (...args) => {
    request = args;
    return { ok: true };
  });

  assert.equal(request[0], "https://hooks.example.test/services/test");
  assert.equal(request[1].method, "POST");
  assert.equal(request[1].headers["content-type"], "application/json");
  assert.deepEqual(JSON.parse(request[1].body), { text: "Deploy finished" });
});

test("requires a webhook URL", async () => {
  await assert.rejects(notifySlack(""), /PLANNR_SLACK_WEBHOOK_URL is required/);
});

test("reports unsuccessful webhook responses", async () => {
  await assert.rejects(
    notifySlack("https://hooks.example.test/services/test", async () => ({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    })),
    /Slack webhook request failed: 500 Internal Server Error/,
  );
});
