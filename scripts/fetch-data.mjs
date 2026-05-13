// Fetch daily adjusted closes from Yahoo Finance, downsample to monthly
// averages, compute forward returns + max-drawdown-experienced per
// month, and write one compact JSON per ticker into public/data/.
// Also writes public/data/index.json describing what was fetched.

import YahooFinance from 'yahoo-finance2'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { UNIVERSE } from './universe.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '..', 'public', 'data')

const yahooFinance = new YahooFinance()
yahooFinance.suppressNotices?.(['yahooSurvey', 'ripHistorical'])

const PERIOD_START = '1980-01-01'
const PERIOD_END = new Date()
const CONCURRENCY = 5

// Cap each ticker's history at the most recent 480 months (40 years).
const MAX_MONTHS = 480

async function fetchPriceSeries(symbol) {
  const result = await yahooFinance.chart(symbol, {
    period1: PERIOD_START,
    period2: PERIOD_END,
    interval: '1d',
    events: 'div,splits',
  })
  return result.quotes
    .filter(r => Number.isFinite(r.adjclose) && r.adjclose > 0)
    .map(r => ({ date: new Date(r.date), adjClose: r.adjclose }))
    .sort((a, b) => a.date - b.date)
}

async function fetchDisplayName(symbol) {
  try {
    const q = await yahooFinance.quote(symbol)
    return q?.longName || q?.shortName || q?.displayName || null
  } catch {
    return null
  }
}

function monthKey(d) {
  const y = d.getUTCFullYear()
  const m = (d.getUTCMonth() + 1).toString().padStart(2, '0')
  return `${y}-${m}`
}

export function analyze(rows) {
  // Last daily close is "today's price" for all CAGR-to-today calcs.
  const currentPrice = rows[rows.length - 1].adjClose
  const asOf = rows[rows.length - 1].date

  // Group dailies by YYYY-MM, average within month.
  const byMonth = new Map()
  for (const r of rows) {
    const k = monthKey(r.date)
    if (!byMonth.has(k)) byMonth.set(k, [])
    byMonth.get(k).push(r.adjClose)
  }
  const allMonths = [...byMonth.keys()].sort()
  const slicedMonths = allMonths.slice(-MAX_MONTHS)

  const months = slicedMonths
  const avgPrice = months.map(k => {
    const arr = byMonth.get(k)
    const sum = arr.reduce((a, b) => a + b, 0)
    return Math.round((sum / arr.length) * 10000) / 10000
  })

  // Years from each month's middle (~15th) to asOf, for CAGR-to-today.
  const yearsToToday = months.map(k => {
    const [y, m] = k.split('-').map(Number)
    const mid = new Date(Date.UTC(y, m - 1, 15))
    return (asOf - mid) / (365.25 * 24 * 3600 * 1000)
  })

  const annualizedToToday = avgPrice.map((p, i) => {
    const yrs = yearsToToday[i]
    if (yrs < 0.5) return null
    return Math.pow(currentPrice / p, 1 / yrs) - 1
  })

  // Forward annualized returns. r1y[i] uses avgPrice[i+12]/avgPrice[i].
  // 12 months ≈ 1 year, so the annualization exponent is 1.
  function forward(monthsForward, exponent) {
    return avgPrice.map((p, i) => {
      const j = i + monthsForward
      if (j >= avgPrice.length) return null
      return Math.pow(avgPrice[j] / p, 1 / exponent) - 1
    })
  }
  const r1y  = forward(12, 1)
  const r5y  = forward(60, 5)
  const r10y = forward(120, 10)

  // Max drawdown forward from each month's buy-in price. Track running
  // max starting at avgPrice[i] (clamped — we want "worst paper loss vs
  // your buy-in price," not vs a future peak that left it well above
  // your cost basis). 0 means the ticker never closed below your
  // entry price in any subsequent month.
  const maxDDForward = avgPrice.map((buyIn, i) => {
    let worst = 0
    let runningMax = buyIn
    for (let j = i; j < avgPrice.length; j++) {
      if (avgPrice[j] > runningMax) runningMax = avgPrice[j]
      const dd = (runningMax - avgPrice[j]) / runningMax
      if (avgPrice[j] < buyIn) {
        const dd2 = (buyIn - avgPrice[j]) / buyIn
        if (dd2 > worst) worst = dd2
      }
      // Also consider drawdowns from later peaks above buy-in — those
      // are paper losses even if you stayed net-positive vs entry,
      // because the running max went above your cost.
      if (dd > worst) worst = dd
    }
    return Math.round(worst * 10000) / 10000
  })

  // Aggregate stats.
  const n = months.length
  const lifetimeCAGR = annualizedToToday[0]

  // Trailing 10y CAGR: anchored at the month 120 months before the
  // last full month. Use annualizedToToday so the metric is comparable
  // to the column header label ("annualized return to today").
  const idx10 = n - 121
  const trailing10yCAGR = idx10 >= 0 ? annualizedToToday[idx10] : null
  const idx20 = n - 241
  const trailing20yCAGR = idx20 >= 0 ? annualizedToToday[idx20] : null

  // Worst lifetime drawdown: from any peak to any subsequent low.
  let maxDD = 0
  {
    let peak = avgPrice[0]
    for (const p of avgPrice) {
      if (p > peak) peak = p
      const dd = (peak - p) / peak
      if (dd > maxDD) maxDD = dd
    }
  }

  // Boringness: 1 minus the mean absolute distance from 10%/yr. This
  // captures both "consistently near the market" AND "low variance" in
  // one number — a bond fund flat at 3% scores middling (far from 10%),
  // a wildly-volatile name scores near 0 (high variance), and a
  // broad-market index that hovers around 10% scores high. Requires
  // at least 5y of valid data to be meaningful.
  const NEUTRAL = 0.10
  const validAnn = annualizedToToday.filter(v => v != null)
  const meanAbsDist = validAnn.length
    ? validAnn.reduce((a, v) => a + Math.abs(v - NEUTRAL), 0) / validAnn.length
    : null
  const boringness = validAnn.length >= 60
    ? Math.max(0, Math.min(1, 1 - meanAbsDist / 0.15))
    : null

  return {
    firstMonth: months[0],
    lastMonth: months[n - 1],
    currentPrice: Math.round(currentPrice * 10000) / 10000,
    asOf: asOf.toISOString().slice(0, 10),
    months,
    avgPrice,
    annualizedToToday,
    r1y,
    r5y,
    r10y,
    maxDDForward,
    stats: {
      lifetimeCAGR,
      trailing10yCAGR,
      trailing20yCAGR,
      maxDD: Math.round(maxDD * 10000) / 10000,
      boringness: boringness == null ? null : Math.round(boringness * 1000) / 1000,
      monthsOfHistory: n,
    },
  }
}

async function processOne(ticker) {
  const { symbol, name: hardcodedName, category } = ticker
  const rows = await fetchPriceSeries(symbol)
  if (rows.length < 30) {
    throw new Error(`too few rows (${rows.length})`)
  }
  const analyzed = analyze(rows)
  const name = hardcodedName || (await fetchDisplayName(symbol)) || symbol
  const payload = { symbol, name, category, ...analyzed }
  await writeFile(
    resolve(OUT_DIR, `${symbol}.json`),
    JSON.stringify(payload),
  )
  return {
    symbol,
    name,
    category,
    firstMonth: analyzed.firstMonth,
    lastMonth: analyzed.lastMonth,
    monthsOfHistory: analyzed.stats.monthsOfHistory,
    lifetimeCAGR: analyzed.stats.lifetimeCAGR,
    trailing10yCAGR: analyzed.stats.trailing10yCAGR,
    trailing20yCAGR: analyzed.stats.trailing20yCAGR,
    maxDD: analyzed.stats.maxDD,
    boringness: analyzed.stats.boringness,
  }
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length)
  let cursor = 0
  async function pull() {
    while (true) {
      const i = cursor++
      if (i >= items.length) return
      try {
        results[i] = { ok: true, value: await worker(items[i], i) }
      } catch (err) {
        results[i] = { ok: false, item: items[i], error: err.message }
      }
    }
  }
  await Promise.all(Array.from({ length: limit }, pull))
  return results
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  console.log(`Fetching ${UNIVERSE.length} tickers, ${CONCURRENCY} at a time…`)
  const t0 = Date.now()

  let done = 0
  const results = await runWithConcurrency(UNIVERSE, CONCURRENCY, async (t) => {
    const r = await processOne(t)
    done++
    process.stdout.write(`\r  ${done}/${UNIVERSE.length}  ${t.symbol.padEnd(10)}     `)
    return r
  })

  const tickers = []
  const failures = []
  for (const r of results) {
    if (r.ok) tickers.push(r.value)
    else failures.push({ symbol: r.item.symbol, error: r.error })
  }

  await writeFile(
    resolve(OUT_DIR, 'index.json'),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), tickers, failureCount: failures.length },
      null, 2,
    ),
  )

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`\nWrote ${tickers.length} tickers + index.json in ${elapsed}s`)
  if (failures.length) {
    console.log(`Skipped ${failures.length}:`)
    for (const f of failures) console.log(`  ${f.symbol.padEnd(10)} ${f.error}`)
  }
}

// Only run when invoked directly. Allows other scripts to import `analyze`.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
