'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        '#05070d',
  bgCard:    '#0a0d1a',
  bgInput:   '#080b14',
  border:    '#1a2035',
  borderGold:'rgba(212,168,83,0.25)',
  gold:      '#d4a853',
  goldDim:   '#a07835',
  goldGlow:  'rgba(212,168,83,0.12)',
  goldGlow2: 'rgba(212,168,83,0.06)',
  textPrimary:   '#e8e0d0',
  textSecondary: '#8a8070',
  textMuted:     '#3a3530',
  verified:  '#22c55e',
  caution:   '#f59e0b',
  danger:    '#ef4444',
  purple:    '#8b5cf6',
  blue:      '#3b82f6',
}

const SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, "Times New Roman", serif'
const SANS  = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const MONO  = '"SF Mono", "Fira Code", "Courier New", monospace'

// ─── Research modes ────────────────────────────────────────────────────────────
const MODES = [
  {
    id: 'case_law',
    label: 'Case Law',
    icon: '⚖',
    desc: 'Search real court decisions by topic, jurisdiction, and outcome',
    color: C.gold,
    placeholder: 'e.g. fraudulent misrepresentation in securities offerings, 9th Circuit',
  },
  {
    id: 'statute',
    label: 'Statute Lookup',
    icon: '📜',
    desc: 'Federal and state statutes by topic or code section',
    color: C.blue,
    placeholder: 'e.g. non-compete enforceability California, trade secret definition DTSA',
  },
  {
    id: 'precedent',
    label: 'Precedent Analysis',
    icon: '🔗',
    desc: 'How courts have ruled on specific legal issues over time',
    color: C.purple,
    placeholder: 'e.g. piercing the corporate veil alter ego liability, reasonable reliance standard',
  },
  {
    id: 'regulatory',
    label: 'Regulatory Research',
    icon: '🏛',
    desc: 'FTC, SEC, FDIC, EPA rules, releases, and guidance documents',
    color: C.caution,
    placeholder: 'e.g. SEC Regulation D private placement exemptions, FTC endorsement guides',
  },
]

const JURISDICTIONS = [
  { value: 'all',        label: 'All Jurisdictions' },
  { value: 'federal',    label: 'Federal' },
  { value: '1st-cir',   label: '1st Circuit' },
  { value: '2nd-cir',   label: '2nd Circuit' },
  { value: '3rd-cir',   label: '3rd Circuit' },
  { value: '4th-cir',   label: '4th Circuit' },
  { value: '5th-cir',   label: '5th Circuit' },
  { value: '6th-cir',   label: '6th Circuit' },
  { value: '7th-cir',   label: '7th Circuit' },
  { value: '8th-cir',   label: '8th Circuit' },
  { value: '9th-cir',   label: '9th Circuit' },
  { value: '10th-cir',  label: '10th Circuit' },
  { value: '11th-cir',  label: '11th Circuit' },
  { value: 'dc-cir',    label: 'D.C. Circuit' },
  { value: 'california',label: 'California' },
  { value: 'new-york',  label: 'New York' },
  { value: 'texas',     label: 'Texas' },
  { value: 'florida',   label: 'Florida' },
  { value: 'illinois',  label: 'Illinois' },
  { value: 'pennsylvania', label: 'Pennsylvania' },
  { value: 'ohio',      label: 'Ohio' },
  { value: 'georgia',   label: 'Georgia' },
  { value: 'washington',label: 'Washington' },
  { value: 'massachusetts', label: 'Massachusetts' },
  { value: 'virginia',  label: 'Virginia' },
  { value: 'colorado',  label: 'Colorado' },
  { value: 'arizona',   label: 'Arizona' },
  { value: 'nevada',    label: 'Nevada' },
  { value: 'delaware',  label: 'Delaware' },
]

const SAMPLE_QUERIES = {
  case_law:   'intentional infliction of emotional distress workplace harassment',
  statute:    'California WARN Act employee notification requirements',
  precedent:  'reasonable expectation of privacy third-party doctrine',
  regulatory: 'SEC Regulation Crowdfunding investment limits disclosure',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function scoreColor(n) {
  if (n >= 80) return C.verified
  if (n >= 55) return C.caution
  return C.danger
}

function confidenceLetter(n) {
  if (n >= 90) return 'A'
  if (n >= 80) return 'B'
  if (n >= 65) return 'C'
  return 'D'
}

function typeColor(type) {
  const map = { case: C.gold, statute: C.blue, regulation: C.caution, restatement: C.purple }
  return map[type] ?? C.textSecondary
}

function statusColor(s) {
  if (!s) return C.textMuted
  if (s === 'Good law' || s === 'Current') return C.verified
  if (s === 'Distinguished' || s === 'Superseded') return C.caution
  return C.danger
}

function outcomeColor(o) {
  if (!o) return C.textMuted
  if (o === 'plaintiff-favorable') return C.caution
  if (o === 'defendant-favorable') return C.blue
  return C.textSecondary
}

function formatDate(d) {
  if (!d) return null
  const year = String(d).slice(0, 4)
  const num = parseInt(year, 10)
  if (!num) return d
  const now = new Date().getFullYear()
  const diff = now - num
  if (diff === 0) return `${year} · This year`
  if (diff <= 2) return `${year} · ${diff}y ago`
  if (diff <= 5) return `${year} · Recent`
  if (diff <= 15) return `${year} · Modern`
  return `${year} · Classic`
}

// ─── ResultCard ────────────────────────────────────────────────────────────────
function ResultCard({ result, onSave, isSaved, index }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: C.bgCard,
      border: `1px solid ${C.border}`,
      borderRadius: '10px',
      padding: '22px 24px',
      animation: 'slideUp 0.35s ease both',
      animationDelay: `${index * 60}ms`,
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.borderGold}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            <span style={{
              fontSize: '10px', fontWeight: '700', letterSpacing: '0.07em',
              textTransform: 'uppercase', padding: '2px 7px', borderRadius: '4px',
              background: `${typeColor(result.type)}18`, color: typeColor(result.type),
              border: `1px solid ${typeColor(result.type)}30`,
            }}>{result.type ?? 'source'}</span>

            {result.jurisdiction && (
              <span style={{
                fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                background: 'rgba(212,168,83,0.07)', color: C.textSecondary,
                border: `1px solid ${C.border}`,
              }}>⚖ {result.jurisdiction}</span>
            )}

            {result.practiceArea && (
              <span style={{
                fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                background: 'rgba(59,130,246,0.08)', color: C.blue,
                border: `1px solid rgba(59,130,246,0.2)`,
              }}>{result.practiceArea}</span>
            )}

            {result.status && result.status !== 'null' && (
              <span style={{
                fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                background: `${statusColor(result.status)}15`,
                color: statusColor(result.status),
                border: `1px solid ${statusColor(result.status)}30`,
              }}>{result.status}</span>
            )}

            {result.outcome && result.outcome !== 'null' && (
              <span style={{
                fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                background: `${outcomeColor(result.outcome)}12`,
                color: outcomeColor(result.outcome),
                border: `1px solid ${outcomeColor(result.outcome)}30`,
              }}>{result.outcome.replace(/-/g, ' ')}</span>
            )}

            {result.source === 'CourtListener' && (
              <span style={{
                fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                background: 'rgba(34,197,94,0.08)', color: C.verified,
                border: `1px solid rgba(34,197,94,0.2)`,
              }}>✓ Live source</span>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            margin: 0, fontSize: '15px', fontFamily: SERIF, fontWeight: '700',
            color: C.textPrimary, lineHeight: '1.35',
          }}>{result.title}</h3>

          {/* Citation */}
          {result.citation && (
            <p style={{
              margin: '4px 0 0', fontSize: '12px', fontFamily: MONO,
              color: C.gold, opacity: 0.8,
            }}>{result.citation}</p>
          )}
        </div>

        {/* Score column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Relevance */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: `2px solid ${scoreColor(result.relevance ?? 0)}40`,
              background: `${scoreColor(result.relevance ?? 0)}10`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: scoreColor(result.relevance ?? 0), lineHeight: 1 }}>
                {result.relevance ?? '?'}
              </span>
              <span style={{ fontSize: '8px', color: C.textMuted, lineHeight: 1 }}>REL</span>
            </div>
          </div>

          {/* Confidence letter */}
          <div style={{
            width: '26px', height: '26px', borderRadius: '6px',
            background: `${scoreColor(result.confidence ?? 0)}15`,
            border: `1px solid ${scoreColor(result.confidence ?? 0)}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: scoreColor(result.confidence ?? 0) }}>
              {confidenceLetter(result.confidence ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Date bar */}
      {result.date && (
        <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '10px' }}>
          📅 {formatDate(result.date)}
        </div>
      )}

      {/* Summary */}
      {result.summary && (
        <p style={{
          margin: '0 0 12px', fontSize: '13px', color: C.textSecondary,
          lineHeight: '1.65',
        }}>{result.summary}</p>
      )}

      {/* Key points */}
      {result.keyPoints?.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          {result.keyPoints.slice(0, expanded ? undefined : 2).map((pt, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              fontSize: '12px', color: C.textSecondary,
              padding: '4px 0',
              borderTop: i === 0 ? `1px solid ${C.border}` : 'none',
            }}>
              <span style={{ color: C.gold, fontSize: '9px', marginTop: '4px', flexShrink: 0 }}>✦</span>
              {pt}
            </div>
          ))}
          {result.keyPoints.length > 2 && (
            <button onClick={() => setExpanded(x => !x)} style={{
              background: 'none', border: 'none', color: C.gold, fontSize: '11px',
              cursor: 'pointer', padding: '4px 0', letterSpacing: '0.04em',
            }}>
              {expanded ? '− Show less' : `+ ${result.keyPoints.length - 2} more points`}
            </button>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
        {result.url && (
          <a href={result.url} target="_blank" rel="noopener noreferrer" style={{
            fontSize: '11px', color: C.gold, textDecoration: 'none',
            padding: '5px 11px', borderRadius: '5px',
            border: `1px solid ${C.borderGold}`,
            background: C.goldGlow2, letterSpacing: '0.04em',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.goldGlow; e.currentTarget.style.borderColor = C.gold }}
            onMouseLeave={e => { e.currentTarget.style.background = C.goldGlow2; e.currentTarget.style.borderColor = C.borderGold }}
          >View Source →</a>
        )}

        <button onClick={() => onSave(result)} style={{
          fontSize: '11px',
          color: isSaved ? C.gold : C.textMuted,
          background: isSaved ? C.goldGlow2 : 'transparent',
          border: `1px solid ${isSaved ? C.borderGold : C.textMuted + '30'}`,
          padding: '5px 11px', borderRadius: '5px',
          cursor: 'pointer', letterSpacing: '0.04em',
          transition: 'all 0.15s',
        }}>
          {isSaved ? '★ Saved' : '☆ Save'}
        </button>

        <div style={{ flex: 1 }} />

        <span style={{
          fontSize: '10px', color: C.textMuted, fontFamily: MONO,
        }}>Confidence: {result.confidence ?? '?'}%</span>
      </div>
    </div>
  )
}

// ─── Skeleton loader ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: '10px', padding: '22px 24px',
      animation: 'pulse 1.6s ease-in-out infinite',
    }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ height: '12px', width: '40%', background: C.border, borderRadius: '4px', marginBottom: '10px' }} />
          <div style={{ height: '16px', width: '75%', background: C.border, borderRadius: '4px', marginBottom: '6px' }} />
          <div style={{ height: '11px', width: '45%', background: C.border, borderRadius: '4px' }} />
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: C.border }} />
      </div>
      <div style={{ height: '13px', width: '100%', background: C.border, borderRadius: '4px', marginBottom: '6px' }} />
      <div style={{ height: '13px', width: '85%', background: C.border, borderRadius: '4px', marginBottom: '6px' }} />
      <div style={{ height: '13px', width: '60%', background: C.border, borderRadius: '4px' }} />
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function ResearchPage() {
  const [mode, setMode]         = useState('case_law')
  const [query, setQuery]       = useState('')
  const [jurisdiction, setJurisdiction] = useState('all')
  const [loading, setLoading]   = useState(false)
  const [results, setResults]   = useState(null)
  const [error, setError]       = useState(null)
  const [recentSearches, setRecentSearches] = useState([])
  const [savedResults, setSavedResults]     = useState([])
  const [savedTab, setSavedTab] = useState(false)
  const [exportMsg, setExportMsg] = useState(null)
  const inputRef = useRef(null)

  // Persist recent searches and saved results in localStorage
  useEffect(() => {
    try {
      const rs = localStorage.getItem('tl_recent_searches')
      if (rs) setRecentSearches(JSON.parse(rs))
      const sr = localStorage.getItem('tl_saved_results')
      if (sr) setSavedResults(JSON.parse(sr))
    } catch {}
  }, [])

  const saveToLocalStorage = useCallback((key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  }, [])

  const currentMode = MODES.find(m => m.id === mode) ?? MODES[0]

  async function handleSearch(q = query) {
    const trimmed = q.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setResults(null)
    setSavedTab(false)

    // Update recent searches (dedup, max 5)
    const updated = [
      { query: trimmed, mode, jurisdiction, ts: Date.now() },
      ...recentSearches.filter(r => r.query !== trimmed),
    ].slice(0, 5)
    setRecentSearches(updated)
    saveToLocalStorage('tl_recent_searches', updated)

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, mode, jurisdiction }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Research failed')
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSave(result) {
    const alreadySaved = savedResults.some(r => r.id === result.id)
    const next = alreadySaved
      ? savedResults.filter(r => r.id !== result.id)
      : [{ ...result, savedAt: Date.now() }, ...savedResults]
    setSavedResults(next)
    saveToLocalStorage('tl_saved_results', next)
  }

  function isSaved(id) {
    return savedResults.some(r => r.id === id)
  }

  function handleExport() {
    const data = savedTab ? savedResults : (results?.results ?? [])
    if (data.length === 0) return
    const lines = data.map(r => [
      `TITLE: ${r.title}`,
      r.citation ? `CITATION: ${r.citation}` : '',
      `JURISDICTION: ${r.jurisdiction ?? 'N/A'}`,
      `DATE: ${r.date ?? 'N/A'}`,
      `RELEVANCE: ${r.relevance ?? 'N/A'}%`,
      `CONFIDENCE: ${r.confidence ?? 'N/A'}%`,
      r.summary ? `SUMMARY: ${r.summary}` : '',
      r.url ? `URL: ${r.url}` : '',
      '─'.repeat(60),
    ].filter(Boolean).join('\n'))

    const header = `TRUSTLAYER LEGAL RESEARCH EXPORT\n${'═'.repeat(60)}\nQuery: ${query}\nMode: ${mode}\nJurisdiction: ${jurisdiction}\nDate: ${new Date().toLocaleDateString()}\n${'═'.repeat(60)}\n\n`
    const blob = new Blob([header + lines.join('\n\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trustlayer-research-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setExportMsg('Exported!')
    setTimeout(() => setExportMsg(null), 2200)
  }

  const displayResults = savedTab ? savedResults : (results?.results ?? [])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: SANS, color: C.textPrimary }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '68px',
        background: 'rgba(5,7,13,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 16px ${C.goldGlow}`,
            }}>
              <span style={{ fontSize: '18px', fontFamily: SERIF, fontWeight: '700', color: '#0a0800' }}>T</span>
            </div>
            <span style={{ fontSize: '20px', fontFamily: SERIF, fontWeight: '700', letterSpacing: '0.02em', color: C.textPrimary }}>
              Trust<span style={{ color: C.gold }}>Layer</span>
            </span>
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <Link href="/" style={{
            fontSize: '13px', color: C.textSecondary, textDecoration: 'none',
            letterSpacing: '0.04em', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.target.style.color = C.gold}
            onMouseLeave={e => e.target.style.color = C.textSecondary}
          >Verify</Link>

          <Link href="/research" style={{
            fontSize: '13px', color: C.gold, textDecoration: 'none',
            letterSpacing: '0.04em', borderBottom: `1px solid ${C.gold}`,
            paddingBottom: '2px',
          }}>Research</Link>

          <Link href="/enterprise" style={{
            fontSize: '13px', color: C.textSecondary, textDecoration: 'none',
            letterSpacing: '0.04em', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.target.style.color = C.gold}
            onMouseLeave={e => e.target.style.color = C.textSecondary}
          >Enterprise</Link>

          <Link href="/request-access" style={{
            padding: '8px 20px', borderRadius: '6px',
            border: `1px solid ${C.borderGold}`,
            background: C.goldGlow2,
            color: C.gold, fontSize: '13px',
            textDecoration: 'none', display: 'inline-block',
            letterSpacing: '0.04em', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.goldGlow; e.currentTarget.style.borderColor = C.gold }}
            onMouseLeave={e => { e.currentTarget.style.background = C.goldGlow2; e.currentTarget.style.borderColor = C.borderGold }}
          >Request Access</Link>
        </div>
      </nav>

      {/* ── Hero + Search ───────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(180deg, rgba(212,168,83,0.04) 0%, transparent 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: '56px 40px 40px',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: C.goldGlow2, border: `1px solid ${C.borderGold}`,
            borderRadius: '20px', padding: '5px 14px',
            marginBottom: '20px',
          }}>
            <span style={{ color: C.gold, fontSize: '11px' }}>⚖</span>
            <span style={{ fontSize: '11px', color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '600' }}>
              AI Legal Research
            </span>
          </div>

          <h1 style={{
            fontFamily: SERIF, fontSize: 'clamp(30px, 4.5vw, 50px)',
            fontWeight: '700', letterSpacing: '-0.01em',
            lineHeight: '1.15', margin: '0 0 12px', color: C.textPrimary,
          }}>
            Research Any Legal Question<br />
            <span style={{ color: C.gold }}>With AI Precision</span>
          </h1>

          <p style={{
            fontSize: '15px', color: C.textSecondary, margin: '0 0 32px',
            maxWidth: '580px', lineHeight: '1.6', fontFamily: SERIF, fontStyle: 'italic',
          }}>
            Case law, statutes, precedent, and regulations — sourced in seconds, verified by AI.
          </p>

          {/* Mode tabs */}
          <div style={{
            display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px',
          }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); setResults(null) }} style={{
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                border: `1px solid ${mode === m.id ? m.color + '50' : C.border}`,
                background: mode === m.id ? `${m.color}12` : 'transparent',
                color: mode === m.id ? m.color : C.textSecondary,
                fontSize: '13px', fontWeight: mode === m.id ? '600' : '400',
                letterSpacing: '0.02em', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
                onMouseEnter={e => {
                  if (mode !== m.id) {
                    e.currentTarget.style.borderColor = m.color + '30'
                    e.currentTarget.style.color = C.textPrimary
                  }
                }}
                onMouseLeave={e => {
                  if (mode !== m.id) {
                    e.currentTarget.style.borderColor = C.border
                    e.currentTarget.style.color = C.textSecondary
                  }
                }}
              >
                <span>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>

          {/* Search bar + jurisdiction */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
              {/* Query input */}
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center',
                background: C.bgInput, border: `1px solid ${C.border}`,
                borderRadius: '10px', padding: '0 16px',
                transition: 'border-color 0.2s',
              }}
                onFocusCapture={e => e.currentTarget.style.borderColor = C.borderGold}
                onBlurCapture={e => e.currentTarget.style.borderColor = C.border}
              >
                <span style={{ color: C.textMuted, fontSize: '16px', marginRight: '10px', flexShrink: 0 }}>⚲</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder={currentMode.placeholder}
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    color: C.textPrimary, fontSize: '14px', padding: '16px 0',
                    fontFamily: SANS,
                  }}
                />
                {query && (
                  <button onClick={() => setQuery('')} style={{
                    background: 'none', border: 'none', color: C.textMuted,
                    cursor: 'pointer', fontSize: '16px', padding: '0 4px',
                  }}>×</button>
                )}
              </div>

              {/* Jurisdiction selector */}
              <select
                value={jurisdiction}
                onChange={e => setJurisdiction(e.target.value)}
                style={{
                  background: C.bgInput, border: `1px solid ${C.border}`,
                  borderRadius: '10px', color: C.textSecondary,
                  fontSize: '13px', padding: '0 14px', cursor: 'pointer',
                  outline: 'none', minWidth: '160px',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = C.borderGold}
                onBlur={e => e.target.style.borderColor = C.border}
              >
                {JURISDICTIONS.map(j => (
                  <option key={j.value} value={j.value} style={{ background: C.bgCard }}>
                    {j.label}
                  </option>
                ))}
              </select>

              {/* Search button */}
              <button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                style={{
                  padding: '0 28px', borderRadius: '10px', border: 'none',
                  background: loading || !query.trim()
                    ? C.border
                    : `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                  color: loading || !query.trim() ? C.textMuted : '#0a0800',
                  fontSize: '14px', fontWeight: '700', letterSpacing: '0.04em',
                  cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                  boxShadow: loading || !query.trim() ? 'none' : `0 4px 16px rgba(212,168,83,0.25)`,
                }}
              >
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{
                      width: '13px', height: '13px', border: `2px solid #0a0800`,
                      borderTopColor: 'transparent', borderRadius: '50%',
                      display: 'inline-block', animation: 'spin 0.7s linear infinite',
                    }} />
                    Searching
                  </span>
                ) : 'Search'}
              </button>
            </div>

            {/* Mode description */}
            <p style={{ fontSize: '12px', color: C.textMuted, margin: 0, paddingLeft: '2px' }}>
              <span style={{ color: currentMode.color }}>{currentMode.icon} {currentMode.label}</span>
              {' — '}{currentMode.desc}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main content grid ────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '32px 40px',
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: '28px',
        alignItems: 'start',
      }}>

        {/* ── Results column ───────────────────────────────────────────────── */}
        <div>
          {/* Results toolbar */}
          {(results || savedResults.length > 0) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '20px', flexWrap: 'wrap',
            }}>
              <button onClick={() => setSavedTab(false)} style={{
                padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
                border: `1px solid ${!savedTab ? C.borderGold : C.border}`,
                background: !savedTab ? C.goldGlow2 : 'transparent',
                color: !savedTab ? C.gold : C.textSecondary,
                fontSize: '12px', fontWeight: '600', transition: 'all 0.2s',
              }}>
                Results {results ? `(${results.results?.length ?? 0})` : ''}
              </button>

              <button onClick={() => setSavedTab(true)} style={{
                padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
                border: `1px solid ${savedTab ? C.borderGold : C.border}`,
                background: savedTab ? C.goldGlow2 : 'transparent',
                color: savedTab ? C.gold : C.textSecondary,
                fontSize: '12px', fontWeight: '600', transition: 'all 0.2s',
              }}>
                ★ Saved ({savedResults.length})
              </button>

              <div style={{ flex: 1 }} />

              {displayResults.length > 0 && (
                <button onClick={handleExport} style={{
                  padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
                  border: `1px solid ${C.border}`,
                  background: 'transparent',
                  color: exportMsg ? C.verified : C.textSecondary,
                  fontSize: '12px', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderGold; e.currentTarget.style.color = C.gold }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = exportMsg ? C.verified : C.textSecondary }}
                >
                  {exportMsg ?? '↓ Export TXT'}
                </button>
              )}
            </div>
          )}

          {/* Research summary banner */}
          {!savedTab && results?.summary && (
            <div style={{
              background: `${C.goldGlow2}`, border: `1px solid ${C.borderGold}`,
              borderRadius: '8px', padding: '14px 18px', marginBottom: '18px',
              animation: 'fadeIn 0.4s ease',
            }}>
              <div style={{ fontSize: '11px', color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px' }}>
                Research Summary
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: C.textSecondary, lineHeight: '1.6' }}>
                {results.summary}
              </p>
              {results.researchNotes && (
                <p style={{
                  margin: '8px 0 0', fontSize: '12px',
                  color: C.caution, lineHeight: '1.5',
                  paddingTop: '8px', borderTop: `1px solid ${C.borderGold}`,
                }}>
                  ⚠ Practitioner note: {results.researchNotes}
                </p>
              )}
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.2)`,
              borderRadius: '8px', padding: '16px 20px', color: C.danger, fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          {/* Saved empty state */}
          {savedTab && savedResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMuted }}>
              <div style={{ fontSize: '32px', marginBottom: '14px', opacity: 0.4 }}>★</div>
              <p style={{ fontSize: '14px', margin: 0 }}>No saved results yet.</p>
              <p style={{ fontSize: '12px', margin: '6px 0 0', color: C.textMuted }}>
                Click ☆ Save on any result to bookmark it here.
              </p>
            </div>
          )}

          {/* Empty state — no query yet */}
          {!loading && !error && !results && !savedTab && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: C.goldGlow, border: `1px solid ${C.borderGold}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: '28px',
              }}>⚖</div>
              <h2 style={{
                fontFamily: SERIF, fontSize: '22px', color: C.textPrimary,
                margin: '0 0 8px', fontWeight: '600',
              }}>Ready to research</h2>
              <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0 0 24px' }}>
                Enter a legal question above to search {currentMode.label.toLowerCase()}.
              </p>
              {/* Sample query */}
              <button onClick={() => { setQuery(SAMPLE_QUERIES[mode]); setTimeout(() => handleSearch(SAMPLE_QUERIES[mode]), 50) }}
                style={{
                  background: C.goldGlow2, border: `1px solid ${C.borderGold}`,
                  color: C.gold, borderRadius: '8px', padding: '10px 20px',
                  cursor: 'pointer', fontSize: '13px', letterSpacing: '0.02em',
                }}>
                Try a sample query →
              </button>
            </div>
          )}

          {/* Results */}
          {!loading && displayResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {displayResults.map((r, i) => (
                <ResultCard
                  key={r.id ?? i}
                  result={r}
                  index={i}
                  onSave={handleSave}
                  isSaved={isSaved(r.id)}
                />
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && !error && results && results.results?.length === 0 && !savedTab && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: C.textMuted }}>
              <p style={{ fontSize: '14px' }}>No results found for this query.</p>
              <p style={{ fontSize: '12px', marginTop: '6px' }}>
                Try broadening your search or switching research mode.
              </p>
            </div>
          )}
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Recent searches */}
          <div style={{
            background: C.bgCard, border: `1px solid ${C.border}`,
            borderRadius: '10px', padding: '18px 20px',
          }}>
            <h3 style={{
              margin: '0 0 14px', fontSize: '12px', fontWeight: '700',
              color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Recent Searches</h3>

            {recentSearches.length === 0 ? (
              <p style={{ fontSize: '12px', color: C.textMuted, margin: 0 }}>
                Your last 5 searches will appear here.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {recentSearches.map((rs, i) => {
                  const modeData = MODES.find(m => m.id === rs.mode)
                  return (
                    <button key={i} onClick={() => {
                      setMode(rs.mode)
                      setQuery(rs.query)
                      setJurisdiction(rs.jurisdiction ?? 'all')
                      setTimeout(() => handleSearch(rs.query), 50)
                    }} style={{
                      background: 'none', border: 'none', textAlign: 'left',
                      cursor: 'pointer', padding: '8px 10px', borderRadius: '6px',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = C.goldGlow2}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '10px', color: modeData?.color ?? C.gold }}>{modeData?.icon}</span>
                        <span style={{ fontSize: '10px', color: C.textMuted, letterSpacing: '0.04em' }}>
                          {modeData?.label}
                        </span>
                      </div>
                      <p style={{
                        margin: 0, fontSize: '12px', color: C.textSecondary,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', maxWidth: '220px',
                        lineHeight: '1.3',
                      }}>{rs.query}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Saved research quick-view */}
          {savedResults.length > 0 && (
            <div style={{
              background: C.bgCard, border: `1px solid ${C.border}`,
              borderRadius: '10px', padding: '18px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{
                  margin: 0, fontSize: '12px', fontWeight: '700',
                  color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>Saved Research</h3>
                <span style={{
                  fontSize: '11px', color: C.textMuted,
                  background: C.goldGlow2, border: `1px solid ${C.borderGold}`,
                  borderRadius: '10px', padding: '1px 7px',
                }}>{savedResults.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedResults.slice(0, 4).map((r, i) => (
                  <div key={i} style={{
                    padding: '8px 0',
                    borderBottom: i < Math.min(savedResults.length - 1, 3) ? `1px solid ${C.border}` : 'none',
                  }}>
                    <p style={{
                      margin: '0 0 3px', fontSize: '12px', color: C.textPrimary,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', lineHeight: '1.3',
                    }}>{r.title}</p>
                    <p style={{ margin: 0, fontSize: '10px', color: C.textMuted, fontFamily: MONO }}>
                      {r.citation ?? r.jurisdiction ?? ''}
                    </p>
                  </div>
                ))}
              </div>

              {savedResults.length > 4 && (
                <button onClick={() => setSavedTab(true)} style={{
                  background: 'none', border: 'none', color: C.gold,
                  fontSize: '11px', cursor: 'pointer', padding: '8px 0 0',
                  letterSpacing: '0.04em',
                }}>
                  View all {savedResults.length} saved →
                </button>
              )}

              <button onClick={handleExport} style={{
                marginTop: '10px', width: '100%', padding: '8px',
                borderRadius: '6px', border: `1px solid ${C.border}`,
                background: 'transparent', color: C.textSecondary,
                fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
                letterSpacing: '0.04em',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderGold; e.currentTarget.style.color = C.gold }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary }}
              >
                {exportMsg ?? '↓ Export Saved Research'}
              </button>
            </div>
          )}

          {/* Research tips */}
          <div style={{
            background: C.bgCard, border: `1px solid ${C.border}`,
            borderRadius: '10px', padding: '18px 20px',
          }}>
            <h3 style={{
              margin: '0 0 12px', fontSize: '12px', fontWeight: '700',
              color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Research Tips</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: '⚖', tip: 'Use Case Law for binding precedent and circuit-specific authority.' },
                { icon: '📜', tip: 'Statute Lookup returns exact code sections with effective dates.' },
                { icon: '🔗', tip: 'Precedent Analysis traces doctrine evolution — great for briefs.' },
                { icon: '🏛', tip: 'Filter by jurisdiction to get controlling vs. persuasive authority.' },
              ].map((t, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '8px', alignItems: 'flex-start',
                  paddingBottom: '10px',
                  borderBottom: i < 3 ? `1px solid ${C.border}` : 'none',
                }}>
                  <span style={{ fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>{t.icon}</span>
                  <p style={{ margin: 0, fontSize: '11px', color: C.textMuted, lineHeight: '1.5' }}>{t.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CourtListener badge */}
          <div style={{
            background: 'rgba(34,197,94,0.05)', border: `1px solid rgba(34,197,94,0.15)`,
            borderRadius: '10px', padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: C.verified, flexShrink: 0,
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: '600', color: C.verified }}>
                Live CourtListener Data
              </p>
              <p style={{ margin: 0, fontSize: '10px', color: C.textMuted, lineHeight: '1.4' }}>
                Case law results cross-referenced with real court opinions in real time.
              </p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; }
        input::placeholder  { color: #3a3530; }
        select option       { background: #0a0d1a; color: #e8e0d0; }
        ::-webkit-scrollbar { width: 7px; }
        ::-webkit-scrollbar-track  { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb  { background: ${C.border}; border-radius: 4px; }
      `}</style>
    </div>
  )
}
