import {
  InteractiveCodeMark,
  type CodeMarkMotif,
  type CodeMarkTheme,
} from "@/components/site/interactive-code-mark";

type TechnicalVisualVariant = "network" | "display" | "sectors" | "data";

export function TechnicalVisual({
  codeMark = false,
  codeMotif = "code",
  codeTheme = "magenta",
  label,
  variant,
}: {
  codeMark?: boolean;
  codeMotif?: CodeMarkMotif;
  codeTheme?: CodeMarkTheme;
  label: string;
  variant: TechnicalVisualVariant;
}) {
  const isCodeMark = codeMark && variant === "display";

  if (isCodeMark) {
    return <InteractiveCodeMark label={label} motif={codeMotif} theme={codeTheme} />;
  }

  return (
    <figure className={`technical-visual ${variant}`}>
      <svg aria-label={label} viewBox="0 0 720 460" role="img">
        <defs>
          <linearGradient id={`${variant}-line`} x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#8bd3ff" />
            <stop offset="55%" stopColor="#b7a3ff" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <radialGradient id={`${variant}-glow`} cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#8bd3ff" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect className="visual-bg" width="720" height="460" rx="28" />
        <rect fill={`url(#${variant}-glow)`} width="720" height="460" rx="28" />
        <path className="visual-grid" d="M60 80H660M60 150H660M60 220H660M60 290H660M60 360H660M120 40V420M220 40V420M320 40V420M420 40V420M520 40V420M620 40V420" />
        {variant === "display" ? <DisplayVisual id={variant} /> : null}
        {variant === "network" ? <NetworkVisual id={variant} /> : null}
        {variant === "sectors" ? <SectorsVisual id={variant} /> : null}
        {variant === "data" ? <DataVisual id={variant} /> : null}
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function DisplayVisual({ id }: { id: string }) {
  return (
    <>
      <rect className="visual-device" x="170" y="92" width="380" height="250" rx="26" />
      <rect className="visual-screen" x="205" y="124" width="310" height="186" rx="16" />
      <path className="visual-line" d="M238 262L304 202L358 238L426 168L484 218" stroke={`url(#${id}-line)`} />
      <circle className="visual-node" cx="304" cy="202" r="8" />
      <circle className="visual-node" cx="426" cy="168" r="8" />
      <path className="visual-softkey" d="M150 144H118M150 198H118M150 252H118M570 144H602M570 198H602M570 252H602" />
      <circle className="visual-accent" cx="545" cy="354" r="34" />
    </>
  );
}

function NetworkVisual({ id }: { id: string }) {
  return (
    <>
      <path className="visual-line" d="M170 230H550M250 150V310M360 120V340M470 150V310" stroke={`url(#${id}-line)`} />
      {[
        [170, 230],
        [250, 150],
        [250, 310],
        [360, 120],
        [360, 340],
        [470, 150],
        [470, 310],
        [550, 230],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle className="visual-node-halo" cx={cx} cy={cy} r="34" />
          <circle className="visual-node" cx={cx} cy={cy} r="12" />
        </g>
      ))}
      <rect className="visual-device small" x="286" y="194" width="148" height="72" rx="18" />
      <text className="visual-text" x="360" y="238" textAnchor="middle">
        CAN
      </text>
    </>
  );
}

function SectorsVisual({ id }: { id: string }) {
  return (
    <>
      <circle className="visual-node-halo" cx="360" cy="230" r="94" />
      <circle className="visual-accent" cx="360" cy="230" r="54" />
      <path className="visual-line" d="M360 230L190 132M360 230L548 138M360 230L198 332M360 230L548 328" stroke={`url(#${id}-line)`} />
      {[
        [190, 132, "AG"],
        [548, 138, "CN"],
        [198, 332, "LG"],
        [548, 328, "IN"],
      ].map(([cx, cy, text]) => (
        <g key={`${cx}-${cy}`}>
          <rect className="visual-device small" x={Number(cx) - 46} y={Number(cy) - 32} width="92" height="64" rx="18" />
          <text className="visual-text" x={cx} y={Number(cy) + 6} textAnchor="middle">
            {text}
          </text>
        </g>
      ))}
    </>
  );
}

function DataVisual({ id }: { id: string }) {
  return (
    <>
      <rect className="visual-device" x="130" y="98" width="210" height="270" rx="22" />
      <path className="visual-softkey" d="M172 158H302M172 206H276M172 254H304M172 302H250" />
      <rect className="visual-device" x="398" y="120" width="190" height="222" rx="22" />
      <path className="visual-line" d="M338 188C374 188 376 188 404 188M338 272C374 272 376 272 404 272" stroke={`url(#${id}-line)`} />
      <circle className="visual-node" cx="370" cy="188" r="8" />
      <circle className="visual-node" cx="370" cy="272" r="8" />
      <path className="visual-line" d="M434 278L474 214L512 246L552 174" stroke={`url(#${id}-line)`} />
    </>
  );
}
