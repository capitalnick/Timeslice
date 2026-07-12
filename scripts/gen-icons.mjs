// Rasterise the app icon into the PNG sizes the PWA manifest needs.
// Run with `npm run gen:icons` (requires the `sharp` dev dependency).
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

const clock = (cx, cy, r, stroke) => `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ffffff" stroke-opacity="0.28" stroke-width="${stroke}" />
  <path d="M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx + r} ${cy} Z" fill="#ffffff" />
  <circle cx="${cx}" cy="${cy}" r="${r * 0.17}" fill="#ffffff" />`

const gradient = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#818cf8" />
      <stop offset="1" stop-color="#4f46e5" />
    </linearGradient>
  </defs>`

// Standard icon: rounded square, clock at ~59% of the canvas.
const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  ${gradient}
  <rect width="512" height="512" rx="112" fill="url(#g)" />
  ${clock(256, 256, 150, 28)}
</svg>`

// Maskable icon: full-bleed background, clock shrunk into the ~80% safe zone.
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  ${gradient}
  <rect width="512" height="512" fill="url(#g)" />
  ${clock(256, 256, 118, 22)}
</svg>`

const targets = [
  { svg: standardSvg, size: 192, file: 'pwa-192.png' },
  { svg: standardSvg, size: 512, file: 'pwa-512.png' },
  { svg: maskableSvg, size: 512, file: 'pwa-maskable-512.png' },
  { svg: standardSvg, size: 180, file: 'apple-touch-icon.png' },
]

for (const { svg, size, file } of targets) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(publicDir, file))
  console.log(`generated ${file} (${size}x${size})`)
}
