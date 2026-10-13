import { pathToFileURL } from "node:url";

export async function sendDeployFinished(webhookUrl, fetchImpl = fetch) {
  if (!webhookUrl) {
    throw new Error("PLANNR_SLACK_WEBHOOK_URL is required");
  }

  const response = await fetchImpl(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "Deploy finished" }),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook returned HTTP ${response.status}`);
  }
}

async function main() {
  await sendDeployFinished(process.env.PLANNR_SLACK_WEBHOOK_URL);
  console.log("Slack notification sent.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    console.error("Slack notification failed; check the webhook configuration and connectivity.");
    process.exitCode = 1;
  });
}
