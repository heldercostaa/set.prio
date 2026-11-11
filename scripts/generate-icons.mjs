import sharp from 'sharp';
for (const [size, name] of [
  [32, 'favicon-32'],
  [180, 'apple-touch-icon'],
  [192, 'icon-192'],
  [512, 'icon-512'],
]) {
  await sharp('public/logo.svg').resize(size, size).png().toFile(`public/${name}.png`);
}
console.log('Generated icon sizes from the supplied SVG.');
