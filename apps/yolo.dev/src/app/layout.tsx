import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@styles/globals.css";


const inter = Inter({ subsets: ["latin"] });

// Dynamically serve favicon via an API route or set up the metadata path to work from a served asset.
export const metadata: Metadata = {
  icons: {
    icon: "/api/favicon", // Dynamically served favicon
    apple: [
      { rel: "apple-touch-icon", url: "/api/icon?icon=icon.png", sizes: "192x192" },
      { rel: "apple-touch-icon", url: "/api/icon?icon=apple-icon.png", sizes: "512x512" },
    ],
  },
  manifest: "/manifest.json",
  title: "YOLO - Make Project Management Fun",
  description:
    "Your friendly project companion that makes managing projects fun and easy - perfect for everyone from students to CEOs!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
      <meta name="apple-mobile-web-app-title" content="YOLO" />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}