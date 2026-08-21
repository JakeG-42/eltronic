"use server";

import { redirect } from "next/navigation";

import {
  setAndersenGateSession,
  verifyAndersenGatePassword,
} from "@/lib/andersen-gate";

export async function unlockAndersenPageAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!verifyAndersenGatePassword(password)) {
    redirect("/andersen?error=invalid");
  }

  await setAndersenGateSession();
  redirect("/andersen");
}
