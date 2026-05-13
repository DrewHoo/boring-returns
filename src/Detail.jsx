import React, { useMemo, useRef, useState } from 'react'
import Row, { buildGlobalMonths } from './Row.jsx'
import {
  cagrColor,
  fmtPct,
  fmtMoney,
  fmtMonth,
  boringnessLabel,
  linePath,
  SPARKLINE_COLOR,
} from './chart-utils.js'

const W = 840
const H = 96
const TOTAL_MONTHS = 480

// Inline-expanded detail view rendered below a row in the leaderboard.
// Includes a taller bar chart, a faint price-line overlay, and a stats
// card.
export default function Detail({ data, globalMonths }) {
  const startIdx = useMemo(() => globalMonths.indexOf(data.months[0]), [data, globalMonths])

  // Price line path on log y-axis, mapped over the global timeline so
  // the line aligns with the underlying bars.
  const priceLine = useMemo(() => {
    if (!data.avgPrice.length) return ''
    const ys = data.avgPrice.map(p => Math.log(p))
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const dx = W / TOTAL_MONTHS
    const xs = data.months.map((_, i) => (startIdx + i) * dx)
    const yNorm = y => maxY === minY
      ? H / 2
      : H - 8 - ((y - minY) / (maxY - minY)) * (H - 16)
    return linePath(xs, ys.map(yNorm))
  }, [data, startIdx])

  // 5-year tick labels at the bottom of the taller chart.
  const yearTicks = useMemo(() => {
    const out = []
    for (let i = 0; i < globalMonths.length; i++) {
      const [y, m] = globalMonths[i].split('-').map(Number)
      if (m === 1 && y % 5 === 0) {
        out.push({ i, label: `'${String(y).slice(-2)}` })
      }
    }
    return out
  }, [globalMonths])

  const bars = useMemo(() => {
    const out = []
    const dx = W / TOTAL_MONTHS
    for (let i = 0; i < data.months.length; i++) {
      const gIdx = startIdx + i
      const cagr = data.annualizedToToday[i]
      out.push({
        i, x: gIdx * dx, cagr, color: cagr == null ? null : cagrColor(cagr),
      })
    }
    return out
  }, [data, startIdx])

  const lifetime = data.stats.lifetimeCAGR
  const lifetimeDollars = lifetime != null
    ? 1000 * (data.currentPrice / data.avgPrice[0])
    : null

  const pctBeatMarket = useMemo(() => {
    const valid = data.annualizedToToday.filter(v => v != null)
    if (!valid.length) return null
    const beat = valid.filter(v => v > 0.10).length
    return beat / valid.length
  }, [data])

  return (
    <div className="detail">
      <div className="detail-chart-wrap">
        <svg
          width="100%"
          height={H + 18}
          viewBox={`0 0 ${W} ${H + 18}`}
          preserveAspectRatio="none"
          className="detail-chart"
        >
          <defs>
            <pattern
              id={`hatchDetail-${data.symbol}`}
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="4" stroke="#c8c4b3" strokeWidth="1" />
            </pattern>
          </defs>
          {bars.map(b => (
            <rect
              key={b.i}
              x={b.x - 0.9}
              y={2}
              width={1.8}
              height={H - 4}
              fill={b.cagr == null ? `url(#hatchDetail-${data.symbol})` : b.color}
              opacity={b.cagr == null ? 0.6 : 0.96}
            />
          ))}
          <path
            d={priceLine}
            fill="none"
            stroke={SPARKLINE_COLOR}
            strokeWidth="0.8"
            opacity="0.55"
          />
          {yearTicks.map(t => (
            <text
              key={t.i}
              x={(t.i / TOTAL_MONTHS) * W}
              y={H + 14}
              fontSize="10"
              fill="#7a7468"
              textAnchor="middle"
            >
              {t.label}
            </text>
          ))}
        </svg>
      </div>

      <div className="detail-stats">
        <Stat
          value={fmtPct(lifetime, false)}
          color={lifetime == null ? '#888' : cagrColor(lifetime)}
          label="lifetime annualized return"
          sub={`since ${fmtMonth(data.firstMonth)}`}
        />
        <Stat
          value={fmtPct(data.stats.trailing10yCAGR, false)}
          color={data.stats.trailing10yCAGR == null ? '#888' : cagrColor(data.stats.trailing10yCAGR)}
          label="trailing 10-year annualized"
          sub="if you bought ten years ago"
        />
        <Stat
          value={`−${(data.stats.maxDD * 100).toFixed(0)}%`}
          color="#c0392b"
          label="worst drawdown experienced"
          sub="peak-to-trough, at the worst point"
        />
        <Stat
          value={pctBeatMarket == null ? '—' : `${(pctBeatMarket * 100).toFixed(0)}%`}
          color={pctBeatMarket == null ? '#888' : cagrColor(0.13)}
          label="of months that beat 10%/yr"
          sub="share of entries that outperformed the long-run market"
        />
        <Stat
          value={data.stats.boringness == null ? '—' : data.stats.boringness.toFixed(2)}
          color="#b8a47a"
          label={`boring score — ${boringnessLabel(data.stats.boringness)}`}
          sub={data.stats.boringness == null
            ? 'not enough history to score yet'
            : 'how little the entry date mattered'}
        />
      </div>

      <div className="detail-footer">
        $1,000 in <strong>{fmtMonth(data.firstMonth)}</strong>{' '}
        → <strong>{fmtMoney(lifetimeDollars)}</strong> today, current price{' '}
        {fmtMoney(data.currentPrice)}.
      </div>
    </div>
  )
}

function Stat({ value, color, label, sub }) {
  return (
    <div className="stat">
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  )
}
