import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adam's Trading Bot — Gold",
  description: "Automated momentum breakout system for gold futures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
