/**
 * Renders the shared card back (public/art/frames/card-back.webp) in the
 * style of the Navia brand mark: a cracked, rune-carved stone plaque with a
 * worn rim, faint lava veins, and the lava "N" logo tile set in the middle.
 * The logo is taken from public/icons/icon-512.png, so re-run after the
 * brand icon changes:
 *   npm run card-back
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logoPng = path.join(root, 'public/icons/icon-512.png');
const out = path.join(root, 'public/art/frames/card-back.webp');

// 5:7 like every card face; 2× the largest on-screen size (Codex card).
const W = 600;
const H = 840;
const LOGO = 350;

// Elder Futhark runes as stroke paths in a 20×30 box.
const RUNES = [
  'M5 0V30M5 5L15 0M5 13L15 8', // fehu
  'M4 30V0L16 8V30', // uruz
  'M5 0V30M5 8L14 15L5 22', // thurisaz
  'M5 0V30M5 3L15 9M5 12L15 18', // ansuz
  'M5 30V0L15 7L5 14L15 30', // raido
  'M15 4L5 15L15 26', // kaunan
  'M3 3L17 27M17 3L3 27', // gebo
  'M5 30V0L15 7L5 14', // wunjo
  'M4 0V30M16 0V30M4 10L16 20', // hagalaz
  'M10 0V30M5 10L15 18', // naudiz
  'M10 0V30', // isa
  'M8 6L3 12L8 18M12 12L17 18L12 24', // jera
  'M10 0V30M10 0L16 6M10 30L4 24', // eihwaz
  'M10 30V0M10 10L3 2M10 10L17 2', // algiz
  'M14 0L5 12L15 18L6 30', // sowilo
  'M10 30V0M3 8L10 0L17 8', // tiwaz
  'M5 0V30M5 0L14 7L5 15L14 23L5 30', // berkanan
  'M4 30V0L10 8L16 0V30', // ehwaz
  'M4 30V0L16 14M16 30V0L4 14', // mannaz
  'M6 30V0L15 9', // laguz
  'M10 3L17 15L10 27L3 15Z', // ingwaz
  'M3 3V27L17 3V27L3 3', // dagaz
  'M3 30L15 12L10 3L5 12L17 30', // othala
];

// Deterministic pseudo-random so every run renders the same back.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

/** A carved rune: dark groove plus a faint lit lower edge. */
function rune(d, x, y, scale) {
  const t = `translate(${x} ${y}) scale(${scale})`;
  return `
    <path d="${d}" transform="${t} translate(0.6 0.8)" fill="none" stroke="#c9a77a" stroke-opacity="0.16" stroke-width="${2.6 / scale}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" transform="${t}" fill="none" stroke="#0d0907" stroke-opacity="0.82" stroke-width="${3 / scale}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** Runes spaced evenly along a straight run of the border band. */
function runeRow(x0, y0, x1, y1, count, scale) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const f = count === 1 ? 0.5 : i / (count - 1);
    const d = RUNES[Math.floor(rand() * RUNES.length)];
    s += rune(d, x0 + (x1 - x0) * f - 10 * scale, y0 + (y1 - y0) * f - 15 * scale, scale);
  }
  return s;
}

/** A jagged crack from (x, y) heading at `angle`. */
function crack(x, y, angle, length, steps) {
  let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
  for (let i = 0; i < steps; i++) {
    angle += (rand() - 0.5) * 0.9;
    x += Math.cos(angle) * (length / steps);
    y += Math.sin(angle) * (length / steps);
    d += `L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

const cx = W / 2;
const cy = H / 2;

const hairCracks = Array.from({ length: 14 }, () =>
  crack(40 + rand() * (W - 80), 40 + rand() * (H - 80), rand() * Math.PI * 2, 50 + rand() * 90, 6),
);
// Lava veins leaving the logo tile toward the rim.
const veins = [-2.5, -1.9, -0.6, 0.35, 1.25, 2.2, 2.85].map((a) =>
  crack(cx + Math.cos(a) * (LOGO * 0.47), cy + Math.sin(a) * (LOGO * 0.47), a, 110 + rand() * 60, 7),
);

// Rune band between the rim and the field: rows top/bottom, columns left/right.
const band = 62;
const runeScale = 1.05;
const runes =
  runeRow(band + 26, band, W - band - 26, band, 10, runeScale) +
  runeRow(band + 26, H - band, W - band - 26, H - band, 10, runeScale) +
  runeRow(band, band + 50, band, H - band - 50, 13, runeScale) +
  runeRow(W - band, band + 50, W - band, H - band - 50, 13, runeScale) +
  // A few loose runes in the field, like the scattered carving on the logo.
  runeRow(150, 150, 450, 150, 6, 0.85) +
  runeRow(150, H - 150, 450, H - 150, 6, 0.85);

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="stone" cx="50%" cy="48%" r="72%">
      <stop offset="0%" stop-color="#43332a"/>
      <stop offset="50%" stop-color="#271e19"/>
      <stop offset="100%" stop-color="#110d0a"/>
    </radialGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8a6a50"/>
      <stop offset="45%" stop-color="#4a372a"/>
      <stop offset="100%" stop-color="#21170f"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff7a1a" stop-opacity="0.7"/>
      <stop offset="55%" stop-color="#c2410c" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#c2410c" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
      <stop offset="60%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="4"/>
      <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.23  0 0 0 0 0.17  0 0 0 0.28 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="4" seed="11"/>
      <feColorMatrix values="0 0 0 0 0.04  0 0 0 0 0.025  0 0 0 0 0.015  0 0 0 1.5 -0.45"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
    <clipPath id="field"><rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="34"/></clipPath>
  </defs>

  <!-- Worn rim -->
  <rect width="${W}" height="${H}" rx="48" fill="url(#rim)"/>
  <rect width="${W}" height="${H}" rx="48" fill="#fff" filter="url(#mottle)"/>
  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="45" fill="none" stroke="#c4a07a" stroke-opacity="0.45" stroke-width="2.5"/>
  <rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="40" fill="none" stroke="#0d0907" stroke-opacity="0.6" stroke-width="3"/>

  <!-- Stone field -->
  <g clip-path="url(#field)">
    <rect width="${W}" height="${H}" fill="url(#stone)"/>
    <rect width="${W}" height="${H}" fill="#fff" filter="url(#mottle)"/>
    <rect width="${W}" height="${H}" fill="#fff" filter="url(#grain)"/>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      ${hairCracks.map((d) => `<path d="${d}" stroke="#0b0806" stroke-opacity="0.6" stroke-width="1.6"/>`).join('')}
    </g>
    <!-- Lava veins: a blurred glow under a bright core -->
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      ${veins.map((d) => `<path d="${d}" stroke="#ff6a00" stroke-opacity="0.55" stroke-width="7" filter="url(#soft)"/>`).join('')}
      ${veins.map((d) => `<path d="${d}" stroke="#2a0d03" stroke-width="3.4"/>`).join('')}
      ${veins.map((d) => `<path d="${d}" stroke="#ffb347" stroke-opacity="0.9" stroke-width="1.4" filter="url(#glow)"/>`).join('')}
    </g>
    ${runes}
    <!-- Carved band lines framing the rune border -->
    <g fill="none">
      <rect x="${band - 26}" y="${band - 30}" width="${W - 2 * band + 52}" height="${H - 2 * band + 60}" rx="22" stroke="#0d0907" stroke-opacity="0.75" stroke-width="3"/>
      <rect x="${band - 25}" y="${band - 29}" width="${W - 2 * band + 52}" height="${H - 2 * band + 60}" rx="22" stroke="#c9a77a" stroke-opacity="0.14" stroke-width="1.5"/>
      <rect x="${band + 28}" y="${band + 32}" width="${W - 2 * band - 56}" height="${H - 2 * band - 64}" rx="16" stroke="#0d0907" stroke-opacity="0.75" stroke-width="3"/>
      <rect x="${band + 29}" y="${band + 33}" width="${W - 2 * band - 56}" height="${H - 2 * band - 64}" rx="16" stroke="#c9a77a" stroke-opacity="0.14" stroke-width="1.5"/>
    </g>
    <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  </g>
  <rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="34" fill="none" stroke="#0d0907" stroke-opacity="0.85" stroke-width="4"/>

  <!-- Molten halo and drop shadow under the logo tile -->
  <circle cx="${cx}" cy="${cy}" r="${LOGO * 0.78}" fill="url(#halo)"/>
  <rect x="${cx - LOGO * 0.45}" y="${cy - LOGO * 0.42}" width="${LOGO * 0.9}" height="${LOGO * 0.9}" rx="${LOGO * 0.16}" fill="#000" opacity="0.75" filter="url(#soft)"/>
</svg>`;

const logo = await sharp(logoPng).resize(LOGO, LOGO).png().toBuffer();
await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: Math.round(cx - LOGO / 2), top: Math.round(cy - LOGO / 2) }])
  .webp({ quality: 86 })
  .toFile(out);
console.log('wrote', path.relative(root, out));
