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

const COURT_TYPES = [
  { value: 'federal-district', label: 'Federal District Court' },
  { value: 'state-court',      label: 'State Court' },
  { value: 'small-claims',     label: 'Small Claims' },
  { value: 'family-court',     label: 'Family Court' },
  { value: 'landlord-tenant',  label: 'Landlord-Tenant Court' },
  { value: 'immigration',      label: 'Immigration Court' },
  { value: 'bankruptcy',       label: 'Bankruptcy Court' },
]

// ─── Difficulty badge ──────────────────────────────────────────────────────────
function difficultyBadge(d) {
  if (d === 'very_challenging') return { label: 'Very Challenging', color: C.danger,   bg: 'rgba(239,68,68,0.10)'  }
  if (d === 'challenging')      return { label: 'Challenging',      color: C.caution,  bg: 'rgba(245,158,11,0.10)' }
  return                               { label: 'Manageable',       color: C.verified, bg: 'rgba(34,197,94,0.10)'  }
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px 26px', animation: 'pulse 1.6s ease-in-out infinite' }}>
      <div style={{ height: '14px', width: '35%', background: C.border, borderRadius: '4px', marginBottom: '14px' }} />
      <div style={{ height: '18px', width: '70%', background: C.border, borderRadius: '4px', marginBottom: '10px' }} />
      <div style={{ height: '14px', width: '95%', background: C.border, borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ height: '14px', width: '82%', background: C.border, borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ height: '14px', width: '60%', background: C.border, borderRadius: '4px' }} />
    </div>
  )
}

// ─── Free resources for pro se users ──────────────────────────────────────────
const FREE_RESOURCES = [
  {
    tool: TOOLS.find(t => t.id === 'plain-english'),
    forProSe: 'Paste any court document, summons, or legal notice to get a plain-English explanation of exactly what it means and what you need to do.',
  },
  {
    tool: TOOLS.find(t => t.id === 'statute-of-limitations'),
    forProSe: 'Find out how long you have to file your claim. Missing this deadline usually means losing your right to sue — forever.',
  },
  {
    tool: TOOLS.find(t => t.id === 'letter-response'),
    forProSe: 'Received a threatening letter from an attorney or a collections agency? Get help drafting a proper response.',
  },
  {
    tool: TOOLS.find(t => t.id === 'deadlines'),
    forProSe: 'Courts are strict about filing deadlines. Use this to track all your important dates and never miss a deadline.',
  },
]

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function ProSePage() {
  const [situation,  setSituation]  = useState('')
  const [courtType,  setCourtType]  = useState('state-court')
  const [state,      setState]      = useState('California')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [result,     setResult]     = useState(null)
  const [saved,      setSaved]      = useState(false)
  const [shareMsg,   setShareMsg]   = useState(null)

  function handleSave()  { setSaved(true); setTimeout(() => setSaved(false), 2200) }
  function handleShare() {
    navigator.clipboard?.writeText(window.location.href)
    setShareMsg('Link copied!')
    setTimeout(() => setShareMsg(null), 2200)
  }

  async function handleSubmit() {
    if (!situation.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res  = await fetch('/api/tools/pro-se', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, courtType, state }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong — please try again.')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectBase = {
    background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: '8px',
    color: C.textPrimary, fontSize: '14px', padding: '11px 14px',
    outline: 'none', width: '100%', fontFamily: SANS, cursor: 'pointer',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: SANS, color: C.textPrimary, fontSize: '14px' }}>

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

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div style={{
        background: `radial-gradient(ellipse at 50% 0%, rgba(212,168,83,0.07) 0%, transparent 65%), linear-gradient(180deg, rgba(212,168,83,0.03) 0%, transparent 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: '60px 40px 48px',
        textAlign: 'center',
      }}>
        {/* Breadcrumb */}
        <p style={{ fontSize: '12px', color: C.textMuted, marginBottom: '28px', letterSpacing: '0.04em' }}>
          <Link href="/"      style={{ color: C.textMuted, textDecoration: 'none' }}>TrustLayer</Link>
          {' › '}
          <Link href="/tools" style={{ color: C.textMuted, textDecoration: 'none' }}>Tools</Link>
          {' › '}
          <span style={{ color: C.textSecondary }}>Pro Se Assistant</span>
        </p>

        {/* Big compassionate headline — no eyebrow badge */}
        <h1 style={{ margin: '0 0 10px', fontFamily: SERIF, lineHeight: 1.1 }}>
          <span style={{ display: 'block', fontSize: 'clamp(38px, 6vw, 52px)', fontWeight: '700', color: C.gold, letterSpacing: '-0.01em' }}>
            You Have Rights.
          </span>
          <span style={{ display: 'block', fontSize: 'clamp(28px, 4.5vw, 40px)', fontWeight: '600', color: C.textPrimary, marginTop: '6px' }}>
            We Help You Use Them.
          </span>
        </h1>

        <p style={{
          fontSize: '16px', color: C.textSecondary, margin: '20px auto 24px',
          maxWidth: '640px', lineHeight: '1.7', fontFamily: SERIF, fontStyle: 'italic',
        }}>
          Navigating the legal system alone is one of the hardest things a person can do.
          You're not alone. This free tool gives you step-by-step guidance written in plain English.
        </p>

        {/* FREE badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.30)',
          borderRadius: '24px', padding: '8px 18px',
        }}>
          <span style={{ color: C.verified, fontSize: '14px' }}>✓</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: C.verified, letterSpacing: '0.04em' }}>
            This tool is 100% FREE — No account required
          </span>
        </div>
      </div>

      {/* ── Main content (full-width, no sidebar) ───────────────────────────── */}
      <div style={{ maxWidth: '840px', margin: '0 auto', padding: '36px 40px' }}>

        {/* ── Form card ─────────────────────────────────────────────────────── */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '32px', marginBottom: '28px' }}>
          <h2 style={{ margin: '0 0 8px', fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: C.textPrimary }}>
            Tell us what's happening
          </h2>
          <p style={{ margin: '0 0 22px', fontSize: '14px', color: C.textSecondary, lineHeight: '1.6' }}>
            Use your own words — don't worry about legal language. The more detail you share, the more specific your guide will be.
          </p>

          {/* Situation textarea */}
          <div style={{ marginBottom: '18px' }}>
            <textarea
              value={situation}
              onChange={e => setSituation(e.target.value)}
              placeholder={"Describe your situation in your own words. Don't worry about legal language. Example: 'My landlord is trying to evict me and I don't think it's fair. I received a 3-day notice to pay or quit but I paid my rent.' or 'I was fired from my job and I think it was because I complained about harassment.'"}
              rows={8}
              style={{
                width: '100%', background: C.bgInput, border: `1px solid ${C.border}`,
                borderRadius: '10px', color: C.textPrimary, fontSize: '14px',
                padding: '14px 16px', outline: 'none', resize: 'vertical',
                minHeight: '200px', fontFamily: SANS, lineHeight: '1.7',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = C.borderGold}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          {/* Court type + State */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: C.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '7px' }}>
                Type of Court
              </label>
              <select
                value={courtType}
                onChange={e => setCourtType(e.target.value)}
                style={selectBase}
                onFocus={e => e.target.style.borderColor = C.borderGold}
                onBlur={e => e.target.style.borderColor = C.border}
              >
                {COURT_TYPES.map(ct => (
                  <option key={ct.value} value={ct.value} style={{ background: C.bgCard }}>{ct.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: C.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '7px' }}>
                Your State
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
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !situation.trim()}
            style={{
              width: '100%', padding: '15px', borderRadius: '10px', border: 'none',
              background: loading || !situation.trim()
                ? C.border
                : `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
              color: loading || !situation.trim() ? C.textMuted : '#0a0800',
              fontSize: '16px', fontWeight: '700', letterSpacing: '0.04em',
              cursor: loading || !situation.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading || !situation.trim() ? 'none' : `0 6px 24px rgba(212,168,83,0.28)`,
            }}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '15px', height: '15px', border: `2px solid #0a0800`,
                  borderTopColor: 'transparent', borderRadius: '50%',
                  display: 'inline-block', animation: 'spin 0.7s linear infinite',
                }} />
                Building your personal legal guide…
              </span>
            ) : 'Get Your Legal Guide'}
          </button>

          {/* Empathy text */}
          <p style={{ margin: '14px 0 0', fontSize: '13px', color: C.textMuted, lineHeight: '1.6', textAlign: 'center' }}>
            We'll create a personalized step-by-step guide just for your situation. This is not legal advice, but it will help you understand your rights and your options.
          </p>
        </div>

        {/* ── Loading ─────────────────────────────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────────────── */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.25)`,
            borderRadius: '12px', padding: '18px 22px', color: C.danger, fontSize: '14px',
            lineHeight: '1.6', animation: 'fadeIn 0.3s ease',
          }}>
            {error}
          </div>
        )}

        {/* ── Results ─────────────────────────────────────────────────────────── */}
        {result && !loading && (() => {
          const db = difficultyBadge(result.difficulty)
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'slideUp 0.4s ease both' }}>

              {/* Overview card */}
              <div style={{ background: C.bgCard, border: `1px solid ${C.borderGold}`, borderRadius: '14px', padding: '26px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: '20px', fontWeight: '700', color: C.textPrimary }}>
                    {result.canHandleProSe ? 'You can handle this.' : 'This is challenging, but doable.'}
                  </h2>
                  <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', background: db.bg, color: db.color, fontWeight: '600' }}>
                    {db.label}
                  </span>
                </div>
                <p style={{ margin: 0, fontFamily: SERIF, fontSize: '16px', color: C.textSecondary, lineHeight: '1.75' }}>
                  {result.overview}
                </p>
              </div>

              {/* Steps */}
              {result.steps?.length > 0 && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontFamily: SERIF, fontSize: '18px', color: C.textPrimary, fontWeight: '700' }}>
                    Your Step-by-Step Plan
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {result.steps.map((step, i) => (
                      <div key={i} style={{
                        background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px',
                        padding: '20px 22px', display: 'flex', gap: '18px', alignItems: 'flex-start',
                        transition: 'border-color 0.2s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = C.borderGold}
                        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                      >
                        {/* Step circle */}
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                          background: C.goldGlow, border: `2px solid ${C.borderGold}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: SERIF, fontSize: '18px', fontWeight: '700', color: C.gold,
                        }}>
                          {step.number ?? i + 1}
                        </div>

                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 8px', fontFamily: SERIF, fontSize: '16px', fontWeight: '700', color: C.textPrimary }}>
                            {step.title}
                          </h4>
                          <p style={{ margin: '0 0 12px', fontSize: '14px', color: C.textSecondary, lineHeight: '1.7' }}>
                            {step.detail}
                          </p>

                          {/* Documents for this step */}
                          {step.documents?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                              {step.documents.map((doc, j) => (
                                <span key={j} style={{
                                  fontSize: '11px', padding: '3px 10px', borderRadius: '12px',
                                  background: C.goldGlow2, border: `1px solid ${C.borderGold}`,
                                  color: C.gold,
                                }}>📄 {doc}</span>
                              ))}
                            </div>
                          )}

                          {/* Timeframe */}
                          {step.timeframe && (
                            <p style={{ margin: 0, fontSize: '12px', color: C.textMuted }}>
                              ⏱ {step.timeframe}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents you'll need */}
              {result.requiredDocuments?.length > 0 && (
                <div>
                  <h3 style={{ margin: '0 0 14px', fontFamily: SERIF, fontSize: '18px', color: C.textPrimary, fontWeight: '700' }}>
                    Documents You'll Need
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {result.requiredDocuments.map((doc, i) => (
                      <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '600', fontSize: '14px', color: C.textPrimary }}>📄 {doc.name}</span>
                          {doc.cost && (
                            <span style={{
                              fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                              background: doc.cost === 'Free' ? 'rgba(34,197,94,0.10)' : 'rgba(245,158,11,0.10)',
                              color: doc.cost === 'Free' ? C.verified : C.caution,
                              border: `1px solid ${doc.cost === 'Free' ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
                              fontWeight: '600',
                            }}>{doc.cost}</span>
                          )}
                        </div>
                        <p style={{ margin: '0 0 4px', fontSize: '13px', color: C.textSecondary, lineHeight: '1.5' }}>{doc.purpose}</p>
                        {doc.whereToGet && (
                          <p style={{ margin: 0, fontSize: '12px', color: C.textMuted }}>
                            Where to get it: <span style={{ color: C.textSecondary }}>{doc.whereToGet}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* At your hearing */}
              {result.hearingPrep?.length > 0 && (
                <div>
                  <h3 style={{ margin: '0 0 14px', fontFamily: SERIF, fontSize: '18px', color: C.textPrimary, fontWeight: '700' }}>
                    At Your Hearing
                  </h3>
                  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px 22px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {result.hearingPrep.map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <span style={{ color: C.verified, fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                          <p style={{ margin: 0, fontSize: '14px', color: C.textSecondary, lineHeight: '1.6' }}>{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Your rights */}
              {result.yourRights?.length > 0 && (
                <div>
                  <h3 style={{ margin: '0 0 14px', fontFamily: SERIF, fontSize: '18px', color: C.textPrimary, fontWeight: '700' }}>
                    Your Rights
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.yourRights.map((right, i) => (
                      <div key={i} style={{
                        background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)',
                        borderRadius: '8px', padding: '13px 16px',
                        display: 'flex', gap: '12px', alignItems: 'flex-start',
                      }}>
                        <span style={{ color: C.verified, fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>⚖</span>
                        <p style={{ margin: 0, fontSize: '14px', color: C.textSecondary, lineHeight: '1.6' }}>{right}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common mistakes */}
              {result.commonMistakes?.length > 0 && (
                <div>
                  <h3 style={{ margin: '0 0 14px', fontFamily: SERIF, fontSize: '18px', color: C.textPrimary, fontWeight: '700' }}>
                    Common Mistakes to Avoid
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.commonMistakes.map((mistake, i) => (
                      <div key={i} style={{
                        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)',
                        borderRadius: '8px', padding: '13px 16px',
                        display: 'flex', gap: '12px', alignItems: 'flex-start',
                      }}>
                        <span style={{ color: C.danger, fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>⚠</span>
                        <p style={{ margin: 0, fontSize: '14px', color: C.textSecondary, lineHeight: '1.6' }}>{mistake}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Court resources */}
              {result.courtResources?.length > 0 && (
                <div>
                  <h3 style={{ margin: '0 0 14px', fontFamily: SERIF, fontSize: '18px', color: C.textPrimary, fontWeight: '700' }}>
                    Court Resources & Self-Help
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.courtResources.map((resource, i) => (
                      <div key={i} style={{
                        background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)',
                        borderRadius: '8px', padding: '13px 16px',
                        display: 'flex', gap: '12px', alignItems: 'flex-start',
                      }}>
                        <span style={{ color: C.blue, fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>🔗</span>
                        <p style={{ margin: 0, fontSize: '14px', color: C.textSecondary, lineHeight: '1.6' }}>{resource}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* When to hire an attorney — honest, non-preachy */}
              {result.whenToHireAttorney && (
                <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '22px 24px' }}>
                  <h3 style={{ margin: '0 0 10px', fontFamily: SERIF, fontSize: '16px', fontWeight: '700', color: C.textPrimary }}>
                    When to Consider Hiring an Attorney
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: C.textSecondary, lineHeight: '1.7' }}>
                    {result.whenToHireAttorney}
                  </p>
                </div>
              )}

              {/* Save / Share / Print */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { label: saved ? '✓ Saved!' : '💾 Save Results', onClick: handleSave,           active: saved      },
                  { label: shareMsg || '🔗 Share',                  onClick: handleShare,           active: !!shareMsg },
                  { label: '🖨 Print',                               onClick: () => window.print(), active: false      },
                ].map(btn => (
                  <button key={btn.label} onClick={btn.onClick} style={{
                    padding: '9px 18px', borderRadius: '6px', cursor: 'pointer',
                    border: `1px solid ${btn.active ? C.borderGold : C.border}`,
                    background: btn.active ? C.goldGlow2 : 'transparent',
                    color: btn.active ? C.gold : C.textSecondary,
                    fontSize: '13px', letterSpacing: '0.03em', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { if (!btn.active) { e.currentTarget.style.borderColor = C.borderGold; e.currentTarget.style.color = C.gold } }}
                    onMouseLeave={e => { if (!btn.active) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary } }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Encouragement card — the last thing they read */}
              {result.encouragement && (
                <div style={{
                  background: C.bgCard, border: `2px solid ${C.borderGold}`,
                  borderRadius: '14px', padding: '28px 30px',
                  background: `linear-gradient(135deg, rgba(212,168,83,0.06) 0%, rgba(10,13,26,1) 100%)`,
                }}>
                  <p style={{ margin: '0 0 14px', fontFamily: SERIF, fontSize: '28px', color: C.gold, lineHeight: 1 }}>✦</p>
                  <p style={{ margin: 0, fontFamily: SERIF, fontSize: '18px', color: C.textPrimary, lineHeight: '1.8', fontStyle: 'italic' }}>
                    {result.encouragement}
                  </p>
                </div>
              )}

            </div>
          )
        })()}

        {/* ── Soft upsell (not standard) ───────────────────────────────────── */}
        <div style={{
          marginTop: '40px', padding: '22px 24px', borderRadius: '12px',
          background: C.bgCard, border: `1px solid ${C.border}`,
          textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 6px', fontSize: '14px', color: C.textSecondary, lineHeight: '1.6' }}>
            If you found this helpful, consider sharing it with someone who needs it.
          </p>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: C.textMuted, lineHeight: '1.5' }}>
            Pro access (<span style={{ color: C.gold }}>$49/mo</span>) gives attorneys unlimited consultations — but this tool will always be free.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
              style={{
                padding: '9px 20px', borderRadius: '8px', cursor: 'pointer',
                border: `1px solid rgba(34,197,94,0.3)`, background: 'rgba(34,197,94,0.08)',
                color: C.verified, fontSize: '13px', fontWeight: '600', letterSpacing: '0.03em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.14)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.08)' }}
            >
              Share This Tool
            </button>
            <Link href="/request-access" style={{
              display: 'inline-block', padding: '9px 20px', borderRadius: '8px',
              border: `1px solid ${C.borderGold}`, background: C.goldGlow2,
              color: C.gold, fontSize: '13px', textDecoration: 'none', fontWeight: '600',
              letterSpacing: '0.03em', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.goldGlow }}
              onMouseLeave={e => { e.currentTarget.style.background = C.goldGlow2 }}
            >
              Learn About Pro Access
            </Link>
          </div>
        </div>

        {/* ── Other Free Resources ─────────────────────────────────────────── */}
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ margin: '0 0 6px', fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: C.textPrimary }}>
            Other Free Resources For You
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: C.textSecondary }}>
            These tools were built for attorneys, but they can help you too.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {FREE_RESOURCES.map(({ tool, forProSe }) => (
              <Link key={tool.id} href={tool.path} style={{
                display: 'block', background: C.bgCard, border: `1px solid ${C.border}`,
                borderRadius: '10px', padding: '18px 20px', textDecoration: 'none',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.borderGold}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{tool.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: C.textPrimary }}>{tool.name}</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: C.textSecondary, lineHeight: '1.6' }}>{forProSe}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
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
