'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Design tokens ────────────────────────────────────────────────────────────
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
}

const SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, "Times New Roman", serif'
const SANS  = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const MONO  = '"SF Mono", "Fira Code", "Courier New", monospace'

// ─── Form data ────────────────────────────────────────────────────────────────
const ROLES = [
  { id: 'partner',    label: 'Partner / Senior Associate' },
  { id: 'inhouse',   label: 'In-House Counsel' },
  { id: 'solo',      label: 'Solo Practitioner' },
  { id: 'compliance',label: 'Compliance Officer' },
  { id: 'legaltech', label: 'Legal Tech Professional' },
  { id: 'academic',  label: 'Law Student / Academic' },
]

const CONCERNS = [
  { id: 'citations',    label: 'Hallucinated case citations',  color: '#ef4444' },
  { id: 'statutes',     label: 'Outdated or wrong statutes',   color: '#8b5cf6' },
  { id: 'regulations',  label: 'Fabricated regulations',       color: '#ef4444' },
  { id: 'jurisdiction', label: 'Jurisdiction errors',          color: '#f59e0b' },
  { id: 'clauses',      label: 'Dangerous contract clauses',   color: '#f59e0b' },
  { id: 'all',          label: 'All of the above',             color: '#d4a853' },
]

// ─── Live feed data ───────────────────────────────────────────────────────────
const FEED_ITEMS = [
  { doc: 'Non-Disclosure Agreement',   loc: 'New York, NY',      score: 72, note: '2 hallucinations detected',  noteColor: '#ef4444' },
  { doc: 'Merger Agreement',           loc: 'San Francisco, CA', score: 91, note: 'Verified — no issues found', noteColor: '#22c55e' },
  { doc: 'Employment Brief',           loc: 'Chicago, IL',       score: 31, note: '4 fabricated citations',     noteColor: '#ef4444' },
  { doc: 'Terms of Service',           loc: 'Austin, TX',        score: 55, note: '3 outdated statutes',        noteColor: '#8b5cf6' },
  { doc: 'Partnership Agreement',      loc: 'Boston, MA',        score: 94, note: 'Verified — no issues found', noteColor: '#22c55e' },
  { doc: 'SEC Disclosure',             loc: 'Washington, D.C.',  score: 44, note: '3 hallucinations detected',  noteColor: '#ef4444' },
  { doc: 'IP Assignment Agreement',    loc: 'Los Angeles, CA',   score: 83, note: '1 outdated clause',          noteColor: '#8b5cf6' },
  { doc: 'Shareholder Agreement',      loc: 'Dallas, TX',        score: 68, note: '2 unverified claims',        noteColor: '#f59e0b' },
  { doc: 'Commercial Lease',           loc: 'Miami, FL',         score: 79, note: '1 outdated statute',         noteColor: '#8b5cf6' },
  { doc: 'Software License Agreement', loc: 'Seattle, WA',       score: 38, note: '5 hallucinations detected',  noteColor: '#ef4444' },
  { doc: 'Arbitration Clause',         loc: 'Houston, TX',       score: 96, note: 'Verified — no issues found', noteColor: '#22c55e' },
  { doc: 'Employment Contract',        loc: 'Phoenix, AZ',       score: 61, note: '2 outdated statutes',        noteColor: '#8b5cf6' },
  { doc: 'Vendor Services Agreement',  loc: 'Denver, CO',        score: 47, note: '3 hallucinations detected',  noteColor: '#ef4444' },
  { doc: 'LLC Operating Agreement',    loc: 'Nashville, TN',     score: 88, note: '1 unverified claim',         noteColor: '#f59e0b' },
  { doc: 'Promissory Note',            loc: 'Minneapolis, MN',   score: 73, note: 'Verified — no issues found', noteColor: '#22c55e' },
]

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1600 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])
  return <span ref={ref}>{val.toLocaleString()}</span>
}

// ─── Live feed ────────────────────────────────────────────────────────────────
function LiveFeed() {
  const items = [...FEED_ITEMS, ...FEED_ITEMS]
  const scoreColor = s => s >= 70 ? '#22c55e' : s >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ animation: 'feedScroll 50s linear infinite' }}>
      {items.map((item, i) => (
        <div key={i} style={{
          padding: '13px 14px', borderRadius: '8px',
          background: C.bg, border: `1px solid ${C.border}`,
          marginBottom: '9px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '600', color: C.textPrimary, fontFamily: SERIF, lineHeight: '1.3' }}>
              {item.doc}
            </span>
            <span style={{
              fontSize: '10px', fontWeight: '700',
              color: scoreColor(item.score),
              padding: '2px 7px', borderRadius: '4px',
              background: `${scoreColor(item.score)}18`,
              border: `1px solid ${scoreColor(item.score)}38`,
              flexShrink: 0,
            }}>{item.score}/100</span>
          </div>
          <p style={{ fontSize: '10.5px', color: C.textMuted, margin: '0 0 5px', fontFamily: MONO }}>
            📍 {item.loc}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
              background: item.noteColor, boxShadow: `0 0 4px ${item.noteColor}`,
            }} />
            <span style={{ fontSize: '11px', color: item.noteColor, fontWeight: '500' }}>{item.note}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Selectable option button ─────────────────────────────────────────────────
function OptionButton({ label, selected, onClick, accentColor }) {
  const [hovered, setHovered] = useState(false)
  const accent = accentColor || C.gold
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '14px 16px', borderRadius: '9px',
        textAlign: 'left', width: '100%',
        background: selected ? `${accent}14` : hovered ? 'rgba(255,255,255,0.02)' : C.bg,
        border: `1px solid ${selected ? accent : hovered ? C.borderGold : C.border}`,
        color: selected ? accent : hovered ? C.textPrimary : C.textSecondary,
        fontSize: '13px', fontWeight: selected ? '600' : '400',
        cursor: 'pointer', transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', gap: '10px',
        boxShadow: selected ? `0 0 0 1px ${accent}28, inset 0 0 20px ${accent}08` : 'none',
      }}
    >
      <span style={{
        width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
        border: `1.5px solid ${selected ? accent : hovered ? C.borderGold : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? accent : 'transparent',
        transition: 'all 0.15s',
      }}>
        {selected && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0a0800' }} />}
      </span>
      {label}
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RequestAccess() {
  const [step, setStep]       = useState(1)          // 1 | 2 | 3 | 'confirmed'
  const [role, setRole]       = useState('')
  const [concern, setConcern] = useState('')
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [firm, setFirm]       = useState('')
  const [position, setPosition]       = useState(0)
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied]   = useState(false)
  const [errors, setErrors]   = useState({})
  const [count, setCount]     = useState(347)

  useEffect(() => {
    const t = setInterval(() => setCount(n => n + 1), 42000 + Math.random() * 20000)
    return () => clearInterval(t)
  }, [])

  function handleSubmit() {
    const e = {}
    if (!name.trim())                        e.name  = 'Your name is required'
    if (!email.trim() || !email.includes('@')) e.email = 'A valid work email is required'
    if (Object.keys(e).length) { setErrors(e); return }
    const pos  = 347 + Math.floor(Math.random() * 6) + 1
    const code = Math.random().toString(36).slice(2, 8).toUpperCase()
    setPosition(pos)
    setReferralCode(code)
    setCount(pos)
    setStep('confirmed')
  }

  function copyLink() {
    navigator.clipboard?.writeText(`https://trustlayer.ai/r/${referralCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const STEP_META = [
    { n: 1, label: 'Your Role' },
    { n: 2, label: 'Your Concern' },
    { n: 3, label: 'Your Info' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.textPrimary, fontFamily: SANS }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '64px',
        background: 'rgba(5,7,13,0.94)',
        backdropFilter: 'blur(18px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '7px',
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 14px ${C.goldGlow}`,
          }}>
            <span style={{ fontFamily: SERIF, fontWeight: '700', fontSize: '16px', color: '#0a0800' }}>T</span>
          </div>
          <span style={{ fontFamily: SERIF, fontWeight: '700', fontSize: '18px', color: C.textPrimary }}>
            Trust<span style={{ color: C.gold }}>Layer</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/" style={{
            fontSize: '13px', color: C.textSecondary, textDecoration: 'none',
            letterSpacing: '0.04em', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.target.style.color = C.gold}
            onMouseLeave={e => e.target.style.color = C.textSecondary}
          >Verify</Link>
          <Link href="/research" style={{
            fontSize: '13px', color: C.textSecondary, textDecoration: 'none',
            letterSpacing: '0.04em', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.target.style.color = C.gold}
            onMouseLeave={e => e.target.style.color = C.textSecondary}
          >Research</Link>
        </div>
      </nav>

      {/* ── Two-column layout ── */}
      <div style={{
        maxWidth: '1160px', margin: '0 auto',
        padding: '64px 24px 96px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 348px',
        gap: '52px',
        alignItems: 'start',
      }}>

        {/* ════════ LEFT COLUMN ════════ */}
        <div>

          {/* Hero */}
          <div style={{ marginBottom: '44px', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '-80px', left: '-60px',
              width: '500px', height: '400px',
              background: 'radial-gradient(ellipse at 30% 40%, rgba(212,168,83,0.07) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />

            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', borderRadius: '999px',
              background: C.goldGlow2, border: `1px solid ${C.borderGold}`,
              fontSize: '11px', color: C.gold, fontWeight: '700',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: '28px',
            }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: C.gold, boxShadow: `0 0 6px ${C.gold}`,
                animation: 'pulseGlow 1.8s ease-in-out infinite',
              }} />
              Early Access — Invitation Required
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: SERIF,
              fontSize: 'clamp(34px, 3.8vw, 54px)',
              fontWeight: '700',
              lineHeight: '1.09',
              letterSpacing: '-0.01em',
              color: C.textPrimary,
              margin: '0 0 22px',
              maxWidth: '600px',
            }}>
              Join Legal Professionals<br />
              Who Never Trust<br />
              <span style={{ color: C.gold }}>AI Blindly Again</span>
            </h1>

            <p style={{
              fontFamily: SERIF, fontStyle: 'italic',
              fontSize: '17px', color: C.textSecondary,
              lineHeight: '1.72', margin: '0 0 36px',
              maxWidth: '500px',
            }}>
              TrustLayer catches fabricated citations, obsolete statutes, and impossible legal claims — before they reach a client or a courtroom.
            </p>

            {/* Live counter */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '20px',
              padding: '18px 26px', borderRadius: '12px',
              background: C.bgCard, border: `1px solid ${C.border}`,
              boxShadow: `0 0 0 1px rgba(212,168,83,0.06)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '9px', height: '9px', borderRadius: '50%',
                  background: '#22c55e', boxShadow: '0 0 10px #22c55e',
                  animation: 'pulseGlow 1.8s ease-in-out infinite',
                }} />
                <div>
                  <div style={{
                    fontFamily: SERIF, fontSize: '28px', fontWeight: '700',
                    color: C.gold, lineHeight: 1,
                  }}>
                    <AnimatedCounter target={count} />
                  </div>
                  <div style={{ fontSize: '11.5px', color: C.textSecondary, marginTop: '2px', letterSpacing: '0.04em' }}>
                    attorneys on the waitlist
                  </div>
                </div>
              </div>
              <div style={{ width: '1px', height: '40px', background: C.border }} />
              <div style={{ fontSize: '12px', color: C.textSecondary, lineHeight: '1.65' }}>
                <div><span style={{ color: C.textPrimary, fontWeight: '600' }}>Avg. wait:</span> 9 days</div>
                <div><span style={{ color: C.gold, fontWeight: '600' }}>Priority access</span> via referral</div>
              </div>
            </div>
          </div>

          {/* ── Form card ── */}
          {step !== 'confirmed' && (
            <div style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
            }}>

              {/* Step progress */}
              <div style={{
                padding: '20px 28px',
                borderBottom: `1px solid ${C.border}`,
                background: 'rgba(212,168,83,0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {STEP_META.map((s, i) => (
                    <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                          background: step > s.n ? '#22c55e' : step === s.n ? C.gold : 'transparent',
                          border: `1.5px solid ${step > s.n ? '#22c55e' : step === s.n ? C.gold : C.border}`,
                          color: step >= s.n ? '#0a0800' : C.textMuted,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: '700',
                          transition: 'all 0.35s',
                        }}>
                          {step > s.n ? '✓' : s.n}
                        </div>
                        <span style={{
                          fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap',
                          color: step === s.n ? C.gold : step > s.n ? C.textSecondary : C.textMuted,
                          transition: 'color 0.35s',
                        }}>{s.label}</span>
                      </div>
                      {i < 2 && (
                        <div style={{
                          flex: 1, height: '1px',
                          background: step > s.n ? '#22c55e40' : C.border,
                          margin: '0 12px',
                          transition: 'background 0.35s',
                        }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '36px 32px' }}>

                {/* ── Step 1 ── */}
                {step === 1 && (
                  <div>
                    <h2 style={{ fontFamily: SERIF, fontSize: '23px', fontWeight: '600', color: C.textPrimary, margin: '0 0 8px' }}>
                      What type of legal professional are you?
                    </h2>
                    <p style={{ fontSize: '14px', color: C.textSecondary, fontFamily: SERIF, fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 28px' }}>
                      We tailor TrustLayer's analysis focus to your specific practice area and document types.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px', marginBottom: '28px' }}>
                      {ROLES.map(r => (
                        <OptionButton
                          key={r.id}
                          label={r.label}
                          selected={role === r.id}
                          onClick={() => setRole(r.id)}
                          accentColor={C.gold}
                        />
                      ))}
                    </div>
                    <PrimaryButton disabled={!role} onClick={() => role && setStep(2)}>
                      Continue →
                    </PrimaryButton>
                  </div>
                )}

                {/* ── Step 2 ── */}
                {step === 2 && (
                  <div>
                    <h2 style={{ fontFamily: SERIF, fontSize: '23px', fontWeight: '600', color: C.textPrimary, margin: '0 0 8px' }}>
                      What's your biggest AI concern?
                    </h2>
                    <p style={{ fontSize: '14px', color: C.textSecondary, fontFamily: SERIF, fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 28px' }}>
                      This will be highlighted first in every verification report you run.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px', marginBottom: '28px' }}>
                      {CONCERNS.map(c => (
                        <OptionButton
                          key={c.id}
                          label={c.label}
                          selected={concern === c.id}
                          onClick={() => setConcern(c.id)}
                          accentColor={c.color}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <BackButton onClick={() => setStep(1)} />
                      <PrimaryButton disabled={!concern} onClick={() => concern && setStep(3)} style={{ flex: 1 }}>
                        Continue →
                      </PrimaryButton>
                    </div>
                  </div>
                )}

                {/* ── Step 3 ── */}
                {step === 3 && (
                  <div>
                    <h2 style={{ fontFamily: SERIF, fontSize: '23px', fontWeight: '600', color: C.textPrimary, margin: '0 0 8px' }}>
                      Secure your spot on the waitlist.
                    </h2>
                    <p style={{ fontSize: '14px', color: C.textSecondary, fontFamily: SERIF, fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 28px' }}>
                      We personally review each application to ensure TrustLayer stays built for serious practitioners.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                      {[
                        { key: 'name',  label: 'Full Name',           placeholder: 'Margaret Chen',          value: name,  set: setName,  type: 'text' },
                        { key: 'email', label: 'Work Email',          placeholder: 'mchen@chenvoss.com',     value: email, set: setEmail, type: 'email' },
                        { key: 'firm',  label: 'Firm / Organization', placeholder: 'Chen & Voss LLP',        value: firm,  set: setFirm,  type: 'text', optional: true },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{
                            display: 'block', marginBottom: '7px',
                            fontSize: '11px', fontWeight: '700',
                            letterSpacing: '0.07em', textTransform: 'uppercase',
                            color: C.textSecondary,
                          }}>
                            {f.label}
                            {!f.optional && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
                            {f.optional && <span style={{ color: C.textMuted, fontWeight: '400', textTransform: 'none', letterSpacing: 0, marginLeft: '6px', fontSize: '11px' }}>optional</span>}
                          </label>
                          <input
                            type={f.type}
                            value={f.value}
                            onChange={e => {
                              f.set(e.target.value)
                              if (errors[f.key]) setErrors(p => ({ ...p, [f.key]: '' }))
                            }}
                            placeholder={f.placeholder}
                            style={{
                              width: '100%', padding: '13px 16px', borderRadius: '8px',
                              background: C.bgInput,
                              border: `1px solid ${errors[f.key] ? '#ef4444' : C.border}`,
                              color: C.textPrimary, fontSize: '14px',
                              outline: 'none', fontFamily: SANS,
                              boxSizing: 'border-box', transition: 'border-color 0.2s',
                            }}
                            onFocus={e => e.target.style.borderColor = C.borderGold}
                            onBlur={e => e.target.style.borderColor = errors[f.key] ? '#ef4444' : C.border}
                          />
                          {errors[f.key] && (
                            <p style={{ fontSize: '12px', color: '#ef4444', margin: '5px 0 0' }}>{errors[f.key]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <BackButton onClick={() => setStep(2)} />
                      <PrimaryButton onClick={handleSubmit} style={{ flex: 1 }}>
                        Join the Waitlist
                      </PrimaryButton>
                    </div>
                    <p style={{ fontSize: '12px', color: C.textMuted, textAlign: 'center', margin: '14px 0 0', lineHeight: '1.5' }}>
                      No payment required. We'll send your activation link within 48 hours.
                    </p>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ── Confirmation screen ── */}
          {step === 'confirmed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Position card */}
              <div style={{
                background: C.bgCard, border: `1px solid ${C.borderGold}`,
                borderRadius: '16px', padding: '44px 40px',
                textAlign: 'center', position: 'relative', overflow: 'hidden',
                boxShadow: '0 0 80px rgba(212,168,83,0.07), 0 24px 64px rgba(0,0,0,0.3)',
              }}>
                <div style={{
                  position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
                  width: '500px', height: '300px',
                  background: 'radial-gradient(ellipse, rgba(212,168,83,0.12) 0%, transparent 65%)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: '26px', color: '#22c55e',
                }}>✓</div>
                <p style={{
                  fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: C.textMuted, margin: '0 0 10px',
                }}>Your Waitlist Position</p>
                <div style={{
                  fontFamily: SERIF, fontSize: '88px', fontWeight: '700',
                  color: C.gold, lineHeight: 1, margin: '0 0 6px',
                  textShadow: '0 0 60px rgba(212,168,83,0.25)',
                }}>#{position}</div>
                <p style={{
                  fontSize: '15px', color: C.textSecondary, fontFamily: SERIF, fontStyle: 'italic',
                  lineHeight: '1.7', margin: '0 0 28px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto',
                }}>
                  You're on the list, {name.split(' ')[0]}. We'll notify you at{' '}
                  <span style={{ color: C.textPrimary, fontWeight: '500' }}>{email}</span>{' '}
                  when your access is ready.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', flexWrap: 'wrap' }}>
                  {[
                    { v: '28s',  l: 'Avg. analysis' },
                    { v: '94%',  l: 'Accuracy rate' },
                    { v: '50K+', l: 'Docs verified' },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: C.gold }}>{s.v}</div>
                      <div style={{ fontSize: '11px', color: C.textMuted, marginTop: '2px' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skip the line */}
              <div style={{
                background: C.bgCard, border: `1px solid ${C.border}`,
                borderRadius: '12px', padding: '26px 28px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '8px', flexShrink: 0,
                    background: C.goldGlow, border: `1px solid ${C.borderGold}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px',
                  }}>⚡</div>
                  <div>
                    <h3 style={{ fontFamily: SERIF, fontSize: '18px', fontWeight: '600', color: C.textPrimary, margin: '0 0 5px' }}>
                      Skip the line
                    </h3>
                    <p style={{ fontSize: '13px', color: C.textSecondary, fontFamily: SERIF, fontStyle: 'italic', lineHeight: '1.6', margin: 0 }}>
                      Share your referral link. Each signup moves you up <span style={{ color: C.gold, fontWeight: '600' }}>3 positions</span>.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{
                    flex: 1, padding: '12px 14px', borderRadius: '7px',
                    background: C.bgInput, border: `1px solid ${C.border}`,
                    fontSize: '13px', color: C.gold, fontFamily: MONO,
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    userSelect: 'all',
                  }}>
                    trustlayer.ai/r/{referralCode}
                  </div>
                  <button
                    onClick={copyLink}
                    style={{
                      padding: '12px 20px', borderRadius: '7px', cursor: 'pointer',
                      background: copied ? 'rgba(34,197,94,0.1)' : C.goldGlow,
                      border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : C.borderGold}`,
                      color: copied ? '#22c55e' : C.gold,
                      fontSize: '12px', fontWeight: '700', letterSpacing: '0.05em',
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                  >{copied ? '✓ Copied!' : 'Copy Link'}</button>
                </div>
              </div>

              {/* PDF download */}
              <div style={{
                padding: '26px 28px', borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(212,168,83,0.07) 0%, rgba(212,168,83,0.02) 100%)',
                border: `1px solid ${C.gold}`,
                display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
                boxShadow: '0 0 40px rgba(212,168,83,0.06)',
              }}>
                <div style={{
                  width: '54px', height: '64px', borderRadius: '8px', flexShrink: 0,
                  background: `linear-gradient(160deg, ${C.gold} 0%, ${C.goldDim} 100%)`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 6px 24px rgba(212,168,83,0.3)`,
                  position: 'relative',
                }}>
                  <span style={{ fontSize: '22px', lineHeight: 1 }}>📄</span>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#0a0800', letterSpacing: '0.05em', marginTop: '2px' }}>PDF</span>
                </div>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <p style={{
                    fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: C.gold, margin: '0 0 5px',
                  }}>Free Report — 24 Pages</p>
                  <h4 style={{
                    fontFamily: SERIF, fontSize: '16px', fontWeight: '600',
                    color: C.textPrimary, margin: '0 0 4px', lineHeight: '1.3',
                  }}>
                    The 10 Most Dangerous AI Hallucinations in Legal Documents
                  </h4>
                  <p style={{ fontSize: '12px', color: C.textSecondary, margin: 0 }}>
                    Real case studies. Actual hallucinations caught by TrustLayer.
                  </p>
                </div>
                <a
                  href="#"
                  onClick={e => e.preventDefault()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    padding: '13px 22px', borderRadius: '8px',
                    background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                    color: '#0a0800', fontSize: '12px', fontWeight: '700',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    boxShadow: '0 4px 22px rgba(212,168,83,0.32)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 7px 30px rgba(212,168,83,0.48)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 22px rgba(212,168,83,0.32)' }}
                >
                  ↓ Download Free
                </a>
              </div>

            </div>
          )}
        </div>

        {/* ════════ RIGHT COLUMN — Live feed ════════ */}
        <div style={{
          position: 'sticky', top: '80px',
          background: C.bgCard, border: `1px solid ${C.border}`,
          borderRadius: '16px', overflow: 'hidden',
          height: 'calc(100vh - 112px)', maxHeight: '700px',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        }}>

          {/* Feed header */}
          <div style={{
            padding: '18px 20px',
            borderBottom: `1px solid ${C.border}`,
            background: 'rgba(212,168,83,0.03)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: '#22c55e', boxShadow: '0 0 8px #22c55e',
                animation: 'pulseGlow 1.8s ease-in-out infinite',
              }} />
              <span style={{
                fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                textTransform: 'uppercase', color: C.textPrimary,
              }}>Live Verifications</span>
            </div>
            <p style={{ fontSize: '11px', color: C.textSecondary, margin: 0 }}>
              Real-time analysis from attorneys worldwide
            </p>
          </div>

          {/* Top fade */}
          <div style={{
            position: 'absolute', top: '64px', left: 0, right: 0, height: '28px',
            background: `linear-gradient(to bottom, ${C.bgCard} 0%, transparent 100%)`,
            zIndex: 2, pointerEvents: 'none',
          }} />

          {/* Scrolling feed */}
          <div style={{ flex: 1, overflow: 'hidden', padding: '8px 14px' }}>
            <LiveFeed />
          </div>

          {/* Bottom fade */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '44px',
            background: `linear-gradient(to top, ${C.bgCard} 0%, transparent 100%)`,
            zIndex: 2, pointerEvents: 'none',
          }} />
        </div>

      </div>

      {/* ── Trust strip ── */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        background: C.bgCard,
        padding: '18px 40px',
        display: 'flex', justifyContent: 'center', gap: '36px',
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        {[
          '🔒  Enterprise-grade security',
          '⚖  Built by legal professionals',
          '◉  SOC 2 Type II in progress',
          '✓  No data sold or shared',
        ].map((t, i) => (
          <span key={i} style={{ fontSize: '12px', color: C.textSecondary }}>
            {t}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes pulseGlow { 0%, 100% { opacity: 1; box-shadow: 0 0 8px currentColor; } 50% { opacity: 0.55; box-shadow: 0 0 3px currentColor; } }
        @keyframes feedScroll { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        * { box-sizing: border-box; }
        body { margin: 0; background: #05070d; }
        input::placeholder { color: #3a3530; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #05070d; }
        ::-webkit-scrollbar-thumb { background: #1a2035; border-radius: 4px; }
      `}</style>
    </div>
  )
}

// ─── Shared button components ─────────────────────────────────────────────────
function PrimaryButton({ children, onClick, disabled, style = {} }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '14px 24px', borderRadius: '8px', border: 'none',
        background: disabled
          ? '#1a2035'
          : hovered
          ? `linear-gradient(135deg, #e0b860, #b08840)`
          : `linear-gradient(135deg, #d4a853, #a07835)`,
        color: disabled ? '#3a3530' : '#0a0800',
        fontSize: '14px', fontWeight: '700',
        letterSpacing: '0.06em', textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        boxShadow: disabled ? 'none' : hovered ? '0 6px 28px rgba(212,168,83,0.45)' : '0 4px 20px rgba(212,168,83,0.28)',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'translateY(0)',
        ...style,
      }}
    >{children}</button>
  )
}

function BackButton({ onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '14px 18px', borderRadius: '8px',
        border: `1px solid ${hovered ? 'rgba(212,168,83,0.25)' : '#1a2035'}`,
        background: 'transparent',
        color: hovered ? '#d4a853' : '#8a8070',
        fontSize: '16px', cursor: 'pointer', transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >←</button>
  )
}
