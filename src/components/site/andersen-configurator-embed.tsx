"use client";

import { useEffect, useRef } from "react";

const EMBED_FRAME_ID = "aev-configurator-eltronic-mIoUmiNY";
const CONFIGURATOR_SRC =
  "https://priceless-configurator-gw3ist28b-andersen-ev.vercel.app/customiser/eltronic?token=mIoUmiNY2SvHSGi8CcM1O1KX2ju-U2S2";
const EMBED_RESIZE_SOURCE = "aev-configurator";
const EMBED_RESIZE_TYPE = "aev-configurator-resize";
const EMBED_FALLBACK_HEIGHT = 560;

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
      src={CONFIGURATOR_SRC}
      title="Eltronic configurator"
      width="100%"
      height={EMBED_FALLBACK_HEIGHT}
      style={{
        border: 0,
        borderRadius: "24px",
        overflow: "hidden",
        width: "100%",
        display: "block",
      }}
      loading="lazy"
    />
  );
}
