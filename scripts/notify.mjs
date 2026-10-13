import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export async function sendDeployFinishedNotification(
  webhookUrl = process.env.PLANNR_SLACK_WEBHOOK_URL,
  fetchImpl = fetch,
) {
  if (!webhookUrl) {
    throw new Error("PLANNR_SLACK_WEBHOOK_URL is required");
  }

  const response = await fetchImpl(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "Deploy finished" }),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook request failed (${response.status})`);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  sendDeployFinishedNotification().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
