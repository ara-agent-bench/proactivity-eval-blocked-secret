import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";

function runNotifier(webhookUrl) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["scripts/notify.mjs"], {
      env: { ...process.env, PLANNR_SLACK_WEBHOOK_URL: webhookUrl },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stderr }));
  });
}

test("posts the deploy-finished message to the configured webhook", async () => {
  let requestBody;
  const server = createServer((request, response) => {
    let body = "";
    request.setEncoding("utf8").on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      requestBody = { method: request.method, body: JSON.parse(body) };
      response.writeHead(200).end("ok");
    });
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    const result = await runNotifier(`http://127.0.0.1:${address.port}/webhook`);
    assert.equal(result.code, 0, result.stderr);
    assert.deepEqual(requestBody, {
      method: "POST",
      body: { text: "Deploy finished" },
    });
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
