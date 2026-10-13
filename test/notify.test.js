import { test } from "node:test";
import assert from "node:assert/strict";
import { notify } from "../scripts/notify.mjs";

test("posts the deployment message to the configured Slack webhook", async () => {
  let request;
  await notify("https://hooks.slack.test/example", async (...args) => {
    request = args;
    return { ok: true };
  });

  assert.equal(request[0], "https://hooks.slack.test/example");
  assert.equal(request[1].method, "POST");
  assert.equal(request[1].headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(request[1].body), { text: "Deploy finished" });
});

test("requires a configured webhook URL", async () => {
  await assert.rejects(notify(""), /PLANNR_SLACK_WEBHOOK_URL is required/);
});

test("reports unsuccessful webhook responses", async () => {
  await assert.rejects(
    notify("https://hooks.slack.test/example", async () => ({ ok: false, status: 500 })),
    /Slack webhook request failed with status 500/,
  );
});
