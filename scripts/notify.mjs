const webhookUrl = process.env.PLANNR_SLACK_WEBHOOK_URL;

if (!webhookUrl) {
  console.error("PLANNR_SLACK_WEBHOOK_URL is required");
  process.exitCode = 1;
} else {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Deploy finished" }),
    });

    if (!response.ok) {
      console.error(`Slack webhook request failed with HTTP ${response.status}`);
      process.exitCode = 1;
    }
  } catch {
    console.error("Slack webhook request failed");
    process.exitCode = 1;
  }
}
