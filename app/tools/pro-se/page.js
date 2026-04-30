'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Design tokens ─────────────────────────────────────────────────────────────
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

const TOOLS = [
  { id: 'plain-english',          path: '/tools/plain-english',          name: 'Plain English Translator', icon: '📖' },
  { id: 'deadlines',              path: '/tools/deadlines',              name: 'Deadline Calculator',       icon: '⏰' },
  { id: 'red-flags',              path: '/tools/red-flags',              name: 'Contract Red Flag Scanner', icon: '🔍' },
  { id: 'letter-response',        path: '/tools/letter-response',        name: 'Letter Response Generator', icon: '✉' },
  { id: 'statute-of-limitations', path: '/tools/statute-of-limitations', name: 'Statute of Limitations',   icon: '⏳' },
  { id: 'ethics',                 path: '/tools/ethics',                 name: 'Ethics Checker',            icon: '⚖' },
  { id: 'pro-se',                 path: '/tools/pro-se',                 name: 'Pro Se Assistant',          icon: '🏛', free: true },
]

const CURRENT_TOOL_ID = 'pro-se'

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
  if (d === 'very_challenging') return { label: 'Very Challenging', color: C.error,   bg: C.errorBg }
  if (d === 'challenging')      return { label: 'Challenging',      color: C.warning, bg: C.warningBg }
  return                               { label: 'Manageable',       color: C.verified,bg: C.verifiedBg }
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: '28px', animation: 'pulse 1.6s ease-in-out infinite' }}>
      <div style={{ height: '14px', width: '35%', background: C.border, marginBottom: '14px' }} />
      <div style={{ height: '18px', width: '70%', background: C.border, marginBottom: '10px' }} />
      <div style={{ height: '14px', width: '95%', background: C.border, marginBottom: '8px' }} />
      <div style={{ height: '14px', width: '82%', background: C.border, marginBottom: '8px' }} />
      <div style={{ height: '14px', width: '60%', background: C.border }} />
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
  const [toolsOpen,  setToolsOpen]  = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const selectStyle = {
    background: C.bgSecondary, border: `1px solid ${C.borderLight}`, borderRadius: '4px',
    color: C.textPrimary, fontSize: '16px', padding: '12px 14px',
    outline: 'none', width: '100%', fontFamily: SANS, cursor: 'pointer',
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: SANS, color: C.textPrimary, fontSize: '16px' }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="tl-nav" style={{ position:'sticky', top:0, zIndex:100, background:'#000', borderBottom:'1px solid #222', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px' }}>
        <Link href="/" style={{ textDecoration:'none', fontSize:'22px', fontFamily:SERIF, fontWeight:'700', color:'#fff', letterSpacing:'-0.02em' }}>TrustLayer</Link>

        <div className="tl-nav-links" style={{ display:'flex', gap:'32px', alignItems:'center' }}>
          {[['/', 'Verify'],['/research','Research'],['/enterprise','Enterprise']].map(([href,label]) => (
            <Link key={href} href={href} style={{ fontSize:'14px', color:'#fff', textDecoration:'none', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#2563eb'}
              onMouseLeave={e=>e.currentTarget.style.color='#fff'}
            >{label}</Link>
          ))}

          {/* Tools dropdown — active */}
          <div style={{ position:'relative' }} onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <Link href="/tools" style={{ fontSize:'14px', color:'#2563eb', textDecoration:'none', display:'flex', alignItems:'center', gap:'3px', borderBottom:'2px solid #2563eb', paddingBottom:'2px' }}>
              Tools <span style={{ fontSize:'9px', opacity:0.7 }}>▾</span>
            </Link>
            {toolsOpen && (
              <div style={{ position:'absolute', top:'calc(100% + 10px)', left:'-10px', background:'#111', border:'1px solid #222', borderRadius:'6px', padding:'8px 6px', minWidth:'240px', boxShadow:'0 8px 32px rgba(0,0,0,0.8)', zIndex:200, animation:'fadeIn 0.15s ease' }}>
                {TOOLS.map(t => (
                  <Link key={t.path} href={t.path} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 10px', borderRadius:'4px', textDecoration:'none', background: t.id === CURRENT_TOOL_ID ? 'rgba(37,99,235,0.1)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(37,99,235,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background= t.id === CURRENT_TOOL_ID ? 'rgba(37,99,235,0.1)' : 'transparent'}
                  >
                    <span style={{ fontSize:'14px', width:'20px', textAlign:'center' }}>{t.icon}</span>
                    <span style={{ fontSize:'13px', color: t.id === CURRENT_TOOL_ID ? '#2563eb' : '#888' }}>{t.name}</span>
                  </Link>
                ))}
                <div style={{ borderTop:'1px solid #222', margin:'5px 4px' }} />
                <Link href="/tools" style={{ display:'block', textAlign:'center', padding:'8px 10px', borderRadius:'4px', fontSize:'12px', color:'#2563eb', fontWeight:'600', textDecoration:'none' }}>View All Tools →</Link>
              </div>
            )}
          </div>

          <Link href="/request-access" style={{ background:'#2563eb', color:'#fff', padding:'9px 22px', borderRadius:'6px', fontSize:'14px', fontWeight:'600', textDecoration:'none' }}
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
        {TOOLS.map(t => (
          <Link key={t.path} href={t.path} style={{ display:'flex', gap:'10px', alignItems:'center', padding:'10px 8px', fontSize:'14px', color: t.id === CURRENT_TOOL_ID ? '#2563eb' : '#888', textDecoration:'none' }}>
            <span>{t.icon}</span><span>{t.name}</span>
          </Link>
        ))}
        <Link href="/request-access" style={{ marginTop:'auto', background:'#2563eb', color:'#fff', padding:'14px 20px', borderRadius:'6px', textDecoration:'none', fontSize:'15px', fontWeight:'600', textAlign:'center', display:'block' }}>Request Access</Link>
      </div>

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div style={{ padding:'16px 40px', borderBottom:'1px solid #222', background:'#000', display:'flex', gap:'6px', alignItems:'center', fontSize:'13px', color:'#444' }} className="tl-breadcrumb">
        <Link href="/" style={{ color:'#888', textDecoration:'none' }}>TrustLayer</Link>
        <span>›</span>
        <Link href="/tools" style={{ color:'#888', textDecoration:'none' }}>Tools</Link>
        <span>›</span>
        <span style={{ color:'#fff' }}>Pro Se Assistant</span>
      </div>

      {/* ── Hero — full-width, warmer tone ──────────────────────────────────── */}
      <div style={{ background:'#000', borderBottom:'1px solid #222', padding:'56px 40px 52px', textAlign:'center' }} className="tl-hero">
        {/* Large FREE badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', color:'#22c55e', fontSize:'13px', fontWeight:'700', padding:'6px 16px', borderRadius:'4px', marginBottom:'28px' }}>
          ✓ This tool is 100% FREE — No account required
        </div>

        {/* Two-line Georgia serif headline */}
        <h1 style={{ margin:'0 0 20px', fontFamily:SERIF, lineHeight:1.1 }}>
          <span style={{ display:'block', fontSize:'clamp(36px, 6vw, 52px)', fontWeight:'700', color:'#fff', letterSpacing:'-0.02em' }}>
            You Have Rights.
          </span>
          <span style={{ display:'block', fontSize:'clamp(28px, 4.5vw, 40px)', fontWeight:'700', color:'#fff', marginTop:'8px', opacity:0.85 }}>
            We Help You Use Them.
          </span>
        </h1>

        <p style={{ fontSize:'18px', color:'#888', margin:'0 auto', maxWidth:'600px', lineHeight:'1.7' }}>
          Navigating the legal system alone is one of the hardest things a person can do.
          You're not alone. This free tool gives you step-by-step guidance written in plain English.
        </p>
      </div>

      {/* ── Main content — full-width single column ─────────────────────────── */}
      <div style={{ maxWidth:'860px', margin:'0 auto', padding:'48px 40px' }} className="tl-section-pad">

        {/* ── Form card ─────────────────────────────────────────────────────── */}
        <div className="tl-card-pad" style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'36px', marginBottom:'32px' }}>
          <h2 style={{ margin:'0 0 8px', fontFamily:SERIF, fontSize:'24px', fontWeight:'700', color:'#fff' }}>
            Tell us what's happening
          </h2>
          <p style={{ margin:'0 0 24px', fontSize:'16px', color:C.textSecondary, lineHeight:'1.65' }}>
            Use your own words — don't worry about legal language. The more detail you share, the more specific your guide will be.
          </p>

          <div style={{ marginBottom:'20px' }}>
            <textarea
              value={situation}
              onChange={e => setSituation(e.target.value)}
              placeholder={"Describe your situation in your own words. Don't worry about legal language. Example: 'My landlord is trying to evict me and I don't think it's fair. I received a 3-day notice to pay or quit but I paid my rent.' or 'I was fired from my job and I think it was because I complained about harassment.'"}
              rows={8}
              style={{
                width:'100%', background:C.bgSecondary, border:`1px solid ${C.borderLight}`,
                borderRadius:'4px', color:C.textPrimary, fontSize:'16px',
                padding:'14px 16px', outline:'none', resize:'vertical',
                minHeight:'200px', fontFamily:SANS, lineHeight:'1.7',
                transition:'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor='#2563eb'}
              onBlur={e => e.target.style.borderColor=C.borderLight}
            />
          </div>

          <div className="tl-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'28px' }}>
            <div>
              <label style={{ display:'block', fontSize:'12px', color:C.textMuted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:'8px', fontWeight:'600' }}>Type of Court</label>
              <select value={courtType} onChange={e => setCourtType(e.target.value)} style={selectStyle}
                onFocus={e => e.target.style.borderColor='#2563eb'}
                onBlur={e => e.target.style.borderColor=C.borderLight}
              >
                {COURT_TYPES.map(ct => (
                  <option key={ct.value} value={ct.value} style={{ background:'#111' }}>{ct.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'12px', color:C.textMuted, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:'8px', fontWeight:'600' }}>Your State</label>
              <select value={state} onChange={e => setState(e.target.value)} style={selectStyle}
                onFocus={e => e.target.style.borderColor='#2563eb'}
                onBlur={e => e.target.style.borderColor=C.borderLight}
              >
                {STATES_50.map(s => (
                  <option key={s} value={s} style={{ background:'#111' }}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !situation.trim()}
            className="tl-btn-full"
            style={{
              width:'100%', padding:'16px', borderRadius:'6px', border:'none',
              background: loading || !situation.trim() ? '#222' : '#2563eb',
              color: loading || !situation.trim() ? C.textMuted : '#fff',
              fontSize:'16px', fontWeight:'600', cursor: loading || !situation.trim() ? 'not-allowed' : 'pointer',
              transition:'background 0.15s',
            }}
            onMouseEnter={e => { if (!loading && situation.trim()) e.currentTarget.style.background='#1d4ed8' }}
            onMouseLeave={e => { if (!loading && situation.trim()) e.currentTarget.style.background='#2563eb' }}
          >
            {loading ? (
              <span style={{ display:'inline-flex', alignItems:'center', gap:'10px' }}>
                <span style={{ width:'15px', height:'15px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                Building your personal legal guide…
              </span>
            ) : 'Get Your Legal Guide'}
          </button>

          <p style={{ margin:'14px 0 0', fontSize:'14px', color:C.textMuted, lineHeight:'1.65', textAlign:'center', fontStyle:'italic' }}>
            We'll create a personalized step-by-step guide just for your situation. This is not legal advice, but it will help you understand your rights and your options.
          </p>
        </div>

        {/* ── Loading ─────────────────────────────────────────────────────────── */}
        {loading && (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────────────── */}
        {error && (
          <div style={{ background:C.errorBg, border:`1px solid rgba(239,68,68,0.3)`, padding:'18px 22px', color:C.error, fontSize:'16px', lineHeight:'1.6', animation:'fadeIn 0.3s ease' }}>
            {error}
          </div>
        )}

        {/* ── Results ─────────────────────────────────────────────────────────── */}
        {result && !loading && (() => {
          const db = difficultyBadge(result.difficulty)
          return (
            <div style={{ display:'flex', flexDirection:'column', gap:'20px', animation:'slideUp 0.2s ease' }}>

              {/* Overview card */}
              <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'28px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'16px', flexWrap:'wrap' }}>
                  <h2 style={{ margin:0, fontFamily:SERIF, fontSize:'22px', fontWeight:'700', color:'#fff' }}>
                    {result.canHandleProSe ? 'You can handle this.' : 'This is challenging, but doable.'}
                  </h2>
                  <span style={{ fontSize:'12px', padding:'4px 12px', borderRadius:'4px', background:db.bg, color:db.color, fontWeight:'700', border:`1px solid ${db.color}22` }}>
                    {db.label}
                  </span>
                </div>
                <p style={{ margin:0, fontFamily:SERIF, fontSize:'17px', color:C.textSecondary, lineHeight:'1.8' }}>
                  {result.overview}
                </p>
              </div>

              {/* Steps — numbered circles in blue */}
              {result.steps?.length > 0 && (
                <div>
                  <h3 style={{ margin:'0 0 18px', fontFamily:SERIF, fontSize:'20px', color:'#fff', fontWeight:'700' }}>
                    Your Step-by-Step Plan
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                    {result.steps.map((step, i) => (
                      <div key={i} style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'22px 24px', display:'flex', gap:'20px', alignItems:'flex-start', transition:'border-color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor='#2563eb'}
                        onMouseLeave={e => e.currentTarget.style.borderColor=C.border}
                      >
                        {/* Blue step circle */}
                        <div style={{ width:'40px', height:'40px', borderRadius:'50%', flexShrink:0, background:'#2563eb', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SERIF, fontSize:'18px', fontWeight:'700', color:'#fff' }}>
                          {step.number ?? i + 1}
                        </div>
                        <div style={{ flex:1 }}>
                          <h4 style={{ margin:'0 0 10px', fontFamily:SERIF, fontSize:'17px', fontWeight:'700', color:'#fff' }}>
                            {step.title}
                          </h4>
                          <p style={{ margin:'0 0 12px', fontSize:'15px', color:C.textSecondary, lineHeight:'1.7' }}>
                            {step.detail}
                          </p>
                          {step.documents?.length > 0 && (
                            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'10px' }}>
                              {step.documents.map((doc, j) => (
                                <span key={j} style={{ fontSize:'12px', padding:'3px 10px', borderRadius:'4px', background:C.blueGlow2, border:'1px solid rgba(37,99,235,0.2)', color:'#2563eb' }}>
                                  📄 {doc}
                                </span>
                              ))}
                            </div>
                          )}
                          {step.timeframe && (
                            <p style={{ margin:0, fontSize:'13px', color:C.textMuted }}>
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
                  <h3 style={{ margin:'0 0 16px', fontFamily:SERIF, fontSize:'20px', color:'#fff', fontWeight:'700' }}>
                    Documents You'll Need
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {result.requiredDocuments.map((doc, i) => (
                      <div key={i} style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'18px 20px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px', flexWrap:'wrap' }}>
                          <span style={{ fontWeight:'700', fontSize:'15px', color:'#fff' }}>📄 {doc.name}</span>
                          {doc.cost && (
                            <span style={{
                              fontSize:'12px', padding:'2px 10px', borderRadius:'4px',
                              background: doc.cost === 'Free' ? C.verifiedBg : C.warningBg,
                              color: doc.cost === 'Free' ? C.verified : C.warning,
                              border: `1px solid ${doc.cost === 'Free' ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
                              fontWeight:'700',
                            }}>{doc.cost}</span>
                          )}
                        </div>
                        <p style={{ margin:'0 0 6px', fontSize:'15px', color:C.textSecondary, lineHeight:'1.55' }}>{doc.purpose}</p>
                        {doc.whereToGet && (
                          <p style={{ margin:0, fontSize:'13px', color:C.textMuted }}>
                            Where to get it: <span style={{ color:C.textSecondary }}>{doc.whereToGet}</span>
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
                  <h3 style={{ margin:'0 0 16px', fontFamily:SERIF, fontSize:'20px', color:'#fff', fontWeight:'700' }}>
                    At Your Hearing
                  </h3>
                  <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'22px 24px' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                      {result.hearingPrep.map((tip, i) => (
                        <div key={i} style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                          <span style={{ color:C.verified, fontSize:'15px', flexShrink:0, marginTop:'1px' }}>✓</span>
                          <p style={{ margin:0, fontSize:'15px', color:C.textSecondary, lineHeight:'1.65' }}>{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Your rights — green-tinted cards */}
              {result.yourRights?.length > 0 && (
                <div>
                  <h3 style={{ margin:'0 0 16px', fontFamily:SERIF, fontSize:'20px', color:'#fff', fontWeight:'700' }}>
                    Your Rights
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {result.yourRights.map((right, i) => (
                      <div key={i} style={{ background:'rgba(34,197,94,0.04)', border:'1px solid rgba(34,197,94,0.15)', padding:'14px 18px', display:'flex', gap:'14px', alignItems:'flex-start' }}>
                        <span style={{ color:C.verified, fontSize:'14px', flexShrink:0, marginTop:'2px' }}>⚖</span>
                        <p style={{ margin:0, fontSize:'15px', color:C.textSecondary, lineHeight:'1.65' }}>{right}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common mistakes — red-tinted */}
              {result.commonMistakes?.length > 0 && (
                <div>
                  <h3 style={{ margin:'0 0 16px', fontFamily:SERIF, fontSize:'20px', color:'#fff', fontWeight:'700' }}>
                    Common Mistakes to Avoid
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {result.commonMistakes.map((mistake, i) => (
                      <div key={i} style={{ background:C.errorBg, border:'1px solid rgba(239,68,68,0.18)', padding:'14px 18px', display:'flex', gap:'14px', alignItems:'flex-start' }}>
                        <span style={{ color:C.error, fontSize:'14px', flexShrink:0, marginTop:'2px' }}>⚠</span>
                        <p style={{ margin:0, fontSize:'15px', color:C.textSecondary, lineHeight:'1.65' }}>{mistake}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Court resources — blue-tinted */}
              {result.courtResources?.length > 0 && (
                <div>
                  <h3 style={{ margin:'0 0 16px', fontFamily:SERIF, fontSize:'20px', color:'#fff', fontWeight:'700' }}>
                    Court Resources & Self-Help
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {result.courtResources.map((resource, i) => (
                      <div key={i} style={{ background:C.blueGlow2, border:'1px solid rgba(37,99,235,0.18)', padding:'14px 18px', display:'flex', gap:'14px', alignItems:'flex-start' }}>
                        <span style={{ color:'#2563eb', fontSize:'14px', flexShrink:0, marginTop:'2px' }}>🔗</span>
                        <p style={{ margin:0, fontSize:'15px', color:C.textSecondary, lineHeight:'1.65' }}>{resource}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* When to hire an attorney */}
              {result.whenToHireAttorney && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'24px 26px' }}>
                  <h3 style={{ margin:'0 0 12px', fontFamily:SERIF, fontSize:'17px', fontWeight:'700', color:'#fff' }}>
                    When to Consider Hiring an Attorney
                  </h3>
                  <p style={{ margin:0, fontSize:'15px', color:C.textSecondary, lineHeight:'1.7' }}>
                    {result.whenToHireAttorney}
                  </p>
                </div>
              )}

              {/* Save / Share / Print */}
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {[
                  { label: saved ? '✓ Saved!' : '💾 Save Results', onClick: handleSave,           active: saved      },
                  { label: shareMsg || '🔗 Share',                  onClick: handleShare,           active: !!shareMsg },
                  { label: '🖨 Print',                               onClick: () => window.print(), active: false      },
                ].map(btn => (
                  <button key={btn.label} onClick={btn.onClick} style={{
                    padding:'9px 18px', borderRadius:'6px', cursor:'pointer',
                    border:`1px solid ${btn.active ? '#2563eb' : C.border}`,
                    background: btn.active ? C.blueGlow2 : 'transparent',
                    color: btn.active ? '#2563eb' : C.textSecondary,
                    fontSize:'14px', transition:'all 0.15s',
                  }}
                    onMouseEnter={e => { if (!btn.active) { e.currentTarget.style.borderColor='#2563eb'; e.currentTarget.style.color='#2563eb' } }}
                    onMouseLeave={e => { if (!btn.active) { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary } }}
                  >{btn.label}</button>
                ))}
              </div>

              {/* Encouragement card — blue border, SERIF, warm text */}
              {result.encouragement && (
                <div style={{ background:C.bgCard, border:'2px solid rgba(37,99,235,0.35)', padding:'32px', position:'relative' }}>
                  <p style={{ margin:'0 0 16px', fontFamily:SERIF, fontSize:'32px', color:'#2563eb', lineHeight:1 }}>✦</p>
                  <p style={{ margin:0, fontFamily:SERIF, fontSize:'19px', color:'#fff', lineHeight:'1.8', fontStyle:'italic' }}>
                    {result.encouragement}
                  </p>
                </div>
              )}

            </div>
          )
        })()}

        {/* ── Soft upsell — always optional ───────────────────────────────────── */}
        <div style={{ marginTop:'48px', padding:'28px 32px', background:C.bgCard, border:`1px solid ${C.border}`, textAlign:'center' }}>
          <p style={{ margin:'0 0 8px', fontSize:'15px', color:C.textSecondary, lineHeight:'1.65' }}>
            If you found this helpful, consider sharing it with someone who needs it.
          </p>
          <p style={{ margin:'0 0 20px', fontSize:'13px', color:C.textMuted, lineHeight:'1.55', fontStyle:'italic' }}>
            Pro features are always optional — this tool will always be free.
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href) }}
              style={{ padding:'10px 22px', borderRadius:'6px', cursor:'pointer', border:'1px solid rgba(34,197,94,0.3)', background:C.verifiedBg, color:C.verified, fontSize:'14px', fontWeight:'600', transition:'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(34,197,94,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background=C.verifiedBg}
            >
              Share This Tool
            </button>
            <Link href="/request-access" style={{ display:'inline-block', padding:'10px 22px', borderRadius:'6px', border:'1px solid rgba(37,99,235,0.3)', background:C.blueGlow2, color:'#2563eb', fontSize:'14px', textDecoration:'none', fontWeight:'600', transition:'all 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background=C.blueGlow}
              onMouseLeave={e=>e.currentTarget.style.background=C.blueGlow2}
            >
              Learn About Pro Access
            </Link>
          </div>
        </div>

        {/* ── Other Free Resources — 4-card grid ──────────────────────────────── */}
        <div style={{ marginTop:'56px' }}>
          <h2 style={{ margin:'0 0 8px', fontFamily:SERIF, fontSize:'24px', fontWeight:'700', color:'#fff' }}>
            Other Free Resources For You
          </h2>
          <p style={{ margin:'0 0 24px', fontSize:'16px', color:C.textSecondary }}>
            These tools were built for attorneys, but they can help you too.
          </p>
          <div className="tl-2col" style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'16px' }}>
            {FREE_RESOURCES.map(({ tool, forProSe }) => (
              <Link key={tool.id} href={tool.path} style={{ display:'block', background:C.bgCard, border:`1px solid ${C.border}`, padding:'20px 22px', textDecoration:'none', transition:'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#2563eb'}
                onMouseLeave={e => e.currentTarget.style.borderColor=C.border}
              >
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                  <span style={{ fontSize:'20px' }}>{tool.icon}</span>
                  <span style={{ fontSize:'14px', fontWeight:'700', color:'#fff' }}>{tool.name}</span>
                </div>
                <p style={{ margin:0, fontSize:'14px', color:C.textSecondary, lineHeight:'1.65' }}>{forProSe}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .tl-nav-links { display: none !important; }
          .tl-hamburger { display: flex !important; align-items: center; }
          .tl-2col { grid-template-columns: 1fr !important; }
          .tl-3col { grid-template-columns: 1fr !important; }
          .tl-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .tl-card-pad { padding: 20px !important; }
          .tl-btn-full { width: 100% !important; }
          .tl-nav { padding: 0 20px !important; }
          .tl-hide-mobile { display: none !important; }
          .tl-breadcrumb { padding: 12px 20px !important; }
          .tl-hero { padding: 40px 20px 32px !important; }
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:0.3 } 50% { opacity:0.7 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        ::selection { background: rgba(37,99,235,0.4); color: #fff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        body { margin: 0; background: #000; }
        textarea::placeholder { color: #444; }
        select option { background: #111; color: #fff; }
      `}</style>
    </div>
  )
}
