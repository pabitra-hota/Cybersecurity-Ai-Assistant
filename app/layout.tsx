import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "CyberShield AI — AI-Powered Cybersecurity Intelligence",
  description:
    "CyberShield AI is an AI-powered cybersecurity intelligence platform. Scan files, analyze URLs, get real-time threat news, and chat with an AI security expert.",
  keywords: [
    "cybersecurity",
    "AI",
    "threat intelligence",
    "malware scanner",
    "phishing detection",
    "VirusTotal",
  ],
  authors: [{ name: "Pabitra Ranjan Hota" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
