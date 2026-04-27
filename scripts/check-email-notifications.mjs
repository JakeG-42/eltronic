#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { Resend } from "resend";

const DEFAULT_RECIPIENT = "jakub@gajosz.com";
const RESEND_ONBOARDING_RECIPIENT = "jakubgajosz1999@gmail.com";
const args = new Set(process.argv.slice(2));
const shouldSendOnboardingEmail = args.has("--onboarding");
const shouldSend = args.has("--send");

loadEnvFile(".env.local");

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.CONTACT_NOTIFICATION_FROM;
const to = parseRecipientList(process.env.CONTACT_NOTIFICATION_TO ?? DEFAULT_RECIPIENT);
const sendFrom = shouldSendOnboardingEmail ? "onboarding@resend.dev" : from;
const sendTo = shouldSendOnboardingEmail ? [RESEND_ONBOARDING_RECIPIENT] : to;

if (!apiKey || !sendFrom) {
  console.error("Email notifications are not configured yet.");
  console.error("");
  console.error("Required Vercel env vars:");
  console.error("  RESEND_API_KEY");
  console.error("  CONTACT_NOTIFICATION_FROM");
  console.error("");
  console.error("Optional:");
  console.error("  CONTACT_NOTIFICATION_TO=jakub@gajosz.com");
  process.exit(1);
}

if (!shouldSend) {
  console.log("Email notification env vars are present.");
  console.log(`From: ${sendFrom}`);
  console.log(`To: ${sendTo.join(", ")}`);
  console.log("Run `npm run email:check -- --send` to send a real test email.");
  console.log("Run `npm run email:check -- --send --onboarding` to send Resend's first-email test.");
  process.exit(0);
}

const resend = new Resend(apiKey);
const { data, error } = await resend.emails.send({
  from: sendFrom,
  html: shouldSendOnboardingEmail
    ? "<p>Congrats on sending your <strong>first email</strong>!</p>"
    : "<p>Eltronic email notification test from the local checker.</p>",
  subject: shouldSendOnboardingEmail ? "Hello World" : "Eltronic email notification test",
  text: shouldSendOnboardingEmail
    ? "Congrats on sending your first email!"
    : "Eltronic email notification test from the local checker.",
  to: sendTo,
}, {
  idempotencyKey: `email-check-${Date.now()}`,
});

if (error) {
  console.error("Test email failed.");
  console.error(`${error.name}: ${error.message}`);
  process.exit(1);
}

console.log(`Test email sent${data?.id ? `: ${data.id}` : "."}`);

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function parseRecipientList(value) {
  return value
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}
