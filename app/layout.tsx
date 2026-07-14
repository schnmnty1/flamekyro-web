import type { Metadata, Viewport } from "next";
import { AmbientBackground } from "@/components/background";
import { Providers } from "@/components/common";
import { PageLayout } from "@/components/layout";
import { BRAND } from "@/lib/constants";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: BRAND.name,
    template: `%s | ${BRAND.name}`,
  },
  description: `${BRAND.name} — Official website of gaming creator ${BRAND.name}.`,
  applicationName: BRAND.name,
};

export const viewport: Viewport = {
  themeColor: "#050816",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-dvh bg-background text-text text-body">
        <Providers>
          <AmbientBackground />
          <PageLayout>{children}</PageLayout>
        </Providers>
      </body>
    </html>
  );
}
