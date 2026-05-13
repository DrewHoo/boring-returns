import React, { useLayoutEffect, useState } from 'react'

// Major financial events to mark behind the leaderboard. Dates picked
// for the day everyone agrees was the inflection point — peak before
// the bust, or the climactic crash day, depending on which is more
// recognizable. Tags are intentionally terse.
const EVENTS = [
  { yyyymm: '1987-10', year: '1987', tag: 'Black Monday' },
  { yyyymm: '2000-03', year: '2000', tag: 'dot-com peak' },
  { yyyymm: '2001-09', year: '2001', tag: '9/11' },
  { yyyymm: '2008-09', year: '2008', tag: 'Lehman / GFC' },
  { yyyymm: '2011-08', year: '2011', tag: 'US downgrade' },
  { yyyymm: '2020-03', year: '2020', tag: 'COVID low' },
  { yyyymm: '2022-01', year: '2022', tag: 'rate shock' },
]

// Position events as vertical dashed lines spanning the leaderboard,
// labeled at the top. Aligned to whichever row's chart-wrap is
// currently mounted — all wraps share the same flex sizing, so the
// first one we find is representative. Re-measures on resize.
export default function BackgroundTimeline({ globalMonths }) {
  const [layout, setLayout] = useState(null)

  useLayoutEffect(() => {
    function measure() {
      const wrap = document.querySelector('.row-chart-wrap')
      const board = document.querySelector('.leaderboard')
      if (!wrap || !board) return
      const wrapRect = wrap.getBoundingClientRect()
      const boardRect = board.getBoundingClientRect()
      setLayout({
        left: wrapRect.left - boardRect.left,
        width: wrapRect.width,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    // Poll once more after a tick — when the leaderboard first mounts
    // the children may not be laid out yet.
    const tid = setTimeout(measure, 100)
    return () => {
      window.removeEventListener('resize', measure)
      clearTimeout(tid)
    }
  }, [globalMonths])

  if (!layout || !globalMonths?.length) return null

  const totalMonths = globalMonths.length
  const firstMonth = globalMonths[0]

  return (
    <div className="bg-timeline" aria-hidden>
      {EVENTS.map(e => {
        // Skip events that fall outside the visible 40-year window.
        if (e.yyyymm < firstMonth) return null
        const idx = globalMonths.indexOf(e.yyyymm)
        if (idx < 0) return null
        const x = layout.left + (idx / (totalMonths - 1)) * layout.width
        return (
          <div
            key={e.yyyymm}
            className="bg-timeline-mark"
            style={{ left: `${x}px` }}
          >
            <div className="bg-timeline-label">
              <span className="bg-timeline-year">{e.year}</span>
              <span className="bg-timeline-tag">{e.tag}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
