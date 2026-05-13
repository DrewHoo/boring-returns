import React, { useMemo } from 'react'
import {
  cagrColor,
  fmtPct,
  fmtMoney,
  fmtMonth,
  linePath,
  forwardDrawdownSurface,
  SPARKLINE_COLOR,
  DRAWDOWN_FILL,
} from './chart-utils.js'

const CARD_W = 272
const CARD_H = 200
const SPARK_W = 240
const SPARK_H = 50

export default function Tooltip({ data, monthIndex, hover }) {
  const k = monthIndex
  const month = data.months[k]
  const buyIn = data.avgPrice[k]
  const now = data.annualizedToToday[k]
  const r1 = data.r1y[k]
  const r5 = data.r5y[k]
  const r10 = data.r10y[k]

  const spark = useMemo(() => {
    const slice = data.avgPrice.slice(k)
    if (slice.length < 2) return { d: '', ddD: '' }
    const minP = Math.min(...slice)
    const maxP = Math.max(...slice)
    const xs = slice.map((_, i) => (i / (slice.length - 1)) * SPARK_W)
    const norm = p => maxP === minP
      ? SPARK_H / 2
      : SPARK_H - ((p - minP) / (maxP - minP)) * SPARK_H
    const ys = slice.map(norm)
    const d = linePath(xs, ys)

    // Drawdown surface as a thin band hugging the bottom of the
    // sparkline panel, scaled so 100% drawdown reaches the bottom.
    const dd = forwardDrawdownSurface(data.avgPrice, k)
    const ddYs = dd.map(v => SPARK_H + 2 + v * 18)
    const ddD = [
      `M0 ${SPARK_H + 2}`,
      ...xs.map((x, i) => `L${x.toFixed(2)} ${ddYs[i].toFixed(2)}`),
      `L${SPARK_W} ${SPARK_H + 2} Z`,
    ].join(' ')

    return { d, ddD }
  }, [data, k])

  const dollars = buyIn > 0
    ? (1000 * (data.currentPrice / buyIn))
    : null

  // Position the card. On touch, pin to viewport bottom.
  const left = hover?.isTouch
    ? Math.max(8, Math.min(window.innerWidth - CARD_W - 8, window.innerWidth / 2 - CARD_W / 2))
    : (() => {
        const barAbsX = (hover?.wrapLeft ?? 0) + hover.barX * (hover?.wrapWidth ?? 0)
        let l = barAbsX - CARD_W / 2
        l = Math.max(8, Math.min(window.innerWidth - CARD_W - 8, l))
        return l
      })()

  const top = hover?.isTouch
    ? (window.innerHeight - CARD_H - 16)
    : Math.max(8, (hover?.rowTop ?? 0) - CARD_H - 12)

  return (
    <div
      className="tooltip"
      style={{
        position: 'fixed',
        left,
        top,
        width: CARD_W,
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <div className="tooltip-eyebrow">
        {data.symbol} · {fmtMonth(month)}
      </div>
      <div className="tooltip-headline" style={{ color: now == null ? '#888' : cagrColor(now) }}>
        {now == null ? 'not enough history' : `${fmtPct(now)}/yr`}
      </div>
      <div className="tooltip-chips">
        <Chip label="1y" value={r1} />
        <Chip label="5y" value={r5} />
        <Chip label="10y" value={r10} />
        <Chip label="now" value={now} headline />
      </div>
      <svg
        className="tooltip-sparkline"
        width={SPARK_W}
        height={SPARK_H + 22}
        viewBox={`0 0 ${SPARK_W} ${SPARK_H + 22}`}
      >
        <path d={spark.ddD} fill={DRAWDOWN_FILL} stroke="none" />
        <path d={spark.d} fill="none" stroke={SPARKLINE_COLOR} strokeWidth="1.2" />
      </svg>
      <div className="tooltip-caption">
        {fmtMoney(1000)} → <strong>{fmtMoney(dollars)}</strong> today
      </div>
    </div>
  )
}

function Chip({ label, value, headline }) {
  const isNull = value == null
  const color = isNull ? '#cccac1' : cagrColor(value)
  return (
    <div className={isNull ? 'chip chip--null' : 'chip'} style={{ background: color }}>
      <div className="chip-value">{isNull ? '—' : fmtPct(value, false)}</div>
      <div className={isNull ? 'chip-label chip-label--null' : 'chip-label'}>
        {headline ? 'now' : label}
      </div>
    </div>
  )
}
