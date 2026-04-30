'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:           '#000000',
  bgCard:       '#111111',
  bgSecondary:  '#0a0a0a',
  border:       '#222222',
  borderLight:  '#333333',
  textPrimary:  '#ffffff',
  textSecondary:'#888888',
  textMuted:    '#444444',
  blue:         '#2563eb',
  blueHover:    '#1d4ed8',
  blueGlow:     'rgba(37,99,235,0.15)',
  blueGlow2:    'rgba(37,99,235,0.08)',
  verified:     '#22c55e',
  verifiedBg:   'rgba(34,197,94,0.08)',
  error:        '#ef4444',
  errorBg:      'rgba(239,68,68,0.08)',
  warning:      '#f59e0b',
  warningBg:    'rgba(245,158,11,0.08)',
}

const SERIF = 'Georgia, "Times New Roman", serif'
const SANS  = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const MONO  = '"JetBrains Mono", "SF Mono", "Fira Code", "Courier New", monospace'

const TOOLS_NAV = [
  { path:'/tools/plain-english',          name:'Plain English Translator',  icon:'📖' },
  { path:'/tools/deadlines',              name:'Deadline Calculator',        icon:'⏰' },
  { path:'/tools/red-flags',              name:'Contract Red Flag Scanner',  icon:'🔍' },
  { path:'/tools/letter-response',        name:'Letter Response Generator',  icon:'✉'  },
  { path:'/tools/statute-of-limitations', name:'Statute of Limitations',     icon:'⏳' },
  { path:'/tools/ethics',                 name:'Ethics Checker',             icon:'⚖' },
  { path:'/tools/pro-se',                 name:'Pro Se Assistant',           icon:'🏛' },
]

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
  { id: 'all',          label: 'All of the above',             color: '#2563eb' },
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
          padding: '14px 16px',
          background: C.bg,
          border: `1px solid ${C.border}`,
          marginBottom: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '5px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: C.textPrimary, fontFamily: SERIF, lineHeight: '1.3' }}>
              {item.doc}
            </span>
            <span style={{
              fontSize: '10px', fontWeight: '700',
              color: scoreColor(item.score),
              padding: '2px 7px',
              background: `${scoreColor(item.score)}18`,
              border: `1px solid ${scoreColor(item.score)}38`,
              flexShrink: 0,
              fontFamily: MONO,
            }}>{item.score}/100</span>
          </div>
          <p style={{ fontSize: '11px', color: C.textMuted, margin: '0 0 6px', fontFamily: MONO }}>
            {item.loc}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
              background: item.noteColor,
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
  const accent = accentColor || C.blue
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 16px',
        borderRadius: '4px',
        textAlign: 'left',
        width: '100%',
        background: selected ? `rgba(37,99,235,0.08)` : C.bgCard,
        border: `1px solid ${selected ? C.blue : C.borderLight}`,
        color: selected ? C.textPrimary : C.textSecondary,
        fontSize: '15px',
        fontWeight: selected ? '600' : '400',
        cursor: 'pointer',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontFamily: SANS,
      }}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = C.blue
          e.currentTarget.style.color = C.textPrimary
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = C.borderLight
          e.currentTarget.style.color = C.textSecondary
        }
      }}
    >
      <span style={{
        width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
        border: `1.5px solid ${selected ? C.blue : C.borderLight}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? C.blue : 'transparent',
        transition: 'all 0.15s',
      }}>
        {selected && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
      </span>
      {label}
    </button>
  )
}

// ─── Primary button ───────────────────────────────────────────────────────────
function PrimaryButton({ children, onClick, disabled, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '14px 24px',
        borderRadius: '6px',
        border: 'none',
        background: disabled ? C.textMuted : C.blue,
        color: disabled ? C.textSecondary : '#fff',
        fontSize: '16px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
        fontFamily: SANS,
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = C.blueHover }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = C.blue }}
    >{children}</button>
  )
}

// ─── Back button ──────────────────────────────────────────────────────────────
function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '14px 18px',
        borderRadius: '6px',
        border: `1px solid ${C.borderLight}`,
        background: 'transparent',
        color: C.textSecondary,
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: SANS,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.textSecondary; e.currentTarget.style.color = C.textPrimary }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderLight; e.currentTarget.style.color = C.textSecondary }}
    >←</button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RequestAccess() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen]           = useState(false)
  const [step, setStep]                     = useState(1)   // 1 | 2 | 3 | 'confirmed'
  const [role, setRole]                     = useState('')
  const [concern, setConcern]               = useState('')
  const [name, setName]                     = useState('')
  const [email, setEmail]                   = useState('')
  const [firm, setFirm]                     = useState('')
  const [position, setPosition]             = useState(0)
  const [referralCode, setReferralCode]     = useState('')
  const [copied, setCopied]                 = useState(false)
  const [errors, setErrors]                 = useState({})
  const [count, setCount]                   = useState(347)

  useEffect(() => {
    const t = setInterval(() => setCount(n => n + 1), 42000 + Math.random() * 20000)
    return () => clearInterval(t)
  }, [])

  function handleSubmit() {
    const e = {}
    if (!name.trim())                         e.name  = 'Your name is required'
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
      <nav className="tl-nav" style={{ position:'sticky', top:0, zIndex:100, background:'#000', borderBottom:'1px solid #222', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px' }}>
        <Link href="/" style={{ textDecoration:'none', fontSize:'22px', fontFamily:SERIF, fontWeight:'700', color:'#fff', letterSpacing:'-0.02em' }}>TrustLayer</Link>
        <div className="tl-nav-links" style={{ display:'flex', gap:'32px', alignItems:'center' }}>
          {[['/', 'Verify'],['/research','Research']].map(([href,label]) => (
            <Link key={href} href={href} style={{ fontSize:'14px', color:'#fff', textDecoration:'none', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#2563eb'}
              onMouseLeave={e=>e.currentTarget.style.color='#fff'}
            >{label}</Link>
          ))}
          {/* Tools dropdown */}
          <div style={{ position:'relative' }} onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <Link href="/tools" style={{ fontSize:'14px', color:'#fff', textDecoration:'none', display:'flex', alignItems:'center', gap:'3px', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#2563eb'}
              onMouseLeave={e=>e.currentTarget.style.color='#fff'}
            >Tools <span style={{ fontSize:'9px', opacity:0.6 }}>▾</span></Link>
            {toolsOpen && (
              <div style={{ position:'absolute', top:'calc(100% + 10px)', left:'-10px', background:'#111', border:'1px solid #222', borderRadius:'6px', padding:'8px 6px', minWidth:'240px', boxShadow:'0 8px 32px rgba(0,0,0,0.8)', zIndex:200, animation:'fadeIn 0.15s ease' }}>
                {TOOLS_NAV.map(t => (
                  <Link key={t.path} href={t.path} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 10px', borderRadius:'4px', textDecoration:'none' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(37,99,235,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <span style={{ fontSize:'14px', width:'20px', textAlign:'center' }}>{t.icon}</span>
                    <span style={{ fontSize:'13px', color:'#888' }}>{t.name}</span>
                  </Link>
                ))}
                <div style={{ borderTop:'1px solid #222', margin:'5px 4px' }} />
                <Link href="/tools" style={{ display:'block', textAlign:'center', padding:'8px 10px', borderRadius:'4px', fontSize:'12px', color:'#2563eb', fontWeight:'600', textDecoration:'none' }}>View All Tools →</Link>
              </div>
            )}
          </div>
          <Link href="/enterprise" style={{ fontSize:'14px', color:'#fff', textDecoration:'none', transition:'color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#2563eb'}
            onMouseLeave={e=>e.currentTarget.style.color='#fff'}
          >Enterprise</Link>
          <Link href="/request-access" style={{ background:'#2563eb', color:'#fff', padding:'9px 22px', borderRadius:'6px', fontSize:'14px', fontWeight:'600', textDecoration:'none', transition:'background 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='#1d4ed8'}
            onMouseLeave={e=>e.currentTarget.style.background='#2563eb'}
          >Request Access</Link>
        </div>
        <button className="tl-hamburger" style={{ display:'none', background:'none', border:'none', color:'#fff', fontSize:'22px', cursor:'pointer', padding:'8px' }} onClick={() => setMobileMenuOpen(v => !v)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile overlay */}
      {mobileMenuOpen && <div style={{ position:'fixed', inset:0, zIndex:149, background:'rgba(0,0,0,0.6)' }} onClick={() => setMobileMenuOpen(false)} />}

      {/* Mobile drawer */}
      <div style={{ position:'fixed', top:0, right:0, width:'280px', height:'100vh', background:'#000', borderLeft:'1px solid #222', zIndex:150, transform:mobileMenuOpen?'translateX(0)':'translateX(100%)', transition:'transform 0.25s ease', display:'flex', flexDirection:'column', padding:'72px 24px 40px', gap:'4px' }}>
        {[['/', 'Verify'],['/research','Research'],['/enterprise','Enterprise']].map(([href,label]) => (
          <Link key={href} href={href} style={{ display:'block', padding:'12px 8px', fontSize:'16px', color:'#fff', textDecoration:'none', borderBottom:'1px solid #111' }}>{label}</Link>
        ))}
        <div style={{ padding:'8px 0 4px', fontSize:'12px', color:'#444', letterSpacing:'0.08em', textTransform:'uppercase' }}>Tools</div>
        {TOOLS_NAV.map(t => (
          <Link key={t.path} href={t.path} style={{ display:'flex', gap:'10px', alignItems:'center', padding:'10px 8px', fontSize:'14px', color:'#888', textDecoration:'none' }}>
            <span>{t.icon}</span><span>{t.name}</span>
          </Link>
        ))}
        <Link href="/request-access" style={{ marginTop:'auto', background:'#2563eb', color:'#fff', padding:'14px 20px', borderRadius:'6px', textDecoration:'none', fontSize:'15px', fontWeight:'600', textAlign:'center', display:'block' }}>Request Access</Link>
      </div>

      {/* ── Two-column layout ── */}
      <div className="tl-2col tl-section-pad" style={{
        maxWidth: '1160px',
        margin: '0 auto',
        padding: '72px 40px 96px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: '56px',
        alignItems: 'start',
      }}>

        {/* ════════ LEFT COLUMN ════════ */}
        <div>

          {/* Hero */}
          <div style={{ marginBottom: '48px' }}>

            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px',
              background: C.blueGlow2,
              border: `1px solid rgba(37,99,235,0.3)`,
              fontSize: '11px', color: C.blue, fontWeight: '700',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: '28px',
            }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: C.blue,
                animation: 'pulse 1.8s ease-in-out infinite',
              }} />
              Early Access — Invitation Required
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: SERIF,
              fontSize: 'clamp(32px, 3.8vw, 52px)',
              fontWeight: '700',
              lineHeight: '1.1',
              letterSpacing: '-0.01em',
              color: C.textPrimary,
              margin: '0 0 20px',
              maxWidth: '580px',
            }}>
              Join Legal Professionals<br />
              Who Never Trust<br />
              <span style={{ color: C.blue }}>AI Blindly Again</span>
            </h1>

            <p style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontSize: '17px',
              color: C.textSecondary,
              lineHeight: '1.7',
              margin: '0 0 36px',
              maxWidth: '500px',
            }}>
              TrustLayer catches fabricated citations, obsolete statutes, and impossible legal claims — before they reach a client or a courtroom.
            </p>

            {/* Live counter */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '20px',
              padding: '18px 24px',
              background: C.bgCard,
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: C.verified,
                  animation: 'pulse 1.8s ease-in-out infinite',
                }} />
                <div>
                  <div style={{
                    fontFamily: SERIF, fontSize: '30px', fontWeight: '700',
                    color: C.textPrimary, lineHeight: 1,
                  }}>
                    <AnimatedCounter target={count} />
                  </div>
                  <div style={{ fontSize: '12px', color: C.textSecondary, marginTop: '3px', letterSpacing: '0.04em' }}>
                    attorneys on the waitlist
                  </div>
                </div>
              </div>
              <div style={{ width: '1px', height: '40px', background: C.border }} />
              <div style={{ fontSize: '13px', color: C.textSecondary, lineHeight: '1.65' }}>
                <div><span style={{ color: C.textPrimary, fontWeight: '600' }}>Avg. wait:</span> 9 days</div>
                <div><span style={{ color: C.blue, fontWeight: '600' }}>Priority access</span> via referral</div>
              </div>
            </div>
          </div>

          {/* ── Form card ── */}
          {step !== 'confirmed' && (
            <div style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              overflow: 'hidden',
            }}>

              {/* Step progress */}
              <div style={{
                padding: '20px 28px',
                borderBottom: `1px solid ${C.border}`,
                background: C.bgSecondary,
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {STEP_META.map((s, i) => (
                    <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                          background: step > s.n ? C.verified : step === s.n ? C.blue : '#222222',
                          border: `1.5px solid ${step > s.n ? C.verified : step === s.n ? C.blue : '#333333'}`,
                          color: step >= s.n ? '#fff' : C.textMuted,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: '700',
                          transition: 'all 0.3s',
                        }}>
                          {step > s.n ? '✓' : s.n}
                        </div>
                        <span style={{
                          fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap',
                          color: step === s.n ? C.textPrimary : step > s.n ? C.textSecondary : C.textMuted,
                          transition: 'color 0.3s',
                        }}>{s.label}</span>
                      </div>
                      {i < 2 && (
                        <div style={{
                          flex: 1, height: '1px',
                          background: step > s.n ? `${C.verified}40` : C.border,
                          margin: '0 12px',
                          transition: 'background 0.3s',
                        }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="tl-card-pad" style={{ padding: '36px 32px' }}>

                {/* ── Step 1 ── */}
                {step === 1 && (
                  <div>
                    <h2 style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: C.textPrimary, margin: '0 0 8px' }}>
                      What type of legal professional are you?
                    </h2>
                    <p style={{ fontSize: '15px', color: C.textSecondary, fontFamily: SERIF, fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 28px' }}>
                      We tailor TrustLayer's analysis focus to your specific practice area and document types.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '28px' }}>
                      {ROLES.map(r => (
                        <OptionButton
                          key={r.id}
                          label={r.label}
                          selected={role === r.id}
                          onClick={() => setRole(r.id)}
                        />
                      ))}
                    </div>
                    <PrimaryButton className="tl-btn-full" disabled={!role} onClick={() => role && setStep(2)} style={{ width: '100%' }}>
                      Continue →
                    </PrimaryButton>
                  </div>
                )}

                {/* ── Step 2 ── */}
                {step === 2 && (
                  <div>
                    <h2 style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: C.textPrimary, margin: '0 0 8px' }}>
                      What's your biggest AI concern?
                    </h2>
                    <p style={{ fontSize: '15px', color: C.textSecondary, fontFamily: SERIF, fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 28px' }}>
                      This will be highlighted first in every verification report you run.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '28px' }}>
                      {CONCERNS.map(c => (
                        <OptionButton
                          key={c.id}
                          label={c.label}
                          selected={concern === c.id}
                          onClick={() => setConcern(c.id)}
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
                    <h2 style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: C.textPrimary, margin: '0 0 8px' }}>
                      Secure your spot on the waitlist.
                    </h2>
                    <p style={{ fontSize: '15px', color: C.textSecondary, fontFamily: SERIF, fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 28px' }}>
                      We personally review each application to ensure TrustLayer stays built for serious practitioners.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                      {[
                        { key: 'name',  label: 'Full Name',           placeholder: 'Margaret Chen',      value: name,  set: setName,  type: 'text' },
                        { key: 'email', label: 'Work Email',          placeholder: 'mchen@chenvoss.com', value: email, set: setEmail, type: 'email' },
                        { key: 'firm',  label: 'Firm / Organization', placeholder: 'Chen & Voss LLP',    value: firm,  set: setFirm,  type: 'text', optional: true },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{
                            display: 'block', marginBottom: '7px',
                            fontSize: '11px', fontWeight: '700',
                            letterSpacing: '0.07em', textTransform: 'uppercase',
                            color: C.textSecondary,
                          }}>
                            {f.label}
                            {!f.optional && <span style={{ color: C.error, marginLeft: '3px' }}>*</span>}
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
                              width: '100%',
                              padding: '12px 14px',
                              borderRadius: '4px',
                              background: C.bgSecondary,
                              border: `1px solid ${errors[f.key] ? C.error : C.borderLight}`,
                              color: C.textPrimary,
                              fontSize: '16px',
                              outline: 'none',
                              fontFamily: SANS,
                              boxSizing: 'border-box',
                              transition: 'border-color 0.15s',
                            }}
                            onFocus={e => e.target.style.borderColor = C.blue}
                            onBlur={e => e.target.style.borderColor = errors[f.key] ? C.error : C.borderLight}
                          />
                          {errors[f.key] && (
                            <p style={{ fontSize: '13px', color: C.error, margin: '5px 0 0' }}>{errors[f.key]}</p>
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
                    <p style={{ fontSize: '13px', color: C.textMuted, textAlign: 'center', margin: '14px 0 0', lineHeight: '1.5' }}>
                      No payment required. We'll send your activation link within 48 hours.
                    </p>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ── Confirmation screen ── */}
          {step === 'confirmed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'slideUp 0.4s ease' }}>

              {/* Position card */}
              <div style={{
                background: C.bgCard,
                border: `1px solid rgba(34,197,94,0.4)`,
                padding: '44px 40px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: C.verifiedBg, border: '1px solid rgba(34,197,94,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: '26px', color: C.verified,
                }}>✓</div>
                <p style={{
                  fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: C.textMuted, margin: '0 0 10px',
                }}>Your Waitlist Position</p>
                <div style={{
                  fontFamily: SERIF, fontSize: '88px', fontWeight: '700',
                  color: C.textPrimary, lineHeight: 1, margin: '0 0 6px',
                }}>#{position}</div>
                <p style={{
                  fontSize: '16px', color: C.textSecondary, fontFamily: SERIF, fontStyle: 'italic',
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
                      <div style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: C.textPrimary }}>{s.v}</div>
                      <div style={{ fontSize: '11px', color: C.textMuted, marginTop: '2px' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skip the line */}
              <div style={{
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                padding: '26px 28px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                  <div style={{
                    width: '38px', height: '38px', flexShrink: 0,
                    background: C.blueGlow2,
                    border: `1px solid rgba(37,99,235,0.3)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px',
                  }}>⚡</div>
                  <div>
                    <h3 style={{ fontFamily: SERIF, fontSize: '18px', fontWeight: '700', color: C.textPrimary, margin: '0 0 5px' }}>
                      Skip the line
                    </h3>
                    <p style={{ fontSize: '14px', color: C.textSecondary, fontFamily: SERIF, fontStyle: 'italic', lineHeight: '1.6', margin: 0 }}>
                      Share your referral link. Each signup moves you up <span style={{ color: C.blue, fontWeight: '600' }}>3 positions</span>.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{
                    flex: 1,
                    padding: '12px 14px',
                    background: C.bgSecondary,
                    border: `1px solid ${C.border}`,
                    fontSize: '13px', color: C.blue, fontFamily: MONO,
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    userSelect: 'all',
                  }}>
                    trustlayer.ai/r/{referralCode}
                  </div>
                  <button
                    onClick={copyLink}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: copied ? C.verifiedBg : C.blueGlow2,
                      border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(37,99,235,0.3)'}`,
                      color: copied ? C.verified : C.blue,
                      fontSize: '12px', fontWeight: '700', letterSpacing: '0.05em',
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                      fontFamily: SANS,
                    }}
                  >{copied ? '✓ Copied!' : 'Copy Link'}</button>
                </div>
              </div>

              {/* PDF download */}
              <div style={{
                padding: '26px 28px',
                background: C.bgCard,
                border: `1px solid ${C.blue}`,
                display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
              }}>
                <div style={{
                  width: '54px', height: '64px', flexShrink: 0,
                  background: C.blueGlow2,
                  border: `1px solid rgba(37,99,235,0.3)`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '22px', lineHeight: 1 }}>📄</span>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: C.blue, letterSpacing: '0.05em', marginTop: '2px' }}>PDF</span>
                </div>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <p style={{
                    fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: C.blue, margin: '0 0 5px',
                  }}>Free Report — 24 Pages</p>
                  <h4 style={{
                    fontFamily: SERIF, fontSize: '16px', fontWeight: '700',
                    color: C.textPrimary, margin: '0 0 4px', lineHeight: '1.3',
                  }}>
                    The 10 Most Dangerous AI Hallucinations in Legal Documents
                  </h4>
                  <p style={{ fontSize: '13px', color: C.textSecondary, margin: 0 }}>
                    Real case studies. Actual hallucinations caught by TrustLayer.
                  </p>
                </div>
                <a
                  href="#"
                  onClick={e => e.preventDefault()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    padding: '13px 22px',
                    borderRadius: '6px',
                    background: C.blue,
                    color: '#fff', fontSize: '13px', fontWeight: '700',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    transition: 'background 0.15s',
                    fontFamily: SANS,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.blueHover}
                  onMouseLeave={e => e.currentTarget.style.background = C.blue}
                >
                  ↓ Download Free
                </a>
              </div>

            </div>
          )}
        </div>

        {/* ════════ RIGHT COLUMN — Live feed ════════ */}
        <div className="tl-hide-mobile" style={{
          position: 'sticky', top: '80px',
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          overflow: 'hidden',
          height: 'calc(100vh - 112px)',
          maxHeight: '700px',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* Feed header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${C.border}`,
            background: C.bgSecondary,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: C.verified,
                animation: 'pulse 1.8s ease-in-out infinite',
              }} />
              <span style={{
                fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                textTransform: 'uppercase', color: C.textPrimary,
              }}>Live Verifications</span>
            </div>
            <p style={{ fontSize: '12px', color: C.textSecondary, margin: 0 }}>
              Real-time analysis from attorneys worldwide
            </p>
          </div>

          {/* Top fade */}
          <div style={{
            position: 'absolute', top: '60px', left: 0, right: 0, height: '24px',
            background: `linear-gradient(to bottom, ${C.bgCard} 0%, transparent 100%)`,
            zIndex: 2, pointerEvents: 'none',
          }} />

          {/* Scrolling feed */}
          <div style={{ flex: 1, overflow: 'hidden', padding: '8px 12px' }}>
            <LiveFeed />
          </div>

          {/* Bottom fade */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px',
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
          <span key={i} style={{ fontSize: '13px', color: C.textSecondary }}>
            {t}
          </span>
        ))}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .tl-nav-links { display: none !important; }
          .tl-hamburger { display: flex !important; align-items: center; }
          .tl-2col { grid-template-columns: 1fr !important; }
          .tl-3col { grid-template-columns: 1fr !important; }
          .tl-section-pad { padding-left: 20px !important; padding-right: 20px !important; padding-top: 56px !important; padding-bottom: 56px !important; }
          .tl-card-pad { padding: 20px !important; }
          .tl-btn-full { width: 100% !important; }
          .tl-nav { padding: 0 20px !important; }
          .tl-hide-mobile { display: none !important; }
          .tl-tool-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:0.3 } 50% { opacity:0.7 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes feedScroll { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        ::selection { background: rgba(37,99,235,0.4); color: #fff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        body { margin: 0; background: #000; }
        input::placeholder { color: #444; }
      `}</style>
    </div>
  )
}
