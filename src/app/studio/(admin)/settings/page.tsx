import { Mail, Palette, ShieldCheck } from "lucide-react";

import { saveContactNotificationSettingsAction } from "@/app/studio/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getContactEmailDeliveryStatus } from "@/lib/email-notifications";
import { getCurrentAdminUser, userCanManageUsers } from "@/lib/admin-auth";
import { getContactNotificationSettings } from "@/lib/managed-data";
import { redirect } from "next/navigation";

type StudioSettingsPageProps = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export const metadata = {
  title: "Settings | Eltronic Studio",
};

export default async function StudioSettingsPage({ searchParams }: StudioSettingsPageProps) {
  const [currentUser, notificationSettings, deliveryStatus, params] = await Promise.all([
    getCurrentAdminUser(),
    getContactNotificationSettings(),
    Promise.resolve(getContactEmailDeliveryStatus()),
    searchParams,
  ]);

  if (!currentUser || !userCanManageUsers(currentUser)) {
    redirect("/studio");
  }
  const recipients = notificationSettings.recipients.join(", ");

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>Studio-level notes and controls. More settings can live here as the admin grows.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Mail className="size-5" />
              </div>
              <div>
                <CardTitle>Email notifications</CardTitle>
                <CardDescription>
                  Choose who receives contact form alerts for enquiries, captcha failures and honeypot spam.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {params?.saved === "notifications" ? (
              <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                Email notification settings saved. Future submissions will use these recipients.
              </div>
            ) : null}
            {params?.error ? (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                {params.error}
              </div>
            ) : null}
            <form action={saveContactNotificationSettingsAction} className="grid gap-4">
              <input name="returnTo" type="hidden" value="/studio/settings" />
              <div className="grid gap-2">
                <Label htmlFor="notificationMode">Frequency</Label>
                <select
                  className="flex h-10 w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  defaultValue={notificationSettings.mode}
                  id="notificationMode"
                  name="notificationMode"
                >
                  <option value="immediate">Immediate - every good and blocked submission</option>
                  <option value="daily_digest">Daily digest - one report each day</option>
                  <option value="weekly_digest">Weekly digest - one report each week</option>
                  <option value="off">Off</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notificationRecipients">Recipients</Label>
                <Input
                  defaultValue={recipients}
                  id="notificationRecipients"
                  name="notificationRecipients"
                  placeholder="admin@example.com, owner@example.com"
                />
                <p className="mb-0 text-xs text-muted-foreground">
                  Enter one or more email addresses, separated by commas. Changes apply to future submissions
                  immediately.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/45 p-4 text-sm text-muted-foreground">
                Delivery provider: <strong className="text-foreground">{deliveryStatus.provider}</strong>. Status:{" "}
                <strong className={deliveryStatus.configured ? "text-emerald-300" : "text-amber-300"}>
                  {deliveryStatus.configured ? "configured" : "missing Vercel env vars"}
                </strong>
                . Sender: <code>{deliveryStatus.from || "CONTACT_NOTIFICATION_FROM not set"}</code>.
              </div>
              {deliveryStatus.from.includes("onboarding@resend.dev") ? (
                <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  Temporary sender active: until the Eltronic domain is verified in Resend, this sender can only
                  deliver to the Resend account email. After domain verification, admins can use any normal recipient
                  inbox here.
                </div>
              ) : null}
              {deliveryStatus.transport === "direct" ? (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                  Direct SMTP mode is active. This is a quick owner-notification fallback from Vercel, so delivery can
                  be rejected or sent to spam without retries.
                </div>
              ) : null}
              <Button className="w-full sm:w-fit" type="submit">
                Save email settings
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Palette className="size-5" />
              </div>
              <div>
                <CardTitle>Studio theme</CardTitle>
                <CardDescription>Use the top-right toggle to switch Studio between dark and light modes.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-0 text-sm text-muted-foreground">
              The selected theme is stored in this browser with <code>localStorage</code>, so it will not affect the
              public website or other users.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>User accounts are now managed inside Studio.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-0 text-sm text-muted-foreground">
              Use <code>/studio/users</code> to add users, reset passwords and assign roles. Keep
              <code> ELTRONIC_ADMIN_SECRET</code> strong because it signs Studio session cookies.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
