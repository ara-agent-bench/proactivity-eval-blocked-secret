import { test } from "node:test";
import assert from "node:assert/strict";
import { sendNotification } from "../scripts/notify.mjs";

test("posts the deployment message to the Slack webhook", async () => {
  let request;
  await sendNotification("https://example.test/webhook", async (...args) => {
    request = args;
    return { ok: true };
  });

  assert.equal(request[0], "https://example.test/webhook");
  assert.deepEqual(request[1], {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "Deploy finished" }),
  });
});

test("requires a configured webhook", async () => {
  await assert.rejects(sendNotification("", async () => ({ ok: true })), {
    message: "PLANNR_SLACK_WEBHOOK_URL is required.",
  });
});

test("reports unsuccessful webhook responses", async () => {
  await assert.rejects(
    sendNotification("https://example.test/webhook", async () => ({ ok: false, status: 500 })),
    { message: "Slack webhook returned HTTP 500." },
  );
});
