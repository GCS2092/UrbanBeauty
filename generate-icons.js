const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, 'frontend/public/favicon.svg');
const outputDir = path.join(__dirname, 'frontend/public/icons');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  for (const size of sizes) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`icon-${size}x${size}.png OK`);
  }
  console.log('=== TOUTES LES ICONES GENEREES ===');
})();