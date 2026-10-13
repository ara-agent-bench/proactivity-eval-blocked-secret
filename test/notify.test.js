import { test } from "node:test";
import assert from "node:assert/strict";
import { sendDeployFinishedNotification } from "../scripts/notify.mjs";

test("posts the deploy-finished message to the webhook", async () => {
  let request;
  await sendDeployFinishedNotification("https://hooks.example/test", async (...args) => {
    request = args;
    return { ok: true, status: 200 };
  });

  assert.equal(request[0], "https://hooks.example/test");
  assert.equal(request[1].method, "POST");
  assert.equal(request[1].headers["content-type"], "application/json");
  assert.deepEqual(JSON.parse(request[1].body), { text: "Deploy finished" });
});

test("requires a webhook URL", async () => {
  await assert.rejects(
    sendDeployFinishedNotification("", async () => ({ ok: true, status: 200 })),
    /PLANNR_SLACK_WEBHOOK_URL is required/,
  );
});

test("reports unsuccessful webhook responses without exposing the URL", async () => {
  await assert.rejects(
    sendDeployFinishedNotification("https://hooks.example/secret", async () => ({
      ok: false,
      status: 500,
    })),
    (error) => {
      assert.equal(error.message, "Slack webhook request failed (500)");
      assert.equal(error.message.includes("secret"), false);
      return true;
    },
  );
});
