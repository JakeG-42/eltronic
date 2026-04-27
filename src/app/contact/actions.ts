"use server";

import { redirect } from "next/navigation";

import { verifyMathCaptcha } from "@/lib/contact-captcha";
import { createBlockedContactSubmission, createContactSubmission } from "@/lib/managed-data";

export async function submitContactFormAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const productSlug = String(formData.get("productSlug") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const captchaAnswer = String(formData.get("captchaAnswer") ?? "").trim();
  const captchaToken = String(formData.get("captchaToken") ?? "");
  const honeypot = String(formData.get("website") ?? "").trim();

  if (!name || !email || !message) {
    redirect(contactRedirect("required", productSlug));
  }

  if (honeypot) {
    await recordBlockedAttempt({
      company,
      email,
      message,
      name,
      productSlug,
      rejectionReason: "Hidden website field was populated.",
      type: "honeypot_spam",
    });
    redirect(contactRedirect("spam", productSlug));
  }

  if (!verifyMathCaptcha(captchaToken, captchaAnswer)) {
    await recordBlockedAttempt({
      company,
      email,
      message,
      name,
      productSlug,
      rejectionReason: captchaAnswer
        ? `Incorrect maths answer submitted: ${captchaAnswer}.`
        : "Maths captcha answer was missing.",
      type: "captcha_failed",
    });
    redirect(contactRedirect("captcha", productSlug));
  }

  try {
    await createContactSubmission({
      name,
      company,
      email,
      productSlug: productSlug || undefined,
      message,
    });
  } catch {
    redirect(contactRedirect("storage", productSlug));
  }

  redirect("/contact?sent=1");
}

async function recordBlockedAttempt(input: Parameters<typeof createBlockedContactSubmission>[0]) {
  try {
    await createBlockedContactSubmission(input);
  } catch {
    // The user-facing redirect should still happen if production storage is not configured.
  }
}

function contactRedirect(error: string, productSlug?: string) {
  const params = new URLSearchParams({ error });

  if (productSlug) {
    params.set("product", productSlug);
  }

  return `/contact?${params.toString()}`;
}
