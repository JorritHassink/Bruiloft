// TIJDELIJK: test van het WhatsApp-linkvoorbeeld met onzichtbare titel en zonder beschrijving
import type { Metadata } from "next";
import Home from "../page";

// U+2800 (braille-spatie): telt als tekst, maar is niet zichtbaar
const ONZICHTBAAR = "⠀";

export const metadata: Metadata = {
  title: ONZICHTBAAR,
  description: null,
  openGraph: {
    title: ONZICHTBAAR,
    images: [{ url: "/og-image.jpg?v=3", width: 1200, height: 630 }],
  },
};

export default Home;
