"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SubmissionsAutoRefreshProps = {
  intervalMs?: number;
};

export function SubmissionsAutoRefresh({ intervalMs = 15000 }: SubmissionsAutoRefreshProps) {
  const router = useRouter();
  const [lastRefreshAt, setLastRefreshAt] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }

      if (document.querySelector(".submission-bulk-checkbox:checked")) {
        return;
      }

      router.refresh();
      setLastRefreshAt(new Date());
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [intervalMs, router]);

  return (
    <div className="submission-auto-refresh" aria-live="polite">
      Auto refresh on
      <span>Last checked {lastRefreshAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
    </div>
  );
}
