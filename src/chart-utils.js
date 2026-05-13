import { scaleLinear } from 'd3-scale'

// The visual hinge of the whole site. 10% nominal/yr is the historical
// long-run S&P 500 return; rendered as a deliberately drab tan so the
// most-quoted figure in personal finance looks exactly as exciting as
// it is.
export const CAGR_NEUTRAL = 0.10

export const cagrColor = scaleLinear()
  .domain([-0.05, 0.00, 0.04, 0.07, 0.10, 0.13, 0.18, 0.25])
  .range([
    '#7a0d0d', // deep red — lost money
    '#c0392b', // red — broke even nominal
    '#d9622a', // red-orange — lost to inflation
    '#c98b2a', // amber — below market
    '#b8a47a', // tan — at market (the boring hinge)
    '#6f9a6a', // muted green — above market
    '#2f7a3b', // green — well above market
    '#1f4f24', // deep green — extraordinary
  ])
  .clamp(true)

// Color a bar whose annualized-to-today is null (not enough history yet).
export const NO_DATA_COLOR = 'transparent'
export const NO_DATA_HATCH = 'url(#hatchNoData)'

export const SPARKLINE_COLOR = '#1f4e8c'
export const DRAWDOWN_FILL = 'rgba(220, 38, 38, 0.18)'

export function fmtPct(v, sign = true) {
  if (v == null || !Number.isFinite(v)) return '—'
  const pct = v * 100
  const fixed = Math.abs(pct) < 10 ? pct.toFixed(1) : pct.toFixed(0)
  if (!sign) return `${fixed}%`
  return pct >= 0 ? `+${fixed}%` : `${fixed}%`
}

export function fmtMoney(v) {
  if (v == null || !Number.isFinite(v)) return '—'
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (v >= 1000) return `$${Math.round(v).toLocaleString('en-US')}`
  if (v >= 10) return `$${v.toFixed(0)}`
  return `$${v.toFixed(2)}`
}

const MONTH_LABELS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
]

export function fmtMonth(yyyymm) {
  if (!yyyymm) return '—'
  const [y, m] = yyyymm.split('-').map(Number)
  return `${MONTH_LABELS[m - 1]} ${y}`
}

export function boringnessLabel(b) {
  if (b == null) return '—'
  if (b >= 0.85) return 'extremely boring'
  if (b >= 0.7)  return 'quite boring'
  if (b >= 0.5)  return 'somewhat boring'
  if (b >= 0.3)  return 'not very boring'
  return 'anything but boring'
}

// Build the SVG <path d="..."> string for the tooltip sparkline. xs and
// ys are arrays of pixel-space coordinates of equal length.
export function linePath(xs, ys) {
  if (!xs.length) return ''
  let d = `M${xs[0].toFixed(2)} ${ys[0].toFixed(2)}`
  for (let i = 1; i < xs.length; i++) {
    d += ` L${xs[i].toFixed(2)} ${ys[i].toFixed(2)}`
  }
  return d
}

// Compute a forward drawdown surface for the sparkline: at each future
// month j ≥ k, what fraction below the running max (clamped to buy-in
// price) is the price? Returns array of length (avgPrice.length - k).
export function forwardDrawdownSurface(avgPrice, k) {
  const out = []
  let runningMax = avgPrice[k]
  for (let j = k; j < avgPrice.length; j++) {
    if (avgPrice[j] > runningMax) runningMax = avgPrice[j]
    out.push(Math.max(0, (runningMax - avgPrice[j]) / runningMax))
  }
  return out
}
