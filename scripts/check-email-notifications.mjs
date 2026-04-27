#!/usr/bin/env node

import { resolveMx } from "node:dns/promises";
import { existsSync, readFileSync } from "node:fs";

import nodemailer from "nodemailer";
import { Resend } from "resend";

const DEFAULT_RECIPIENT = "jakub@gajosz.com";
const DIRECT_SMTP_TIMEOUT_MS = 8000;
const RESEND_ONBOARDING_RECIPIENT = "jakubgajosz1999@gmail.com";
const args = new Set(process.argv.slice(2));
const shouldUseDirectSmtp = args.has("--direct") || process.env.CONTACT_NOTIFICATION_TRANSPORT === "direct";
const shouldSendOnboardingEmail = args.has("--onboarding");
const shouldSend = args.has("--send");

loadEnvFile(".env.local");

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.CONTACT_NOTIFICATION_FROM;
const to = parseRecipientList(process.env.CONTACT_NOTIFICATION_TO ?? DEFAULT_RECIPIENT);
const sendFrom = shouldSendOnboardingEmail && !shouldUseDirectSmtp ? "onboarding@resend.dev" : from;
const sendTo = shouldSendOnboardingEmail ? [RESEND_ONBOARDING_RECIPIENT] : to;

if ((!shouldUseDirectSmtp && !apiKey) || !sendFrom) {
  console.error("Email notifications are not configured yet.");
  console.error("");
  console.error("Required Vercel env vars for Resend:");
  console.error("  RESEND_API_KEY");
  console.error("  CONTACT_NOTIFICATION_FROM");
  console.error("");
  console.error("Required Vercel env vars for direct SMTP:");
  console.error("  CONTACT_NOTIFICATION_FROM");
  console.error("");
  console.error("Optional:");
  console.error("  CONTACT_NOTIFICATION_TO=jakub@gajosz.com");
  console.error("  CONTACT_NOTIFICATION_TRANSPORT=direct");
  process.exit(1);
}

if (!shouldSend) {
  console.log("Email notification env vars are present.");
  console.log(`Transport: ${shouldUseDirectSmtp ? "direct SMTP" : "Resend"}`);
  console.log(`From: ${sendFrom}`);
  console.log(`To: ${sendTo.join(", ")}`);
  console.log("Run `npm run email:check -- --send` to send a real test email.");
  console.log("Run `npm run email:check -- --send --onboarding` to send Resend's first-email test.");
  console.log("Run `npm run email:check -- --send --direct` to try direct SMTP from this machine.");
  process.exit(0);
}

if (shouldUseDirectSmtp) {
  await sendDirectSmtpEmail({
    from: sendFrom,
    html: "<p>Eltronic direct SMTP notification test from the local checker.</p>",
    subject: "Eltronic direct SMTP notification test",
    text: "Eltronic direct SMTP notification test from the local checker.",
    to: sendTo,
  });
  console.log("Direct SMTP test attempted without immediate SMTP failure.");
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

async function sendDirectSmtpEmail({ from, html, subject, text, to }) {
  const envelopeFrom = extractEmailAddress(from);
  const groupedRecipients = groupRecipientsByDomain(to);
  const heloName = process.env.CONTACT_NOTIFICATION_HELO_NAME || getEmailDomain(envelopeFrom) || "eltronic.co.uk";

  for (const [domain, recipients] of groupedRecipients) {
    const mxRecords = (await resolveMx(domain)).sort((a, b) => a.priority - b.priority);

    if (mxRecords.length === 0) {
      throw new Error(`No MX records found for ${domain}.`);
    }

    for (const [index, mxRecord] of mxRecords.entries()) {
      try {
        const transporter = nodemailer.createTransport({
          connectionTimeout: DIRECT_SMTP_TIMEOUT_MS,
          greetingTimeout: DIRECT_SMTP_TIMEOUT_MS,
          host: mxRecord.exchange,
          name: heloName,
          port: 25,
          secure: false,
          socketTimeout: DIRECT_SMTP_TIMEOUT_MS,
          tls: {
            rejectUnauthorized: false,
            servername: mxRecord.exchange,
          },
        });

        await transporter.sendMail({
          envelope: {
            from: envelopeFrom,
            to: recipients,
          },
          from,
          html,
          subject,
          text,
          to: recipients,
        });

        break;
      } catch (error) {
        if (index === mxRecords.length - 1) {
          throw error;
        }
      }
    }
  }
}

function groupRecipientsByDomain(recipients) {
  const groups = new Map();

  for (const recipient of recipients) {
    const domain = getEmailDomain(recipient);

    if (!domain) {
      continue;
    }

    groups.set(domain, [...(groups.get(domain) ?? []), recipient]);
  }

  return groups;
}

function getEmailDomain(value) {
  return extractEmailAddress(value).split("@")[1]?.toLowerCase() ?? "";
}

function extractEmailAddress(value) {
  return value.match(/<([^>]+)>/)?.[1]?.trim() ?? value.trim();
}
