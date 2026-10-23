import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Urban Mobility DB — Traffic Pattern Analysis",
  description:
    "Advanced SQL powered urban traffic analytics platform. Relational database design, complex JOINs, subqueries, CTEs, window functions, views, materialized views and spatio-temporal analysis.",
  keywords: [
    "Advanced SQL",
    "Urban Mobility",
    "Traffic Pattern Analysis",
    "Database",
    "CTE",
    "Window Functions",
    "Materialized Views",
    "PostgreSQL",
  ],
  authors: [{ name: "Urban Mobility Research" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="bottom-right" theme="light" />
      </body>
    </html>
  );
}
