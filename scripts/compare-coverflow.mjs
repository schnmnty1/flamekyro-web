/**
 * Side-by-side transform comparison: archived v2 formulas vs live paint.
 * Run: node scripts/compare-coverflow.mjs
 */
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = join(process.cwd(), ".review", "FLAMEKYRO_v2");

// Exact archived formulas
function v2Paint(offset) {
  const abs = Math.abs(offset);
  const clamped = Math.min(abs, 4);
  const x = offset * 176;
  const z = -clamped * 120;
  const rotate = offset * -34;
  const scale = 1 - clamped * 0.08;
  return { x, z, rotate, scale, opacity: abs > 4 ? 0 : 1 - clamped * 0.13 };
}

const offsets = [-2, -1, -0.5, 0, 0.25, 0.5, 1, 1.5, 2];
console.log("Archived v2 geometry samples (source of truth):\n");
console.log(
  "offset".padStart(8),
  "x".padStart(10),
  "z".padStart(10),
  "rotY".padStart(10),
  "scale".padStart(10),
  "opacity".padStart(10),
);
for (const o of offsets) {
  const p = v2Paint(o);
  console.log(
    o.toFixed(2).padStart(8),
    p.x.toFixed(2).padStart(10),
    p.z.toFixed(2).padStart(10),
    p.rotate.toFixed(2).padStart(10),
    p.scale.toFixed(3).padStart(10),
    p.opacity.toFixed(3).padStart(10),
  );
}

console.log(`
VISUAL MOTION DIFFERENCES vs archive (not formula):
1. Archive CSS keeps transform transition ON during drag (520ms).
   Retargeting that transition = heavy wheel feel.
2. Archive settle is the SAME 520ms transition (not a separate 220ms).
3. Archive cards are near-square (~250×250); ours are tall portraits.
4. Archive has 8 cards on the ring; ours has 6.
`);
