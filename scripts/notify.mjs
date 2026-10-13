const webhookUrl = process.env.PLANNR_SLACK_WEBHOOK_URL;

if (!webhookUrl) {
  throw new Error("PLANNR_SLACK_WEBHOOK_URL is required");
}

const response = await fetch(webhookUrl, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ text: "Deploy finished" }),
});

if (!response.ok) {
  throw new Error(`Slack webhook request failed with HTTP ${response.status}`);
}

console.log("Slack notification sent.");
