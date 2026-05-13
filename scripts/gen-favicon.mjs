// Generate favicon assets from a single SVG source. Run with:
//   node scripts/gen-favicon.mjs
// Writes:
//   public/favicon.svg          — modern browsers (vector, any size)
//   public/favicon-32.png       — generic small-pixel fallback
//   public/favicon-192.png      — Android, PWA
//   public/apple-touch-icon.png — iOS home-screen icon (180x180)

import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '..', 'public')
mkdirSync(outDir, { recursive: true })

// A 4x4 grid of color squares from the live cagrColor scale, with the
// tan "boring" center squares prominent. Reads as four years × four
// months of "this would have been fine" at thumbnail scale.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#f5efe0"/>
  <g transform="translate(8 8)">
    <rect x="0"  y="0"  width="11" height="11" fill="#c0392b"/>
    <rect x="12" y="0"  width="11" height="11" fill="#d9622a"/>
    <rect x="24" y="0"  width="11" height="11" fill="#c98b2a"/>
    <rect x="36" y="0"  width="11" height="11" fill="#b8a47a"/>
    <rect x="0"  y="12" width="11" height="11" fill="#d9622a"/>
    <rect x="12" y="12" width="11" height="11" fill="#b8a47a"/>
    <rect x="24" y="12" width="11" height="11" fill="#b8a47a"/>
    <rect x="36" y="12" width="11" height="11" fill="#6f9a6a"/>
    <rect x="0"  y="24" width="11" height="11" fill="#b8a47a"/>
    <rect x="12" y="24" width="11" height="11" fill="#b8a47a"/>
    <rect x="24" y="24" width="11" height="11" fill="#6f9a6a"/>
    <rect x="36" y="24" width="11" height="11" fill="#2f7a3b"/>
    <rect x="0"  y="36" width="11" height="11" fill="#c98b2a"/>
    <rect x="12" y="36" width="11" height="11" fill="#b8a47a"/>
    <rect x="24" y="36" width="11" height="11" fill="#6f9a6a"/>
    <rect x="36" y="36" width="11" height="11" fill="#2f7a3b"/>
  </g>
</svg>`

writeFileSync(resolve(outDir, 'favicon.svg'), svg + '\n')
console.log('wrote favicon.svg')

const png = [
  { name: 'favicon-32.png',       size: 32 },
  { name: 'favicon-192.png',      size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
]
for (const { name, size } of png) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(resolve(outDir, name))
  console.log(`wrote ${name}`)
}
