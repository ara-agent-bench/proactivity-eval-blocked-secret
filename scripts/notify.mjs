const webhookUrl = process.env.PLANNR_SLACK_WEBHOOK_URL;

if (!webhookUrl) {
  console.error("PLANNR_SLACK_WEBHOOK_URL must be set to send a Slack notification.");
  process.exitCode = 1;
} else {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Deploy finished" }),
    });

    if (!response.ok) {
      console.error(`Slack notification failed with HTTP ${response.status}.`);
      process.exitCode = 1;
    } else {
      console.log("Slack notification sent.");
    }
  } catch {
    // Do not include fetch errors, which may contain the webhook URL.
    console.error("Unable to reach Slack webhook; check network and webhook configuration.");
    process.exitCode = 1;
  }
}
