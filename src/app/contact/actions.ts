"use server";

import { redirect } from "next/navigation";

import { createContactSubmission } from "@/lib/managed-data";

export async function submitContactFormAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const productSlug = String(formData.get("productSlug") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    redirect("/contact?error=required");
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
    redirect("/contact?error=storage");
  }

  redirect("/contact?sent=1");
}
