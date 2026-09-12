/**
 * Rasterizes the Navia brand icon into every icon size the app needs —
 * favicons, PWA manifest icons and Android launcher/adaptive icons.
 *
 * Run after replacing public/icons/icon-512.png:
 *   npm run icons
 */
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = path.join(root, 'public/icons');
const iconPng = path.join(iconsDir, 'icon-512.png');

// PWA / favicon / apple-touch sizes rendered from the full mark (stone plaque background baked in).
const WEB_SIZES = [16, 32, 48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384];

// Android launcher (legacy square/round) and adaptive-icon foreground sizes, keyed by density bucket.
const ANDROID_DENSITIES = {
  mdpi: { launcher: 48, foreground: 108 },
  hdpi: { launcher: 72, foreground: 162 },
  xhdpi: { launcher: 96, foreground: 216 },
  xxhdpi: { launcher: 144, foreground: 324 },
  xxxhdpi: { launcher: 192, foreground: 432 },
};

// Adaptive icons crop to a circle/squircle inset from the canvas.
const PWA_SAFE_ZONE = 0.8;
const ANDROID_SAFE_ZONE = 0.62;
const ICON_BACKGROUND = '#241b13';

async function renderPng(source, size, outPath, { safeZone, background, round } = {}) {
  let pipeline = sharp(source).resize(size, size, { fit: 'contain' });
  if (safeZone) {
    const inner = Math.round(size * safeZone);
    const inset = await sharp(source).resize(inner, inner, { fit: 'contain' }).png().toBuffer();
    pipeline = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
      },
    }).composite([{ input: inset, gravity: 'center' }]);
  } else if (background) {
    pipeline = pipeline.flatten({ background });
  }
  if (round) {
    const circleMask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`,
    );
    pipeline = pipeline.composite([{ input: circleMask, blend: 'dest-in' }]);
  }
  await pipeline.png().toFile(outPath);
  console.log('wrote', path.relative(root, outPath));
}

async function main() {
  await mkdir(iconsDir, { recursive: true });

  // Keep the canonical 512px source untouched so repeated runs never
  // resample it or add another layer of safe-zone padding.
  const source = await readFile(iconPng);

  for (const size of WEB_SIZES) {
    await renderPng(source, size, path.join(iconsDir, `icon-${size}.png`));
  }
  // Maskable icons need an opaque canvas and artwork inside the mask safe zone.
  await renderPng(source, 512, path.join(iconsDir, 'icon-maskable-512.png'), {
    safeZone: PWA_SAFE_ZONE,
    background: ICON_BACKGROUND,
  });

  for (const [density, { launcher, foreground }] of Object.entries(ANDROID_DENSITIES)) {
    const resDir = path.join(root, 'android/app/src/main/res', `mipmap-${density}`);
    await renderPng(source, launcher, path.join(resDir, 'ic_launcher.png'));
    await renderPng(source, launcher, path.join(resDir, 'ic_launcher_round.png'), { round: true });
    await renderPng(source, foreground, path.join(resDir, 'ic_launcher_foreground.png'), {
      safeZone: ANDROID_SAFE_ZONE,
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
