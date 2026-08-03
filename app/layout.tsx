import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Inter } from "next/font/google";

import { THEME_INIT_SCRIPT } from "./components/theme-toggle";
import "./globals.css";

/* Display — Fraunces variable. SOFT + WONK axes are what make the
   headings feel hand-set and warm rather than toy-like. */
const display = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* Mono is reserved for field-notebook labels: dates, percentages, kickers. */
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lenni — Your AI Career Copilot",
  description: "A career roadmap built from your actual experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${display.variable} ${sans.variable} ${mono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Applies the stored theme before first paint so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-page font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
