import { Fira_Code, Tajawal } from "next/font/google";

export const body = Tajawal({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-body",
});

export const code = Fira_Code({
  subsets: ["latin"],
  variable: "--font-code",
});
