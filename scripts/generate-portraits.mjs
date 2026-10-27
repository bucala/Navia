/**
 * Cuts square head portraits out of the full card art for the Sieň Božstiev
 * list (public/art/portraits/<cardId>.webp, 160 px). Each entry is the head's
 * centre and the crop size as fractions of the source image (width-relative
 * size). Add a line here whenever new card art lands, then run:
 *   npm run portraits
 */
import sharp from 'sharp';
import { access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public/art/portraits');
const SIZE = 160;

// cardId: [art file, centreX, centreY, crop size (fraction of width)]
export const HEADS = {
  bojovy_kohut: ['bojovy_kohut', 0.5, 0.2, 0.3],
  chepri: ['chepri', 0.5, 0.2, 0.32],
  cuauhtli: ['cuauhtli', 0.56, 0.1, 0.32],
  gorila: ['gorila', 0.5, 0.16, 0.3],
  kamenny_strazca: ['kamenny_strazca', 0.5, 0.11, 0.28],
  khadga: ['khadga', 0.5, 0.14, 0.34],
  lavovy_skriatok: ['lavovy_skriatok', 0.5, 0.42, 0.62],
  mahisa: ['mahisa', 0.5, 0.14, 0.34],
  medvebor: ['medvebor', 0.5, 0.12, 0.3],
  megadrak: ['megadrak', 0.63, 0.14, 0.3],
  nebesky_vrabec: ['nebesky_vrabec', 0.57, 0.25, 0.3],
  papagaj: ['papagaj', 0.56, 0.18, 0.26],
  pekelne_zaklinadlo: ['pekelne_zaklinadlo', 0.5, 0.36, 0.55],
  rysoslav: ['rysoslav', 0.47, 0.15, 0.28],
  opici_kral: ['wukong', 0.56, 0.23, 0.28],
  zlaty_gryf: ['zlaty_gryf', 0.57, 0.14, 0.28],
  // Lava Court art generated in Canva (add the WebP files to public/art/).
  salamandra: ['salamandra', 0.5, 0.17, 0.33],
  ohnivak: ['ohnivak', 0.5, 0.18, 0.3],
  mesha: ['mesha', 0.49, 0.17, 0.44],
};

async function main() {
  await mkdir(outDir, { recursive: true });
  for (const [cardId, [file, cx, cy, size]] of Object.entries(HEADS)) {
    const src = path.join(root, 'public/art', `${file}.webp`);
    try {
      await access(src);
    } catch {
      console.warn('skip', cardId, '— no art yet at', path.relative(root, src));
      continue;
    }
    const { width, height } = await sharp(src).metadata();
    const side = Math.round(size * width);
    const left = Math.min(Math.max(0, Math.round(cx * width - side / 2)), width - side);
    const top = Math.min(Math.max(0, Math.round(cy * height - side / 2)), height - side);
    await sharp(src)
      .extract({ left, top, width: side, height: side })
      .resize(SIZE, SIZE)
      .webp({ quality: 82 })
      .toFile(path.join(outDir, `${cardId}.webp`));
    console.log('wrote', `portraits/${cardId}.webp`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
