import { Inbox } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmissionCard } from "@/components/studio/submission-card";
import { getSubmissions, type ContactSubmission, type ContactSubmissionType } from "@/lib/managed-data";

type SubmissionFilter = "enquiries" | "blocked" | ContactSubmissionType | "all";

type SubmissionsPageProps = {
  searchParams?: Promise<{
    type?: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Enquiries | Eltronic Studio",
};

export default async function SubmissionsPage({ searchParams }: SubmissionsPageProps) {
  const params = await searchParams;
  const submissions = await getSubmissions();
  const activeFilter = parseFilter(params?.type);
  const filteredSubmissions = filterSubmissions(submissions, activeFilter);
  const counts = {
    all: submissions.length,
    blocked: submissions.filter((submission) => submission.type !== "enquiry").length,
    captcha_failed: submissions.filter((submission) => submission.type === "captcha_failed").length,
    enquiries: submissions.filter((submission) => submission.type === "enquiry").length,
    honeypot_spam: submissions.filter((submission) => submission.type === "honeypot_spam").length,
  };

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>Messages and blocked attempts submitted through the public quote/contact form.</p>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <Inbox className="size-5" />
            </div>
            <div>
              <CardTitle>Contact submissions</CardTitle>
              <CardDescription>Review enquiries, captcha failures and honeypot spam attempts.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="submission-filter-bar">
            <FilterLink active={activeFilter === "enquiries"} count={counts.enquiries} href="/studio/submissions" label="Enquiries" />
            <FilterLink
              active={activeFilter === "blocked"}
              count={counts.blocked}
              href="/studio/submissions?type=blocked"
              label="Blocked"
            />
            <FilterLink
              active={activeFilter === "captcha_failed"}
              count={counts.captcha_failed}
              href="/studio/submissions?type=captcha_failed"
              label="Captcha"
            />
            <FilterLink
              active={activeFilter === "honeypot_spam"}
              count={counts.honeypot_spam}
              href="/studio/submissions?type=honeypot_spam"
              label="Honeypot"
            />
            <FilterLink active={activeFilter === "all"} count={counts.all} href="/studio/submissions?type=all" label="All" />
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No records match this filter yet.
            </div>
          ) : null}
          {filteredSubmissions.map((submission) => (
            <SubmissionCard
              returnTo={activeFilter === "enquiries" ? "/studio/submissions" : `/studio/submissions?type=${activeFilter}`}
              submission={submission}
              key={submission.id}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function FilterLink({ active, count, href, label }: { active: boolean; count: number; href: string; label: string }) {
  return (
    <Link className={active ? "active" : undefined} href={href}>
      {label}
      <span>{count}</span>
    </Link>
  );
}

function parseFilter(value?: string): SubmissionFilter {
  if (value === "all" || value === "blocked" || value === "captcha_failed" || value === "honeypot_spam") {
    return value;
  }

  return "enquiries";
}

function filterSubmissions(submissions: ContactSubmission[], filter: SubmissionFilter) {
  if (filter === "all") {
    return submissions;
  }

  if (filter === "blocked") {
    return submissions.filter((submission) => submission.type !== "enquiry");
  }

  if (filter === "enquiries") {
    return submissions.filter((submission) => submission.type === "enquiry");
  }

  return submissions.filter((submission) => submission.type === filter);
}
