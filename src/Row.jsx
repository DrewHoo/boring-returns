import React, { useMemo, useRef, useState } from 'react'
import { cagrColor, CAGR_NEUTRAL } from './chart-utils.js'
import Tooltip from './Tooltip.jsx'

const W = 840
const H_DEFAULT = 26
const H_DETAIL = 70
const BAR_W = 1.6
const TOTAL_MONTHS = 480

// Build the global axis range — last 480 months, anchored on the most
// recent month present across the entire universe. We compute this at
// the App level and pass it down so every row shares a timeline.
export function buildGlobalMonths(latestMonthYYYYMM) {
  const [yEnd, mEnd] = latestMonthYYYYMM.split('-').map(Number)
  const out = []
  // mEnd is 1..12; walk back TOTAL_MONTHS - 1 months from there.
  let y = yEnd
  let m = mEnd
  for (let i = 0; i < TOTAL_MONTHS; i++) {
    out.unshift(`${y}-${m.toString().padStart(2, '0')}`)
    m -= 1
    if (m === 0) { m = 12; y -= 1 }
  }
  return out
}

// Index of a YYYY-MM within the global timeline, or -1.
function indexOf(globalMonths, key) {
  // Linear is fine; globalMonths.length === 480.
  for (let i = 0; i < globalMonths.length; i++) {
    if (globalMonths[i] === key) return i
  }
  return -1
}

export default function Row({
  data,
  globalMonths,
  detail = false,
  onClick,
  onHoverChange,
}) {
  const [hover, setHover] = useState(null) // { i: month index within data.months, x, y }
  const ref = useRef(null)

  const H = detail ? H_DETAIL : H_DEFAULT

  // Pre-compute bar positions, colors, heights.
  const bars = useMemo(() => {
    const out = []
    if (!data || !globalMonths) return out
    // Start offset of data.months within globalMonths.
    const startIdx = indexOf(globalMonths, data.months[0])
    if (startIdx < 0) return out
    const dx = W / TOTAL_MONTHS
    for (let i = 0; i < data.months.length; i++) {
      const gIdx = startIdx + i
      if (gIdx < 0 || gIdx >= TOTAL_MONTHS) continue
      const cagr = data.annualizedToToday[i]
      const x = gIdx * dx
      const big = cagr != null && Math.abs(cagr - CAGR_NEUTRAL) > 0.10
      const height = big ? H : Math.max(8, H - 6)
      out.push({
        i,
        x,
        height,
        color: cagr == null ? null : cagrColor(cagr),
        isNoData: cagr == null,
      })
    }
    return out
  }, [data, globalMonths, H])

  function pointerToMonthIndex(clientX) {
    if (!ref.current || !bars.length) return null
    const rect = ref.current.getBoundingClientRect()
    const xFrac = (clientX - rect.left) / rect.width
    const xPx = xFrac * W
    // Find nearest bar.
    let nearest = bars[0]
    let bestDist = Math.abs(bars[0].x - xPx)
    for (let i = 1; i < bars.length; i++) {
      const d = Math.abs(bars[i].x - xPx)
      if (d < bestDist) { bestDist = d; nearest = bars[i] }
    }
    return nearest
  }

  function onPointerMove(e) {
    const b = pointerToMonthIndex(e.clientX)
    if (!b) return
    const rect = ref.current.getBoundingClientRect()
    const next = {
      i: b.i,
      barX: b.x / W,           // fraction of row width
      pointerY: e.clientY,
      rowTop: rect.top,
      rowBottom: rect.bottom,
      wrapLeft: rect.left,
      wrapWidth: rect.width,
      isTouch: e.pointerType === 'touch' || e.pointerType === 'pen',
    }
    setHover(next)
    onHoverChange?.(next)
  }

  function onPointerLeave() {
    setHover(null)
    onHoverChange?.(null)
  }

  function onClickRow() {
    onClick?.(data.symbol)
  }

  return (
    <div className={detail ? 'row row--detail' : 'row'}>
      <button
        type="button"
        className="row-symbol"
        onClick={onClickRow}
        title={data.name}
      >
        <strong>{data.symbol}</strong>
        <span className="row-symbol-name">{data.name}</span>
      </button>
      <div
        className="row-chart-wrap"
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerMove}
        onClick={onClickRow}
        style={{ touchAction: 'pan-y', cursor: 'pointer' }}
      >
        <svg
          className="row-chart"
          width="100%"
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="hatchNoData"
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
              x={b.x - BAR_W / 2}
              y={(H - b.height) / 2}
              width={BAR_W}
              height={b.height}
              fill={b.isNoData ? 'url(#hatchNoData)' : b.color}
              opacity={b.isNoData ? 0.6 : 1}
            />
          ))}
          {hover && (() => {
            const startIdx = indexOf(globalMonths, data.months[0])
            const gIdx = startIdx + hover.i
            const dx = W / TOTAL_MONTHS
            return (
              <line
                x1={gIdx * dx}
                x2={gIdx * dx}
                y1={0}
                y2={H}
                stroke="#1a1814"
                strokeWidth="0.8"
                opacity="0.6"
              />
            )
          })()}
        </svg>
      </div>
      {hover && !detail && (
        <Tooltip data={data} monthIndex={hover.i} hover={hover} />
      )}
    </div>
  )
}
