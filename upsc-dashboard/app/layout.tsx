import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import RecordsProvider from "./providers/RecordsProvider";
import "@/styles/globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UPSC Practice Dashboard",
  description: "Adaptive Practice Intelligence",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${sora.variable}`}>
        <Providers>
          <div className="app-frame">
            <Navbar />
            <RecordsProvider>{children}</RecordsProvider>
          </div>
        </Providers>
      </body>
    </html>
  );
}
