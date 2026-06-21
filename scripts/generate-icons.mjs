// Rasterize public/favicon.svg into the PNG icons referenced by the PWA manifest
// and index.html. Run with `bun run icons` (or `node scripts/generate-icons.mjs`).
//
// Outputs:
//   public/icons/icon-192.png
//   public/icons/icon-512.png
//   public/icons/icon-maskable-512.png   (safe-zone padded for Android cropping)
//   public/icons/apple-touch-icon-180.png

import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, "..", "public");
const ICONS = resolve(PUBLIC, "icons");

async function main() {
  await mkdir(ICONS, { recursive: true });
  const svg = await readFile(resolve(PUBLIC, "favicon.svg"));

  const flat = async (size) =>
    sharp(svg, { density: 384 }).resize(size, size, { fit: "contain" }).png();

  await (await flat(192)).toFile(resolve(ICONS, "icon-192.png"));
  await (await flat(512)).toFile(resolve(ICONS, "icon-512.png"));
  await (await flat(180)).toFile(resolve(ICONS, "apple-touch-icon-180.png"));

  // Maskable: render the mark at ~62% inside a solid 512 square (safe zone).
  const inner = Math.round(512 * 0.62);
  const mark = await sharp(svg, { density: 384 })
    .resize(inner, inner, { fit: "contain" })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 3, g: 105, b: 161, alpha: 1 }, // #0369a1
    },
  })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toFile(resolve(ICONS, "icon-maskable-512.png"));

  console.log("PWA icons generated in public/icons/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
