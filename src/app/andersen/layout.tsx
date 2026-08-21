import type { Metadata } from "next";

import { body, code } from "@/app/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Andersen",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AndersenLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${code.variable}`}>{children}</body>
    </html>
  );
}
