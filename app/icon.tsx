import { ImageResponse } from "next/og";
import { BRAND, THEME } from "@/lib/constants";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon — cyan brand ember on deep space.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: THEME.background,
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: THEME.glow,
            boxShadow: `0 0 10px ${THEME.glow}`,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
