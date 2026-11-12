import { writeFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AudioLines } from 'lucide-react';
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
await writeFile(
  'public/icons/audio-lines.svg',
  renderToStaticMarkup(
    createElement(AudioLines, {
      xmlns: 'http://www.w3.org/2000/svg',
      color: '#a1a1a6',
      strokeWidth: 1.8,
      'aria-hidden': true,
    })
  )
);
console.log('Generated the shared Audio lines day icon from Lucide.');
