import { NextResponse } from "next/server";

import { getCurrentAdminUser, userCanManageSubmissions } from "@/lib/admin-auth";
import { getSubmissions } from "@/lib/managed-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentAdminUser();

  if (!user || !userCanManageSubmissions(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await getSubmissions();
  const counts = {
    all: submissions.length,
    blocked: submissions.filter((submission) => submission.type !== "enquiry").length,
    captcha_failed: submissions.filter((submission) => submission.type === "captcha_failed").length,
    enquiry: submissions.filter((submission) => submission.type === "enquiry").length,
    honeypot_spam: submissions.filter((submission) => submission.type === "honeypot_spam").length,
  };

  return NextResponse.json(
    {
      counts,
      latestCreatedAt: submissions[0]?.createdAt,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
