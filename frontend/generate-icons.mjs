import sharp from 'sharp';
import { mkdirSync } from 'fs';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceLogo = './public/SonshoLogo.PNG'; // déjà présent dans public/

mkdirSync('./public/icons', { recursive: true });

for (const size of sizes) {
  await sharp(sourceLogo)
    .resize(size, size, { fit: 'cover' })
    .png()
    .toFile(`./public/icons/icon-${size}x${size}.png`);
  console.log(`icon-${size}x${size}.png OK`);
}

// Favicon
await sharp(sourceLogo).resize(96, 96).png().toFile('./public/favicon.png');
console.log('favicon.png OK');