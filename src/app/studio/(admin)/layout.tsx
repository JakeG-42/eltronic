import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StudioShell } from "@/components/studio/studio-shell";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { toPublicAdminUser } from "@/lib/admin-user-model";
import { getStorageMode, hasPersistentStorage } from "@/lib/managed-data";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StudioAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentAdminUser();

  if (!currentUser) {
    redirect("/studio/login");
  }

  return (
    <StudioShell
      currentUser={toPublicAdminUser(currentUser)}
      storageConfigured={hasPersistentStorage()}
      storageMode={getStorageMode()}
    >
      {children}
    </StudioShell>
  );
}
