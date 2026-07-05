/**
 * Rasterizes the Navia brand mark into every icon size the app needs —
 * favicons, PWA manifest icons and Android launcher/adaptive icons.
 *
 * Run after editing public/art/branding/navia-mark*.svg:
 *   npm run icons
 */
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const markSvg = path.join(root, 'public/art/branding/navia-mark.svg');
const foregroundSvg = path.join(root, 'public/art/branding/navia-mark-foreground.svg');
const iconsDir = path.join(root, 'public/icons');

// PWA / favicon / apple-touch sizes rendered from the full mark (stone plaque background baked in).
const WEB_SIZES = [16, 32, 48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512];

// Android launcher (legacy square/round) and adaptive-icon foreground sizes, keyed by density bucket.
const ANDROID_DENSITIES = {
  mdpi: { launcher: 48, foreground: 108 },
  hdpi: { launcher: 72, foreground: 162 },
  xhdpi: { launcher: 96, foreground: 216 },
  xxhdpi: { launcher: 144, foreground: 324 },
  xxxhdpi: { launcher: 192, foreground: 432 },
};

// Adaptive icons crop to a circle/squircle inset from the canvas — keep the glyph
// within Android's ~66% safe zone by padding the foreground render.
const FOREGROUND_SAFE_ZONE = 0.62;

async function renderPng(svgPath, size, outPath, { pad } = {}) {
  const svg = await readFile(svgPath);
  let pipeline = sharp(svg, { density: 384 }).resize(size, size, { fit: 'contain' });
  if (pad) {
    const inner = Math.round(size * FOREGROUND_SAFE_ZONE);
    pipeline = sharp(svg, { density: 384 })
      .resize(inner, inner, { fit: 'contain' })
      .extend({
        top: Math.floor((size - inner) / 2),
        bottom: Math.ceil((size - inner) / 2),
        left: Math.floor((size - inner) / 2),
        right: Math.ceil((size - inner) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
  }
  await pipeline.png().toFile(outPath);
  console.log('wrote', path.relative(root, outPath));
}

async function main() {
  await mkdir(iconsDir, { recursive: true });

  for (const size of WEB_SIZES) {
    await renderPng(markSvg, size, path.join(iconsDir, `icon-${size}.png`));
  }
  // Maskable variant for PWA install icons — same safe-zone padding as Android.
  await renderPng(markSvg, 512, path.join(iconsDir, 'icon-maskable-512.png'), { pad: true });

  for (const [density, { launcher, foreground }] of Object.entries(ANDROID_DENSITIES)) {
    const resDir = path.join(root, 'android/app/src/main/res', `mipmap-${density}`);
    await renderPng(markSvg, launcher, path.join(resDir, 'ic_launcher.png'));
    await renderPng(markSvg, launcher, path.join(resDir, 'ic_launcher_round.png'));
    await renderPng(foregroundSvg, foreground, path.join(resDir, 'ic_launcher_foreground.png'), { pad: true });
  }
}

main();
