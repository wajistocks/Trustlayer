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
  { id: 'lease-interpreter',     path: '/tools/lease-interpreter',     name: 'Lease Interpreter',          icon: '🏠' },
]

const CURRENT_TOOL_ID = 'ethics'

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

// ─── Risk level config ─────────────────────────────────────────────────────────
function riskConfig(level) {
  switch (level) {
    case 'high':   return { bg: C.errorBg,   border: 'rgba(239,68,68,0.30)',  color: C.error,   label: 'High Ethical Risk',     icon: '🚨' }
    case 'medium': return { bg: C.warningBg, border: 'rgba(245,158,11,0.30)', color: C.warning, label: 'Moderate Ethical Risk', icon: '⚠' }
    default:       return { bg: C.verifiedBg,border: 'rgba(34,197,94,0.25)',  color: C.verified,label: 'Low Ethical Risk',      icon: '✓' }
  }
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: '28px', animation: 'pulse 1.6s ease-in-out infinite' }}>
      <div style={{ height: '12px', width: '28%', background: C.border, marginBottom: '14px' }} />
      <div style={{ height: '16px', width: '68%', background: C.border, marginBottom: '10px' }} />
      <div style={{ height: '13px', width: '95%', background: C.border, marginBottom: '8px' }} />
      <div style={{ height: '13px', width: '80%', background: C.border, marginBottom: '8px' }} />
      <div style={{ height: '13px', width: '55%', background: C.border }} />
    </div>
  )
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
  const [toolsOpen,    setToolsOpen]    = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
        <span style={{ color:'#fff' }}>Ethics Checker</span>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div style={{ background:'#000', borderBottom:'1px solid #222', padding:'56px 40px 48px' }} className="tl-hero">
        <div style={{ maxWidth:'720px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(37,99,235,0.08)', border:'1px solid rgba(37,99,235,0.2)', borderRadius:'4px', padding:'5px 14px', marginBottom:'20px' }}>
            <span style={{ fontSize:'13px' }}>⚖</span>
            <span style={{ fontSize:'11px', color:'#2563eb', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:'600' }}>Attorney Ethics Checker</span>
          </div>
          <h1 style={{ fontFamily:SERIF, fontSize:'clamp(28px, 4vw, 46px)', fontWeight:'700', letterSpacing:'-0.01em', lineHeight:'1.15', margin:'0 0 16px', color:'#fff' }}>
            Get Instant Answers To Your<br />
            <span style={{ color:'#2563eb' }}>Ethics Questions</span>
          </h1>
          <p style={{ fontSize:'17px', color:'#888', margin:0, maxWidth:'600px', lineHeight:'1.65' }}>
            Attorneys face complex ethical situations daily. Get instant guidance on ABA Model Rules,
            state bar rules, and recent ethics opinions — before making a decision you'll regret.
          </p>
        </div>
      </div>

      {/* ── Main grid ───────────────────────────────────────────────────────── */}
      <div className="tl-2col" style={{ maxWidth:'1100px', margin:'0 auto', padding:'40px 40px', display:'grid', gridTemplateColumns:'1fr 280px', gap:'32px', alignItems:'start' }}>

        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div>

          {/* ── Form card ─────────────────────────────────────────────────── */}
          <div className="tl-card-pad" style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'32px', marginBottom:'24px' }}>
            <h2 style={{ margin:'0 0 24px', fontFamily:SERIF, fontSize:'20px', fontWeight:'700', color:'#fff' }}>
              Describe Your Ethical Situation
            </h2>

            <div style={{ marginBottom:'18px' }}>
              <label style={{ display:'block', fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'8px', fontWeight:'600' }}>Your Situation</label>
              <textarea
                value={situation}
                onChange={e => setSituation(e.target.value)}
                placeholder={"Describe your ethical question or situation in detail. Example: 'I represent two companies in the same industry. Company A has asked me to help them acquire Company B, which is also my client. Is this a conflict?'"}
                rows={7}
                style={{
                  width:'100%', background:C.bgSecondary, border:`1px solid ${C.borderLight}`,
                  borderRadius:'4px', color:C.textPrimary, fontSize:'16px',
                  padding:'12px 14px', outline:'none', resize:'vertical',
                  minHeight:'200px', fontFamily:SANS, lineHeight:'1.65',
                  transition:'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor='#2563eb'}
                onBlur={e => e.target.style.borderColor=C.borderLight}
              />
            </div>

            <div className="tl-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' }}>
              <div>
                <label style={{ display:'block', fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'8px', fontWeight:'600' }}>State Bar</label>
                <select value={state} onChange={e => setState(e.target.value)} style={selectStyle}
                  onFocus={e => e.target.style.borderColor='#2563eb'}
                  onBlur={e => e.target.style.borderColor=C.borderLight}
                >
                  {STATES_50.map(s => (
                    <option key={s} value={s} style={{ background:'#111' }}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display:'block', fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'8px', fontWeight:'600' }}>Practice Area</label>
                <select value={practiceArea} onChange={e => setPracticeArea(e.target.value)} style={selectStyle}
                  onFocus={e => e.target.style.borderColor='#2563eb'}
                  onBlur={e => e.target.style.borderColor=C.borderLight}
                >
                  {PRACTICE_AREAS.map(pa => (
                    <option key={pa} value={pa} style={{ background:'#111' }}>{pa}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleCheck}
              disabled={loading || !situation.trim()}
              className="tl-btn-full"
              style={{
                width:'100%', padding:'14px', borderRadius:'6px', border:'none',
                background: loading || !situation.trim() ? '#222' : '#2563eb',
                color: loading || !situation.trim() ? C.textMuted : '#fff',
                fontSize:'15px', fontWeight:'600', cursor: loading || !situation.trim() ? 'not-allowed' : 'pointer',
                transition:'background 0.15s',
              }}
              onMouseEnter={e => { if (!loading && situation.trim()) e.currentTarget.style.background='#1d4ed8' }}
              onMouseLeave={e => { if (!loading && situation.trim()) e.currentTarget.style.background='#2563eb' }}
            >
              {loading ? (
                <span style={{ display:'inline-flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                  Checking Ethics Rules…
                </span>
              ) : 'Check Ethics Rules'}
            </button>

            {/* Confidentiality note */}
            <p style={{ margin:'12px 0 0', fontSize:'13px', color:C.textMuted, fontStyle:'italic', lineHeight:'1.5', textAlign:'center' }}>
              Your query is processed by AI and not stored. For sensitive matters, consider contacting your state bar ethics hotline directly.
            </p>
          </div>

          {/* ── Loading ───────────────────────────────────────────────────── */}
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* ── Error ─────────────────────────────────────────────────────── */}
          {error && (
            <div style={{ background:C.errorBg, border:`1px solid rgba(239,68,68,0.3)`, padding:'16px 20px', color:C.error, fontSize:'15px', lineHeight:'1.5', animation:'fadeIn 0.3s ease' }}>
              {error}
            </div>
          )}

          {/* ── Results ───────────────────────────────────────────────────── */}
          {result && !loading && (() => {
            const rc = riskConfig(result.riskLevel)
            return (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px', animation:'slideUp 0.2s ease' }}>

                {/* Risk level banner */}
                <div style={{ background:rc.bg, border:`1px solid ${rc.border}`, padding:'16px 20px' }}>
                  <p style={{ margin:0, fontSize:'16px', fontWeight:'700', color:rc.color }}>
                    {rc.icon} {rc.label}
                  </p>
                </div>

                {/* Summary card */}
                {result.summary && (
                  <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'24px', animation:'slideUp 0.2s ease' }}>
                    <p style={{ margin:'0 0 10px', fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' }}>Summary</p>
                    <p style={{ margin:0, fontSize:'15px', color:C.textSecondary, lineHeight:'1.7' }}>{result.summary}</p>
                  </div>
                )}

                {/* Answer card — large, prominent, green-bordered */}
                {result.answer && (
                  <div style={{ background:C.bgCard, border:'1px solid rgba(34,197,94,0.3)', background:'rgba(34,197,94,0.04)', padding:'28px', animation:'slideUp 0.2s ease' }}>
                    <p style={{ margin:'0 0 14px', fontSize:'12px', color:C.verified, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' }}>Answer to Your Question</p>
                    <p style={{ margin:0, fontFamily:SERIF, fontSize:'18px', color:C.textPrimary, lineHeight:'1.8' }}>{result.answer}</p>
                  </div>
                )}

                {/* ABA Model Rules */}
                {result.abaRules?.length > 0 && (
                  <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'24px', animation:'slideUp 0.2s ease' }}>
                    <p style={{ margin:'0 0 18px', fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' }}>Relevant ABA Model Rules</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                      {result.abaRules.map((rule, i) => (
                        <div key={i} style={{ background:C.bgSecondary, borderLeft:'3px solid #2563eb', padding:'16px 18px' }}>
                          <div style={{ display:'flex', alignItems:'baseline', gap:'14px', marginBottom:'8px', flexWrap:'wrap' }}>
                            <span style={{ fontFamily:MONO, fontSize:'28px', color:'#2563eb', fontWeight:'700', lineHeight:1 }}>{rule.rule}</span>
                            <span style={{ fontFamily:SERIF, fontSize:'15px', color:C.textPrimary }}>{rule.title}</span>
                          </div>
                          <p style={{ margin:'0 0 10px', fontSize:'14px', color:C.textSecondary, lineHeight:'1.55' }}>{rule.relevance}</p>
                          {rule.keyLanguage && (
                            <p style={{ margin:0, fontSize:'13px', color:C.textMuted, fontStyle:'italic', lineHeight:'1.55', borderTop:`1px solid ${C.border}`, paddingTop:'10px' }}>
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
                  <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'24px', animation:'slideUp 0.2s ease' }}>
                    <p style={{ margin:'0 0 18px', fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' }}>
                      {state} State-Specific Rules
                    </p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                      {result.stateRules.map((sr, i) => (
                        <div key={i} style={{ background:C.bgSecondary, borderLeft:'3px solid #2563eb', padding:'14px 18px' }}>
                          <div style={{ display:'flex', alignItems:'baseline', gap:'10px', marginBottom:'6px', flexWrap:'wrap' }}>
                            <span style={{ fontFamily:MONO, fontSize:'14px', color:'#2563eb', fontWeight:'600' }}>{sr.rule}</span>
                            <span style={{ fontSize:'12px', color:C.textMuted }}>{sr.state}</span>
                          </div>
                          {sr.difference && (
                            <p style={{ margin:'0 0 6px', fontSize:'13px', color:C.warning, lineHeight:'1.5' }}>
                              Differs from ABA: {sr.difference}
                            </p>
                          )}
                          <p style={{ margin:0, fontSize:'14px', color:C.textSecondary, lineHeight:'1.55' }}>{sr.relevance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ethics opinions */}
                {result.ethicsOpinions?.length > 0 && (
                  <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'24px', animation:'slideUp 0.2s ease' }}>
                    <p style={{ margin:'0 0 16px', fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' }}>Recent Ethics Opinions</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                      {result.ethicsOpinions.map((op, i) => (
                        <div key={i} style={{ background:C.bgSecondary, border:`1px solid ${C.border}`, padding:'14px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px', flexWrap:'wrap' }}>
                            <span style={{ fontFamily:MONO, fontSize:'13px', color:'#2563eb', fontWeight:'600' }}>{op.citation}</span>
                            <span style={{ fontSize:'12px', color:C.textMuted }}>{op.issuer}</span>
                          </div>
                          <p style={{ margin:0, fontSize:'14px', color:C.textSecondary, lineHeight:'1.55' }}>{op.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related issues */}
                {result.relatedIssues?.length > 0 && (
                  <div style={{ background:C.warningBg, border:`1px solid rgba(245,158,11,0.25)`, padding:'24px', animation:'slideUp 0.2s ease' }}>
                    <p style={{ margin:'0 0 14px', fontSize:'12px', color:C.warning, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' }}>Related Issues to Consider</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                      {result.relatedIssues.map((issue, i) => (
                        <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                          <span style={{ color:C.warning, fontSize:'11px', marginTop:'4px', flexShrink:0 }}>▸</span>
                          <p style={{ margin:0, fontSize:'15px', color:C.textSecondary, lineHeight:'1.6' }}>{issue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended next steps */}
                {result.nextSteps?.length > 0 && (
                  <div style={{ background:C.verifiedBg, border:`1px solid rgba(34,197,94,0.2)`, padding:'24px', animation:'slideUp 0.2s ease' }}>
                    <p style={{ margin:'0 0 16px', fontSize:'12px', color:C.verified, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' }}>Recommended Next Steps</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                      {result.nextSteps.map((step, i) => (
                        <div key={i} style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                          <span style={{
                            width:'24px', height:'24px', borderRadius:'50%', flexShrink:0,
                            background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:'12px', fontWeight:'700', color:C.verified,
                          }}>{i + 1}</span>
                          <p style={{ margin:0, fontSize:'15px', color:C.textSecondary, lineHeight:'1.6', paddingTop:'2px' }}>{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ethics hotline card — blue bordered */}
                {result.hotlineInfo && (
                  <div style={{ background:C.bgCard, border:'1px solid rgba(37,99,235,0.3)', padding:'24px', animation:'slideUp 0.2s ease' }}>
                    <p style={{ margin:'0 0 10px', fontSize:'12px', color:'#2563eb', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' }}>State Bar Ethics Hotline</p>
                    <p style={{ margin:'0 0 12px', fontSize:'15px', color:C.textSecondary, lineHeight:'1.65' }}>{result.hotlineInfo}</p>
                    <a
                      href="https://www.americanbar.org/groups/professional_responsibility/resources/links_of_interest/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize:'13px', color:'#2563eb', textDecoration:'none', borderBottom:'1px solid rgba(37,99,235,0.3)' }}
                    >
                      ABA Ethics Resources →
                    </a>
                  </div>
                )}

                {/* Save / Share / Print */}
                <div style={{ display:'flex', gap:'8px', marginTop:'4px', flexWrap:'wrap' }}>
                  {[
                    { label: saved ? '✓ Saved!' : '💾 Save Results', onClick: handleSave,           active: saved      },
                    { label: shareMsg || '🔗 Share',                  onClick: handleShare,           active: !!shareMsg },
                    { label: '🖨 Print',                               onClick: () => window.print(), active: false      },
                  ].map(btn => (
                    <button key={btn.label} onClick={btn.onClick} style={{
                      padding:'8px 16px', borderRadius:'6px', cursor:'pointer',
                      border:`1px solid ${btn.active ? '#2563eb' : C.border}`,
                      background: btn.active ? C.blueGlow2 : 'transparent',
                      color: btn.active ? '#2563eb' : C.textSecondary,
                      fontSize:'13px', transition:'all 0.15s',
                    }}
                      onMouseEnter={e => { if (!btn.active) { e.currentTarget.style.borderColor='#2563eb'; e.currentTarget.style.color='#2563eb' } }}
                      onMouseLeave={e => { if (!btn.active) { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary } }}
                    >{btn.label}</button>
                  ))}
                </div>

              </div>
            )
          })()}

          {/* ── Upsell footer ──────────────────────────────────────────────── */}
          <div style={{ background:'#111', border:'1px solid rgba(37,99,235,0.25)', padding:'32px', textAlign:'center', marginTop:'48px' }}>
            <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:'700', color:'#fff', marginBottom:'10px' }}>Upgrade to Pro — $49/month</div>
            <div style={{ fontSize:'15px', color:'#888', marginBottom:'24px', lineHeight:1.6 }}>Unlimited searches, export to Word & PDF, team accounts, priority support.</div>
            <Link href="/request-access" style={{ display:'inline-block', background:'#2563eb', color:'#fff', padding:'13px 32px', borderRadius:'6px', textDecoration:'none', fontSize:'15px', fontWeight:'600' }}
              onMouseEnter={e=>e.currentTarget.style.background='#1d4ed8'}
              onMouseLeave={e=>e.currentTarget.style.background='#2563eb'}
            >Start Free Trial →</Link>
          </div>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside style={{ position:'sticky', top:'80px' }}>
          <div style={{ background:'#111', border:'1px solid #222', padding:'24px', marginBottom:'16px' }}>
            <div style={{ fontSize:'11px', color:'#444', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'16px', fontWeight:'600' }}>Other Tools</div>
            {TOOLS.filter(t => t.id !== CURRENT_TOOL_ID).map(t => (
              <Link key={t.path} href={t.path} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:'1px solid #1a1a1a', textDecoration:'none' }}>
                <span>{t.icon}</span>
                <span style={{ fontSize:'13px', color:'#888' }}>{t.name}</span>
                {t.free && <span style={{ fontSize:'10px', color:'#22c55e', fontWeight:'700', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:'3px', padding:'2px 6px', marginLeft:'auto' }}>FREE</span>}
              </Link>
            ))}
          </div>
          <div style={{ background:'#111', border:'1px solid rgba(37,99,235,0.3)', padding:'24px' }}>
            <div style={{ fontSize:'14px', fontFamily:SERIF, fontWeight:'700', color:'#fff', marginBottom:'8px' }}>Upgrade to Pro</div>
            <div style={{ fontSize:'13px', color:'#888', lineHeight:1.6, marginBottom:'16px' }}>Unlimited searches, export to Word/PDF, team sharing.</div>
            <Link href="/request-access" style={{ display:'block', textAlign:'center', background:'#2563eb', color:'#fff', padding:'10px 16px', borderRadius:'6px', textDecoration:'none', fontSize:'13px', fontWeight:'600' }}
              onMouseEnter={e=>e.currentTarget.style.background='#1d4ed8'}
              onMouseLeave={e=>e.currentTarget.style.background='#2563eb'}
            >See Plans →</Link>
          </div>
        </aside>
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
