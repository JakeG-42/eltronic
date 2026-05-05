import config from "@payload-config";
import "@payloadcms/next/css";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import type { Metadata } from "next";
import type { ServerFunctionClient } from "payload";
import React from "react";

import { siteConfig } from "@/lib/seo";
import { importMap } from "./console/importMap.js";
import "./custom.scss";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Eltronic Console",
    template: "%s | Eltronic Console",
  },
  robots: {
    index: false,
    follow: false,
  },
};

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";

  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
);

export default Layout;
