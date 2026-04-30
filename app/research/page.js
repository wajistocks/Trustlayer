'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:            '#000000',
  bgCard:        '#111111',
  bgSecondary:   '#0a0a0a',
  border:        '#222222',
  borderLight:   '#333333',
  textPrimary:   '#ffffff',
  textSecondary: '#888888',
  textMuted:     '#444444',
  blue:          '#2563eb',
  blueHover:     '#1d4ed8',
  blueGlow:      'rgba(37,99,235,0.15)',
  blueGlow2:     'rgba(37,99,235,0.08)',
  verified:      '#22c55e',
  verifiedBg:    'rgba(34,197,94,0.08)',
  error:         '#ef4444',
  errorBg:       'rgba(239,68,68,0.08)',
  warning:       '#f59e0b',
  warningBg:     'rgba(245,158,11,0.08)',
}

const SERIF = 'Georgia, "Times New Roman", serif'
const SANS  = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const MONO  = '"JetBrains Mono", "SF Mono", "Fira Code", "Courier New", monospace'

const TOOLS_NAV = [
  { path: '/tools/plain-english',          name: 'Plain English Translator',  icon: '📖' },
  { path: '/tools/deadlines',              name: 'Deadline Calculator',        icon: '⏰' },
  { path: '/tools/red-flags',              name: 'Contract Red Flag Scanner',  icon: '🔍' },
  { path: '/tools/letter-response',        name: 'Letter Response Generator',  icon: '✉'  },
  { path: '/tools/statute-of-limitations', name: 'Statute of Limitations',     icon: '⏳' },
  { path: '/tools/ethics',                 name: 'Ethics Checker',             icon: '⚖'  },
  { path: '/tools/pro-se',                 name: 'Pro Se Assistant',           icon: '🏛'  },
]

// ─── Research modes ────────────────────────────────────────────────────────────
const MODES = [
  {
    id: 'case_law',
    label: 'Case Law',
    icon: '⚖',
    desc: 'Search real court decisions by topic, jurisdiction, and outcome',
    color: C.blue,
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
    color: C.blue,
    placeholder: 'e.g. piercing the corporate veil alter ego liability, reasonable reliance standard',
  },
  {
    id: 'regulatory',
    label: 'Regulatory Research',
    icon: '🏛',
    desc: 'FTC, SEC, FDIC, EPA rules, releases, and guidance documents',
    color: C.blue,
    placeholder: 'e.g. SEC Regulation D private placement exemptions, FTC endorsement guides',
  },
]

const JURISDICTIONS = [
  { value: 'all',           label: 'All Jurisdictions' },
  { value: 'federal',       label: 'Federal' },
  { value: '1st-cir',      label: '1st Circuit' },
  { value: '2nd-cir',      label: '2nd Circuit' },
  { value: '3rd-cir',      label: '3rd Circuit' },
  { value: '4th-cir',      label: '4th Circuit' },
  { value: '5th-cir',      label: '5th Circuit' },
  { value: '6th-cir',      label: '6th Circuit' },
  { value: '7th-cir',      label: '7th Circuit' },
  { value: '8th-cir',      label: '8th Circuit' },
  { value: '9th-cir',      label: '9th Circuit' },
  { value: '10th-cir',     label: '10th Circuit' },
  { value: '11th-cir',     label: '11th Circuit' },
  { value: 'dc-cir',       label: 'D.C. Circuit' },
  { value: 'california',   label: 'California' },
  { value: 'new-york',     label: 'New York' },
  { value: 'texas',        label: 'Texas' },
  { value: 'florida',      label: 'Florida' },
  { value: 'illinois',     label: 'Illinois' },
  { value: 'pennsylvania', label: 'Pennsylvania' },
  { value: 'ohio',         label: 'Ohio' },
  { value: 'georgia',      label: 'Georgia' },
  { value: 'washington',   label: 'Washington' },
  { value: 'massachusetts',label: 'Massachusetts' },
  { value: 'virginia',     label: 'Virginia' },
  { value: 'colorado',     label: 'Colorado' },
  { value: 'arizona',      label: 'Arizona' },
  { value: 'nevada',       label: 'Nevada' },
  { value: 'delaware',     label: 'Delaware' },
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
  if (n >= 55) return C.warning
  return C.error
}

function confidenceLetter(n) {
  if (n >= 90) return 'A'
  if (n >= 80) return 'B'
  if (n >= 65) return 'C'
  return 'D'
}

function typeColor(type) {
  const map = { case: C.blue, statute: C.blue, regulation: C.warning, restatement: C.textSecondary }
  return map[type] ?? C.textSecondary
}

function statusColor(s) {
  if (!s) return C.textMuted
  if (s === 'Good law' || s === 'Current') return C.verified
  if (s === 'Distinguished' || s === 'Superseded') return C.warning
  return C.error
}

function outcomeColor(o) {
  if (!o) return C.textMuted
  if (o === 'plaintiff-favorable') return C.warning
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
      padding: '28px',
      animation: 'slideUp 0.2s ease',
      animationDelay: `${index * 60}ms`,
      animationFillMode: 'both',
      marginBottom: '12px',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.borderLight}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {result.type && (
              <span style={{
                fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em',
                textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px',
                background: `${typeColor(result.type)}18`, color: typeColor(result.type),
                border: `1px solid ${typeColor(result.type)}30`,
              }}>{result.type}</span>
            )}

            {result.jurisdiction && (
              <span style={{
                fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
                background: C.bgSecondary, color: C.textSecondary,
                border: `1px solid ${C.border}`,
              }}>{result.jurisdiction}</span>
            )}

            {result.practiceArea && (
              <span style={{
                fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
                background: C.blueGlow2, color: C.blue,
                border: `1px solid rgba(37,99,235,0.2)`,
              }}>{result.practiceArea}</span>
            )}

            {result.status && result.status !== 'null' && (
              <span style={{
                fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
                background: `${statusColor(result.status)}15`,
                color: statusColor(result.status),
                border: `1px solid ${statusColor(result.status)}30`,
              }}>{result.status}</span>
            )}

            {result.outcome && result.outcome !== 'null' && (
              <span style={{
                fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
                background: `${outcomeColor(result.outcome)}12`,
                color: outcomeColor(result.outcome),
                border: `1px solid ${outcomeColor(result.outcome)}30`,
              }}>{result.outcome.replace(/-/g, ' ')}</span>
            )}

            {result.source === 'CourtListener' && (
              <span style={{
                fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
                background: C.verifiedBg, color: C.verified,
                border: `1px solid rgba(34,197,94,0.2)`,
              }}>✓ Live source</span>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            margin: 0, fontSize: '18px', fontFamily: SERIF, fontWeight: '700',
            color: C.textPrimary, lineHeight: '1.4',
          }}>{result.title}</h3>

          {/* Citation */}
          {result.citation && (
            <p style={{
              margin: '6px 0 0', fontSize: '13px', fontFamily: MONO,
              color: C.textSecondary,
            }}>{result.citation}</p>
          )}
        </div>

        {/* Score column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Relevance bar */}
          <div style={{ textAlign: 'center', minWidth: '52px' }}>
            <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '4px', letterSpacing: '0.06em' }}>REL</div>
            <div style={{ height: '4px', background: C.border, borderRadius: '2px', width: '52px' }}>
              <div style={{
                height: '4px', background: scoreColor(result.relevance ?? 0),
                width: `${result.relevance ?? 0}%`, borderRadius: '2px',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: scoreColor(result.relevance ?? 0), marginTop: '4px' }}>
              {result.relevance ?? '?'}
            </div>
          </div>

          {/* Confidence letter badge */}
          <div style={{
            padding: '4px 8px', borderRadius: '4px',
            background: `${scoreColor(result.confidence ?? 0)}15`,
            border: `1px solid ${scoreColor(result.confidence ?? 0)}30`,
          }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: scoreColor(result.confidence ?? 0), fontFamily: MONO }}>
              {confidenceLetter(result.confidence ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Date */}
      {result.date && (
        <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: '12px', fontFamily: MONO }}>
          {formatDate(result.date)}
        </div>
      )}

      {/* Summary */}
      {result.summary && (
        <p style={{
          margin: '0 0 16px', fontSize: '16px', color: '#cccccc',
          lineHeight: '1.7', fontFamily: SANS,
        }}>{result.summary}</p>
      )}

      {/* Key points */}
      {result.keyPoints?.length > 0 && (
        <div style={{ marginBottom: '16px', borderTop: `1px solid ${C.border}`, paddingTop: '14px' }}>
          {result.keyPoints.slice(0, expanded ? undefined : 2).map((pt, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              fontSize: '14px', color: C.textSecondary,
              padding: '5px 0',
              lineHeight: '1.6',
            }}>
              <span style={{ color: C.blue, fontSize: '10px', marginTop: '5px', flexShrink: 0 }}>■</span>
              {pt}
            </div>
          ))}
          {result.keyPoints.length > 2 && (
            <button onClick={() => setExpanded(x => !x)} style={{
              background: 'none', border: 'none', color: C.blue, fontSize: '13px',
              cursor: 'pointer', padding: '6px 0', fontFamily: SANS,
            }}>
              {expanded ? '− Show less' : `+ ${result.keyPoints.length - 2} more points`}
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
        {result.url && (
          <a href={result.url} target="_blank" rel="noopener noreferrer" style={{
            fontSize: '13px', color: C.blue, textDecoration: 'none',
            padding: '6px 14px', borderRadius: '4px',
            border: `1px solid rgba(37,99,235,0.3)`,
            background: C.blueGlow2,
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.blueGlow; e.currentTarget.style.borderColor = C.blue }}
            onMouseLeave={e => { e.currentTarget.style.background = C.blueGlow2; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)' }}
          >View Source →</a>
        )}

        <button onClick={() => onSave(result)} style={{
          fontSize: '13px',
          color: isSaved ? C.verified : C.textMuted,
          background: isSaved ? C.verifiedBg : 'transparent',
          border: `1px solid ${isSaved ? 'rgba(34,197,94,0.3)' : C.border}`,
          padding: '6px 14px', borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.15s',
          fontFamily: SANS,
        }}>
          {isSaved ? '★ Saved' : '☆ Save'}
        </button>

        <div style={{ flex: 1 }} />

        <span style={{ fontSize: '12px', color: C.textMuted, fontFamily: MONO }}>
          {result.confidence ?? '?'}% confidence
        </span>
      </div>
    </div>
  )
}

// ─── Skeleton loader ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: C.bgCard,
      border: `1px solid ${C.border}`,
      padding: '28px',
      marginBottom: '12px',
    }}>
      <div style={{ height: '20px', background: '#1a1a1a', borderRadius: '2px', marginBottom: '12px', width: '60%', animation: 'pulse 1.4s ease infinite' }} />
      <div style={{ height: '16px', background: '#1a1a1a', borderRadius: '2px', marginBottom: '8px', width: '40%', animation: 'pulse 1.4s ease infinite', animationDelay: '0.1s' }} />
      <div style={{ height: '16px', background: '#1a1a1a', borderRadius: '2px', marginBottom: '8px', width: '100%', animation: 'pulse 1.4s ease infinite', animationDelay: '0.2s' }} />
      <div style={{ height: '16px', background: '#1a1a1a', borderRadius: '2px', marginBottom: '8px', width: '85%', animation: 'pulse 1.4s ease infinite', animationDelay: '0.3s' }} />
      <div style={{ height: '16px', background: '#1a1a1a', borderRadius: '2px', width: '70%', animation: 'pulse 1.4s ease infinite', animationDelay: '0.4s' }} />
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function ResearchPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen]           = useState(false)
  const [mode, setMode]                     = useState('case_law')
  const [query, setQuery]                   = useState('')
  const [jurisdiction, setJurisdiction]     = useState('all')
  const [loading, setLoading]               = useState(false)
  const [results, setResults]               = useState(null)
  const [error, setError]                   = useState(null)
  const [recentSearches, setRecentSearches] = useState([])
  const [savedResults, setSavedResults]     = useState([])
  const [savedTab, setSavedTab]             = useState(false)
  const [exportMsg, setExportMsg]           = useState(null)
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

      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .tl-nav-links { display: none !important; }
          .tl-hamburger { display: flex !important; align-items: center; }
          .tl-2col { grid-template-columns: 1fr !important; }
          .tl-3col { grid-template-columns: 1fr !important; }
          .tl-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .tl-hide-mobile { display: none !important; }
          .tl-mode-tabs { flex-wrap: wrap !important; }
          .tl-nav { padding: 0 20px !important; }
        }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes pulse   { 0%,100% { opacity:0.3 } 50% { opacity:0.7 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        ::selection { background: rgba(37,99,235,0.4); color: #fff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        body { margin: 0; background: #000; }
        input::placeholder { color: #444; }
        select option { background: #111; color: #fff; }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="tl-nav" style={{ position: 'sticky', top: 0, zIndex: 100, background: '#000', borderBottom: '1px solid #222', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
        <Link href="/" style={{ textDecoration: 'none', fontSize: '22px', fontFamily: SERIF, fontWeight: '700', color: '#fff', letterSpacing: '-0.02em' }}>TrustLayer</Link>

        <div className="tl-nav-links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '14px', color: C.textSecondary, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = C.blue}
            onMouseLeave={e => e.currentTarget.style.color = C.textSecondary}
          >Verify</Link>

          <Link href="/research" style={{ fontSize: '14px', color: C.blue, textDecoration: 'none', borderBottom: '2px solid #2563eb', paddingBottom: '2px' }}>
            Research
          </Link>

          {/* Tools dropdown */}
          <div style={{ position: 'relative' }}
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <Link href="/tools" style={{ fontSize: '14px', color: C.textSecondary, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              onMouseEnter={e => e.currentTarget.style.color = C.blue}
              onMouseLeave={e => e.currentTarget.style.color = C.textSecondary}
            >
              Tools <span style={{ fontSize: '9px', opacity: 0.7 }}>▾</span>
            </Link>
            {toolsOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 10px)', left: '-10px', background: '#111', border: '1px solid #222', borderRadius: '6px', padding: '8px 6px', minWidth: '240px', boxShadow: '0 8px 32px rgba(0,0,0,0.8)', zIndex: 200, animation: 'fadeIn 0.15s ease' }}>
                {TOOLS_NAV.map(t => (
                  <Link key={t.path} href={t.path} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '4px', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{t.icon}</span>
                    <span style={{ fontSize: '13px', color: '#888' }}>{t.name}</span>
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid #222', margin: '5px 4px' }} />
                <Link href="/tools" style={{ display: 'block', textAlign: 'center', padding: '8px 10px', borderRadius: '4px', fontSize: '12px', color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>View All Tools →</Link>
              </div>
            )}
          </div>

          <Link href="/enterprise" style={{ fontSize: '14px', color: C.textSecondary, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = C.blue}
            onMouseLeave={e => e.currentTarget.style.color = C.textSecondary}
          >Enterprise</Link>

          <Link href="/request-access" style={{ background: '#2563eb', color: '#fff', padding: '9px 22px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
          >Request Access</Link>
        </div>

        <button className="tl-hamburger" style={{ display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer', padding: '8px' }} onClick={() => setMobileMenuOpen(v => !v)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile overlay */}
      {mobileMenuOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 149, background: 'rgba(0,0,0,0.6)' }} onClick={() => setMobileMenuOpen(false)} />}

      {/* Mobile drawer */}
      <div style={{ position: 'fixed', top: 0, right: 0, width: '280px', height: '100vh', background: '#000', borderLeft: '1px solid #222', zIndex: 150, transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.25s ease', display: 'flex', flexDirection: 'column', padding: '72px 24px 40px', gap: '4px' }}>
        {[['/', 'Verify'], ['/research', 'Research'], ['/enterprise', 'Enterprise']].map(([href, label]) => (
          <Link key={href} href={href} style={{ display: 'block', padding: '12px 8px', fontSize: '16px', color: '#fff', textDecoration: 'none', borderBottom: '1px solid #111' }}>{label}</Link>
        ))}
        <div style={{ padding: '8px 0 4px', fontSize: '12px', color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tools</div>
        {TOOLS_NAV.map(t => (
          <Link key={t.path} href={t.path} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 8px', fontSize: '14px', color: '#888', textDecoration: 'none' }}>
            <span>{t.icon}</span><span>{t.name}</span>
          </Link>
        ))}
        <Link href="/request-access" style={{ marginTop: 'auto', background: '#2563eb', color: '#fff', padding: '14px 20px', borderRadius: '6px', textDecoration: 'none', fontSize: '15px', fontWeight: '600', textAlign: 'center', display: 'block' }}>Request Access</Link>
      </div>

      {/* ── Hero + Search ───────────────────────────────────────────────────── */}
      <div className="tl-section-pad" style={{ borderBottom: `1px solid ${C.border}`, padding: '64px 40px 48px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: C.blueGlow2, border: `1px solid rgba(37,99,235,0.2)`,
            borderRadius: '4px', padding: '5px 14px', marginBottom: '24px',
          }}>
            <span style={{ fontSize: '11px', color: C.blue, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '600' }}>
              AI Legal Research
            </span>
          </div>

          <h1 style={{
            fontFamily: SERIF, fontSize: 'clamp(32px, 4.5vw, 52px)',
            fontWeight: '700', letterSpacing: '-0.01em',
            lineHeight: '1.15', margin: '0 0 16px', color: C.textPrimary,
          }}>
            Research Any Legal Question<br />With AI Precision
          </h1>

          <p style={{
            fontSize: '18px', color: C.textSecondary, margin: '0 0 40px',
            maxWidth: '560px', lineHeight: '1.7', fontFamily: SANS,
          }}>
            Case law, statutes, precedent, and regulations — sourced in seconds, verified by AI.
          </p>

          {/* Mode tabs */}
          <div className="tl-mode-tabs" style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#111', border: '1px solid #222', borderRadius: '4px', padding: '4px' }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); setResults(null) }} style={{
                flex: 1, padding: '9px 16px', cursor: 'pointer',
                border: 'none',
                background: mode === m.id ? '#2563eb' : 'transparent',
                color: mode === m.id ? '#fff' : C.textSecondary,
                fontSize: '13px', fontWeight: mode === m.id ? '600' : '400',
                borderRadius: '4px',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                whiteSpace: 'nowrap',
              }}>
                <span>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch', flexWrap: 'wrap' }}>
              {/* Query input */}
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={currentMode.placeholder}
                style={{
                  flex: '1 1 300px', background: C.bgSecondary, border: `1px solid ${C.borderLight}`,
                  color: C.textPrimary, borderRadius: '4px',
                  fontSize: '16px', padding: '14px 16px',
                  outline: 'none', fontFamily: SANS,
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = C.blue}
                onBlur={e => e.target.style.borderColor = C.borderLight}
              />

              {/* Jurisdiction selector */}
              <select
                value={jurisdiction}
                onChange={e => setJurisdiction(e.target.value)}
                style={{
                  background: C.bgSecondary, border: `1px solid ${C.borderLight}`,
                  borderRadius: '4px', color: C.textSecondary,
                  fontSize: '16px', padding: '14px 16px', cursor: 'pointer',
                  outline: 'none', minWidth: '170px',
                  transition: 'border-color 0.2s', fontFamily: SANS,
                }}
                onFocus={e => e.target.style.borderColor = C.blue}
                onBlur={e => e.target.style.borderColor = C.borderLight}
              >
                {JURISDICTIONS.map(j => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </select>

              {/* Search button */}
              <button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                style={{
                  padding: '14px 32px', borderRadius: '6px', border: 'none',
                  background: loading || !query.trim() ? C.border : '#2563eb',
                  color: loading || !query.trim() ? C.textMuted : '#fff',
                  fontSize: '16px', fontWeight: '600',
                  cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s', whiteSpace: 'nowrap',
                  fontFamily: SANS,
                }}
                onMouseEnter={e => { if (!loading && query.trim()) e.currentTarget.style.background = '#1d4ed8' }}
                onMouseLeave={e => { if (!loading && query.trim()) e.currentTarget.style.background = '#2563eb' }}
              >
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '14px', height: '14px', border: `2px solid rgba(255,255,255,0.3)`,
                      borderTopColor: '#fff', borderRadius: '50%',
                      display: 'inline-block', animation: 'spin 0.7s linear infinite',
                    }} />
                    Searching
                  </span>
                ) : 'Search'}
              </button>
            </div>

            {/* Mode description */}
            <p style={{ fontSize: '14px', color: C.textMuted, margin: 0, lineHeight: '1.5' }}>
              <span style={{ color: C.blue }}>{currentMode.icon} {currentMode.label}</span>
              {' — '}{currentMode.desc}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main content grid ────────────────────────────────────────────────── */}
      <div className="tl-section-pad tl-2col" style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '40px 40px',
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '32px',
        alignItems: 'start',
      }}>

        {/* ── Results column ───────────────────────────────────────────────── */}
        <div>
          {/* Results toolbar */}
          {(results || savedResults.length > 0) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '24px', flexWrap: 'wrap',
            }}>
              <button onClick={() => setSavedTab(false)} style={{
                padding: '8px 16px', cursor: 'pointer',
                border: `1px solid ${!savedTab ? C.blue : C.border}`,
                background: !savedTab ? C.blueGlow2 : 'transparent',
                color: !savedTab ? C.blue : C.textSecondary,
                fontSize: '13px', fontWeight: '600',
                borderRadius: '4px',
                transition: 'all 0.15s', fontFamily: SANS,
              }}>
                Results {results ? `(${results.results?.length ?? 0})` : ''}
              </button>

              <button onClick={() => setSavedTab(true)} style={{
                padding: '8px 16px', cursor: 'pointer',
                border: `1px solid ${savedTab ? C.blue : C.border}`,
                background: savedTab ? C.blueGlow2 : 'transparent',
                color: savedTab ? C.blue : C.textSecondary,
                fontSize: '13px', fontWeight: '600',
                borderRadius: '4px',
                transition: 'all 0.15s', fontFamily: SANS,
              }}>
                ★ Saved ({savedResults.length})
              </button>

              <div style={{ flex: 1 }} />

              {displayResults.length > 0 && (
                <button onClick={handleExport} style={{
                  padding: '8px 16px', cursor: 'pointer',
                  border: `1px solid ${C.border}`,
                  background: 'transparent',
                  color: exportMsg ? C.verified : C.textSecondary,
                  fontSize: '13px', borderRadius: '4px',
                  transition: 'all 0.15s', fontFamily: SANS,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue }}
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
              background: C.bgSecondary, border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${C.blue}`, padding: '24px 28px', marginBottom: '28px',
              animation: 'fadeIn 0.4s ease',
            }}>
              <div style={{ fontSize: '11px', color: C.blue, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>
                Research Summary
              </div>
              <p style={{ margin: 0, fontSize: '16px', color: C.textSecondary, lineHeight: '1.7' }}>
                {results.summary}
              </p>
              {results.researchNotes && (
                <p style={{
                  margin: '12px 0 0', fontSize: '14px',
                  color: C.warning, lineHeight: '1.6',
                  paddingTop: '12px', borderTop: `1px solid ${C.border}`,
                }}>
                  ⚠ Practitioner note: {results.researchNotes}
                </p>
              )}
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div>
              {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: C.errorBg, border: `1px solid rgba(239,68,68,0.2)`,
              padding: '20px 24px', color: C.error, fontSize: '15px',
              lineHeight: '1.6',
            }}>
              {error}
            </div>
          )}

          {/* Saved empty state */}
          {savedTab && savedResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: C.textMuted }}>
              <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.3 }}>★</div>
              <p style={{ fontSize: '16px', margin: '0 0 8px', color: C.textSecondary }}>No saved results yet.</p>
              <p style={{ fontSize: '14px', margin: 0, color: C.textMuted }}>
                Click ☆ Save on any result to bookmark it here.
              </p>
            </div>
          )}

          {/* Empty state — no query yet */}
          {!loading && !error && !results && !savedTab && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{
                width: '72px', height: '72px',
                background: C.blueGlow2, border: `1px solid rgba(37,99,235,0.2)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', fontSize: '32px',
              }}>⚖</div>
              <h2 style={{
                fontFamily: SERIF, fontSize: '26px', color: C.textPrimary,
                margin: '0 0 12px', fontWeight: '700',
              }}>Ready to research</h2>
              <p style={{ fontSize: '16px', color: C.textSecondary, margin: '0 0 28px', lineHeight: '1.7' }}>
                Enter a legal question above to search {currentMode.label.toLowerCase()}.
              </p>
              <button onClick={() => { setQuery(SAMPLE_QUERIES[mode]); setTimeout(() => handleSearch(SAMPLE_QUERIES[mode]), 50) }}
                style={{
                  background: C.blueGlow2, border: `1px solid rgba(37,99,235,0.3)`,
                  color: C.blue, borderRadius: '6px', padding: '12px 24px',
                  cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                  fontFamily: SANS, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.blueGlow; e.currentTarget.style.borderColor = C.blue }}
                onMouseLeave={e => { e.currentTarget.style.background = C.blueGlow2; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)' }}
              >
                Try a sample query →
              </button>
            </div>
          )}

          {/* Results list */}
          {!loading && displayResults.length > 0 && (
            <div>
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
            <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMuted }}>
              <p style={{ fontSize: '16px', marginBottom: '8px', color: C.textSecondary }}>No results found for this query.</p>
              <p style={{ fontSize: '14px', marginTop: 0 }}>
                Try broadening your search or switching research mode.
              </p>
            </div>
          )}
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Recent searches */}
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: '24px' }}>
            <h3 style={{
              margin: '0 0 16px', fontSize: '11px', fontWeight: '700',
              color: C.textSecondary, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>Recent Searches</h3>

            {recentSearches.length === 0 ? (
              <p style={{ fontSize: '14px', color: C.textMuted, margin: 0, lineHeight: '1.6' }}>
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
                      cursor: 'pointer', padding: '10px 8px',
                      transition: 'background 0.15s', borderRadius: '2px',
                      fontFamily: SANS,
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = C.blueGlow2}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span style={{ fontSize: '11px', color: C.blue }}>{modeData?.icon}</span>
                        <span style={{ fontSize: '11px', color: C.textMuted, letterSpacing: '0.04em' }}>
                          {modeData?.label}
                        </span>
                      </div>
                      <p style={{
                        margin: 0, fontSize: '13px', color: C.textSecondary,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', maxWidth: '230px',
                        lineHeight: '1.4',
                      }}>{rs.query}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Saved research quick-view */}
          {savedResults.length > 0 && (
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{
                  margin: 0, fontSize: '11px', fontWeight: '700',
                  color: C.textSecondary, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>Saved Research</h3>
                <span style={{
                  fontSize: '12px', color: C.blue,
                  background: C.blueGlow2, border: `1px solid rgba(37,99,235,0.2)`,
                  borderRadius: '4px', padding: '2px 8px', fontFamily: MONO,
                }}>{savedResults.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {savedResults.slice(0, 4).map((r, i) => (
                  <div key={i} style={{
                    padding: '10px 0',
                    borderBottom: i < Math.min(savedResults.length - 1, 3) ? `1px solid ${C.border}` : 'none',
                  }}>
                    <p style={{
                      margin: '0 0 4px', fontSize: '13px', color: C.textPrimary,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', lineHeight: '1.4',
                      fontFamily: SERIF,
                    }}>{r.title}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: C.textMuted, fontFamily: MONO }}>
                      {r.citation ?? r.jurisdiction ?? ''}
                    </p>
                  </div>
                ))}
              </div>

              {savedResults.length > 4 && (
                <button onClick={() => setSavedTab(true)} style={{
                  background: 'none', border: 'none', color: C.blue,
                  fontSize: '13px', cursor: 'pointer', padding: '10px 0 4px',
                  fontFamily: SANS, fontWeight: '600',
                }}>
                  View all {savedResults.length} saved →
                </button>
              )}

              <button onClick={handleExport} style={{
                marginTop: '12px', width: '100%', padding: '10px',
                border: `1px solid ${C.border}`,
                background: 'transparent', color: C.textSecondary,
                fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: SANS, borderRadius: '4px',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary }}
              >
                {exportMsg ?? '↓ Export Saved Research'}
              </button>
            </div>
          )}

          {/* Research tips */}
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: '24px' }}>
            <h3 style={{
              margin: '0 0 16px', fontSize: '11px', fontWeight: '700',
              color: C.textSecondary, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>Research Tips</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: '⚖', tip: 'Use Case Law for binding precedent and circuit-specific authority.' },
                { icon: '📜', tip: 'Statute Lookup returns exact code sections with effective dates.' },
                { icon: '🔗', tip: 'Precedent Analysis traces doctrine evolution — great for briefs.' },
                { icon: '🏛', tip: 'Filter by jurisdiction to get controlling vs. persuasive authority.' },
              ].map((t, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  paddingBottom: '12px',
                  borderBottom: i < 3 ? `1px solid ${C.border}` : 'none',
                }}>
                  <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>{t.icon}</span>
                  <p style={{ margin: 0, fontSize: '13px', color: C.textMuted, lineHeight: '1.6' }}>{t.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CourtListener live badge */}
          <div style={{
            background: C.verifiedBg, border: `1px solid rgba(34,197,94,0.15)`,
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '8px', height: '8px',
              background: C.verified, flexShrink: 0,
              animation: 'pulse 2s ease-in-out infinite',
              borderRadius: '50%',
            }} />
            <div>
              <p style={{ margin: '0 0 3px', fontSize: '12px', fontWeight: '700', color: C.verified }}>
                Live CourtListener Data
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: C.textMuted, lineHeight: '1.5' }}>
                Case law cross-referenced with real court opinions in real time.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
