import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jorritenrenee.nl"),
  title: "Jorrit & Renee — 2 Juli 2027",
  description: "Wij gaan trouwen! Vier deze bijzondere dag met ons mee.",
  openGraph: {
    title: "Jorrit & Renee — 2 Juli 2027",
    description: "Wij gaan trouwen! Vier deze bijzondere dag met ons mee.",
    siteName: "Jorrit & Renee",
    locale: "nl_NL",
    type: "website",
    images: [{ url: "/og-image.jpg?v=2", width: 1200, height: 630, alt: "Jorrit & Renee — 2 Juli 2027" }],
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
