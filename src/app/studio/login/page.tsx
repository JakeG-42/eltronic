import Link from "next/link";
import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAdminConfigured } from "@/lib/admin-auth";
import { loginAction } from "./actions";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Studio Login | Eltronic",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StudioLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasError = params?.error === "invalid";
  const configured = isAdminConfigured();

  return (
    <main className="page">
      <section className="mx-auto grid min-h-[calc(100vh-14rem)] max-w-xl place-items-center">
        <Card className="w-full overflow-hidden border-primary/20">
          <CardHeader className="border-b border-border/70 bg-primary/5">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <LockKeyhole className="size-5" />
            </div>
            <CardTitle>Eltronic Studio</CardTitle>
            <CardDescription>
              Sign in to manage products, Code Studio, enquiries, users and launch settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!configured ? (
              <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
                Set <code>ELTRONIC_ADMIN_PASSWORD</code> and <code>ELTRONIC_ADMIN_SECRET</code> before
                using the production admin.
              </div>
            ) : null}
            {hasError ? (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                Those login details did not match. Try again.
              </div>
            ) : null}
            <form action={loginAction} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Login</Label>
                <Input
                  autoComplete="username"
                  defaultValue="admin"
                  id="username"
                  name="username"
                  placeholder="admin or email@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Admin password</Label>
                <Input
                  autoComplete="current-password"
                  id="password"
                  name="password"
                  type="password"
                  placeholder="password"
                  required
                />
              </div>
              <Button type="submit" size="lg">
                Enter studio
              </Button>
            </form>
            <Button asChild className="mt-4 w-full" variant="ghost">
              <Link href="/">Back to site</Link>
            </Button>
            {process.env.NODE_ENV !== "production" ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Temporary login: <code>admin</code> / <code>password</code>
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
