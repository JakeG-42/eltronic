import { deleteSubmissionAction, updateSubmissionStatusAction } from "@/app/studio/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ContactSubmission, ContactSubmissionStatus } from "@/lib/managed-data";

const selectClass =
  "flex h-10 w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const statusOptions = ["new", "reviewed", "replied", "archived", "blocked"] satisfies ContactSubmissionStatus[];

export function SubmissionCard({
  returnTo = "/studio/submissions",
  submission,
}: {
  returnTo?: string;
  submission: ContactSubmission;
}) {
  const isBlocked = submission.type !== "enquiry";

  return (
    <article className="rounded-2xl border border-border bg-background/35 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="mb-1 text-lg">{submission.name}</h3>
          <p className="mb-0 text-sm text-muted-foreground">{formatDate(submission.createdAt)}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge variant={isBlocked ? "warning" : "outline"}>{formatType(submission.type)}</Badge>
          <Badge variant={submission.status === "new" ? "warning" : "outline"}>{submission.status}</Badge>
        </div>
      </div>
      <div className="grid gap-2 text-sm text-muted-foreground">
        {submission.email.endsWith(".invalid") ? (
          <span>{submission.email}</span>
        ) : (
          <a className="text-primary" href={`mailto:${submission.email}`}>
            {submission.email}
          </a>
        )}
        {submission.company ? <span>{submission.company}</span> : null}
        {submission.productName ? <span>Product: {submission.productName}</span> : null}
        {submission.rejectionReason ? <span>Blocked reason: {submission.rejectionReason}</span> : null}
      </div>
      <p className="mt-4 whitespace-pre-wrap rounded-xl bg-muted p-3 text-sm text-foreground">{submission.message}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <form action={updateSubmissionStatusAction} className="flex gap-2">
          <input name="id" type="hidden" value={submission.id} />
          <input name="returnTo" type="hidden" value={returnTo} />
          <select className={selectClass} defaultValue={submission.status} name="status">
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Update
          </Button>
        </form>
        <form action={deleteSubmissionAction}>
          <input name="id" type="hidden" value={submission.id} />
          <input name="returnTo" type="hidden" value={returnTo} />
          <Button type="submit" variant="outline">
            Delete
          </Button>
        </form>
      </div>
    </article>
  );
}

function formatType(type: ContactSubmission["type"]) {
  if (type === "captcha_failed") return "captcha failed";
  if (type === "honeypot_spam") return "honeypot spam";
  return "enquiry";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
