import { Inbox } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmissionCard } from "@/components/studio/submission-card";
import { getSubmissions } from "@/lib/managed-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Enquiries | Eltronic Studio",
};

export default async function SubmissionsPage() {
  const submissions = await getSubmissions();

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>Messages submitted through the public quote/contact form.</p>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <Inbox className="size-5" />
            </div>
            <div>
              <CardTitle>Contact submissions</CardTitle>
              <CardDescription>Review, status and clear incoming messages.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {submissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No submissions yet. The contact form is wired and ready.
            </div>
          ) : null}
          {submissions.map((submission) => (
            <SubmissionCard submission={submission} key={submission.id} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
