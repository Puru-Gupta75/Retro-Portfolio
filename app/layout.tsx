import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SystemProvider } from "@/context/SystemContext";
import { SyncProvider } from "@/context/SyncContext";
import { Analytics } from "@vercel/analytics/next";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "PURU GUPTA",
  description: "High-fidelity 1980s CRT hardware simulation portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
      <body className="antialiased">
        <ErrorBoundary label="ROOT">
          <SystemProvider>
            <SyncProvider>
              <AppShell>
                {children}
              </AppShell>
            </SyncProvider>
          </SystemProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
