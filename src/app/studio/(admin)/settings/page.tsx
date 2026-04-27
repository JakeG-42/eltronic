import { Palette, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Settings | Eltronic Studio",
};

export default function StudioSettingsPage() {
  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>Studio-level notes and controls. More settings can live here as the admin grows.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
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
                <CardDescription>Current temporary login is intentionally simple while the admin is private.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-0 text-sm text-muted-foreground">
              Defaults are <code>admin</code> / <code>password</code>. Override later with
              <code> ELTRONIC_ADMIN_USERNAME</code>, <code> ELTRONIC_ADMIN_PASSWORD</code> and
              <code> ELTRONIC_ADMIN_SECRET</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
