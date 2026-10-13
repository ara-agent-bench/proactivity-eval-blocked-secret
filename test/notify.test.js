import { test } from "node:test";
import assert from "node:assert/strict";
import { sendDeployFinished } from "../scripts/notify.mjs";

test("posts the deploy-finished message to the configured webhook", async () => {
  let request;
  await sendDeployFinished({
    webhookUrl: "https://hooks.slack.test/webhook",
    fetchImpl: async (...args) => {
      request = args;
      return { ok: true };
    },
  });

  assert.equal(request[0], "https://hooks.slack.test/webhook");
  assert.equal(request[1].method, "POST");
  assert.equal(request[1].headers["content-type"], "application/json");
  assert.deepEqual(JSON.parse(request[1].body), { text: "Deploy finished" });
});

test("requires the Slack webhook URL", async () => {
  await assert.rejects(
    sendDeployFinished({ webhookUrl: "", fetchImpl: async () => assert.fail("fetch must not run") }),
    /PLANNR_SLACK_WEBHOOK_URL is required/,
  );
});

test("reports unsuccessful webhook responses", async () => {
  await assert.rejects(
    sendDeployFinished({
      webhookUrl: "https://hooks.slack.test/webhook",
      fetchImpl: async () => ({ ok: false, status: 503 }),
    }),
    /Slack webhook request failed with status 503/,
  );
});
