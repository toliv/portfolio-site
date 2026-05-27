import "./global.css";
import type { Metadata } from "next";
import { Recursive } from "next/font/google";
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

const recursive = Recursive({
  subsets: ["latin"],
  display: "swap",
  weight: "variable",
  axes: ["MONO", "CASL"],
});

const cx = (...classes) => classes.filter(Boolean).join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cx("text-black bg-white dark:text-white dark:bg-black")}
    >
      <body
        className={cx(
          recursive.className,
          "antialiased max-w-2xl mx-4 mt-8 lg:mx-auto"
        )}
      >
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
          <Navbar />
          {children}
          <Footer />
          <Analytics />
        </main>
      </body>
    </html>
  );
}
