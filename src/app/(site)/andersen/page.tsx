import { LockKeyhole } from "lucide-react";

import { unlockAndersenPageAction } from "@/app/(site)/andersen/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasAndersenGateAccess } from "@/lib/andersen-gate";
import { createPageMetadata } from "@/lib/seo";

export const metadata = {
  ...createPageMetadata({
    title: "Andersen",
    description: "Password-protected Andersen configurator preview.",
    path: "/andersen",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

type AndersenPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AndersenPage({ searchParams }: AndersenPageProps) {
  const params = await searchParams;
  const unlocked = await hasAndersenGateAccess();
  const hasError = params?.error === "invalid";

  if (!unlocked) {
    return (
      <main className="page">
        <section className="mx-auto grid min-h-[calc(100vh-14rem)] max-w-xl place-items-center">
          <Card className="w-full overflow-hidden border-primary/20">
            <CardHeader className="border-b border-border/70 bg-primary/5">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <LockKeyhole className="size-5" />
              </div>
              <CardTitle>Andersen preview</CardTitle>
              <CardDescription>
                Enter the access password to view this configurator page.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {hasError ? (
                <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                  That password did not match. Try again.
                </div>
              ) : null}
              <form action={unlockAndersenPageAction} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    autoComplete="current-password"
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <Button type="submit" size="lg">
                  Unlock page
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">01</span>
            <h2>Andersen EV Product Configurator</h2>
          </div>
        </div>
        <div className="andersen-embed-shell overflow-hidden rounded-[24px]">
          <iframe
            className="andersen-embed-frame"
            src="https://priceless-configurator.vercel.app/customiser/eltronic?token=-0TD4XWjQuFS1PPXG4tMgYpTMAqn0ac8"
            title="Eltronic configurator"
            loading="lazy"
          />
        </div>
      </section>
    </main>
  );
}
