import type { Metadata } from "next";
import "./globals.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

export const metadata: Metadata = {
  title: "Hikmet Gulsesli — Developer Portal",
  description: "Developer portfolio and project showcase for Hikmet Gulsesli",
  keywords: ["developer", "portfolio", "web development", "React", "Next.js"],
  authors: [{ name: "Hikmet Gulsesli" }],
  openGraph: {
    title: "Hikmet Gulsesli — Developer Portal",
    description: "Developer portfolio and project showcase for Hikmet Gulsesli",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hikmet Gulsesli — Developer Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hikmet Gulsesli — Developer Portal",
    description: "Developer portfolio and project showcase for Hikmet Gulsesli",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
