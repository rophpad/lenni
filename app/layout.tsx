import type { Metadata } from "next";
import { Figtree, IBM_Plex_Mono, Poppins, Plus_Jakarta_Sans } from "next/font/google";

import { THEME_INIT_SCRIPT } from "./components/theme-toggle";
import { Providers } from "./providers";
import "./globals.css";

import { Analytics } from '@vercel/analytics/next';

/* Display — Poppins at 700/800. Geometric, round and loud: headings
   should feel like a friendly shout, not a magazine masthead. */
const display = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

/* Body — Figtree. Same geometric family feel, but comfortable at 15px. */
const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

/* Mono is reserved for figures: dates, percentages, counters. */
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const heading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
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
      className={`scroll-smooth ${display.variable} ${sans.variable} ${mono.variable} ${heading.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Applies the stored theme before first paint so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-page font-sans text-foreground antialiased">
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
