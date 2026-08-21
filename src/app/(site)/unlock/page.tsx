import { LockKeyhole } from "lucide-react";

import { unlockDemoSiteAction } from "@/app/(site)/unlock/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = {
  title: "Unlock demo",
  robots: {
    index: false,
    follow: false,
  },
};

type UnlockPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function UnlockDemoPage({ searchParams }: UnlockPageProps) {
  const params = await searchParams;
  const hasError = params?.error === "invalid";
  const nextPath =
    params?.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/";

  return (
    <main className="page">
      <section className="mx-auto grid min-h-[calc(100vh-14rem)] max-w-xl place-items-center">
        <Card className="w-full overflow-hidden border-primary/20">
          <CardHeader className="border-b border-border/70 bg-primary/5">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <LockKeyhole className="size-5" />
            </div>
            <CardTitle>Demo access</CardTitle>
            <CardDescription>
              Enter the site password to continue. The Andersen page uses a separate password.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {hasError ? (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                That password did not match. Try again.
              </div>
            ) : null}
            <form action={unlockDemoSiteAction} className="grid gap-4">
              <input type="hidden" name="next" value={nextPath} />
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
                Unlock site
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
