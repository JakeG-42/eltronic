"use client";

import { useEffect, useRef } from "react";

type InteractiveCodeMarkProps = {
  label: string;
};

type MotionPoint = {
  angle: number;
  glowX: number;
  glowY: number;
  scrollY: number;
  x: number;
  y: number;
};

const neutralPoint: MotionPoint = {
  angle: 0,
  glowX: 50,
  glowY: 48,
  scrollY: 0,
  x: 0,
  y: 0,
};

export function InteractiveCodeMark({ label }: InteractiveCodeMarkProps) {
  const figureRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const figure = figureRef.current;

    if (!figure || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;
    const current = { ...neutralPoint };
    const target = { ...neutralPoint };

    const setTargetFromPointer = (clientX: number, clientY: number) => {
      const rect = figure.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      const normalizedX = clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const normalizedY = clamp(((clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      const distance = Math.min(1, Math.hypot(normalizedX, normalizedY));

      target.x = normalizedX * 30 * distance;
      target.y = normalizedY * 30 * distance;
      target.angle = Math.atan2(normalizedY, normalizedX) * (180 / Math.PI);
      target.glowX = 50 + normalizedX * 12;
      target.glowY = 48 + normalizedY * 10;
    };

    const setScrollTarget = () => {
      const rect = figure.getBoundingClientRect();
      const visualCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const distanceFromCenter = clamp((visualCenter - viewportCenter) / window.innerHeight, -1, 1);

      target.scrollY = distanceFromCenter * -18;
    };

    const resetPointerTarget = () => {
      target.x = 0;
      target.y = 0;
      target.angle = 0;
      target.glowX = neutralPoint.glowX;
      target.glowY = neutralPoint.glowY;
    };

    const animate = () => {
      current.x = lerp(current.x, target.x, 0.12);
      current.y = lerp(current.y, target.y, 0.12);
      current.scrollY = lerp(current.scrollY, target.scrollY, 0.08);
      current.angle = lerpAngle(current.angle, target.angle, 0.1);
      current.glowX = lerp(current.glowX, target.glowX, 0.1);
      current.glowY = lerp(current.glowY, target.glowY, 0.1);

      figure.style.setProperty("--code-core-x", `${current.x.toFixed(2)}px`);
      figure.style.setProperty("--code-core-y", `${current.y.toFixed(2)}px`);
      figure.style.setProperty("--code-scroll-y", `${current.scrollY.toFixed(2)}px`);
      figure.style.setProperty("--code-mark-angle", `${current.angle.toFixed(2)}deg`);
      figure.style.setProperty("--code-glow-x", `${current.glowX.toFixed(2)}%`);
      figure.style.setProperty("--code-glow-y", `${current.glowY.toFixed(2)}%`);

      frame = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => setTargetFromPointer(event.clientX, event.clientY);

    figure.addEventListener("pointermove", handlePointerMove);
    figure.addEventListener("pointerleave", resetPointerTarget);
    window.addEventListener("scroll", setScrollTarget, { passive: true });
    window.addEventListener("resize", setScrollTarget);

    setScrollTarget();
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      figure.removeEventListener("pointermove", handlePointerMove);
      figure.removeEventListener("pointerleave", resetPointerTarget);
      window.removeEventListener("scroll", setScrollTarget);
      window.removeEventListener("resize", setScrollTarget);
    };
  }, []);

  return (
    <figure className="technical-visual display code-mark interactive-code-mark" ref={figureRef}>
      <svg aria-label={label} viewBox="0 0 720 720" role="img">
        <defs>
          <linearGradient id="display-line" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="55%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <radialGradient id="display-glow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#d946ef" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="visual-bg" cx="360" cy="360" r="330" />
        <circle fill="url(#display-glow)" cx="360" cy="360" r="330" />
        <path
          className="visual-grid visual-grid-radial"
          d="M140 360H580M360 140V580M204 204L516 516M516 204L204 516"
        />
        <circle className="visual-code-ring visual-code-ring-outer" cx="360" cy="360" r="238" />
        <circle className="visual-code-ring visual-code-ring-middle" cx="360" cy="360" r="184" />
        <path
          className="visual-code-arc"
          d="M188 360C208 258 278 188 360 188C442 188 512 258 532 360"
          stroke="url(#display-line)"
        />
        <path
          className="visual-code-arc reverse"
          d="M532 360C512 462 442 532 360 532C278 532 208 462 188 360"
          stroke="url(#display-line)"
        />
        <g className="visual-code-inner">
          <circle className="visual-code-core" cx="360" cy="360" r="132" />
          <text className="visual-code-mark" x="360" y="388" textAnchor="middle">
            <tspan>{"<"}</tspan>
            <tspan dx="20">{"/"}</tspan>
            <tspan dx="20">{">"}</tspan>
          </text>
        </g>
      </svg>
    </figure>
  );
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function lerpAngle(start: number, end: number, amount: number) {
  const delta = ((((end - start) % 360) + 540) % 360) - 180;

  return start + delta * amount;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
