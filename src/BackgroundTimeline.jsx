import React, { useEffect, useLayoutEffect, useState } from 'react'

// Major financial events. The dashed verticals slice through the
// leaderboard at the right month; the labels float fixed against the
// viewport, rendered as narrow vertical strips so they don't crowd
// the chart even when adjacent events sit only a few pixels apart.
const EVENTS = [
  { yyyymm: '1987-10', year: '1987', tag: 'Black Monday' },
  { yyyymm: '2000-03', year: '2000', tag: 'dot-com peak' },
  { yyyymm: '2001-09', year: '2001', tag: '9/11' },
  { yyyymm: '2008-09', year: '2008', tag: 'Lehman / GFC' },
  { yyyymm: '2011-08', year: '2011', tag: 'US downgrade' },
  { yyyymm: '2020-03', year: '2020', tag: 'COVID low' },
  { yyyymm: '2022-01', year: '2022', tag: 'rate shock' },
]

export default function BackgroundTimeline({ globalMonths }) {
  // Two coordinate systems: `boardLeft` for the dashed marks (drawn
  // inside .leaderboard), and `viewportLeft` for the labels (drawn
  // position:fixed against the viewport). Vertical scroll doesn't
  // shift either, so we only re-measure on resize.
  const [layout, setLayout] = useState(null)
  const [inView, setInView] = useState(false)

  useLayoutEffect(() => {
    function measure() {
      const wrap = document.querySelector('.row-chart-wrap')
      const board = document.querySelector('.leaderboard')
      if (!wrap || !board) return
      const wrapRect = wrap.getBoundingClientRect()
      const boardRect = board.getBoundingClientRect()
      setLayout({
        boardLeft: wrapRect.left - boardRect.left,
        viewportLeft: wrapRect.left,
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

  // Only paint the labels when an actual leaderboard row is sitting at
  // the viewport's vertical midline — i.e. when rows are physically
  // scrolling across where the labels would render. Anywhere else and
  // they'd float over the masthead/methodology with nothing behind
  // them, which reads as visual noise.
  useEffect(() => {
    const board = document.querySelector('.leaderboard')
    if (!board) return
    function check() {
      const rect = board.getBoundingClientRect()
      const center = window.innerHeight / 2
      setInView(rect.top < center && rect.bottom > center)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [globalMonths])

  if (!layout || !globalMonths?.length) return null

  const totalMonths = globalMonths.length
  const firstMonth = globalMonths[0]

  const placed = EVENTS.map(e => {
    if (e.yyyymm < firstMonth) return null
    const idx = globalMonths.indexOf(e.yyyymm)
    if (idx < 0) return null
    const frac = idx / (totalMonths - 1)
    return {
      ...e,
      boardX: layout.boardLeft + frac * layout.width,
      viewportX: layout.viewportLeft + frac * layout.width,
    }
  }).filter(Boolean)

  return (
    <>
      <div className="bg-timeline" aria-hidden>
        {placed.map(e => (
          <div
            key={e.yyyymm}
            className="bg-timeline-mark"
            style={{ left: `${e.boardX}px` }}
          />
        ))}
      </div>
      {inView && (
        <div className="bg-timeline-labels" aria-hidden>
          {placed.map(e => (
            <div
              key={e.yyyymm}
              className="bg-timeline-label"
              style={{ left: `${e.viewportX}px` }}
            >
              <span className="bg-timeline-year">{e.year}</span>
              <span className="bg-timeline-tag">{e.tag}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
