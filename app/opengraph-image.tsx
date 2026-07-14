import { ImageResponse } from "next/og";
import { BRAND, THEME } from "@/lib/constants";

export const alt = `${BRAND.name} — ${BRAND.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Open Graph card — brand-first, matches site atmosphere.
 */
export default function OpenGraphImage() {
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
          background: `radial-gradient(ellipse at 50% 0%, ${THEME.primary}55 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, ${THEME.ambientOrange}33 0%, transparent 45%), ${THEME.background}`,
          color: THEME.text,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 28,
            height: 28,
            borderRadius: 999,
            background: THEME.glow,
            boxShadow: `0 0 40px ${THEME.glow}`,
            marginBottom: 28,
          }}
        />
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {BRAND.name}
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 28,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {BRAND.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
