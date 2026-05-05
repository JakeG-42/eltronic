import { redirect } from "next/navigation";
import { KeyRound, UserCircle } from "lucide-react";

import { saveOwnAccountAction } from "@/app/studio/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminRoleLabels } from "@/lib/admin-user-model";
import { getCurrentAdminUser } from "@/lib/admin-auth";

type StudioAccountPageProps = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export const metadata = {
  title: "Account | Eltronic Studio",
};

export default async function StudioAccountPage({ searchParams }: StudioAccountPageProps) {
  const [currentUser, params] = await Promise.all([getCurrentAdminUser(), searchParams]);

  if (!currentUser) {
    redirect("/studio/login");
  }

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>Update your own Studio profile and password.</p>
      </section>

      {params?.saved === "account" ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          Account updated.
        </div>
      ) : null}
      {params?.error ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
          {params.error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <UserCircle className="size-5" />
              </div>
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your login identity and display name.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={saveOwnAccountAction} className="grid gap-4">
              <input name="returnTo" type="hidden" value="/studio/account" />
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input defaultValue={currentUser.displayName} id="displayName" name="displayName" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input defaultValue={currentUser.email} id="email" name="email" required type="email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input defaultValue={currentUser.username} id="username" name="username" required />
              </div>
              <div className="rounded-2xl border border-border bg-background/45 p-4 text-sm text-muted-foreground">
                Role: <strong className="text-foreground">{adminRoleLabels[currentUser.role]}</strong>
              </div>
              <Button type="submit">Save profile</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <KeyRound className="size-5" />
              </div>
              <div>
                <CardTitle>Password</CardTitle>
                <CardDescription>Changing your password signs out old sessions for this account.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={saveOwnAccountAction} className="grid gap-4">
              <input name="returnTo" type="hidden" value="/studio/account" />
              <input name="displayName" type="hidden" value={currentUser.displayName} />
              <input name="email" type="hidden" value={currentUser.email} />
              <input name="username" type="hidden" value={currentUser.username} />
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input id="currentPassword" name="currentPassword" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" name="newPassword" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" />
              </div>
              <Button type="submit">Change password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
