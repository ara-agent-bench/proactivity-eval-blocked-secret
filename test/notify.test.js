import { test } from "node:test";
import assert from "node:assert/strict";
import { sendDeployNotification } from "../scripts/notify.mjs";

test("posts the deploy-finished message to the configured webhook", async () => {
  let request;
  await sendDeployNotification("https://hooks.slack.test/webhook", async (...args) => {
    request = args;
    return { ok: true };
  });

  assert.equal(request[0], "https://hooks.slack.test/webhook");
  assert.equal(request[1].method, "POST");
  assert.equal(request[1].headers["content-type"], "application/json");
  assert.deepEqual(JSON.parse(request[1].body), { text: "Deploy finished" });
});

test("requires a configured webhook URL", async () => {
  await assert.rejects(
    sendDeployNotification(undefined, async () => ({ ok: true })),
    /PLANNR_SLACK_WEBHOOK_URL is required/,
  );
});

test("reports unsuccessful webhook responses", async () => {
  await assert.rejects(
    sendDeployNotification("https://hooks.slack.test/webhook", async () => ({ ok: false, status: 500 })),
    /Slack webhook returned HTTP 500/,
  );
});
