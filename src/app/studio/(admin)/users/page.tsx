import { redirect } from "next/navigation";
import { ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";

import { deleteAdminUserAction, saveAdminUserAction } from "@/app/studio/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminRoleLabels, adminStatusLabels } from "@/lib/admin-user-model";
import { getCurrentAdminUser, userCanManageUsers } from "@/lib/admin-auth";
import { getPublicAdminUsers } from "@/lib/managed-data";

type StudioUsersPageProps = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export const metadata = {
  title: "Users | Eltronic Studio",
};

export default async function StudioUsersPage({ searchParams }: StudioUsersPageProps) {
  const [currentUser, users, params] = await Promise.all([getCurrentAdminUser(), getPublicAdminUsers(), searchParams]);

  if (!currentUser || !userCanManageUsers(currentUser)) {
    redirect("/studio");
  }

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>Manage Studio users, roles and account access. Super admin and admin currently have full control.</p>
      </section>

      {params?.saved === "users" ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          User settings saved.
        </div>
      ) : null}
      {params?.error ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
          {params.error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <UserPlus className="size-5" />
            </div>
            <div>
              <CardTitle>Add user</CardTitle>
              <CardDescription>Create a Studio account with a role and temporary password.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form action={saveAdminUserAction} className="grid gap-4 md:grid-cols-2">
            <input name="returnTo" type="hidden" value="/studio/users" />
            <StudioTextField label="Display name" name="displayName" placeholder="Jane Engineer" required />
            <StudioTextField label="Email" name="email" placeholder="jane@example.com" required type="email" />
            <StudioTextField label="Username" name="username" placeholder="jane@example.com" required />
            <StudioTextField label="Temporary password" name="password" required type="password" />
            <StudioSelect label="Role" name="role" options={adminRoleLabels} />
            <StudioSelect label="Status" name="status" options={adminStatusLabels} />
            <div className="md:col-span-2">
              <Button type="submit">Create user</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <CardTitle>Existing users</CardTitle>
              <CardDescription>Update roles, reset passwords or disable access.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {users.map((user) => (
            <article className="rounded-2xl border border-border bg-background/45 p-4" key={user.id}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="mb-1 text-base font-bold text-foreground">{user.displayName}</h2>
                  <p className="mb-0 text-sm text-muted-foreground">
                    {user.email} · {user.username}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  <ShieldCheck className="size-3" />
                  {adminRoleLabels[user.role]}
                </span>
              </div>

              <form action={saveAdminUserAction} className="grid gap-3 md:grid-cols-3">
                <input name="returnTo" type="hidden" value="/studio/users" />
                <input name="userId" type="hidden" value={user.id} />
                <StudioTextField defaultValue={user.displayName} label="Display name" name="displayName" required />
                <StudioTextField defaultValue={user.email} label="Email" name="email" required type="email" />
                <StudioTextField defaultValue={user.username} label="Username" name="username" required />
                <StudioSelect defaultValue={user.role} label="Role" name="role" options={adminRoleLabels} />
                <StudioSelect defaultValue={user.status} label="Status" name="status" options={adminStatusLabels} />
                <StudioTextField label="New password" name="password" placeholder="Leave blank to keep current" type="password" />
                <div className="flex flex-wrap gap-2 md:col-span-3">
                  <Button type="submit">Save user</Button>
                </div>
              </form>

              {user.id !== currentUser.id ? (
                <form action={deleteAdminUserAction} className="mt-3">
                  <input name="returnTo" type="hidden" value="/studio/users" />
                  <input name="userId" type="hidden" value={user.id} />
                  <Button type="submit" variant="destructive">
                    <Trash2 className="size-4" />
                    Delete user
                  </Button>
                </form>
              ) : null}
            </article>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StudioTextField({
  defaultValue,
  label,
  name,
  placeholder,
  required = false,
  type = "text",
}: {
  defaultValue?: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input defaultValue={defaultValue} id={name} name={name} placeholder={placeholder} required={required} type={type} />
    </div>
  );
}

function StudioSelect({
  defaultValue,
  label,
  name,
  options,
}: {
  defaultValue?: string;
  label: string;
  name: string;
  options: Record<string, string>;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        className="flex h-10 w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        defaultValue={defaultValue}
        id={name}
        name={name}
      >
        {Object.entries(options).map(([value, labelText]) => (
          <option key={value} value={value}>
            {labelText}
          </option>
        ))}
      </select>
    </div>
  );
}
