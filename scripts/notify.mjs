const webhookUrl = process.env.PLANNR_SLACK_WEBHOOK_URL;

if (!webhookUrl) {
  console.error("PLANNR_SLACK_WEBHOOK_URL is required to send the Slack notification.");
  process.exitCode = 1;
} else {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "Deploy finished" }),
  });

  if (!response.ok) {
    console.error(`Slack notification failed with HTTP ${response.status}.`);
    process.exitCode = 1;
  }
}
