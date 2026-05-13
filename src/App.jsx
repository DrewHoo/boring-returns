import React, { useEffect, useMemo, useRef, useState } from 'react'
import { track } from './analytics.js'
import Row, { buildGlobalMonths } from './Row.jsx'
import Detail from './Detail.jsx'
import BackgroundTimeline from './BackgroundTimeline.jsx'
import { cagrColor, CAGR_NEUTRAL } from './chart-utils.js'

const SORT_OPTIONS = [
  { code: 'recent',   label: '10-year',   key: 'trailing10yCAGR', dir: 'desc' },
  { code: 'lifetime', label: 'lifetime',  key: 'lifetimeCAGR',    dir: 'desc' },
  { code: 'boring',   label: 'boring',    key: 'boringness',      dir: 'desc' },
  { code: 'worst',    label: 'worst',     key: 'lifetimeCAGR',    dir: 'asc'  },
]

const FILTER_OPTIONS = [
  { code: 'all',           label: 'all',             match: () => true },
  { code: 'stock',         label: 'stocks',          match: c => c === 'stock' },
  { code: 'etf-broad',     label: 'broad-market ETFs',  match: c => c === 'etf-broad' },
  { code: 'etf-sector',    label: 'sector ETFs',        match: c => c === 'etf-sector' },
  { code: 'etf-factor',    label: 'factor ETFs',        match: c => c === 'etf-factor' },
  { code: 'etf-country',   label: 'country ETFs',       match: c => c === 'etf-country' },
  { code: 'etf-bond',      label: 'bond ETFs',          match: c => c === 'etf-bond' },
  { code: 'commodity',     label: 'commodities',     match: c => c === 'commodity' || c === 'etf-commodity' },
  { code: 'crypto',        label: 'crypto',          match: c => c === 'crypto' },
]

function readInitialState() {
  if (typeof window === 'undefined') return { t: null, s: 'recent', f: 'all' }
  const params = new URLSearchParams(window.location.search)
  const t = (params.get('t') || '').toUpperCase().trim() || null
  const sRaw = (params.get('s') || '').toLowerCase()
  const s = SORT_OPTIONS.find(o => o.code === sRaw)?.code || 'recent'
  const fRaw = (params.get('f') || '').toLowerCase()
  const f = FILTER_OPTIONS.find(o => o.code === fRaw)?.code || 'all'
  return { t, s, f }
}

export default function App() {
  const initial = useMemo(() => readInitialState(), [])
  const [index, setIndex] = useState(null)
  const [allData, setAllData] = useState({})    // symbol → ticker JSON
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(initial.t)
  const [sort, setSort] = useState(initial.s)
  const [filter, setFilter] = useState(initial.f)
  const baseUrl = import.meta.env.BASE_URL

  // Load the leaderboard index, then fan out to every per-ticker JSON.
  useEffect(() => {
    let cancelled = false
    fetch(`${baseUrl}data/index.json`)
      .then(r => r.json())
      .then(idx => {
        if (cancelled) return
        setIndex(idx)
        setProgress({ done: 0, total: idx.tickers.length })
        // Parallel fan-out. Browser will multiplex; HTTP/2 keeps it sane.
        let done = 0
        for (const t of idx.tickers) {
          fetch(`${baseUrl}data/${encodeURIComponent(t.symbol)}.json`)
            .then(r => r.json())
            .then(d => {
              if (cancelled) return
              setAllData(s => ({ ...s, [d.symbol]: d }))
              done++
              setProgress({ done, total: idx.tickers.length })
            })
            .catch(() => {
              done++
              setProgress(p => ({ ...p, done }))
            })
        }
      })
      .catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [baseUrl])

  // Mirror state into the URL.
  useEffect(() => {
    const params = new URLSearchParams()
    if (selected) params.set('t', selected)
    if (sort !== 'recent') params.set('s', sort)
    if (filter !== 'all') params.set('f', filter)
    const qs = params.toString()
    const next = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname
    const current = window.location.pathname + (window.location.search || '')
    if (next !== current) {
      window.history.replaceState(null, '', next)
    }
  }, [selected, sort, filter])

  useEffect(() => { track('Board viewed', {}) }, [])

  const globalMonths = useMemo(() => {
    if (!index?.tickers?.length) return null
    // Anchor the timeline on the latest lastMonth in the universe.
    let latest = index.tickers[0].lastMonth
    for (const t of index.tickers) {
      if (t.lastMonth > latest) latest = t.lastMonth
    }
    return buildGlobalMonths(latest)
  }, [index])

  const filtered = useMemo(() => {
    if (!index) return []
    const f = FILTER_OPTIONS.find(o => o.code === filter)
    return index.tickers.filter(t => f.match(t.category))
  }, [index, filter])

  const sorted = useMemo(() => {
    const o = SORT_OPTIONS.find(x => x.code === sort)
    const arr = [...filtered]
    const m = o.dir === 'desc' ? -1 : 1
    arr.sort((a, b) => {
      const av = a[o.key]; const bv = b[o.key]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      return (av - bv) * m
    })
    return arr
  }, [filtered, sort])

  function selectTicker(sym) {
    const next = sym === selected ? null : sym
    setSelected(next)
    if (next) {
      const t = index?.tickers.find(x => x.symbol === next)
      track('Row expanded', { ticker: next, name: t?.name, category: t?.category })
    }
  }

  function changeSort(s) {
    setSort(s)
    track('Sort changed', { sort: s })
  }

  function changeFilter(f) {
    setFilter(f)
    track('Filter changed', { filter: f })
  }

  if (error) return <main className="error">Couldn't load data: {error}</main>

  return (
    <main>
      <header className="masthead">
        <h1>Boring Returns</h1>
        <p className="subhead">
          the long-run annualized return of the S&amp;P 500 — by long-run
          convention, somewhere around ten percent a year, which is also,
          by long-run convention, the most boring sentence ever to be
          approximately true.
        </p>
        <p className="lede">
          Your brokerage shows you a line graph. The line goes up, more or
          less, with the kind of jagged enthusiasm that line graphs have,
          and you are meant to look at it and form some opinion about
          whether to act. This is, on inspection, an absurd thing to ask
          a person to do. Below — instead — is every ticker we could find,
          rendered as a forty-year strip of monthly squares, each square
          colored by the annualized return you would have earned had you
          bought in that month and held until the present and refused,
          with grim stoic dignity, to look at your account in between.
          Ten percent a year — the historical American average; the polite
          dinner-party answer to the question of what stocks do — is
          rendered in tan, on the theory that the historical American
          average should look exactly that exciting.
        </p>
      </header>

      <Legend />

      <section className="controls">
        <div className="controls-row">
          <TickerSearch
            tickers={index?.tickers || []}
            onSelect={sym => {
              setSelected(sym)
              setTimeout(() => {
                const el = document.querySelector(`[data-row-symbol="${sym}"]`)
                el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
              }, 50)
              track('Search selected', { ticker: sym })
            }}
          />
          <ShareButton />
        </div>
        <div className="controls-row">
          <div className="controls-label">sort:</div>
          {SORT_OPTIONS.map(o => (
            <button
              key={o.code}
              className={sort === o.code ? 'chip-control chip-control--active' : 'chip-control'}
              onClick={() => changeSort(o.code)}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="controls-row">
          <div className="controls-label">filter:</div>
          {FILTER_OPTIONS.map(o => (
            <button
              key={o.code}
              className={filter === o.code ? 'chip-control chip-control--active' : 'chip-control'}
              onClick={() => changeFilter(o.code)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </section>

      {!index ? (
        <p className="loading">Loading the index…</p>
      ) : (
        <>
          {progress.done < progress.total && (
            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
              <div className="progress-label">
                {progress.done} of {progress.total} tickers loaded
              </div>
            </div>
          )}
          {globalMonths && (
            <div className="leaderboard">
              <BackgroundTimeline globalMonths={globalMonths} />
              {sorted.map(t => {
                const data = allData[t.symbol]
                if (!data) {
                  return (
                    <div
                      className="row row--loading"
                      key={t.symbol}
                      data-row-symbol={t.symbol}
                    >
                      <div className="row-symbol">
                        <strong>{t.symbol}</strong>
                        <span className="row-symbol-name">{t.name}</span>
                      </div>
                      <div className="row-chart-wrap row-chart-wrap--placeholder" />
                    </div>
                  )
                }
                const isOpen = selected === t.symbol
                return (
                  <React.Fragment key={t.symbol}>
                    <Row
                      data={data}
                      globalMonths={globalMonths}
                      onClick={selectTicker}
                    />
                    {isOpen && <Detail data={data} globalMonths={globalMonths} />}
                  </React.Fragment>
                )
              })}
            </div>
          )}
        </>
      )}

      <Methodology generatedAt={index?.generatedAt} tickerCount={index?.tickers?.length} />
    </main>
  )
}

function TickerSearch({ tickers, onSelect }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase()
    if (!q) return tickers.slice(0, 30)
    return tickers
      .filter(t =>
        t.symbol.includes(q) ||
        (t.name || '').toUpperCase().includes(q)
      )
      .slice(0, 30)
  }, [query, tickers])

  function commit(sym) {
    onSelect(sym)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div className="ticker-search" ref={wrapRef}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        placeholder={tickers.length
          ? `search ${tickers.length.toLocaleString()} tickers — symbol or name`
          : 'loading…'}
        onFocus={() => setOpen(true)}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onKeyDown={e => {
          if (e.key === 'Enter' && filtered[0]) commit(filtered[0].symbol)
          else if (e.key === 'Escape') { setOpen(false); setQuery('') }
        }}
      />
      {open && tickers.length > 0 && (
        <ul className="ticker-search-results" role="listbox">
          {filtered.map(t => (
            <li
              key={t.symbol}
              role="option"
              onMouseDown={() => commit(t.symbol)}
            >
              <span className="result-symbol">{t.symbol}</span>
              <span className="result-name">{t.name}</span>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="no-results">no match for "{query}"</li>
          )}
        </ul>
      )}
    </div>
  )
}

function Legend() {
  // Render a compact gradient bar with anchor labels at the breakpoints.
  const stops = [-0.05, 0, 0.04, 0.07, 0.10, 0.13, 0.18, 0.25]
  const gradient = stops
    .map((v, i) => `${cagrColor(v)} ${(i / (stops.length - 1)) * 100}%`)
    .join(', ')
  return (
    <section className="legend">
      <div className="legend-gradient" style={{ background: `linear-gradient(to right, ${gradient})` }} />
      <div className="legend-labels">
        <span>−5%</span>
        <span>0%</span>
        <span>7%</span>
        <span className="legend-label-anchor">10%/yr</span>
        <span>13%</span>
        <span>18%</span>
        <span>25%+</span>
      </div>
      <p className="legend-caption">
        Warm = below the long-run market. Tan = at the market
        ({Math.round(CAGR_NEUTRAL * 100)}%/yr). Cool = above. Gray hatch
        marks months too recent to have a meaningful annualized return.
        Hover or tap a month for the rest.
      </p>
    </section>
  )
}

function ShareButton() {
  const [copied, setCopied] = useState(false)
  function share() {
    const url = window.location.href
    track('Share clicked', { url })
    const done = () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(done, done)
    } else {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch {}
      document.body.removeChild(ta)
      done()
    }
  }
  return (
    <button
      className={copied ? 'share-button share-button--copied' : 'share-button'}
      onClick={share}
      title="Copy a link to this exact view"
    >
      {copied ? '✓ link copied' : 'share'}
    </button>
  )
}

function Methodology({ generatedAt, tickerCount }) {
  return (
    <section className="methodology">
      <h3>A note on method, and on what the chart is for</h3>
      <p>
        Forty years of monthly adjusted closes from Yahoo Finance, downsampled
        from the daily series to a per-month average. Each month's color is the
        annualized return you would have earned, dividends reinvested,
        had you bought at that month's average closing price and held to the
        most recent daily close. Taxes are ignored, transaction costs are
        ignored, and regret is unpriceable.
      </p>
      <p>
        The color scale hinges on ten percent a year, an entirely conventional
        figure for the long-run nominal return of the U.S. stock market and
        a figure that is meant, in this chart, to feel exactly that
        conventional — a flat tan, the color of a discount-store envelope, the
        color a hotel chooses when it wants to seem reliable and unmemorable.
        Months above tan beat the long run; months below it didn't. Gray hatch
        means the month is too young — a buy six months ago doesn't yet have
        a meaningfully annualizable return to today.
      </p>
      <p>
        The S&amp;P 500's constituents, then as now, contain only those
        constituents who lived to see it; we are not attempting to correct for
        survivorship. {tickerCount ? `${tickerCount} tickers shown.` : null}{' '}
        Data refreshed {generatedAt ? new Date(generatedAt).toLocaleString() : '—'}.
      </p>
    </section>
  )
}
