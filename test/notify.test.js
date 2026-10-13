import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { test } from "node:test";

const scriptPath = new URL("../scripts/notify.mjs", import.meta.url);

function runNotify(webhookUrl) {
  return new Promise((resolve) => {
    const env = { ...process.env };
    if (webhookUrl) env.PLANNR_SLACK_WEBHOOK_URL = webhookUrl;
    else delete env.PLANNR_SLACK_WEBHOOK_URL;

    const child = spawn(process.execPath, [scriptPath.pathname], { env });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => (stdout += chunk));
    child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("posts the deploy message to the configured webhook", async (t) => {
  let requestBody = "";
  const server = createServer((request, response) => {
    request.setEncoding("utf8");
    request.on("data", (chunk) => (requestBody += chunk));
    request.on("end", () => {
      response.writeHead(200, { "content-type": "text/plain" });
      response.end("ok");
    });
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());

  const { port } = server.address();
  const result = await runNotify(`http://127.0.0.1:${port}/webhook`);

  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(requestBody), { text: "Deploy finished" });
  assert.match(result.stdout, /Slack notification sent/);
});

test("fails clearly when the webhook variable is missing", async () => {
  const result = await runNotify(undefined);

  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /PLANNR_SLACK_WEBHOOK_URL is required/);
});

test("fails when Slack rejects the webhook request", async (t) => {
  const server = createServer((_request, response) => {
    response.writeHead(500);
    response.end();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());

  const { port } = server.address();
  const result = await runNotify(`http://127.0.0.1:${port}/webhook`);

  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /HTTP 500/);
});
