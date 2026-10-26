import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const raw = (f) => path.join(root, 'raw', f);
const out = (f) => path.join(root, 'public', f);

const PHOTO_WIDTHS = [480, 800, 1080];

// name = Instagram shortcode (raw/<name>.jpg), optional crop {left, top, width, height} in source pixels.
// Flat-lay posts are clean 1080x1440 photos. Two reel covers are cropped to drop the shop's sticker; DZ8L782RJCO keeps it because cropping would cut the pants.
const photos = [
  ['De0lYkONK5W'],
  ['De0lLjst-fN'],
  ['DdW077PpP1y'],
  ['DdAXHupp5rY'],
  ['Dc9CBRcoKZa'],
  ['Dc6sfR_mEcm'],
  ['DczlrMHIC1s'],
  ['Dcw7yE1CRmW'],
  ['DcuPpjSGEO8'],
  ['DcuO963GKtE'],
  ['DcuNdsiGEKL'],
  ['DaOg0oDxQMN'],
  ['DZ8L782RJCO'],
  ['DZx5NiVzsBD', { left: 0, top: 0, width: 720, height: 1000 }],
  ['DZNbuMRu-mM'],
  ['DZIv9I9Omf5'],
  ['DZGDuDqJ6Ji', { left: 0, top: 200, width: 640, height: 936 }],
];

async function optimizePhotos() {
  await mkdir(out('img'), { recursive: true });
  const manifest = {};
  for (const [name, crop] of photos) {
    let base = sharp(raw(`${name}.jpg`)).rotate();
    if (crop) base = base.extract(crop);
    const buf = await base.toBuffer();
    const meta = await sharp(buf).metadata();
    const widths = [...new Set(PHOTO_WIDTHS.filter((w) => w < meta.width).concat([meta.width]))].sort((a, b) => a - b);
    for (const w of widths) {
      await sharp(buf).resize({ width: w }).webp({ quality: 80, effort: 5 }).toFile(out(`img/${name}-${w}.webp`));
    }
    const { dominant } = await sharp(buf).stats();
    manifest[name] = { w: meta.width, h: meta.height, widths, dominant: `rgb(${dominant.r},${dominant.g},${dominant.b})` };
    console.log(name, meta.width, 'x', meta.height, widths.join(','));
  }
  return manifest;
}

// Instagram profile picture (150px) is the only logo source; good enough for icons
async function icons() {
  await sharp(raw('logo.jpg')).resize(64).png().toFile(out('favicon-64.png'));
  await sharp(raw('logo.jpg')).resize(180, 180, { kernel: 'lanczos3' }).png().toFile(out('apple-touch-icon.png'));
  await sharp(raw('logo.jpg')).resize(300).png().toFile(out('img/logo-300.png'));
}

await mkdir(out('img'), { recursive: true });
await icons();
const manifest = await optimizePhotos();
await writeFile(path.join(root, 'src', 'image-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
