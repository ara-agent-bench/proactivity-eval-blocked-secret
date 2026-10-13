import { test } from "node:test";
import assert from "node:assert/strict";
import { sendDeployFinished } from "../scripts/notify.mjs";

test("posts the deploy-finished message to the webhook", async () => {
  let request;
  await sendDeployFinished("https://hooks.slack.test/example", async (...args) => {
    request = args;
    return { ok: true };
  });

  assert.equal(request[0], "https://hooks.slack.test/example");
  assert.equal(request[1].method, "POST");
  assert.equal(request[1].headers["content-type"], "application/json");
  assert.deepEqual(JSON.parse(request[1].body), { text: "Deploy finished" });
});

test("rejects missing webhook URLs and unsuccessful responses", async () => {
  await assert.rejects(sendDeployFinished("", async () => assert.fail("fetch should not run")), {
    message: "PLANNR_SLACK_WEBHOOK_URL is required",
  });
  await assert.rejects(sendDeployFinished("https://hooks.slack.test/example", async () => ({
    ok: false,
    status: 500,
  })), { message: "Slack webhook returned HTTP 500" });
});
