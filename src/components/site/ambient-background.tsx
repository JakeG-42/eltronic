"use client";

import type { CSSProperties } from "react";

const glyphs = [
  { value: "[]", x: "7%", y: "18%", delay: "-2s", duration: "24s", driftX: "54px", driftY: "-88px", rotate: "-8deg" },
  { value: "{ }", x: "86%", y: "14%", delay: "-8s", duration: "29s", driftX: "-76px", driftY: "74px", rotate: "10deg" },
  { value: "</>", x: "18%", y: "42%", delay: "-12s", duration: "31s", driftX: "92px", driftY: "-58px", rotate: "6deg" },
  { value: "_", x: "78%", y: "46%", delay: "-4s", duration: "26s", driftX: "-68px", driftY: "-82px", rotate: "-12deg" },
  { value: "%", x: "11%", y: "78%", delay: "-15s", duration: "34s", driftX: "78px", driftY: "62px", rotate: "14deg" },
  { value: "&", x: "68%", y: "82%", delay: "-6s", duration: "28s", driftX: "-86px", driftY: "-66px", rotate: "8deg" },
  { value: "\\", x: "44%", y: "12%", delay: "-10s", duration: "33s", driftX: "56px", driftY: "96px", rotate: "-18deg" },
  { value: "=", x: "92%", y: "68%", delay: "-3s", duration: "25s", driftX: "-92px", driftY: "46px", rotate: "5deg" },
  { value: "<>", x: "34%", y: "72%", delay: "-18s", duration: "36s", driftX: "74px", driftY: "-92px", rotate: "-6deg" },
  { value: "\"", x: "54%", y: "36%", delay: "-7s", duration: "30s", driftX: "-54px", driftY: "78px", rotate: "16deg" },
  { value: "/", x: "4%", y: "56%", delay: "-13s", duration: "27s", driftX: "84px", driftY: "34px", rotate: "-20deg" },
  { value: "{", x: "58%", y: "8%", delay: "-16s", duration: "37s", driftX: "-72px", driftY: "96px", rotate: "12deg" },
  { value: "()", x: "27%", y: "16%", delay: "-21s", duration: "32s", driftX: "66px", driftY: "80px", rotate: "-10deg" },
  { value: "&&", x: "74%", y: "24%", delay: "-24s", duration: "35s", driftX: "-88px", driftY: "58px", rotate: "18deg" },
  { value: "=>", x: "48%", y: "88%", delay: "-19s", duration: "30s", driftX: "92px", driftY: "-70px", rotate: "4deg" },
] as const;

export function AmbientBackground() {
  return (
    <div className="ambient-background" aria-hidden="true">
      {glyphs.map((glyph, index) => (
        <span
          className="ambient-glyph"
          key={`${glyph.value}-${index}`}
          style={
            {
              "--glyph-x": glyph.x,
              "--glyph-y": glyph.y,
              "--glyph-delay": glyph.delay,
              "--glyph-duration": glyph.duration,
              "--glyph-drift-x": glyph.driftX,
              "--glyph-drift-y": glyph.driftY,
              "--glyph-rotate": glyph.rotate,
            } as CSSProperties
          }
        >
          {glyph.value}
        </span>
      ))}
    </div>
  );
}
