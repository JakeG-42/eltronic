"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const glyphs = [
  { value: "[]", x: "7%", y: "18%", delay: "-2s", duration: "18s", driftX: "12px", driftY: "-28px", rotate: "-8deg" },
  { value: "{ }", x: "86%", y: "14%", delay: "-8s", duration: "22s", driftX: "-18px", driftY: "24px", rotate: "10deg" },
  { value: "</>", x: "18%", y: "42%", delay: "-12s", duration: "24s", driftX: "22px", driftY: "-18px", rotate: "6deg" },
  { value: "_", x: "78%", y: "46%", delay: "-4s", duration: "19s", driftX: "-14px", driftY: "-24px", rotate: "-12deg" },
  { value: "%", x: "11%", y: "78%", delay: "-15s", duration: "26s", driftX: "18px", driftY: "18px", rotate: "14deg" },
  { value: "&", x: "68%", y: "82%", delay: "-6s", duration: "21s", driftX: "-20px", driftY: "-20px", rotate: "8deg" },
  { value: "\\", x: "44%", y: "12%", delay: "-10s", duration: "25s", driftX: "12px", driftY: "30px", rotate: "-18deg" },
  { value: "=", x: "92%", y: "68%", delay: "-3s", duration: "18s", driftX: "-24px", driftY: "12px", rotate: "5deg" },
  { value: "<>", x: "34%", y: "72%", delay: "-18s", duration: "27s", driftX: "16px", driftY: "-30px", rotate: "-6deg" },
  { value: "\"", x: "54%", y: "36%", delay: "-7s", duration: "23s", driftX: "-10px", driftY: "22px", rotate: "16deg" },
  { value: "/", x: "4%", y: "56%", delay: "-13s", duration: "20s", driftX: "20px", driftY: "10px", rotate: "-20deg" },
  { value: "{", x: "58%", y: "8%", delay: "-16s", duration: "28s", driftX: "-16px", driftY: "26px", rotate: "12deg" },
] as const;

export function AmbientBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const background = backgroundRef.current;

    if (!background || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let animationFrame = 0;

    function handlePointerMove(event: PointerEvent) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const target = backgroundRef.current;

        if (!target) {
          return;
        }

        target.style.setProperty("--ambient-x", `${event.clientX}px`);
        target.style.setProperty("--ambient-y", `${event.clientY}px`);
      });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div className="ambient-background" ref={backgroundRef} aria-hidden="true">
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
