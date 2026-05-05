"use client";

import { Download, ImagePlus, Trash2, Wifi } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type QrMode = "text" | "wifi";
type DotStyle = "square" | "rounded" | "dots";
type WifiSecurity = "WPA" | "WEP" | "nopass";
type ExportFormat = "png" | "svg";

type QrCodeStylingInstance = {
  append: (element: HTMLElement) => void;
  update: (options: QrCodeOptions) => void;
  download: (options: { extension: ExportFormat; name: string }) => void;
};

type QrCodeConstructor = new (options: QrCodeOptions) => QrCodeStylingInstance;

type QrCodeOptions = {
  width: number;
  height: number;
  type: "svg";
  data: string;
  image?: string;
  margin: number;
  qrOptions: {
    errorCorrectionLevel: "H";
  };
  imageOptions: {
    hideBackgroundDots: boolean;
    imageSize: number;
    margin: number;
  };
  dotsOptions: {
    color: string;
    type: DotStyle;
  };
  cornersSquareOptions: {
    color: string;
    type: "square" | "extra-rounded" | "dot";
  };
  cornersDotOptions: {
    color: string;
    type: "square" | "dot";
  };
  backgroundOptions: {
    color: string;
  };
};

const dotStyleOptions: Array<{ label: string; value: DotStyle }> = [
  { label: "Square", value: "square" },
  { label: "Rounded", value: "rounded" },
  { label: "Circular", value: "dots" },
];

const securityOptions: Array<{ label: string; value: WifiSecurity }> = [
  { label: "WPA/WPA2", value: "WPA" },
  { label: "WEP", value: "WEP" },
  { label: "Open", value: "nopass" },
];

export function QrCodeGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QrCodeStylingInstance | null>(null);
  const qrConstructorRef = useRef<QrCodeConstructor | null>(null);
  const [mode, setMode] = useState<QrMode>("text");
  const [content, setContent] = useState("https://eltronic.co.uk");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState<WifiSecurity>("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);
  const [dotStyle, setDotStyle] = useState<DotStyle>("square");
  const [foregroundColor, setForegroundColor] = useState("#07111f");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [logoSize, setLogoSize] = useState(0.2);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const [isQrReady, setIsQrReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qrPayload = useMemo(() => {
    if (mode === "wifi") {
      return buildWifiQrPayload({
        hidden: wifiHidden,
        password: wifiPassword,
        security: wifiSecurity,
        ssid: wifiSsid,
      });
    }

    return content.trim();
  }, [content, mode, wifiHidden, wifiPassword, wifiSecurity, wifiSsid]);

  const canExport = mode === "wifi" ? Boolean(wifiSsid.trim()) : Boolean(content.trim());
  const qrOptions = useMemo(
    () =>
      createQrOptions({
        backgroundColor,
        data: qrPayload || " ",
        dotStyle,
        foregroundColor,
        logoDataUrl,
        logoSize,
      }),
    [backgroundColor, dotStyle, foregroundColor, logoDataUrl, logoSize, qrPayload],
  );

  useEffect(() => {
    let mounted = true;

    async function loadQrCode() {
      const qrModule = await import("qr-code-styling");

      if (!mounted) {
        return;
      }

      qrConstructorRef.current = qrModule.default as QrCodeConstructor;
      setIsLibraryLoaded(true);
    }

    loadQrCode();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLibraryLoaded || !previewRef.current || !qrConstructorRef.current) {
      return;
    }

    if (!qrCodeRef.current) {
      qrCodeRef.current = new qrConstructorRef.current(qrOptions);
      previewRef.current.innerHTML = "";
      qrCodeRef.current.append(previewRef.current);
      setIsQrReady(true);
      return;
    }

    qrCodeRef.current.update(qrOptions);
  }, [isLibraryLoaded, qrOptions]);

  function handleLogoUpload(file?: File) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setLogoDataUrl(typeof reader.result === "string" ? reader.result : "");
    });
    reader.readAsDataURL(file);
  }

  function downloadQrCode(extension: ExportFormat) {
    if (!canExport || !isQrReady) {
      return;
    }

    qrCodeRef.current?.download({
      extension,
      name: `eltronic-${mode === "wifi" ? "wifi" : "qr"}-code`,
    });
  }

  return (
    <div className="qr-tool-grid">
      <section className="studio-form-section qr-tool-controls qr-tool-content">
        <div className="studio-form-section-header">
          <div>
            <span className="studio-eyebrow">qr.input</span>
            <h2>Content</h2>
            <p>Choose the QR payload and keep the scan target simple.</p>
          </div>
        </div>

        <div className="qr-segmented-control" role="group" aria-label="QR code type">
          <button className={mode === "text" ? "active" : undefined} type="button" onClick={() => setMode("text")}>
            Link / text
          </button>
          <button className={mode === "wifi" ? "active" : undefined} type="button" onClick={() => setMode("wifi")}>
            <Wifi className="size-4" />
            Wi-Fi
          </button>
        </div>

        {mode === "wifi" ? (
          <div className="qr-field-stack">
            <div className="grid gap-2">
              <Label htmlFor="qr-wifi-ssid">Network name</Label>
              <Input
                autoComplete="off"
                id="qr-wifi-ssid"
                onChange={(event) => setWifiSsid(event.target.value)}
                placeholder="Guest Wi-Fi"
                value={wifiSsid}
              />
            </div>

            <div className="builder-field-grid">
              <div className="grid gap-2">
                <Label htmlFor="qr-wifi-security">Security</Label>
                <select
                  className="builder-select"
                  id="qr-wifi-security"
                  onChange={(event) => setWifiSecurity(event.target.value as WifiSecurity)}
                  value={wifiSecurity}
                >
                  {securityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="qr-wifi-password">Password</Label>
                <Input
                  autoComplete="new-password"
                  disabled={wifiSecurity === "nopass"}
                  id="qr-wifi-password"
                  onChange={(event) => setWifiPassword(event.target.value)}
                  type="text"
                  value={wifiSecurity === "nopass" ? "" : wifiPassword}
                />
              </div>
            </div>

            <label className="qr-toggle-row">
              <input checked={wifiHidden} onChange={(event) => setWifiHidden(event.target.checked)} type="checkbox" />
              <span>Hidden network</span>
            </label>
          </div>
        ) : (
          <div className="grid gap-2">
            <Label htmlFor="qr-content">URL or text</Label>
            <Textarea
              id="qr-content"
              onChange={(event) => setContent(event.target.value)}
              value={content}
            />
          </div>
        )}
      </section>

      <section className="studio-form-section qr-tool-controls qr-tool-style">
        <div className="studio-form-section-header">
          <div>
            <span className="studio-eyebrow">qr.style</span>
            <h2>Style</h2>
            <p>Use high contrast for anything that will be printed or placed on equipment.</p>
          </div>
        </div>

        <div className="qr-field-stack">
          <div className="grid gap-2">
            <Label>Dots</Label>
            <div className="qr-segmented-control" role="group" aria-label="QR dot style">
              {dotStyleOptions.map((option) => (
                <button
                  className={dotStyle === option.value ? "active" : undefined}
                  key={option.value}
                  type="button"
                  onClick={() => setDotStyle(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="builder-color-row qr-color-row">
            <label className="builder-color-field">
              <span>Foreground</span>
              <input
                aria-label="QR foreground colour"
                type="color"
                value={foregroundColor}
                onChange={(event) => setForegroundColor(event.target.value)}
              />
            </label>
            <label className="builder-color-field">
              <span>Background</span>
              <input
                aria-label="QR background colour"
                type="color"
                value={backgroundColor}
                onChange={(event) => setBackgroundColor(event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-2">
            <Label>Centre logo</Label>
            <div className="qr-logo-row">
              <input
                accept="image/*"
                className="sr-only"
                ref={fileInputRef}
                type="file"
                onChange={(event) => handleLogoUpload(event.target.files?.[0])}
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <ImagePlus className="size-4" />
                Upload
              </Button>
              {logoDataUrl ? (
                <Button type="button" variant="ghost" onClick={() => setLogoDataUrl("")}>
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              ) : null}
            </div>
          </div>

          <label className={cn("qr-slider-field", !logoDataUrl && "is-disabled")}>
            <span>Logo size</span>
            <input
              disabled={!logoDataUrl}
              max="0.3"
              min="0.12"
              onChange={(event) => setLogoSize(Number(event.target.value))}
              step="0.01"
              type="range"
              value={logoSize}
            />
            <strong>{Math.round(logoSize * 100)}%</strong>
          </label>
        </div>
      </section>

      <aside className="qr-preview-panel">
        <div className="qr-preview-card">
          <div className="qr-preview-frame" ref={previewRef} aria-label="QR code preview" />
          {!canExport ? <p className="qr-preview-warning">Enter content before exporting.</p> : null}
          <div className="qr-export-actions">
            <Button disabled={!canExport || !isQrReady} type="button" onClick={() => downloadQrCode("png")}>
              <Download className="size-4" />
              PNG
            </Button>
            <Button disabled={!canExport || !isQrReady} type="button" variant="outline" onClick={() => downloadQrCode("svg")}>
              <Download className="size-4" />
              SVG
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function createQrOptions({
  backgroundColor,
  data,
  dotStyle,
  foregroundColor,
  logoDataUrl,
  logoSize,
}: {
  backgroundColor: string;
  data: string;
  dotStyle: DotStyle;
  foregroundColor: string;
  logoDataUrl: string;
  logoSize: number;
}): QrCodeOptions {
  const cornerStyle: "square" | "extra-rounded" | "dot" =
    dotStyle === "dots" ? "dot" : dotStyle === "rounded" ? "extra-rounded" : "square";

  return {
    backgroundOptions: {
      color: backgroundColor,
    },
    cornersDotOptions: {
      color: foregroundColor,
      type: dotStyle === "dots" ? "dot" : "square",
    },
    cornersSquareOptions: {
      color: foregroundColor,
      type: cornerStyle,
    },
    data,
    dotsOptions: {
      color: foregroundColor,
      type: dotStyle,
    },
    height: 320,
    image: logoDataUrl || undefined,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: logoSize,
      margin: 8,
    },
    margin: 16,
    qrOptions: {
      errorCorrectionLevel: "H",
    },
    type: "svg",
    width: 320,
  };
}

function buildWifiQrPayload({
  hidden,
  password,
  security,
  ssid,
}: {
  hidden: boolean;
  password: string;
  security: WifiSecurity;
  ssid: string;
}) {
  const fields = [`T:${security}`, `S:${escapeWifiValue(ssid.trim())}`];

  if (security !== "nopass") {
    fields.push(`P:${escapeWifiValue(password)}`);
  }

  if (hidden) {
    fields.push("H:true");
  }

  return `WIFI:${fields.join(";")};;`;
}

function escapeWifiValue(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/:/g, "\\:")
    .replace(/"/g, '\\"');
}
