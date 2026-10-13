import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createServer } from "node:http";
import assert from "node:assert/strict";
import { test } from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const execFileAsync = promisify(execFile);

test("posts the deploy-finished message to the configured webhook", { timeout: 10_000 }, async () => {
  let requestBody;
  const server = createServer((request, response) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => {
      requestBody = { method: request.method, contentType: request.headers["content-type"], body };
      response.writeHead(200);
      response.end("ok");
    });
  });

  await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  const { port } = server.address();

  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, ["scripts/notify.mjs"], {
      cwd: root,
      env: {
        ...process.env,
        ALL_PROXY: "",
        HTTP_PROXY: "",
        HTTPS_PROXY: "",
        all_proxy: "",
        http_proxy: "",
        https_proxy: "",
        PLANNR_SLACK_WEBHOOK_URL: `http://127.0.0.1:${port}/webhook`,
      },
    });

    assert.equal(stdout, "");
    assert.equal(stderr, "");
    assert.deepEqual(requestBody, {
      method: "POST",
      contentType: "application/json",
      body: JSON.stringify({ text: "Deploy finished" }),
    });
  } finally {
    server.closeAllConnections();
    await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
  }
});
