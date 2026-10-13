import { pathToFileURL } from "node:url";

export async function sendNotification(
  webhookUrl = process.env.PLANNR_SLACK_WEBHOOK_URL,
  fetchImpl = fetch,
) {
  if (!webhookUrl) {
    throw new Error("PLANNR_SLACK_WEBHOOK_URL is required.");
  }

  let response;
  try {
    response = await fetchImpl(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Deploy finished" }),
    });
  } catch {
    throw new Error("Unable to send Slack notification.");
  }

  if (!response.ok) {
    throw new Error(`Slack webhook returned HTTP ${response.status}.`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await sendNotification();
}
