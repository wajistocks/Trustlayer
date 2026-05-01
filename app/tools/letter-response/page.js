'use client'

import { useState } from 'react'
import Link from 'next/link'

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

const CURRENT_TOOL_ID = 'letter-response'

const TOOLS = [
  { id:'plain-english',          path:'/tools/plain-english',          name:'Plain English Translator',  icon:'📖' },
  { id:'deadlines',              path:'/tools/deadlines',              name:'Deadline Calculator',        icon:'⏰' },
  { id:'red-flags',              path:'/tools/red-flags',              name:'Contract Red Flag Scanner',  icon:'🔍' },
  { id:'letter-response',        path:'/tools/letter-response',        name:'Letter Response Generator',  icon:'✉'  },
  { id:'statute-of-limitations', path:'/tools/statute-of-limitations', name:'Statute of Limitations',     icon:'⏳' },
  { id:'ethics',                 path:'/tools/ethics',                 name:'Ethics Checker',             icon:'⚖' },
  { id:'pro-se',                 path:'/tools/pro-se',                 name:'Pro Se Assistant',           icon:'🏛', free:true },
  { id:'lease-interpreter',      path:'/tools/lease-interpreter',      name:'Lease Interpreter',           icon:'🏠' },
]

const STATES = ['Federal','Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']

const SENDER_TYPES = [
  { value:'debt-collector',   label:'Debt Collector' },
  { value:'landlord',         label:'Landlord' },
  { value:'employer',         label:'Employer' },
  { value:'opposing-counsel', label:'Opposing Counsel' },
  { value:'government-agency',label:'Government Agency' },
  { value:'business-partner', label:'Business Partner' },
  { value:'other',            label:'Other' },
]

function urgencyStyle(u) {
  if (!u)            return { color:C.textSecondary, bg:`${C.textSecondary}15`, border:`${C.textSecondary}25` }
  if (u === 'high')  return { color:C.error,   bg:C.errorBg,   border:'rgba(239,68,68,0.3)' }
  if (u === 'medium')return { color:C.warning, bg:C.warningBg, border:'rgba(245,158,11,0.3)' }
  return                    { color:C.verified, bg:C.verifiedBg, border:'rgba(34,197,94,0.25)' }
}

function ToolSidebar() {
  const related = TOOLS.filter(t => t.id !== CURRENT_TOOL_ID)
  return (
    <aside style={{ position:'sticky', top:'80px', display:'flex', flexDirection:'column', gap:'12px' }}>
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'24px' }}>
        <div style={{ fontSize:'11px', color:C.textMuted, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'16px', fontWeight:'600' }}>Other Tools</div>
        {related.map(tool => (
          <Link key={tool.id} href={tool.path} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:`1px solid #1a1a1a`, textDecoration:'none' }}
            onMouseEnter={e => { const s = e.currentTarget.querySelectorAll('span'); if (s[1]) s[1].style.color=C.blue }}
            onMouseLeave={e => { const s = e.currentTarget.querySelectorAll('span'); if (s[1]) s[1].style.color=C.textSecondary }}
          >
            <span style={{ fontSize:'16px', width:'22px', textAlign:'center' }}>{tool.icon}</span>
            <span style={{ fontSize:'13px', color:C.textSecondary, flex:1, transition:'color 0.15s' }}>{tool.name}</span>
            {tool.free && <span style={{ fontSize:'10px', color:C.verified, fontWeight:'700', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:'3px', padding:'2px 6px' }}>FREE</span>}
          </Link>
        ))}
      </div>
      <div style={{ background:C.bgCard, border:`1px solid rgba(37,99,235,0.3)`, padding:'24px' }}>
        <div style={{ fontFamily:SERIF, fontSize:'15px', fontWeight:'700', color:C.textPrimary, marginBottom:'8px' }}>Upgrade to Pro</div>
        <div style={{ fontSize:'13px', color:C.textSecondary, lineHeight:1.6, marginBottom:'16px' }}>Unlimited responses, all 7 tools, export to Word/PDF, and priority support.</div>
        <Link href="/request-access" style={{ display:'block', textAlign:'center', background:C.blue, color:'#fff', padding:'10px 16px', borderRadius:'6px', textDecoration:'none', fontSize:'13px', fontWeight:'600' }}
          onMouseEnter={e=>e.currentTarget.style.background=C.blueHover}
          onMouseLeave={e=>e.currentTarget.style.background=C.blue}
        >See Plans →</Link>
      </div>
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'20px' }}>
        <div style={{ fontSize:'11px', color:C.textMuted, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'14px', fontWeight:'600' }}>Tips</div>
        {[
          { icon:'✉', tip:'Always send legal responses via certified mail — keep the receipt.' },
          { icon:'⚖', tip:'Never ignore a legal letter. Even a cease and desist requires a response.' },
          { icon:'📋', tip:'Have an attorney review before sending if significant money or rights are involved.' },
        ].map((t, i) => (
          <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', paddingBottom:'12px', borderBottom: i < 2 ? `1px solid #1a1a1a` : 'none', marginBottom: i < 2 ? '12px' : 0 }}>
            <span style={{ fontSize:'13px', flexShrink:0 }}>{t.icon}</span>
            <p style={{ margin:0, fontSize:'12px', color:C.textMuted, lineHeight:1.55 }}>{t.tip}</p>
          </div>
        ))}
      </div>
    </aside>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'28px', marginBottom:'12px' }}>
      <div style={{ height:'14px', width:'30%', background:'#1a1a1a', borderRadius:'2px', marginBottom:'14px', animation:'pulse 1.5s ease infinite' }} />
      <div style={{ height:'13px', width:'100%', background:'#1a1a1a', borderRadius:'2px', marginBottom:'8px', animation:'pulse 1.5s ease infinite' }} />
      <div style={{ height:'13px', width:'82%', background:'#1a1a1a', borderRadius:'2px', marginBottom:'8px', animation:'pulse 1.5s ease infinite' }} />
      <div style={{ height:'13px', width:'65%', background:'#1a1a1a', borderRadius:'2px', animation:'pulse 1.5s ease infinite' }} />
    </div>
  )
}

export default function LetterResponsePage() {
  const [letter, setLetter]         = useState('')
  const [senderType, setSenderType] = useState('debt-collector')
  const [state, setState]           = useState('California')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [result, setResult]         = useState(null)
  const [saved, setSaved]           = useState(false)
  const [copied, setCopied]         = useState(false)
  const [toolsOpen, setToolsOpen]   = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleSubmit() {
    if (!letter.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/tools/letter-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letter, senderType, state }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleCopyLetter() {
    if (result?.responseLetter) {
      navigator.clipboard?.writeText(result.responseLetter)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const us = result ? urgencyStyle(result.urgency) : null

  const inputStyle = {
    background: C.bgSecondary, border:`1px solid ${C.borderLight}`, color:C.textPrimary,
    borderRadius:'4px', fontSize:'15px', padding:'11px 14px', outline:'none', width:'100%',
    cursor:'pointer', fontFamily:SANS,
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:SANS, color:C.textPrimary }}>
      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .tl-nav-links { display: none !important; }
          .tl-hamburger { display: flex !important; align-items: center; }
          .tl-2col { grid-template-columns: 1fr !important; }
          .tl-form-2col { grid-template-columns: 1fr !important; }
          .tl-breadcrumb { padding: 12px 20px !important; }
          .tl-hero { padding: 40px 20px 32px !important; }
          .tl-main { padding: 24px 20px !important; }
          .tl-hide-mobile { display: none !important; }
          .tl-btn-full { width: 100% !important; }
        }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes pulse   { 0%,100% { opacity:0.3 } 50% { opacity:0.7 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        ::selection { background: rgba(37,99,235,0.4); color:#fff; }
        textarea::placeholder { color: #444; }
        select option { background: #111; color: #fff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="tl-nav" style={{ position:'sticky', top:0, zIndex:100, background:'#000', borderBottom:`1px solid ${C.border}`, height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px' }}>
        <Link href="/" style={{ textDecoration:'none', fontSize:'22px', fontFamily:SERIF, fontWeight:'700', color:'#fff', letterSpacing:'-0.02em' }}>TrustLayer</Link>
        <div className="tl-nav-links" style={{ display:'flex', gap:'32px', alignItems:'center' }}>
          {[['/', 'Verify'],['/research','Research'],['/enterprise','Enterprise']].map(([href,label]) => (
            <Link key={href} href={href} style={{ fontSize:'14px', color:'#fff', textDecoration:'none', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color=C.blue}
              onMouseLeave={e=>e.currentTarget.style.color='#fff'}
            >{label}</Link>
          ))}
          <div style={{ position:'relative' }} onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <Link href="/tools" style={{ fontSize:'14px', color:C.blue, textDecoration:'none', display:'flex', alignItems:'center', gap:'3px', borderBottom:`2px solid ${C.blue}`, paddingBottom:'2px' }}>
              Tools <span style={{ fontSize:'9px', opacity:0.7 }}>▾</span>
            </Link>
            {toolsOpen && (
              <div style={{ position:'absolute', top:'calc(100% + 10px)', left:'-10px', background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'6px', padding:'8px 6px', minWidth:'240px', boxShadow:'0 8px 32px rgba(0,0,0,0.8)', zIndex:200, animation:'fadeIn 0.15s ease' }}>
                {TOOLS.map(t => (
                  <Link key={t.path} href={t.path} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 10px', borderRadius:'4px', textDecoration:'none', background: t.id === CURRENT_TOOL_ID ? 'rgba(37,99,235,0.1)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(37,99,235,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background= t.id === CURRENT_TOOL_ID ? 'rgba(37,99,235,0.1)' : 'transparent'}
                  >
                    <span style={{ fontSize:'14px', width:'20px', textAlign:'center' }}>{t.icon}</span>
                    <span style={{ fontSize:'13px', color: t.id === CURRENT_TOOL_ID ? C.blue : C.textSecondary }}>{t.name}</span>
                  </Link>
                ))}
                <div style={{ borderTop:`1px solid ${C.border}`, margin:'5px 4px' }} />
                <Link href="/tools" style={{ display:'block', textAlign:'center', padding:'8px 10px', borderRadius:'4px', fontSize:'12px', color:C.blue, fontWeight:'600', textDecoration:'none' }}>View All Tools →</Link>
              </div>
            )}
          </div>
          <Link href="/request-access" style={{ background:C.blue, color:'#fff', padding:'9px 22px', borderRadius:'6px', fontSize:'14px', fontWeight:'600', textDecoration:'none', transition:'background 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.background=C.blueHover}
            onMouseLeave={e=>e.currentTarget.style.background=C.blue}
          >Request Access</Link>
        </div>
        <button className="tl-hamburger" style={{ display:'none', background:'none', border:'none', color:'#fff', fontSize:'22px', cursor:'pointer', padding:'8px', lineHeight:1 }} onClick={() => setMobileMenuOpen(v => !v)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>
      {mobileMenuOpen && <div style={{ position:'fixed', inset:0, zIndex:149, background:'rgba(0,0,0,0.6)' }} onClick={() => setMobileMenuOpen(false)} />}
      <div style={{ position:'fixed', top:0, right:0, width:'280px', height:'100vh', background:'#000', borderLeft:`1px solid ${C.border}`, zIndex:150, transform:mobileMenuOpen?'translateX(0)':'translateX(100%)', transition:'transform 0.25s ease', display:'flex', flexDirection:'column', padding:'72px 24px 40px', gap:'4px' }}>
        {[['/', 'Verify'],['/research','Research'],['/enterprise','Enterprise']].map(([href,label]) => (
          <Link key={href} href={href} style={{ display:'block', padding:'12px 8px', fontSize:'16px', color:'#fff', textDecoration:'none', borderBottom:`1px solid #111` }}>{label}</Link>
        ))}
        <div style={{ padding:'8px 0 4px', fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase' }}>Tools</div>
        {TOOLS.map(t => (
          <Link key={t.path} href={t.path} style={{ display:'flex', gap:'10px', alignItems:'center', padding:'10px 8px', fontSize:'14px', color: t.id === CURRENT_TOOL_ID ? C.blue : C.textSecondary, textDecoration:'none' }}>
            <span>{t.icon}</span><span>{t.name}</span>
          </Link>
        ))}
        <Link href="/request-access" style={{ marginTop:'auto', background:C.blue, color:'#fff', padding:'14px 20px', borderRadius:'6px', textDecoration:'none', fontSize:'15px', fontWeight:'600', textAlign:'center', display:'block' }}>Request Access</Link>
      </div>

      {/* ── Breadcrumb ───────────────────────────────────────────────────────── */}
      <div className="tl-breadcrumb" style={{ padding:'14px 40px', borderBottom:`1px solid ${C.border}`, background:'#000', display:'flex', gap:'6px', alignItems:'center', fontSize:'13px', color:C.textMuted }}>
        <Link href="/" style={{ color:C.textSecondary, textDecoration:'none', transition:'color 0.15s' }} onMouseEnter={e=>e.currentTarget.style.color=C.blue} onMouseLeave={e=>e.currentTarget.style.color=C.textSecondary}>TrustLayer</Link>
        <span>›</span>
        <Link href="/tools" style={{ color:C.textSecondary, textDecoration:'none', transition:'color 0.15s' }} onMouseEnter={e=>e.currentTarget.style.color=C.blue} onMouseLeave={e=>e.currentTarget.style.color=C.textSecondary}>Tools</Link>
        <span>›</span>
        <span style={{ color:'#fff' }}>Letter Response Generator</span>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="tl-hero" style={{ background:'#000', borderBottom:`1px solid ${C.border}`, padding:'56px 40px 48px' }}>
        <div style={{ maxWidth:'800px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:C.blueGlow2, border:`1px solid rgba(37,99,235,0.25)`, borderRadius:'4px', padding:'4px 12px', marginBottom:'20px' }}>
            <span style={{ fontSize:'14px' }}>✉</span>
            <span style={{ fontSize:'12px', color:C.blue, fontWeight:'600', letterSpacing:'0.08em', textTransform:'uppercase' }}>Letter Response Generator</span>
          </div>
          <h1 style={{ fontFamily:SERIF, fontSize:'clamp(28px,4vw,48px)', fontWeight:'700', color:'#fff', margin:'0 0 16px', lineHeight:1.1, letterSpacing:'-0.02em' }}>
            Respond To Any Legal Threat With Confidence
          </h1>
          <p style={{ fontSize:'17px', color:C.textSecondary, margin:0, lineHeight:1.7, maxWidth:'560px' }}>
            Understand what they&apos;re claiming, know your rights, and get a ready-to-send response letter.
          </p>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────────── */}
      <div className="tl-2col tl-main" style={{ maxWidth:'1200px', margin:'0 auto', padding:'48px 40px', display:'grid', gridTemplateColumns:'1fr 260px', gap:'40px', alignItems:'start' }}>

        {/* Left column */}
        <div>

          {/* Form card */}
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'28px', marginBottom:'24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
              <label style={{ fontSize:'14px', color:C.textSecondary, fontWeight:'600', letterSpacing:'0.03em' }}>The Letter You Received</label>
              <span style={{ fontSize:'12px', color:C.textMuted, fontFamily:MONO }}>{letter.length.toLocaleString()} chars</span>
            </div>
            <textarea
              value={letter}
              onChange={e => setLetter(e.target.value)}
              placeholder="Paste the threatening letter you received here..."
              style={{ width:'100%', minHeight:'220px', background:C.bgSecondary, border:`1px solid ${C.borderLight}`, color:'#fff', fontSize:'15px', fontFamily:SANS, padding:'14px 16px', resize:'vertical', outline:'none', lineHeight:1.65, boxSizing:'border-box', transition:'border-color 0.2s', marginBottom:'20px', borderRadius:'4px' }}
              onFocus={e => e.target.style.borderColor=C.blue}
              onBlur={e => e.target.style.borderColor=C.borderLight}
            />
            <div className="tl-form-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' }}>
              <div>
                <label style={{ display:'block', fontSize:'11px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600', marginBottom:'7px' }}>Sender Type</label>
                <select value={senderType} onChange={e=>setSenderType(e.target.value)} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor=C.blue}
                  onBlur={e=>e.target.style.borderColor=C.borderLight}
                >
                  {SENDER_TYPES.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'11px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600', marginBottom:'7px' }}>Your State</label>
                <select value={state} onChange={e=>setState(e.target.value)} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor=C.blue}
                  onBlur={e=>e.target.style.borderColor=C.borderLight}
                >
                  {STATES.filter(s => s !== 'Federal').map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <button
                onClick={handleSubmit}
                disabled={!letter.trim() || loading}
                className="tl-btn-full"
                style={{ padding:'13px 28px', borderRadius:'6px', border:'none', background: (!letter.trim() || loading) ? C.border : C.blue, color: (!letter.trim() || loading) ? C.textMuted : '#fff', fontSize:'15px', fontWeight:'600', cursor: (!letter.trim() || loading) ? 'not-allowed' : 'pointer', transition:'background 0.15s', display:'inline-flex', alignItems:'center', gap:'8px' }}
                onMouseEnter={e => { if (!loading && letter.trim()) e.currentTarget.style.background=C.blueHover }}
                onMouseLeave={e => { if (!loading && letter.trim()) e.currentTarget.style.background=C.blue }}
              >
                {loading ? (
                  <>
                    <span style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                    Analyzing...
                  </>
                ) : '✉ Analyze & Generate Response'}
              </button>
              {letter && (
                <button onClick={() => { setLetter(''); setResult(null); setError(null) }}
                  style={{ padding:'13px 18px', borderRadius:'6px', border:`1px solid ${C.border}`, background:'transparent', color:C.textMuted, fontSize:'14px', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.error; e.currentTarget.style.color=C.error }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textMuted }}
                >Clear</button>
              )}
            </div>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background:C.errorBg, border:'1px solid rgba(239,68,68,0.25)', padding:'20px 24px', marginBottom:'12px' }}>
              <div style={{ fontSize:'14px', fontWeight:'600', color:C.error, marginBottom:'4px' }}>⚠ Error</div>
              <div style={{ fontSize:'14px', color:C.textSecondary }}>{error}</div>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div style={{ animation:'slideUp 0.3s ease both' }}>

              {/* Attorney review banner */}
              <div style={{ background:C.warningBg, border:'1px solid rgba(245,158,11,0.3)', padding:'16px 20px', marginBottom:'20px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
                <span style={{ fontSize:'20px', flexShrink:0 }}>⚠</span>
                <div>
                  <div style={{ fontSize:'14px', fontWeight:'700', color:C.warning, marginBottom:'4px' }}>Attorney Review Recommended</div>
                  <p style={{ margin:0, fontSize:'13px', color:C.textSecondary, lineHeight:1.6 }}>
                    For matters involving significant money, employment, housing, or your legal rights, have a licensed attorney review this response before sending.
                  </p>
                </div>
              </div>

              {/* Empathy for high urgency */}
              {result.urgency === 'high' && (
                <div style={{ background:'rgba(37,99,235,0.06)', border:'1px solid rgba(37,99,235,0.2)', padding:'14px 18px', marginBottom:'20px', display:'flex', gap:'10px', alignItems:'center' }}>
                  <span style={{ fontSize:'18px' }}>💙</span>
                  <p style={{ margin:0, fontSize:'14px', color:C.textSecondary, lineHeight:1.6 }}>
                    We know receiving this letter is stressful. You have rights, and this response will help protect them.
                  </p>
                </div>
              )}

              {/* Save/Share/Print row */}
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'24px' }}>
                <button onClick={handleSave} style={{ padding:'8px 16px', borderRadius:'6px', border:`1px solid ${saved ? 'rgba(34,197,94,0.4)' : C.borderLight}`, background: saved ? C.verifiedBg : 'transparent', color: saved ? C.verified : C.textSecondary, fontSize:'13px', cursor:'pointer', transition:'all 0.15s' }}>
                  {saved ? '✓ Saved!' : '💾 Save Results'}
                </button>
                <button onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  style={{ padding:'8px 16px', borderRadius:'6px', border:`1px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontSize:'13px', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.color=C.blue }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary }}
                >🔗 Share</button>
                <button onClick={() => window.print()}
                  style={{ padding:'8px 16px', borderRadius:'6px', border:`1px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontSize:'13px', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.color=C.blue }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary }}
                >🖨 Print</button>
              </div>

              {/* Urgency */}
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px', flexWrap:'wrap' }}>
                <span style={{ fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' }}>Urgency</span>
                {us && (
                  <span style={{ padding:'4px 14px', borderRadius:'4px', fontSize:'13px', fontWeight:'700', background:us.bg, color:us.color, border:`1px solid ${us.border}`, textTransform:'capitalize' }}>
                    {result.urgency ?? 'Unknown'}
                  </span>
                )}
              </div>

              {/* Sender analysis */}
              {result.senderAnalysis && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.blue}`, padding:'20px 24px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:C.blue, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'8px' }}>Sender Analysis</div>
                  <p style={{ margin:0, fontSize:'15px', color:C.textSecondary, lineHeight:1.7 }}>{result.senderAnalysis}</p>
                </div>
              )}

              {/* Claims */}
              {result.claims?.length > 0 && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'20px 24px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'14px' }}>What They&apos;re Claiming</div>
                  <ol style={{ margin:0, padding:'0 0 0 20px', display:'flex', flexDirection:'column', gap:'10px' }}>
                    {result.claims.map((c, i) => (
                      <li key={i} style={{ fontSize:'15px', color:C.textSecondary, lineHeight:1.7 }}>{c}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Legal accuracy */}
              {result.legalAccuracy && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'20px 24px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'8px' }}>Legal Accuracy of Their Claims</div>
                  <p style={{ margin:0, fontSize:'15px', color:C.textSecondary, lineHeight:1.7 }}>{result.legalAccuracy}</p>
                </div>
              )}

              {/* Your rights */}
              {result.yourRights?.length > 0 && (
                <div style={{ background:'rgba(34,197,94,0.04)', border:'1px solid rgba(34,197,94,0.18)', padding:'20px 24px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:C.verified, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'14px' }}>Your Legal Rights</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {result.yourRights.map((r, i) => (
                      <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                        <span style={{ color:C.verified, fontSize:'14px', flexShrink:0, marginTop:'2px' }}>✓</span>
                        <span style={{ fontSize:'15px', color:C.textSecondary, lineHeight:1.7 }}>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Protective laws */}
              {result.protectiveLaws?.length > 0 && (
                <div style={{ marginBottom:'20px' }}>
                  <div style={{ fontSize:'11px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'14px' }}>Laws That Protect You</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {result.protectiveLaws.map((law, i) => (
                      <div key={i} style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'16px 20px', transition:'border-color 0.15s' }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
                      >
                        <div style={{ display:'flex', gap:'12px', alignItems:'flex-start', flexWrap:'wrap', marginBottom: law.howItHelps ? '8px' : 0 }}>
                          <div style={{ fontFamily:SERIF, fontSize:'16px', fontWeight:'700', color:'#fff' }}>{law.name}</div>
                          {law.citation && (
                            <span style={{ fontSize:'11px', fontFamily:MONO, color:C.textMuted, background:C.bgSecondary, padding:'2px 8px', borderRadius:'3px', border:`1px solid ${C.border}` }}>{law.citation}</span>
                          )}
                        </div>
                        {law.howItHelps && <p style={{ margin:0, fontSize:'14px', color:C.textSecondary, lineHeight:1.6 }}>{law.howItHelps}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Response letter */}
              {result.responseLetter && (
                <div style={{ marginBottom:'24px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px', flexWrap:'wrap', gap:'10px' }}>
                    <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:'700', color:'#fff' }}>✉ Your Response Letter</div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button onClick={handleCopyLetter}
                        style={{ padding:'8px 16px', borderRadius:'6px', border:`1px solid ${copied ? 'rgba(34,197,94,0.4)' : C.borderLight}`, background: copied ? C.verifiedBg : 'transparent', color: copied ? C.verified : C.textSecondary, fontSize:'13px', cursor:'pointer', transition:'all 0.15s', fontWeight:'600' }}
                      >
                        {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
                      </button>
                      <button onClick={() => window.print()}
                        style={{ padding:'8px 14px', borderRadius:'6px', border:`1px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontSize:'13px', cursor:'pointer' }}
                        onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.color=C.blue }}
                        onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary }}
                      >🖨 Print</button>
                    </div>
                  </div>
                  <div style={{ background:C.bgSecondary, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.blue}`, padding:'28px 32px' }}>
                    <pre style={{ margin:0, fontFamily:MONO, fontSize:'13px', color:'#fff', lineHeight:1.85, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                      {result.responseLetter}
                    </pre>
                  </div>
                </div>
              )}

              {/* Deadlines */}
              {result.deadlines?.length > 0 && (
                <div style={{ background:C.errorBg, border:'1px solid rgba(239,68,68,0.2)', padding:'20px 24px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:C.error, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'14px' }}>⏰ Deadlines & Time-Sensitive Actions</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {result.deadlines.map((d, i) => (
                      <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                        <span style={{ color:C.error, fontSize:'14px', flexShrink:0, marginTop:'2px' }}>!</span>
                        <span style={{ fontSize:'15px', color:C.textSecondary, lineHeight:1.7 }}>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result.warnings?.length > 0 && (
                <div style={{ background:C.errorBg, border:'1px solid rgba(239,68,68,0.2)', padding:'20px 24px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:C.error, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'14px' }}>🚫 Do NOT Do These Things</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {result.warnings.map((w, i) => (
                      <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                        <span style={{ color:C.error, fontSize:'14px', flexShrink:0, marginTop:'2px' }}>✕</span>
                        <span style={{ fontSize:'15px', color:C.textSecondary, lineHeight:1.7 }}>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              {result.disclaimer && (
                <p style={{ fontSize:'12px', color:C.textMuted, lineHeight:1.6, fontStyle:'italic', margin:'0 0 8px' }}>{result.disclaimer}</p>
              )}
            </div>
          )}

          {/* Upsell footer */}
          <div style={{ marginTop:'48px', background:C.bgCard, border:'1px solid rgba(37,99,235,0.25)', padding:'32px', textAlign:'center' }}>
            <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:'700', color:'#fff', marginBottom:'10px' }}>Upgrade to Pro — $49/month</div>
            <div style={{ fontSize:'15px', color:C.textSecondary, marginBottom:'24px', lineHeight:1.6 }}>Unlimited responses, export to Word & PDF, team accounts, and priority support.</div>
            <Link href="/request-access" style={{ display:'inline-block', background:C.blue, color:'#fff', padding:'13px 32px', borderRadius:'6px', textDecoration:'none', fontSize:'15px', fontWeight:'600' }}
              onMouseEnter={e=>e.currentTarget.style.background=C.blueHover}
              onMouseLeave={e=>e.currentTarget.style.background=C.blue}
            >Start Free Trial →</Link>
          </div>
        </div>

        {/* Sidebar */}
        <ToolSidebar />
      </div>
    </div>
  )
}
