import React, { useMemo } from 'react'
import { createPortal } from 'react-dom'
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
const SPARK_W = 240
const SPARK_H = 50
// Approximate rendered card heights — used only to decide whether
// there's room to place the card above the row. The actual card is
// laid out by the browser; we anchor by its bottom edge so we don't
// need a precise number to position correctly. Mobile is taller
// because the chip grid wraps to two columns (see styles.css).
const CARD_H_DESKTOP = 280
const CARD_H_MOBILE = 440

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

  // Position the card above the scrubbed row, horizontally centered
  // on the bar. We anchor by `bottom` (so the card grows upward
  // regardless of its actual height) when there's enough room above
  // the row to fit it; otherwise we fall back to anchoring `top`
  // below the row.
  const barAbsX = (hover?.wrapLeft ?? 0) + hover.barX * (hover?.wrapWidth ?? 0)
  const left = Math.max(
    8,
    Math.min(window.innerWidth - CARD_W - 8, barAbsX - CARD_W / 2),
  )

  const isMobile = typeof window !== 'undefined'
    && window.matchMedia('(max-width: 720px)').matches
  const cardH = isMobile ? CARD_H_MOBILE : CARD_H_DESKTOP
  const rowTop = hover?.rowTop ?? 0
  const rowBottom = hover?.rowBottom ?? 0
  const fitsAbove = rowTop > cardH + 20

  const verticalStyle = fitsAbove
    ? { bottom: Math.max(8, window.innerHeight - rowTop + 12) }
    : { top: Math.min(window.innerHeight - cardH - 8, rowBottom + 12) }

  // Portal to body so we escape any row stacking context — otherwise
  // later .row siblings (each with z-index:1) paint over the fixed
  // tooltip when it visually overlaps them.
  return createPortal(
    <div
      className="tooltip"
      style={{
        position: 'fixed',
        left,
        ...verticalStyle,
        width: CARD_W,
        zIndex: 1000,
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
    </div>,
    document.body
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
