import "./global.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "./components/nav";
import { Analytics } from "@vercel/analytics/react";
import Footer from "./components/footer";
import { baseUrl } from "./sitemap";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Tony Oliverio",
    template: "%s | personal site",
  },
  description: "This is my personal website",
  openGraph: {
    title: "Tony Oliverio",
    description: "This is my portfolio.",
    url: baseUrl,
    siteName: "My Portfolio",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const charter = localFont({
  src: [
    { path: "./fonts/charter/charter_regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/charter/charter_italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/charter/charter_bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/charter/charter_bold_italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-charter",
  display: "swap",
});

// Apply an explicit saved preference before paint; first-time visitors get light mode.
const themeScript = `try {
  document.documentElement.dataset.theme = localStorage.getItem("theme") === "dark" ? "dark" : "light";
} catch {}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" className={charter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div className="site-shell">
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
