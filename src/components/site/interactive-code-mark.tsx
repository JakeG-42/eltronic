"use client";

import { useEffect, useId, useRef } from "react";
import type { CSSProperties } from "react";

type InteractiveCodeMarkProps = {
  label: string;
  motif?: CodeMarkMotif;
  theme?: CodeMarkTheme;
};

export type CodeMarkMotif = "code" | "data" | "sectors";
export type CodeMarkTheme = "amber" | "cyan" | "emerald" | "lime" | "magenta" | "teal" | "violet";

type MotionPoint = {
  angle: number;
  glowX: number;
  glowY: number;
  scrollY: number;
  x: number;
  y: number;
};

type CodeParticle = {
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
  opacity: number;
  radius: number;
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

const codeParticles: CodeParticle[] = [
  { x: 300, y: 304, radius: 2.2, opacity: 0.48, delay: -1.8, duration: 8.8, driftX: 8, driftY: -10 },
  { x: 392, y: 290, radius: 1.5, opacity: 0.34, delay: -5.4, duration: 10.6, driftX: -7, driftY: 8 },
  { x: 438, y: 344, radius: 1.9, opacity: 0.42, delay: -2.6, duration: 9.4, driftX: 6, driftY: 9 },
  { x: 278, y: 374, radius: 1.3, opacity: 0.3, delay: -6.2, duration: 11.2, driftX: 10, driftY: 5 },
  { x: 334, y: 418, radius: 2.4, opacity: 0.5, delay: -3.7, duration: 9.8, driftX: -6, driftY: -9 },
  { x: 424, y: 410, radius: 1.4, opacity: 0.32, delay: -7.1, duration: 12.4, driftX: -10, driftY: -6 },
  { x: 360, y: 274, radius: 1.2, opacity: 0.28, delay: -4.9, duration: 13, driftX: 4, driftY: 12 },
  { x: 256, y: 334, radius: 1.6, opacity: 0.38, delay: -8.3, duration: 10.2, driftX: 12, driftY: -4 },
  { x: 462, y: 382, radius: 1.1, opacity: 0.26, delay: -1.2, duration: 11.8, driftX: -9, driftY: 7 },
  { x: 316, y: 448, radius: 1.2, opacity: 0.3, delay: -9, duration: 12.8, driftX: 7, driftY: -11 },
  { x: 404, y: 452, radius: 1.7, opacity: 0.4, delay: -5.9, duration: 9.2, driftX: -8, driftY: -8 },
  { x: 452, y: 318, radius: 1.2, opacity: 0.3, delay: -10.1, duration: 13.6, driftX: -11, driftY: 3 },
  { x: 288, y: 424, radius: 1.1, opacity: 0.25, delay: -2.1, duration: 12.2, driftX: 8, driftY: -6 },
  { x: 334, y: 282, radius: 1.4, opacity: 0.33, delay: -6.8, duration: 10.8, driftX: -4, driftY: 11 },
  { x: 386, y: 426, radius: 1, opacity: 0.24, delay: -4.1, duration: 14, driftX: 6, driftY: -7 },
  { x: 266, y: 392, radius: 1.8, opacity: 0.42, delay: -11.2, duration: 9.6, driftX: 11, driftY: -8 },
];

export function InteractiveCodeMark({ label, motif = "code", theme = "magenta" }: InteractiveCodeMarkProps) {
  const codeMarkId = useId().replace(/:/g, "");
  const coreClipId = `code-core-${codeMarkId}`;
  const glowGradientId = `code-glow-${codeMarkId}`;
  const lineGradientId = `code-line-${codeMarkId}`;
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

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radius = Math.min(rect.width, rect.height) / 2;
      const normalizedX = clamp((clientX - centerX) / radius, -1, 1);
      const normalizedY = clamp((clientY - centerY) / radius, -1, 1);
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

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", setScrollTarget, { passive: true });
    window.addEventListener("resize", setScrollTarget);

    setScrollTarget();
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", setScrollTarget);
      window.removeEventListener("resize", setScrollTarget);
    };
  }, []);

  return (
    <figure
      className={`technical-visual display code-mark code-mark-${theme} code-mark-motif-${motif} interactive-code-mark`}
      ref={figureRef}
    >
      <svg aria-label={label} viewBox="0 0 720 720" role="img">
        <defs>
          <linearGradient id={lineGradientId} x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="var(--code-tone-light)" />
            <stop offset="55%" stopColor="var(--code-tone-mid)" />
            <stop offset="100%" stopColor="var(--code-tone-deep)" />
          </linearGradient>
          <radialGradient id={glowGradientId} cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="var(--code-tone-mid)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
          <clipPath id={coreClipId}>
            <circle cx="360" cy="360" r="126" />
          </clipPath>
        </defs>
        <circle className="visual-bg" cx="360" cy="360" r="330" />
        <circle fill={`url(#${glowGradientId})`} cx="360" cy="360" r="330" />
        <path
          className="visual-grid visual-grid-radial"
          d="M140 360H580M360 140V580M204 204L516 516M516 204L204 516"
        />
        <circle className="visual-code-ring visual-code-ring-outer" cx="360" cy="360" r="238" />
        <circle className="visual-code-ring visual-code-ring-middle" cx="360" cy="360" r="184" />
        <path
          className="visual-code-arc"
          d="M188 360C208 258 278 188 360 188C442 188 512 258 532 360"
          stroke={`url(#${lineGradientId})`}
        />
        <path
          className="visual-code-arc reverse"
          d="M532 360C512 462 442 532 360 532C278 532 208 462 188 360"
          stroke={`url(#${lineGradientId})`}
        />
        <g className="visual-code-inner">
          <circle className="visual-code-core" cx="360" cy="360" r="132" />
          <g className="visual-code-depth" clipPath={`url(#${coreClipId})`}>
            {codeParticles.map((particle) => (
              <circle
                className="visual-code-particle"
                cx={particle.x}
                cy={particle.y}
                key={`${particle.x}-${particle.y}`}
                r={particle.radius}
                style={
                  {
                    "--particle-delay": `${particle.delay}s`,
                    "--particle-drift-x": `${particle.driftX}px`,
                    "--particle-drift-y": `${particle.driftY}px`,
                    "--particle-duration": `${particle.duration}s`,
                    "--particle-opacity": particle.opacity,
                  } as CSSProperties
                }
              />
            ))}
          </g>
          {motif === "sectors" ? <SectorMotif lineGradientId={lineGradientId} /> : null}
          {motif === "data" ? <DataMotif lineGradientId={lineGradientId} /> : null}
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

function SectorMotif({ lineGradientId }: { lineGradientId: string }) {
  return (
    <g className="visual-code-motif visual-code-motif-sectors" aria-hidden="true">
      <path
        className="visual-code-motif-line"
        d="M360 360L288 310M360 360L434 310M360 360L290 420M360 360L436 420"
        stroke={`url(#${lineGradientId})`}
      />
      {[
        [288, 310],
        [434, 310],
        [290, 420],
        [436, 420],
      ].map(([cx, cy]) => (
        <circle className="visual-code-motif-node" cx={cx} cy={cy} key={`${cx}-${cy}`} r="8" />
      ))}
    </g>
  );
}

function DataMotif({ lineGradientId }: { lineGradientId: string }) {
  return (
    <g className="visual-code-motif visual-code-motif-data" aria-hidden="true">
      <path
        className="visual-code-motif-line"
        d="M296 304H424M296 334H392M328 416H424M360 304V416"
        stroke={`url(#${lineGradientId})`}
      />
      <rect className="visual-code-motif-frame" x="284" y="292" width="152" height="136" rx="20" />
      <circle className="visual-code-motif-node" cx="360" cy="304" r="6" />
      <circle className="visual-code-motif-node" cx="360" cy="416" r="6" />
    </g>
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
