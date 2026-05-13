// Generate a 1200x630 OG preview image. Run with:
//   node scripts/gen-og.mjs
// The output (public/og.png) is committed; CI does not regenerate it.

import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '..', 'public')
mkdirSync(outDir, { recursive: true })

const W = 1200
const H = 630
const INK = '#1a1814'
const INK_MUTED = '#5e574a'
const BG = '#f5efe0'

// Stylized leaderboard of 12 rows × 60 bars, drawn by hand to look like
// a representative slice of the live chart. Each row's bars are
// pseudo-randomly colored from the cagrColor stops, weighted so most
// land in the tan/boring middle and the rest fan out warm/cool.
const STOPS = [
  '#7a0d0d', '#c0392b', '#d9622a', '#c98b2a',
  '#b8a47a', // tan — heavy weight
  '#6f9a6a', '#2f7a3b', '#1f4f24',
]
const WEIGHTS = [0.5, 1, 2, 3, 8, 3, 1.5, 0.7]
const cumW = (() => {
  const out = []
  let s = 0
  for (const w of WEIGHTS) { s += w; out.push(s) }
  return out
})()
const totalW = cumW[cumW.length - 1]
function pickColor(rng) {
  const r = rng() * totalW
  for (let i = 0; i < cumW.length; i++) {
    if (r <= cumW[i]) return STOPS[i]
  }
  return STOPS[STOPS.length - 1]
}
// Deterministic pseudo-random so the OG is stable run-to-run.
function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}
const rng = makeRng(7)

const ROWS = 12
const COLS = 60
const ROW_H = 24
const ROW_GAP = 4
const BAR_W = 5
const GRID_X = 640
const GRID_Y = 200
const GRID_W = COLS * (BAR_W)
const rows = []
for (let r = 0; r < ROWS; r++) {
  const bars = []
  for (let c = 0; c < COLS; c++) {
    bars.push(pickColor(rng))
  }
  rows.push(bars)
}

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <text x="60" y="160" font-family="Iowan Old Style, Georgia, serif"
    font-size="92" fill="${INK}" font-weight="700" letter-spacing="-1">
    Boring Returns
  </text>
  <text x="60" y="220" font-family="Georgia, serif" font-style="italic"
    font-size="22" fill="${INK_MUTED}">
    ten percent a year, in tan and otherwise
  </text>
  <text x="60" y="320" font-family="Georgia, serif"
    font-size="20" fill="${INK}">
    Every month of the last forty years
  </text>
  <text x="60" y="348" font-family="Georgia, serif"
    font-size="20" fill="${INK}">
    for ~600 tickers, colored by what
  </text>
  <text x="60" y="376" font-family="Georgia, serif"
    font-size="20" fill="${INK}">
    you'd have made holding to today.
  </text>

  <text x="60" y="460" font-family="SF Mono, Menlo, monospace"
    font-size="13" fill="${INK_MUTED}" letter-spacing="0.08em">
    BELOW MARKET   ·   10%/YR   ·   ABOVE MARKET
  </text>

  <!-- Gradient legend bar -->
  <defs>
    <linearGradient id="grad" x1="0" x2="1">
      ${STOPS.map((c, i) => `<stop offset="${(i / (STOPS.length - 1)) * 100}%" stop-color="${c}"/>`).join('')}
    </linearGradient>
  </defs>
  <rect x="60" y="476" width="320" height="10" rx="2" fill="url(#grad)"/>

  <!-- Stylized leaderboard on the right -->
  <g transform="translate(${GRID_X} ${GRID_Y})">
    ${rows.map((bars, r) => `
      <g transform="translate(0 ${r * (ROW_H + ROW_GAP)})">
        ${bars.map((c, i) => `<rect x="${i * BAR_W}" y="0" width="${BAR_W - 0.5}" height="${ROW_H}" fill="${c}"/>`).join('')}
      </g>
    `).join('')}
  </g>

  <text x="60" y="${H - 40}" font-family="SF Mono, Menlo, monospace"
    font-size="13" fill="${INK_MUTED}" letter-spacing="0.05em">
    drewhoover.com/boring-returns
  </text>
</svg>
`

const out = resolve(outDir, 'og.png')
await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile(out)
console.log(`wrote ${out}`)
