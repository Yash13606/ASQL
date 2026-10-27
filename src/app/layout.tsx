import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASQL | Urban Mobility Traffic Analytics",
  description: "MySQL-backed analysis of the Bangalore traffic dataset with filtered analytics, advanced SQL, views, and index plans.",
  keywords: ["Advanced SQL", "Urban Mobility", "Traffic Analysis", "MySQL", "Bangalore Traffic Dataset"],
  authors: [{ name: "Urban Mobility Research" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased bg-background text-foreground">{children}</body></html>;
}
