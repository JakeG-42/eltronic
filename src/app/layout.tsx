import type { Metadata } from "next";
import { Fira_Code, Tajawal } from "next/font/google";
import "./globals.css";

const body = Tajawal({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-body",
});

const code = Fira_Code({
  subsets: ["latin"],
  variable: "--font-code",
});

export const metadata: Metadata = {
  title: "Eltronic",
  description:
    "Systems integration, HMI displays, CAN data logging and specialist equipment control solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${code.variable}`}>
        {children}
      </body>
    </html>
  );
}
