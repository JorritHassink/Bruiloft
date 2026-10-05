import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Voorbeeldafbeelding bij het delen van een link (WhatsApp, Facebook, etc.).
// Wordt bij de build gegenereerd als /og-image.png en in layout.tsx gekoppeld.
export const dynamic = "force-static";

const size = { width: 1200, height: 630 };

export async function GET() {
  const fonts = join(process.cwd(), "assets/fonts");
  const [serifLight, serifItalic, sans] = await Promise.all([
    readFile(join(fonts, "cormorant-garamond-latin-300-normal.woff")),
    readFile(join(fonts, "cormorant-garamond-latin-400-italic.woff")),
    readFile(join(fonts, "jost-latin-400-normal.woff")),
  ]);

  const goldLine = (direction: "left" | "right") => (
    <div
      style={{
        width: 120,
        height: 2,
        background: `linear-gradient(to ${direction}, rgba(196,162,101,0), #c4a265)`,
      }}
    />
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom, #f5efe6, #fdfbf7 55%, #f8f3eb)",
          position: "relative",
        }}
      >
        {/* Zachte kleurvlekken, zoals op de site */}
        <div
          style={{
            position: "absolute", top: -220, right: -180, width: 620, height: 620, borderRadius: 9999,
            background: "radial-gradient(circle, rgba(240,221,210,0.9), rgba(240,221,210,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: -260, left: -200, width: 640, height: 640, borderRadius: 9999,
            background: "radial-gradient(circle, rgba(212,222,206,0.8), rgba(212,222,206,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 4,
            background: "linear-gradient(to right, rgba(196,162,101,0), #c4a265, rgba(196,162,101,0))",
          }}
        />

        <div style={{ fontFamily: "Jost", fontSize: 26, letterSpacing: 10, color: "#c4967a", marginBottom: 28 }}>
          WIJ GAAN TROUWEN
        </div>

        <div style={{ display: "flex", alignItems: "center", fontFamily: "Cormorant", fontSize: 150, color: "#3d3229", lineHeight: 1 }}>
          <span>Jorrit</span>
          <span style={{ fontFamily: "Cormorant Italic", fontStyle: "italic", color: "#c4a265", fontSize: 110, margin: "0 36px" }}>&amp;</span>
          <span>Renee</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 40, gap: 28 }}>
          {goldLine("right")}
          <div style={{ fontFamily: "Jost", fontSize: 30, letterSpacing: 8, color: "#8a7e72" }}>2 JULI 2027</div>
          {goldLine("left")}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Cormorant", data: serifLight, style: "normal", weight: 300 },
        { name: "Cormorant Italic", data: serifItalic, style: "italic", weight: 400 },
        { name: "Jost", data: sans, style: "normal", weight: 400 },
      ],
    }
  );
}
