import { ImageResponse } from "next/og";

export const alt = "Eltronic systems integration, HMI and software engineering";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background:
            "radial-gradient(circle at 18% 18%, rgba(103, 232, 249, 0.28), transparent 28%), radial-gradient(circle at 82% 22%, rgba(192, 132, 252, 0.32), transparent 30%), linear-gradient(135deg, #020617 0%, #0f172a 52%, #111827 100%)",
          color: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial",
          height: "100%",
          justifyContent: "space-between",
          padding: "76px",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(148, 163, 184, 0.28)",
            borderRadius: "36px",
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            justifyContent: "space-between",
            padding: "58px",
          }}
        >
          <div style={{ color: "#67e8f9", display: "flex", fontSize: 30, letterSpacing: "0.18em" }}>
            SYSTEMS.INTEGRATION
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                background: "linear-gradient(90deg, #67e8f9, #c084fc, #fbbf24)",
                backgroundClip: "text",
                color: "transparent",
                display: "flex",
                fontSize: 104,
                fontWeight: 800,
                letterSpacing: "-0.05em",
                lineHeight: 0.92,
              }}
            >
              Eltronic
            </div>
            <div style={{ color: "#cbd5e1", display: "flex", fontSize: 42, maxWidth: 850 }}>
              Rugged HMI, CAN-Bus data, control integration and software systems.
            </div>
          </div>
          <div style={{ color: "#94a3b8", display: "flex", fontSize: 28 }}>eltronic.co.uk</div>
        </div>
      </div>
    ),
    size,
  );
}
