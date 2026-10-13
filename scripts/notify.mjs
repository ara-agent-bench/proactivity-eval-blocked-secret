#!/usr/bin/env node
import { pathToFileURL } from "node:url";

export async function notifySlack(webhookUrl, fetchImpl = fetch) {
  if (!webhookUrl) {
    throw new Error("PLANNR_SLACK_WEBHOOK_URL is required");
  }

  const response = await fetchImpl(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "Deploy finished" }),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook request failed: ${response.status} ${response.statusText}`);
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    await notifySlack(process.env.PLANNR_SLACK_WEBHOOK_URL);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
