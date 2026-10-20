import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jorritenrenee.nl"),
  // Geen beschrijving en een onzichtbare og:title (U+2800, braille-spatie): het WhatsApp-linkvoorbeeld
  // toont dan alleen de afbeelding. Zonder og:title zou WhatsApp het webadres als titel tonen.
  title: "Jorrit & Renee",
  openGraph: {
    title: "⠀",
    locale: "nl_NL",
    type: "website",
    images: [{ url: "/og-image.jpg?v=3", width: 1200, height: 630, alt: "Jorrit & Renee — 2 Juli 2027" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
