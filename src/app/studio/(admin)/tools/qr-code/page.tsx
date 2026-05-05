import { QrCodeGenerator } from "@/components/studio/qr-code-generator";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "QR Code Generator | Eltronic Studio",
};

export default function StudioQrCodeToolPage() {
  return (
    <div className="qr-tool-shell">
      <section className="studio-page-header">
        <p>Create QR codes for links, text and Wi-Fi networks with simple Studio-safe styling controls.</p>
      </section>

      <QrCodeGenerator />
    </div>
  );
}
