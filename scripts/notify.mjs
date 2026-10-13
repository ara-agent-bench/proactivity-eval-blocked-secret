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
      throw new Error(`Slack webhook returned HTTP ${response.status}`);
    }
  } catch (error) {
    console.error(`Unable to send Slack notification: ${error.message}`);
    process.exitCode = 1;
  }
}
