import { Resend } from "resend";

import {
  getContactDigestSubmissions,
  getContactNotificationSettings,
  markContactDigestSent,
  type ContactNotificationMode,
  type ContactSubmission,
} from "@/lib/managed-data";

const DEFAULT_CONTACT_NOTIFICATION_TO = "jakub@gajosz.com";

type EmailNotificationResult = "sent" | "skipped" | "failed";

export async function notifyContactSubmission(submission: ContactSubmission): Promise<EmailNotificationResult> {
  const settings = await getContactNotificationSettings();

  if (settings.mode !== "immediate") {
    return "skipped";
  }

  try {
    const result = await sendResendEmail({
      html: buildSubmissionEmailHtml(submission),
      idempotencyKey: submission.id,
      replyTo: isReplyableEmail(submission.email) ? submission.email : undefined,
      subject: buildSubmissionSubject(submission),
      text: buildSubmissionEmailText(submission),
    });

    if (result === "skipped") {
      console.info("Contact email notification skipped because email environment variables are not configured.");
    }

    return result;
  } catch (error) {
    console.warn(
      "Contact email notification failed.",
      error instanceof Error ? error.message : "Unknown notification error.",
    );
    return "failed";
  }
}

export async function sendContactSubmissionDigest(): Promise<EmailNotificationResult> {
  const settings = await getContactNotificationSettings();

  if (!isDigestMode(settings.mode)) {
    return "skipped";
  }

  if (!isDigestDue(settings.mode, settings.lastDigestSentAt)) {
    return "skipped";
  }

  const submissions = await getContactDigestSubmissions();

  if (submissions.length === 0) {
    await markContactDigestSent();
    return "skipped";
  }

  try {
    const result = await sendResendEmail({
      html: buildDigestEmailHtml(submissions, settings.mode),
      idempotencyKey: `${settings.mode}:${submissions[0]?.createdAt ?? new Date().toISOString()}`,
      subject: buildDigestSubject(submissions, settings.mode),
      text: buildDigestEmailText(submissions, settings.mode),
    });

    if (result === "sent") {
      await markContactDigestSent();
    }

    return result;
  } catch (error) {
    console.warn(
      "Contact digest email notification failed.",
      error instanceof Error ? error.message : "Unknown digest notification error.",
    );
    return "failed";
  }
}

export function getContactEmailDeliveryStatus() {
  return {
    configured: Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFICATION_FROM),
    from: process.env.CONTACT_NOTIFICATION_FROM ?? "",
    provider: "Resend",
  };
}

async function sendResendEmail({
  html,
  idempotencyKey,
  replyTo,
  subject,
  text,
}: {
  html: string;
  idempotencyKey: string;
  replyTo?: string;
  subject: string;
  text: string;
}): Promise<EmailNotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_NOTIFICATION_FROM;
  const settings = await getContactNotificationSettings();
  const to = settings.recipients.length > 0 ? settings.recipients : parseRecipientList(DEFAULT_CONTACT_NOTIFICATION_TO);

  if (!apiKey || !from || to.length === 0) {
    return "skipped";
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    html,
    replyTo,
    subject,
    text,
    to,
  }, {
    idempotencyKey,
  });

  if (error) {
    throw new Error(`Resend returned ${error.name}: ${error.message}`);
  }

  return "sent";
}

function buildSubmissionSubject(submission: ContactSubmission) {
  if (submission.type === "captcha_failed") {
    return `Eltronic blocked captcha attempt from ${submission.name}`;
  }

  if (submission.type === "honeypot_spam") {
    return `Eltronic honeypot spam blocked from ${submission.name}`;
  }

  return `New Eltronic enquiry from ${submission.name}`;
}

function buildSubmissionEmailText(submission: ContactSubmission) {
  return [
    `Eltronic website submission: ${formatSubmissionType(submission.type)}`,
    "",
    `Type: ${formatSubmissionType(submission.type)}`,
    `Status: ${submission.status}`,
    `Name: ${submission.name}`,
    `Company: ${submission.company ?? "Not provided"}`,
    `Email: ${submission.email}`,
    `Product: ${submission.productName ?? submission.productSlug ?? "General enquiry"}`,
    `Blocked reason: ${submission.rejectionReason ?? "Not applicable"}`,
    `Submitted: ${formatDate(submission.createdAt)}`,
    "",
    "Message:",
    submission.message,
    "",
    "Open Studio submissions:",
    "https://project-5v5cr.vercel.app/studio/submissions",
  ].join("\n");
}

function buildSubmissionEmailHtml(submission: ContactSubmission) {
  const rows = [
    ["Type", formatSubmissionType(submission.type)],
    ["Status", submission.status],
    ["Name", submission.name],
    ["Company", submission.company ?? "Not provided"],
    ["Email", submission.email],
    ["Product", submission.productName ?? submission.productSlug ?? "General enquiry"],
    ["Blocked reason", submission.rejectionReason ?? "Not applicable"],
    ["Submitted", formatDate(submission.createdAt)],
  ];
  const tone = getSubmissionTone(submission.type);

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:28px;">
      <div style="background:#020617;color:#f8fafc;border-radius:20px;padding:24px;">
        <p style="margin:0 0 8px;color:${tone};font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">${escapeHtml(formatSubmissionType(submission.type))}</p>
        <h1 style="margin:0;font-size:24px;line-height:1.25;">New website submission</h1>
      </div>
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;margin-top:18px;padding:22px;">
        <table style="width:100%;border-collapse:collapse;">
          <tbody>
            ${rows
              .map(
                ([label, value]) => `<tr>
                  <td style="padding:8px 12px 8px 0;color:#64748b;font-size:13px;font-weight:700;vertical-align:top;">${escapeHtml(label)}</td>
                  <td style="padding:8px 0;font-size:14px;vertical-align:top;">${escapeHtml(value)}</td>
                </tr>`,
              )
              .join("")}
          </tbody>
        </table>
        <div style="margin-top:18px;padding:16px;border-radius:14px;background:#f1f5f9;white-space:pre-wrap;font-size:14px;line-height:1.6;">${escapeHtml(
          submission.message,
        )}</div>
        <p style="margin:22px 0 0;">
          <a href="https://project-5v5cr.vercel.app/studio/submissions" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:999px;padding:11px 16px;font-size:14px;font-weight:700;">Open Studio submissions</a>
        </p>
      </div>
    </div>
  </body>
</html>`;
}

function buildDigestSubject(submissions: ContactSubmission[], mode: ContactNotificationMode) {
  return `Eltronic ${mode === "weekly_digest" ? "weekly" : "daily"} contact report: ${submissions.length} record${submissions.length === 1 ? "" : "s"}`;
}

function buildDigestEmailText(submissions: ContactSubmission[], mode: ContactNotificationMode) {
  return [
    buildDigestSubject(submissions, mode),
    "",
    ...submissions.flatMap((submission, index) => [
      `${index + 1}. ${formatSubmissionType(submission.type)} - ${submission.name}`,
      `Email: ${submission.email}`,
      `Product: ${submission.productName ?? submission.productSlug ?? "General enquiry"}`,
      `Reason: ${submission.rejectionReason ?? "Not applicable"}`,
      `Submitted: ${formatDate(submission.createdAt)}`,
      `Message: ${submission.message}`,
      "",
    ]),
    "Open Studio submissions:",
    "https://project-5v5cr.vercel.app/studio/submissions",
  ].join("\n");
}

function buildDigestEmailHtml(submissions: ContactSubmission[], mode: ContactNotificationMode) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="max-width:720px;margin:0 auto;padding:28px;">
      <div style="background:#020617;color:#f8fafc;border-radius:20px;padding:24px;">
        <p style="margin:0 0 8px;color:#67e8f9;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Eltronic ${mode === "weekly_digest" ? "weekly" : "daily"} report</p>
        <h1 style="margin:0;font-size:24px;line-height:1.25;">${submissions.length} contact record${submissions.length === 1 ? "" : "s"}</h1>
      </div>
      ${submissions
        .map((submission) => {
          const tone = getSubmissionTone(submission.type);

          return `<div style="background:#ffffff;border:1px solid #e2e8f0;border-left:5px solid ${tone};border-radius:18px;margin-top:14px;padding:18px;">
            <p style="margin:0 0 8px;color:${tone};font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">${escapeHtml(formatSubmissionType(submission.type))}</p>
            <h2 style="margin:0 0 10px;font-size:18px;">${escapeHtml(submission.name)}</h2>
            <p style="margin:0 0 4px;font-size:14px;"><strong>Email:</strong> ${escapeHtml(submission.email)}</p>
            <p style="margin:0 0 4px;font-size:14px;"><strong>Product:</strong> ${escapeHtml(submission.productName ?? submission.productSlug ?? "General enquiry")}</p>
            <p style="margin:0 0 4px;font-size:14px;"><strong>Reason:</strong> ${escapeHtml(submission.rejectionReason ?? "Not applicable")}</p>
            <p style="margin:0 0 12px;font-size:14px;"><strong>Submitted:</strong> ${escapeHtml(formatDate(submission.createdAt))}</p>
            <div style="padding:14px;border-radius:14px;background:#f1f5f9;white-space:pre-wrap;font-size:14px;line-height:1.6;">${escapeHtml(submission.message)}</div>
          </div>`;
        })
        .join("")}
      <p style="margin:22px 0 0;">
        <a href="https://project-5v5cr.vercel.app/studio/submissions" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:999px;padding:11px 16px;font-size:14px;font-weight:700;">Open Studio submissions</a>
      </p>
    </div>
  </body>
</html>`;
}

function parseRecipientList(value: string) {
  return value
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

function isReplyableEmail(value: string) {
  return value.includes("@") && !value.endsWith(".invalid");
}

function isDigestMode(mode: ContactNotificationMode) {
  return mode === "daily_digest" || mode === "weekly_digest";
}

function isDigestDue(mode: ContactNotificationMode, lastDigestSentAt?: string) {
  if (!lastDigestSentAt) {
    return true;
  }

  const elapsedMs = Date.now() - Date.parse(lastDigestSentAt);
  const dueMs = mode === "weekly_digest" ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

  return elapsedMs >= dueMs - 5 * 60 * 1000;
}

function formatSubmissionType(type: ContactSubmission["type"]) {
  if (type === "captcha_failed") return "Captcha failed";
  if (type === "honeypot_spam") return "Honeypot spam";
  return "Enquiry";
}

function getSubmissionTone(type: ContactSubmission["type"]) {
  if (type === "captcha_failed") return "#f59e0b";
  if (type === "honeypot_spam") return "#ef4444";
  return "#22c55e";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
