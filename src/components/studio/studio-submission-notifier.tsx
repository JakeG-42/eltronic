"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type SubmissionCounts = {
  all: number;
  blocked: number;
  captcha_failed: number;
  enquiry: number;
  honeypot_spam: number;
};

type SubmissionSummary = {
  counts: SubmissionCounts;
  latestCreatedAt?: string;
};

type SubmissionDeltas = Partial<Record<keyof SubmissionCounts, number>>;

const STORAGE_KEY = "eltronic-studio-submission-summary";
const POLL_INTERVAL_MS = 20000;

export function StudioSubmissionNotifier() {
  const pathname = usePathname();
  const [deltas, setDeltas] = useState<SubmissionDeltas>({});

  useEffect(() => {
    let cancelled = false;

    async function pollSummary() {
      try {
        const response = await fetch("/api/studio/submissions/summary", {
          cache: "no-store",
          headers: {
            accept: "application/json",
          },
        });

        if (!response.ok) {
          return;
        }

        const summary = (await response.json()) as SubmissionSummary;

        if (cancelled) {
          return;
        }

        const previousSummary = readStoredSummary();

        if (pathname.startsWith("/studio/submissions")) {
          setDeltas({});
        } else if (previousSummary) {
          setDeltas((current) => mergeDeltas(current, getPositiveDeltas(previousSummary.counts, summary.counts)));
        }

        storeSummary(summary);
      } catch {
        // The badge is nice-to-have; never disturb Studio navigation if polling fails.
      }
    }

    pollSummary();
    const interval = window.setInterval(pollSummary, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [pathname]);

  const visibleDeltas = useMemo(
    () => {
      if (pathname.startsWith("/studio/submissions")) {
        return [];
      }

      const blockedOnly = Math.max(
        0,
        (deltas.blocked ?? 0) - (deltas.captcha_failed ?? 0) - (deltas.honeypot_spam ?? 0),
      );

      return [
        { key: "enquiry", label: "enquiry", tone: "enquiry" },
        { key: "blocked", label: "blocked", tone: "blocked", countOverride: blockedOnly },
        { key: "captcha_failed", label: "captcha failed", tone: "captcha" },
        { key: "honeypot_spam", label: "honeypot spam", tone: "honeypot" },
      ]
        .map((item) => ({
          ...item,
          count: item.countOverride ?? deltas[item.key as keyof SubmissionCounts] ?? 0,
        }))
        .filter((item) => item.count > 0);
    },
    [deltas, pathname],
  );

  if (visibleDeltas.length === 0) {
    return null;
  }

  return (
    <span className="studio-submission-notifier" aria-label={formatAriaLabel(visibleDeltas)}>
      {visibleDeltas.map((delta) => (
        <span className="studio-submission-delta" data-tone={delta.tone} key={delta.key}>
          +{delta.count}
        </span>
      ))}
    </span>
  );
}

function readStoredSummary() {
  try {
    const rawSummary = window.localStorage.getItem(STORAGE_KEY);
    return rawSummary ? (JSON.parse(rawSummary) as SubmissionSummary) : null;
  } catch {
    return null;
  }
}

function storeSummary(summary: SubmissionSummary) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(summary));
}

function getPositiveDeltas(previousCounts: SubmissionCounts, nextCounts: SubmissionCounts): SubmissionDeltas {
  return {
    all: Math.max(0, nextCounts.all - previousCounts.all),
    blocked: Math.max(0, nextCounts.blocked - previousCounts.blocked),
    captcha_failed: Math.max(0, nextCounts.captcha_failed - previousCounts.captcha_failed),
    enquiry: Math.max(0, nextCounts.enquiry - previousCounts.enquiry),
    honeypot_spam: Math.max(0, nextCounts.honeypot_spam - previousCounts.honeypot_spam),
  };
}

function mergeDeltas(current: SubmissionDeltas, next: SubmissionDeltas): SubmissionDeltas {
  return {
    blocked: (current.blocked ?? 0) + (next.blocked ?? 0),
    captcha_failed: (current.captcha_failed ?? 0) + (next.captcha_failed ?? 0),
    enquiry: (current.enquiry ?? 0) + (next.enquiry ?? 0),
    honeypot_spam: (current.honeypot_spam ?? 0) + (next.honeypot_spam ?? 0),
  };
}

function formatAriaLabel(deltas: Array<{ count: number; label: string }>) {
  return deltas.map((delta) => `${delta.count} new ${delta.label}`).join(", ");
}
