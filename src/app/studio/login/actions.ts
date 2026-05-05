"use server";

import { redirect } from "next/navigation";

import { setAdminSession, verifyAdminCredentials } from "@/lib/admin-auth";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const user = await verifyAdminCredentials(username, password);

  if (!user) {
    redirect("/studio/login?error=invalid");
  }

  await setAdminSession(user);
  redirect("/studio");
}
