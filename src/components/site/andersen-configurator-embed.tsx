"use client";

import { useEffect, useRef } from "react";

const CONFIGURATOR_BASE_URL = "https://priceless-configurator.vercel.app";
const PARTNER_SLUG = "eltronic";
const PARTNER_NAME = "Eltronic";
const EMBED_TOKEN = "-0TD4XWjQuFS1PPXG4tMgYpTMAqn0ac8";
const EMBED_RESIZE_SOURCE = "aev-configurator";
const EMBED_RESIZE_TYPE = "aev-configurator-resize";
const EMBED_FALLBACK_HEIGHT = 560;

function buildEmbedFrameId(partnerSlug: string, token: string) {
  const slug = partnerSlug.replace(/[^a-z0-9-]+/gi, "").toLowerCase() || "partner";
  const suffix = token.replace(/[^a-z0-9]+/gi, "").slice(0, 8) || "token";

  return `aev-configurator-${slug}-${suffix}`;
}

function buildConfiguratorSrc() {
  return new URL(
    `/customiser/${encodeURIComponent(PARTNER_SLUG)}?token=${encodeURIComponent(EMBED_TOKEN)}`,
    `${CONFIGURATOR_BASE_URL.replace(/\/+$/, "")}/`
  ).toString();
}

const EMBED_FRAME_ID = buildEmbedFrameId(PARTNER_SLUG, EMBED_TOKEN);
const CONFIGURATOR_SRC = buildConfiguratorSrc();

export function AndersenConfiguratorEmbed() {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function applyHeight(nextHeight: number) {
      const frame = frameRef.current;

      if (!frame) {
        return;
      }

      const height = Math.max(320, Math.ceil(Number(nextHeight) || 0));

      if (!height) {
        return;
      }

      frame.style.height = `${height}px`;
      frame.setAttribute("height", String(height));
    }

    function handleMessage(event: MessageEvent) {
      const frame = frameRef.current;
      const data = event.data as { source?: string; type?: string; height?: number } | null;

      if (!frame || !data || data.source !== EMBED_RESIZE_SOURCE || data.type !== EMBED_RESIZE_TYPE) {
        return;
      }

      if (event.source !== frame.contentWindow) {
        return;
      }

      applyHeight(data.height ?? 0);
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <iframe
      ref={frameRef}
      id={EMBED_FRAME_ID}
      className="andersen-embed-frame"
      src={CONFIGURATOR_SRC}
      title={`${PARTNER_NAME} configurator`}
      width="100%"
      height={EMBED_FALLBACK_HEIGHT}
      loading="lazy"
    />
  );
}
