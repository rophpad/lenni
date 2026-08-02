import type { Metadata } from "next";
import { Figtree } from "next/font/google";

import "./globals.css";

const font = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lenni — Your AI Career Copilot",
  description: "A career roadmap built from your actual experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`min-h-screen overflow-x-hidden bg-page font-sans text-foreground antialiased ${font.className}`}>
        {children}
      </body>
    </html>
  );
}
