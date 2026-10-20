// TIJDELIJK: test van het WhatsApp-linkvoorbeeld met korte titel en zonder beschrijving
import type { Metadata } from "next";
import Home from "../page";

export const metadata: Metadata = {
  title: "Jorrit & Renee",
  description: null,
  openGraph: {
    title: "Jorrit & Renee",
    images: [{ url: "/og-image.jpg?v=3", width: 1200, height: 630 }],
  },
};

export default Home;
