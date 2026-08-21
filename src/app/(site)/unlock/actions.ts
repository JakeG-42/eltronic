"use server";

import { redirect } from "next/navigation";

import {
  setDemoSiteGateSession,
  verifyDemoSiteGatePassword,
} from "@/lib/demo-site-gate";

export async function unlockDemoSiteAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/").trim() || "/";
  const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";

  if (!verifyDemoSiteGatePassword(password)) {
    redirect(`/unlock?error=invalid&next=${encodeURIComponent(safeNext)}`);
  }

  await setDemoSiteGateSession();
  redirect(safeNext);
}
