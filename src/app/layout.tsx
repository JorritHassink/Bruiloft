import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jorrit & Renee — 2 Juli 2027",
  description: "Wij gaan trouwen! RSVP voor onze bruiloft op 2 juli 2027.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
