import { Inbox } from "lucide-react";
import Link from "next/link";

import { bulkSubmissionAction } from "@/app/studio/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubmissionCard } from "@/components/studio/submission-card";
import { SubmissionBulkSelect } from "@/components/studio/submission-bulk-select";
import { SubmissionsAutoRefresh } from "@/components/studio/submissions-auto-refresh";
import { getSubmissions, type ContactSubmission, type ContactSubmissionType } from "@/lib/managed-data";

type SubmissionFilter = "enquiries" | "blocked" | ContactSubmissionType | "all";
type SubmissionFilterTone = "enquiry" | "blocked" | ContactSubmissionType | "all";
export type DisplaySubmission = ContactSubmission & {
  duplicateCount: number;
  duplicateIds: string[];
};

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
  const visibleSubmissions = collapseRepeatedBlockedSubmissions(submissions);
  const activeFilter = parseFilter(params?.type);
  const filteredSubmissions = filterSubmissions(visibleSubmissions, activeFilter);
  const returnTo = activeFilter === "enquiries" ? "/studio/submissions" : `/studio/submissions?type=${activeFilter}`;
  const bulkFormId = "submission-bulk-form";
  const counts = {
    all: visibleSubmissions.length,
    blocked: visibleSubmissions.filter((submission) => submission.type !== "enquiry").length,
    captcha_failed: visibleSubmissions.filter((submission) => submission.type === "captcha_failed").length,
    enquiries: visibleSubmissions.filter((submission) => submission.type === "enquiry").length,
    honeypot_spam: visibleSubmissions.filter((submission) => submission.type === "honeypot_spam").length,
  };

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>Messages and blocked attempts submitted through the public quote/contact form.</p>
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Inbox className="size-5" />
              </div>
              <div>
                <CardTitle>Contact submissions</CardTitle>
                <CardDescription>Review enquiries, captcha failures and honeypot spam attempts.</CardDescription>
              </div>
            </div>
            <SubmissionsAutoRefresh />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="submission-filter-bar">
            <FilterLink
              active={activeFilter === "enquiries"}
              count={counts.enquiries}
              href="/studio/submissions"
              label="Enquiries"
              tone="enquiry"
            />
            <FilterLink
              active={activeFilter === "blocked"}
              count={counts.blocked}
              href="/studio/submissions?type=blocked"
              label="Blocked"
              tone="blocked"
            />
            <FilterLink
              active={activeFilter === "captcha_failed"}
              count={counts.captcha_failed}
              href="/studio/submissions?type=captcha_failed"
              label="Captcha"
              tone="captcha_failed"
            />
            <FilterLink
              active={activeFilter === "honeypot_spam"}
              count={counts.honeypot_spam}
              href="/studio/submissions?type=honeypot_spam"
              label="Honeypot"
              tone="honeypot_spam"
            />
            <FilterLink active={activeFilter === "all"} count={counts.all} href="/studio/submissions?type=all" label="All" tone="all" />
          </div>

          <form action={bulkSubmissionAction} className="submission-bulk-toolbar" id={bulkFormId}>
            <input name="returnTo" type="hidden" value={returnTo} />
            <SubmissionBulkSelect />
            <label>
              <span>Mass action</span>
              <select name="bulkAction" defaultValue="status:reviewed">
                <option value="status:new">Mark new</option>
                <option value="status:reviewed">Mark reviewed</option>
                <option value="status:replied">Mark replied</option>
                <option value="status:archived">Archive</option>
                <option value="status:blocked">Mark blocked</option>
                <option value="delete">Delete selected</option>
              </select>
            </label>
            <Button type="submit" variant="secondary">
              Apply
            </Button>
          </form>

          {filteredSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No records match this filter yet.
            </div>
          ) : null}
          {filteredSubmissions.map((submission) => (
            <SubmissionCard
              bulkFormId={bulkFormId}
              returnTo={returnTo}
              selectValue={submission.duplicateIds.join(",")}
              submission={submission}
              key={submission.id}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function FilterLink({
  active,
  count,
  href,
  label,
  tone,
}: {
  active: boolean;
  count: number;
  href: string;
  label: string;
  tone: SubmissionFilterTone;
}) {
  return (
    <Link className={active ? "active" : undefined} data-tone={tone} href={href}>
      <span className="submission-type-dot" aria-hidden="true" />
      {label}
      <span className="submission-filter-count">{count}</span>
    </Link>
  );
}

function parseFilter(value?: string): SubmissionFilter {
  if (value === "all" || value === "blocked" || value === "captcha_failed" || value === "honeypot_spam") {
    return value;
  }

  return "enquiries";
}

function filterSubmissions(submissions: DisplaySubmission[], filter: SubmissionFilter) {
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

function collapseRepeatedBlockedSubmissions(submissions: ContactSubmission[]): DisplaySubmission[] {
  const collapsedSubmissions = new Map<string, DisplaySubmission>();

  for (const submission of submissions) {
    const key = getSubmissionCollapseKey(submission);
    const existingSubmission = collapsedSubmissions.get(key);

    if (existingSubmission) {
      existingSubmission.duplicateCount += 1;
      existingSubmission.duplicateIds.push(submission.id);
      continue;
    }

    collapsedSubmissions.set(key, {
      ...submission,
      duplicateCount: 1,
      duplicateIds: [submission.id],
    });
  }

  return Array.from(collapsedSubmissions.values());
}

function getSubmissionCollapseKey(submission: ContactSubmission) {
  if (submission.type === "enquiry") {
    return submission.id;
  }

  return [
    submission.type,
    submission.email,
    submission.name,
    submission.productSlug ?? "",
    submission.message,
    submission.rejectionReason ?? "",
  ].join("|");
}
