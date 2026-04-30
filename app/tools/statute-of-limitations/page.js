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
  { id: 'plain-english',        path: '/tools/plain-english',        name: 'Plain English Translator',   icon: '📖' },
  { id: 'deadlines',            path: '/tools/deadlines',            name: 'Deadline Calculator',         icon: '⏰' },
  { id: 'red-flags',            path: '/tools/red-flags',            name: 'Contract Red Flag Scanner',   icon: '🔍' },
  { id: 'letter-response',      path: '/tools/letter-response',      name: 'Letter Response Generator',   icon: '✉' },
  { id: 'statute-of-limitations', path: '/tools/statute-of-limitations', name: 'Statute of Limitations', icon: '⏳' },
  { id: 'ethics',               path: '/tools/ethics',               name: 'Ethics Checker',              icon: '⚖' },
  { id: 'pro-se',               path: '/tools/pro-se',               name: 'Pro Se Assistant',            icon: '🏛', free: true },
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

const CLAIM_TYPES = [
  { value: 'personal-injury',            label: 'Personal Injury' },
  { value: 'contract-breach',            label: 'Contract Breach' },
  { value: 'employment-discrimination',  label: 'Employment Discrimination' },
  { value: 'medical-malpractice',        label: 'Medical Malpractice' },
  { value: 'property-damage',            label: 'Property Damage' },
  { value: 'fraud',                      label: 'Fraud' },
  { value: 'defamation',                 label: 'Defamation' },
  { value: 'civil-rights',               label: 'Civil Rights' },
  { value: 'consumer-protection',        label: 'Consumer Protection' },
  { value: 'other',                      label: 'Other' },
]

// ─── Today's date string for max= on date input ────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0]

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
          { icon: '📅', tip: 'The "discovery rule" may extend your deadline if you didn\'t know about the injury immediately.' },
          { icon: '🏛', tip: 'Government claims often require a notice of claim filed within 30–180 days.' },
          { icon: '⏸', tip: 'Tolling pauses the clock — minors, fraud, and incapacity can all toll the statute.' },
          { icon: '⚠', tip: 'Statutes of limitations are strictly enforced. Even one day late is usually fatal.' },
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
      <div style={{ height: '14px', width: '35%', background: C.border, borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ height: '18px', width: '65%', background: C.border, borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ height: '13px', width: '90%', background: C.border, borderRadius: '4px', marginBottom: '6px' }} />
      <div style={{ height: '13px', width: '75%', background: C.border, borderRadius: '4px' }} />
    </div>
  )
}

// ─── Urgency config ────────────────────────────────────────────────────────────
function urgencyConfig(urgency) {
  switch (urgency) {
    case 'expired':  return { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.30)',  color: C.danger,   icon: '⛔',  label: 'DEADLINE LIKELY EXPIRED — Consult an attorney immediately to determine if any exceptions apply' }
    case 'critical': return { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  color: C.danger,   icon: '🚨', label: 'CRITICAL — Your deadline is within 90 days. Do not delay.' }
    case 'warning':  return { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', color: C.caution,  icon: '⚠', label: 'Approaching — You have time but should act now.' }
    default:         return { bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.20)',  color: C.verified, icon: '✓',  label: 'You have time — but don\'t wait. Statutes of limitations can be affected by many factors.' }
  }
}

function deadlineColor(urgency) {
  if (urgency === 'expired' || urgency === 'critical') return C.danger
  if (urgency === 'warning') return C.caution
  return C.gold
}

function formatDeadlineDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return dateStr }
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function StatuteOfLimitationsPage() {
  const [claimType,    setClaimType]    = useState('personal-injury')
  const [state,        setState]        = useState('California')
  const [incidentDate, setIncidentDate] = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)
  const [result,       setResult]       = useState(null)
  const [saved,        setSaved]        = useState(false)
  const [shareMsg,     setShareMsg]     = useState(null)

  function handleSave()  { setSaved(true);  setTimeout(() => setSaved(false), 2200) }
  function handleShare() {
    navigator.clipboard?.writeText(window.location.href)
    setShareMsg('Link copied!')
    setTimeout(() => setShareMsg(null), 2200)
  }

  async function handleCalculate() {
    if (!incidentDate) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res  = await fetch('/api/tools/statute-of-limitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimType, state, incidentDate }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Calculation failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputBase = {
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
              color:        active ? C.gold : C.textSecondary,
              borderBottom: active ? `1px solid ${C.gold}` : 'none',
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
          <Link href="/"     style={{ color: C.textMuted, textDecoration: 'none' }}>TrustLayer</Link>
          {' › '}
          <Link href="/tools" style={{ color: C.textMuted, textDecoration: 'none' }}>Tools</Link>
          {' › '}
          <span style={{ color: C.textSecondary }}>Statute of Limitations</span>
        </p>

        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: C.goldGlow2, border: `1px solid ${C.borderGold}`,
          borderRadius: '20px', padding: '5px 14px', marginBottom: '20px',
        }}>
          <span style={{ color: C.gold, fontSize: '13px' }}>⏳</span>
          <span style={{ fontSize: '11px', color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '600' }}>
            Statute of Limitations Checker
          </span>
        </div>

        <h1 style={{
          fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: '700',
          letterSpacing: '-0.01em', lineHeight: '1.15', margin: '0 0 14px',
          color: C.textPrimary, maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto',
        }}>
          Know Exactly How Long<br />
          <span style={{ color: C.gold }}>You Have To File</span>
        </h1>

        <p style={{
          fontSize: '15px', color: C.textSecondary, margin: '0 auto',
          maxWidth: '620px', lineHeight: '1.65', fontFamily: SERIF, fontStyle: 'italic',
        }}>
          Missing a statute of limitations is the most common and most devastating legal mistake.
          Know your exact deadline before it's too late.
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
              Calculate Your Deadline
            </h2>

            {/* 3-column inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>

              {/* Claim type */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Claim Type
                </label>
                <select
                  value={claimType}
                  onChange={e => setClaimType(e.target.value)}
                  style={inputBase}
                  onFocus={e => e.target.style.borderColor = C.borderGold}
                  onBlur={e => e.target.style.borderColor = C.border}
                >
                  {CLAIM_TYPES.map(ct => (
                    <option key={ct.value} value={ct.value} style={{ background: C.bgCard }}>{ct.label}</option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  State
                </label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  style={inputBase}
                  onFocus={e => e.target.style.borderColor = C.borderGold}
                  onBlur={e => e.target.style.borderColor = C.border}
                >
                  {STATES_50.map(s => (
                    <option key={s} value={s} style={{ background: C.bgCard }}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Date of incident */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Date of Incident or Discovery
                </label>
                <input
                  type="date"
                  max={TODAY}
                  value={incidentDate}
                  onChange={e => setIncidentDate(e.target.value)}
                  style={{ ...inputBase, colorScheme: 'dark' }}
                  onFocus={e => e.target.style.borderColor = C.borderGold}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
            </div>

            {/* Calculate button */}
            <button
              onClick={handleCalculate}
              disabled={loading || !incidentDate}
              style={{
                width: '100%', padding: '13px', borderRadius: '8px', border: 'none',
                background: loading || !incidentDate
                  ? C.border
                  : `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                color: loading || !incidentDate ? C.textMuted : '#0a0800',
                fontSize: '14px', fontWeight: '700', letterSpacing: '0.06em',
                cursor: loading || !incidentDate ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading || !incidentDate ? 'none' : `0 4px 20px rgba(212,168,83,0.25)`,
              }}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '13px', height: '13px', border: `2px solid #0a0800`,
                    borderTopColor: 'transparent', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.7s linear infinite',
                  }} />
                  Calculating…
                </span>
              ) : 'Calculate Deadline'}
            </button>
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
            const uc = urgencyConfig(result.urgency)
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'slideUp 0.35s ease both' }}>

                {/* Urgency banner */}
                <div style={{ background: uc.bg, border: `1px solid ${uc.border}`, borderRadius: '10px', padding: '16px 20px' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: uc.color, lineHeight: '1.4' }}>
                    {uc.icon} {uc.label}
                  </p>
                </div>

                {/* Deadline display */}
                <div style={{
                  background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px',
                  padding: '28px', textAlign: 'center',
                }}>
                  <p style={{ margin: '0 0 6px', fontSize: '11px', color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Filing Deadline
                  </p>
                  <p style={{ margin: '0 0 8px', fontFamily: SERIF, fontSize: '34px', fontWeight: '700', color: deadlineColor(result.urgency), lineHeight: 1 }}>
                    {formatDeadlineDate(result.deadline)}
                  </p>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', color: C.textSecondary }}>
                    {result.urgency === 'expired'
                      ? 'Deadline has passed'
                      : `Days Remaining: ${result.daysRemaining?.toLocaleString() ?? '—'}`}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: C.textMuted }}>
                    Statute of limitations: <span style={{ color: C.gold, fontFamily: MONO }}>{result.yearsToFile} {result.yearsToFile === 1 ? 'year' : 'years'}</span> in {result.state}
                  </p>
                </div>

                {/* Statute card */}
                {result.statute && (
                  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px 22px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Controlling Statute</p>
                    <p style={{ margin: '0 0 10px', fontFamily: MONO, fontSize: '14px', color: C.gold }}>{result.statute}</p>
                    {result.statuteText && (
                      <p style={{ margin: 0, fontSize: '13px', color: C.textSecondary, lineHeight: '1.6', fontStyle: 'italic', borderLeft: `3px solid ${C.borderGold}`, paddingLeft: '14px' }}>
                        "{result.statuteText}"
                      </p>
                    )}
                  </div>
                )}

                {/* Discovery rule */}
                {result.discoveryRule && (
                  <div style={{ background: C.bgCard, border: `1px solid ${C.borderGold}`, borderRadius: '10px', padding: '20px 22px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '11px', color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Discovery Rule</p>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: C.textSecondary, lineHeight: '1.6' }}>{result.discoveryRule}</p>
                    {result.discoveryDeadline && (
                      <p style={{ margin: 0, fontSize: '12px', color: C.textMuted }}>
                        Discovery deadline: <span style={{ color: C.gold, fontFamily: MONO }}>{formatDeadlineDate(result.discoveryDeadline)}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Tolling exceptions */}
                {result.tollingExceptions?.length > 0 && (
                  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px 22px' }}>
                    <p style={{ margin: '0 0 14px', fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tolling Exceptions</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {result.tollingExceptions.map((ex, i) => (
                        <div key={i} style={{ background: C.bgInput, borderRadius: '6px', padding: '12px 14px' }}>
                          <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '600', color: C.caution }}>{ex.exception}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: C.textSecondary, lineHeight: '1.5' }}>{ex.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Government claim */}
                {result.governmentClaim?.required && (
                  <div style={{ background: 'rgba(245,158,11,0.07)', border: `1px solid rgba(245,158,11,0.25)`, borderRadius: '10px', padding: '20px 22px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '700', color: C.caution, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      ⚠ Government Claim Required
                    </p>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: C.textSecondary, lineHeight: '1.6' }}>
                      {result.governmentClaim.description}
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: C.textMuted }}>
                      File within: <span style={{ color: C.caution, fontWeight: '600' }}>{result.governmentClaim.daysFromIncident} days</span> of the incident
                    </p>
                    {result.governmentClaim.authority && (
                      <p style={{ margin: 0, fontSize: '12px', color: C.textMuted }}>
                        Authority: <span style={{ color: C.textSecondary, fontFamily: MONO }}>{result.governmentClaim.authority}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Important notes */}
                {result.importantNotes?.length > 0 && (
                  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px 22px' }}>
                    <p style={{ margin: '0 0 12px', fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Important Notes</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {result.importantNotes.map((note, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{ color: C.gold, fontSize: '9px', marginTop: '5px', flexShrink: 0 }}>✦</span>
                          <p style={{ margin: 0, fontSize: '13px', color: C.textSecondary, lineHeight: '1.6' }}>{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div style={{ background: C.bgCard, border: `1px solid ${C.borderGold}`, borderRadius: '10px', padding: '20px 22px' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Legal Disclaimer
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: C.textSecondary, lineHeight: '1.65' }}>
                    {result.disclaimer ?? 'Consult an attorney — statute of limitations questions are jurisdiction-specific and fact-dependent. This tool provides general information only and does not constitute legal advice. Deadlines may vary based on your specific facts, applicable exceptions, and changes in the law. Always verify with a licensed attorney in your jurisdiction before relying on any deadline.'}
                  </p>
                </div>

                {/* Save / Share / Print */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {[
                    { label: saved ? '✓ Saved!' : '💾 Save Results', onClick: handleSave, active: saved },
                    { label: shareMsg || '🔗 Share',                 onClick: handleShare, active: !!shareMsg },
                    { label: '🖨 Print',                              onClick: () => window.print(), active: false },
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
              Upgrade to Pro for <strong style={{ color: C.gold }}>$49/month</strong> — unlimited consultations, priority support, and full research access.
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
        <ToolSidebar currentId="statute-of-limitations" />
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; }
        input::placeholder { color: #3a3530; }
        select option { background: #0a0d1a; color: #e8e0d0; }
        ::-webkit-scrollbar { width: 7px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>
    </div>
  )
}
