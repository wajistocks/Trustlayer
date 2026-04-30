'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:          '#05070d',
  bgCard:      '#0a0d1a',
  bgInput:     '#080b14',
  border:      '#1a2035',
  borderGold:  'rgba(212,168,83,0.25)',
  gold:        '#d4a853',
  goldDim:     '#a07835',
  goldGlow:    'rgba(212,168,83,0.12)',
  goldGlow2:   'rgba(212,168,83,0.06)',
  textPrimary:   '#e8e0d0',
  textSecondary: '#8a8070',
  textMuted:     '#3a3530',
  verified:    '#22c55e',
  caution:     '#f59e0b',
  danger:      '#ef4444',
  blue:        '#3b82f6',
  purple:      '#8b5cf6',
}

const SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, "Times New Roman", serif'
const SANS  = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const MONO  = '"SF Mono", "Fira Code", "Courier New", monospace'

const TOOLS = [
  { id: 'plain-english',          path: '/tools/plain-english',          name: 'Plain English Translator',   icon: '📖' },
  { id: 'deadlines',              path: '/tools/deadlines',              name: 'Deadline Calculator',         icon: '⏰' },
  { id: 'red-flags',              path: '/tools/red-flags',              name: 'Contract Red Flag Scanner',   icon: '🔍' },
  { id: 'letter-response',        path: '/tools/letter-response',        name: 'Letter Response Generator',   icon: '✉' },
  { id: 'statute-of-limitations', path: '/tools/statute-of-limitations', name: 'Statute of Limitations',     icon: '⏳' },
  { id: 'ethics',                 path: '/tools/ethics',                 name: 'Ethics Checker',              icon: '⚖' },
  { id: 'pro-se',                 path: '/tools/pro-se',                 name: 'Pro Se Assistant',            icon: '🏛', free: true },
]

const STATES_50 = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
]

const PRACTICE_AREAS = [
  'Corporate','Employment','Family','Real Estate','Criminal Defense','Immigration',
  'Intellectual Property','Bankruptcy','Tax','Estate Planning','Personal Injury',
  'Civil Rights','Administrative','Other',
]

// ─── ToolSidebar ───────────────────────────────────────────────────────────────
function ToolSidebar({ currentId }) {
  const related = TOOLS.filter(t => t.id !== currentId)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'sticky', top: '88px' }}>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '18px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Other Tools
        </h3>
        {related.map(tool => (
          <Link
            key={tool.id}
            href={tool.path}
            style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 10px', borderRadius: '6px', textDecoration: 'none', transition: 'background 0.15s', marginBottom: '2px' }}
            onMouseEnter={e => e.currentTarget.style.background = C.goldGlow2}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '14px' }}>{tool.icon}</span>
            <span style={{ fontSize: '12px', color: C.textSecondary }}>{tool.name}</span>
            {tool.free && (
              <span style={{ marginLeft: 'auto', fontSize: '9px', color: C.verified, border: '1px solid rgba(34,197,94,0.3)', borderRadius: '3px', padding: '1px 5px' }}>
                FREE
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Tips card */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '18px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Quick Tips
        </h3>
        {[
          { icon: '🔒', tip: 'This tool does not store your query. For highly sensitive matters, contact your state bar ethics hotline directly.' },
          { icon: '📋', tip: 'The ABA Model Rules are not binding unless your state has adopted them. Check your state\'s specific rules.' },
          { icon: '⚖', tip: 'Conflicts of interest are the most common ethics violation. When in doubt, screen and disclose.' },
          { icon: '📞', tip: 'Every state bar has a free ethics hotline for licensed attorneys. Use it — it\'s confidential.' },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', paddingBottom: '10px', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none', marginBottom: i < 3 ? '10px' : '0' }}>
            <span style={{ fontSize: '13px', flexShrink: 0 }}>{t.icon}</span>
            <p style={{ margin: 0, fontSize: '11px', color: C.textMuted, lineHeight: '1.5' }}>{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '22px 24px', animation: 'pulse 1.6s ease-in-out infinite' }}>
      <div style={{ height: '13px', width: '30%', background: C.border, borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ height: '17px', width: '70%', background: C.border, borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ height: '13px', width: '95%', background: C.border, borderRadius: '4px', marginBottom: '6px' }} />
      <div style={{ height: '13px', width: '80%', background: C.border, borderRadius: '4px', marginBottom: '6px' }} />
      <div style={{ height: '13px', width: '55%', background: C.border, borderRadius: '4px' }} />
    </div>
  )
}

// ─── Risk level config ─────────────────────────────────────────────────────────
function riskConfig(level) {
  switch (level) {
    case 'high':   return { bg: 'rgba(239,68,68,0.09)',  border: 'rgba(239,68,68,0.28)',  color: C.danger,   label: 'High Ethical Risk',     icon: '🚨' }
    case 'medium': return { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', color: C.caution,  label: 'Moderate Ethical Risk', icon: '⚠' }
    default:       return { bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.20)',  color: C.verified, label: 'Low Ethical Risk',      icon: '✓' }
  }
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function EthicsPage() {
  const [situation,    setSituation]    = useState('')
  const [state,        setState]        = useState('California')
  const [practiceArea, setPracticeArea] = useState('Corporate')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)
  const [result,       setResult]       = useState(null)
  const [saved,        setSaved]        = useState(false)
  const [shareMsg,     setShareMsg]     = useState(null)

  function handleSave()  { setSaved(true); setTimeout(() => setSaved(false), 2200) }
  function handleShare() {
    navigator.clipboard?.writeText(window.location.href)
    setShareMsg('Link copied!')
    setTimeout(() => setShareMsg(null), 2200)
  }

  async function handleCheck() {
    if (!situation.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res  = await fetch('/api/tools/ethics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, state, practiceArea }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Ethics check failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectBase = {
    background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: '8px',
    color: C.textPrimary, fontSize: '13px', padding: '10px 12px',
    outline: 'none', width: '100%', fontFamily: SANS, cursor: 'pointer',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: SANS, color: C.textPrimary }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '68px',
        background: 'rgba(5,7,13,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
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

        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          {[
            { href: '/',           label: 'Verify',     active: false },
            { href: '/research',   label: 'Research',   active: false },
            { href: '/tools',      label: 'Tools',      active: true  },
            { href: '/enterprise', label: 'Enterprise', active: false },
          ].map(({ href, label, active }) => (
            <Link key={href} href={href} style={{
              fontSize: '13px', letterSpacing: '0.04em', textDecoration: 'none',
              color:         active ? C.gold : C.textSecondary,
              borderBottom:  active ? `1px solid ${C.gold}` : 'none',
              paddingBottom: active ? '2px' : '0',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = C.gold }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = C.textSecondary }}
            >{label}</Link>
          ))}

          <Link href="/request-access" style={{
            padding: '8px 20px', borderRadius: '6px',
            border: `1px solid ${C.borderGold}`, background: C.goldGlow2,
            color: C.gold, fontSize: '13px', textDecoration: 'none',
            letterSpacing: '0.04em', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.goldGlow; e.currentTarget.style.borderColor = C.gold }}
            onMouseLeave={e => { e.currentTarget.style.background = C.goldGlow2; e.currentTarget.style.borderColor = C.borderGold }}
          >Request Access</Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(180deg, rgba(212,168,83,0.04) 0%, transparent 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: '52px 40px 40px',
        textAlign: 'center',
      }}>
        {/* Breadcrumb */}
        <p style={{ fontSize: '12px', color: C.textMuted, marginBottom: '24px', letterSpacing: '0.04em' }}>
          <Link href="/"      style={{ color: C.textMuted, textDecoration: 'none' }}>TrustLayer</Link>
          {' › '}
          <Link href="/tools" style={{ color: C.textMuted, textDecoration: 'none' }}>Tools</Link>
          {' › '}
          <span style={{ color: C.textSecondary }}>Ethics Checker</span>
        </p>

        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: C.goldGlow2, border: `1px solid ${C.borderGold}`,
          borderRadius: '20px', padding: '5px 14px', marginBottom: '20px',
        }}>
          <span style={{ color: C.gold, fontSize: '13px' }}>⚖</span>
          <span style={{ fontSize: '11px', color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '600' }}>
            Attorney Ethics Checker
          </span>
        </div>

        <h1 style={{
          fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: '700',
          letterSpacing: '-0.01em', lineHeight: '1.15', margin: '0 0 14px',
          color: C.textPrimary, maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto',
        }}>
          Get Instant Answers To Your<br />
          <span style={{ color: C.gold }}>Ethics Questions</span>
        </h1>

        <p style={{
          fontSize: '15px', color: C.textSecondary, margin: '0 auto',
          maxWidth: '640px', lineHeight: '1.65', fontFamily: SERIF, fontStyle: 'italic',
        }}>
          Attorneys face complex ethical situations daily. Get instant guidance on ABA Model Rules,
          state bar rules, and recent ethics opinions — before making a decision you'll regret.
        </p>
      </div>

      {/* ── Main grid ───────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '32px 40px',
        display: 'grid', gridTemplateColumns: '1fr 260px', gap: '28px', alignItems: 'start',
      }}>

        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div>

          {/* ── Form card ─────────────────────────────────────────────────── */}
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: '700', color: C.textPrimary, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Describe Your Ethical Situation
            </h2>

            {/* Situation textarea */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Your Situation
              </label>
              <textarea
                value={situation}
                onChange={e => setSituation(e.target.value)}
                placeholder={"Describe your ethical question or situation in detail. Example: 'I represent two companies in the same industry. Company A has asked me to help them acquire Company B, which is also my client. Is this a conflict?'"}
                rows={7}
                style={{
                  width: '100%', background: C.bgInput, border: `1px solid ${C.border}`,
                  borderRadius: '8px', color: C.textPrimary, fontSize: '13px',
                  padding: '12px 14px', outline: 'none', resize: 'vertical',
                  minHeight: '200px', fontFamily: SANS, lineHeight: '1.6',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = C.borderGold}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>

            {/* State + Practice area selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  State Bar
                </label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  style={selectBase}
                  onFocus={e => e.target.style.borderColor = C.borderGold}
                  onBlur={e => e.target.style.borderColor = C.border}
                >
                  {STATES_50.map(s => (
                    <option key={s} value={s} style={{ background: C.bgCard }}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Practice Area
                </label>
                <select
                  value={practiceArea}
                  onChange={e => setPracticeArea(e.target.value)}
                  style={selectBase}
                  onFocus={e => e.target.style.borderColor = C.borderGold}
                  onBlur={e => e.target.style.borderColor = C.border}
                >
                  {PRACTICE_AREAS.map(pa => (
                    <option key={pa} value={pa} style={{ background: C.bgCard }}>{pa}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleCheck}
              disabled={loading || !situation.trim()}
              style={{
                width: '100%', padding: '13px', borderRadius: '8px', border: 'none',
                background: loading || !situation.trim()
                  ? C.border
                  : `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                color: loading || !situation.trim() ? C.textMuted : '#0a0800',
                fontSize: '14px', fontWeight: '700', letterSpacing: '0.06em',
                cursor: loading || !situation.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading || !situation.trim() ? 'none' : `0 4px 20px rgba(212,168,83,0.25)`,
              }}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '13px', height: '13px', border: `2px solid #0a0800`,
                    borderTopColor: 'transparent', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.7s linear infinite',
                  }} />
                  Checking Ethics Rules…
                </span>
              ) : 'Check Ethics Rules'}
            </button>

            {/* Confidentiality note */}
            <p style={{ margin: '12px 0 0', fontSize: '11px', color: C.textMuted, fontStyle: 'italic', lineHeight: '1.5', textAlign: 'center' }}>
              Your query is processed by AI and not stored. For sensitive matters, consider contacting your state bar ethics hotline directly.
            </p>
          </div>

          {/* ── Loading ───────────────────────────────────────────────────── */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* ── Error ─────────────────────────────────────────────────────── */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.25)`,
              borderRadius: '10px', padding: '16px 20px', color: C.danger, fontSize: '13px',
              lineHeight: '1.5', animation: 'fadeIn 0.3s ease',
            }}>
              {error}
            </div>
          )}

          {/* ── Results ───────────────────────────────────────────────────── */}
          {result && !loading && (() => {
            const rc = riskConfig(result.riskLevel)
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'slideUp 0.35s ease both' }}>

                {/* Risk level banner */}
                <div style={{ background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: '10px', padding: '14px 20px' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: rc.color }}>
                    {rc.icon} {rc.label}
                  </p>
                </div>

                {/* Summary card */}
                {result.summary && (
                  <div style={{ background: C.bgCard, border: `1px solid ${C.borderGold}`, borderRadius: '10px', padding: '20px 22px' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '11px', color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Summary</p>
                    <p style={{ margin: 0, fontSize: '13px', color: C.textSecondary, lineHeight: '1.7' }}>{result.summary}</p>
                  </div>
                )}

                {/* Answer card — most prominent */}
                {result.answer && (
                  <div style={{ background: C.bgCard, border: `1px solid rgba(34,197,94,0.3)`, borderRadius: '10px', padding: '22px 24px' }}>
                    <p style={{ margin: '0 0 12px', fontSize: '11px', color: C.verified, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Answer to Your Question</p>
                    <p style={{ margin: 0, fontFamily: SERIF, fontSize: '16px', color: C.textPrimary, lineHeight: '1.75' }}>{result.answer}</p>
                  </div>
                )}

                {/* ABA Model Rules */}
                {result.abaRules?.length > 0 && (
                  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px 22px' }}>
                    <p style={{ margin: '0 0 16px', fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Relevant ABA Model Rules</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {result.abaRules.map((rule, i) => (
                        <div key={i} style={{ background: C.bgInput, borderRadius: '8px', padding: '14px 16px', borderLeft: `3px solid ${C.gold}` }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
                            <span style={{ fontFamily: MONO, fontSize: '16px', fontWeight: '700', color: C.gold }}>{rule.rule}</span>
                            <span style={{ fontFamily: SERIF, fontSize: '14px', color: C.textPrimary }}>{rule.title}</span>
                          </div>
                          <p style={{ margin: '0 0 8px', fontSize: '12px', color: C.textSecondary, lineHeight: '1.5' }}>{rule.relevance}</p>
                          {rule.keyLanguage && (
                            <p style={{ margin: 0, fontSize: '12px', color: C.textMuted, fontStyle: 'italic', lineHeight: '1.5', borderTop: `1px solid ${C.border}`, paddingTop: '8px' }}>
                              "{rule.keyLanguage}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* State-specific rules */}
                {result.stateRules?.length > 0 && (
                  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px 22px' }}>
                    <p style={{ margin: '0 0 16px', fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {state} State-Specific Rules
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {result.stateRules.map((sr, i) => (
                        <div key={i} style={{ background: C.bgInput, borderRadius: '8px', padding: '14px 16px', borderLeft: `3px solid ${C.blue}` }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
                            <span style={{ fontFamily: MONO, fontSize: '13px', color: C.blue }}>{sr.rule}</span>
                            <span style={{ fontSize: '11px', color: C.textMuted }}>{sr.state}</span>
                          </div>
                          {sr.difference && (
                            <p style={{ margin: '0 0 4px', fontSize: '12px', color: C.caution, lineHeight: '1.5' }}>
                              Differs from ABA: {sr.difference}
                            </p>
                          )}
                          <p style={{ margin: 0, fontSize: '12px', color: C.textSecondary, lineHeight: '1.5' }}>{sr.relevance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent ethics opinions */}
                {result.ethicsOpinions?.length > 0 && (
                  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px 22px' }}>
                    <p style={{ margin: '0 0 14px', fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Recent Ethics Opinions</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {result.ethicsOpinions.map((op, i) => (
                        <div key={i} style={{ background: C.bgInput, borderRadius: '6px', padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: MONO, fontSize: '12px', color: C.gold }}>{op.citation}</span>
                            <span style={{ fontSize: '11px', color: C.textMuted }}>{op.issuer}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '12px', color: C.textSecondary, lineHeight: '1.5' }}>{op.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related issues */}
                {result.relatedIssues?.length > 0 && (
                  <div style={{ background: 'rgba(245,158,11,0.06)', border: `1px solid rgba(245,158,11,0.22)`, borderRadius: '10px', padding: '20px 22px' }}>
                    <p style={{ margin: '0 0 12px', fontSize: '11px', color: C.caution, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Related Issues to Consider</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {result.relatedIssues.map((issue, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{ color: C.caution, fontSize: '11px', marginTop: '2px', flexShrink: 0 }}>▸</span>
                          <p style={{ margin: 0, fontSize: '13px', color: C.textSecondary, lineHeight: '1.55' }}>{issue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended next steps */}
                {result.nextSteps?.length > 0 && (
                  <div style={{ background: 'rgba(34,197,94,0.06)', border: `1px solid rgba(34,197,94,0.20)`, borderRadius: '10px', padding: '20px 22px' }}>
                    <p style={{ margin: '0 0 14px', fontSize: '11px', color: C.verified, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Recommended Next Steps</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {result.nextSteps.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <span style={{
                            width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: '700', color: C.verified,
                          }}>{i + 1}</span>
                          <p style={{ margin: 0, fontSize: '13px', color: C.textSecondary, lineHeight: '1.55', paddingTop: '2px' }}>{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ethics hotline */}
                {result.hotlineInfo && (
                  <div style={{ background: C.bgCard, border: `1px solid rgba(139,92,246,0.3)`, borderRadius: '10px', padding: '20px 22px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '11px', color: C.purple, letterSpacing: '0.08em', textTransform: 'uppercase' }}>State Bar Ethics Hotline</p>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', color: C.textSecondary, lineHeight: '1.6' }}>{result.hotlineInfo}</p>
                    <a
                      href="https://www.americanbar.org/groups/professional_responsibility/resources/links_of_interest/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: C.purple, textDecoration: 'none', borderBottom: `1px solid rgba(139,92,246,0.3)` }}
                    >
                      ABA Ethics Resources →
                    </a>
                  </div>
                )}

                {/* Save / Share / Print */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {[
                    { label: saved ? '✓ Saved!' : '💾 Save Results', onClick: handleSave,                      active: saved       },
                    { label: shareMsg || '🔗 Share',                  onClick: handleShare,                     active: !!shareMsg  },
                    { label: '🖨 Print',                               onClick: () => window.print(),            active: false       },
                  ].map(btn => (
                    <button key={btn.label} onClick={btn.onClick} style={{
                      padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                      border: `1px solid ${btn.active ? C.borderGold : C.border}`,
                      background: btn.active ? C.goldGlow2 : 'transparent',
                      color: btn.active ? C.gold : C.textSecondary,
                      fontSize: '12px', letterSpacing: '0.04em', transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { if (!btn.active) { e.currentTarget.style.borderColor = C.borderGold; e.currentTarget.style.color = C.gold } }}
                      onMouseLeave={e => { if (!btn.active) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary } }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

              </div>
            )
          })()}

          {/* ── Upsell ────────────────────────────────────────────────────── */}
          <div style={{
            marginTop: '32px', background: C.bgCard,
            border: `1px solid ${C.borderGold}`, borderRadius: '12px',
            padding: '24px 28px', textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 6px', fontFamily: SERIF, fontSize: '18px', color: C.textPrimary }}>
              Want unlimited access to all tools?
            </p>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: C.textSecondary }}>
              Upgrade to Pro for <strong style={{ color: C.gold }}>$49/month</strong> — unlimited ethics consultations, priority support, and full research access.
            </p>
            <Link href="/request-access" style={{
              display: 'inline-block', padding: '10px 28px', borderRadius: '8px',
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
              color: '#0a0800', fontSize: '13px', fontWeight: '700',
              textDecoration: 'none', letterSpacing: '0.06em',
              boxShadow: `0 4px 16px rgba(212,168,83,0.25)`,
            }}>
              Upgrade to Pro →
            </Link>
          </div>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <ToolSidebar currentId="ethics" />
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; }
        textarea::placeholder { color: #3a3530; }
        select option { background: #0a0d1a; color: #e8e0d0; }
        ::-webkit-scrollbar { width: 7px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>
    </div>
  )
}
