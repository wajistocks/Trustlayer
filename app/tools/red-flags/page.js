'use client'

import { useState, useEffect, useRef } from 'react'
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

const TOOLS = [
  { id:'plain-english', path:'/tools/plain-english', name:'Plain English Translator', icon:'📖' },
  { id:'deadlines', path:'/tools/deadlines', name:'Deadline Calculator', icon:'⏰' },
  { id:'red-flags', path:'/tools/red-flags', name:'Contract Red Flag Scanner', icon:'🔍' },
  { id:'letter-response', path:'/tools/letter-response', name:'Letter Response Generator', icon:'✉' },
  { id:'statute-of-limitations', path:'/tools/statute-of-limitations', name:'Statute of Limitations', icon:'⏳' },
  { id:'ethics', path:'/tools/ethics', name:'Ethics Checker', icon:'⚖' },
  { id:'pro-se', path:'/tools/pro-se', name:'Pro Se Assistant', icon:'🏛', free:true },
  { id:'lease-interpreter', path:'/tools/lease-interpreter', name:'Lease Interpreter', icon:'🏠' },
]

const CURRENT_TOOL_ID = 'red-flags'

const SAMPLE_CONTRACT = `INDEMNIFICATION. Contractor shall indemnify, defend, and hold harmless Company, its officers, directors, employees, agents, and successors from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to Contractor's performance under this Agreement, regardless of Company's negligence. LIMITATION OF LIABILITY. NOTWITHSTANDING ANYTHING TO THE CONTRARY, COMPANY'S LIABILITY SHALL BE LIMITED TO THE GREATER OF $100 OR THE AMOUNT PAID IN THE PRIOR 30 DAYS. INTELLECTUAL PROPERTY. All work product, inventions, and ideas conceived by Contractor, whether or not during working hours and whether or not using Company resources, shall be the sole and exclusive property of Company. NON-COMPETE. For a period of 36 months following termination, Contractor shall not engage in any business competitive with Company anywhere in the United States. MODIFICATION. Company reserves the right to modify the terms of this Agreement at any time with or without notice to Contractor.`

function severityColor(s) {
  if (!s) return C.blue
  const lc = s.toLowerCase()
  if (lc === 'high') return C.error
  if (lc === 'medium') return C.warning
  return C.blue
}

function scoreColor(n) {
  if (n >= 80) return C.verified
  if (n >= 50) return C.warning
  return C.error
}

function verdictStyle(v) {
  if (!v) return { color: C.textSecondary, bg: 'rgba(136,136,136,0.1)', border: 'rgba(136,136,136,0.25)' }
  const lv = v.toLowerCase()
  if (lv === 'safe') return { color: C.verified, bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)' }
  if (lv === 'caution') return { color: C.warning, bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' }
  return { color: C.error, bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' }
}

function ScoreCircle({ target }) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (target == null) return
    const start = performance.now()
    const duration = 1000
    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      setDisplay(Math.round(progress * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target])

  const col = scoreColor(target ?? 0)
  const size = 96
  const r = 38
  const circ = 2 * Math.PI * r
  const progress = ((target ?? 0) / 100)
  const dash = circ * progress
  const gap = circ - dash

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
      <div style={{ position:'relative', width:`${size}px`, height:`${size}px` }}>
        <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${col}20`} strokeWidth="6" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${dash} ${gap}`} style={{ transition:'stroke-dasharray 0.1s ease' }} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:'26px', fontWeight:'700', fontFamily:MONO, color:col, lineHeight:1 }}>{display}</span>
          <span style={{ fontSize:'9px', color:'#444', letterSpacing:'0.07em', textTransform:'uppercase' }}>/ 100</span>
        </div>
      </div>
    </div>
  )
}

export default function RedFlagsPage() {
  const [contract, setContract]           = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const [result, setResult]               = useState(null)
  const [saved, setSaved]                 = useState(false)
  const [expandedFlag, setExpandedFlag]   = useState(null)
  const [showNotFound, setShowNotFound]   = useState(false)
  const [toolsOpen, setToolsOpen]         = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleSubmit() {
    if (!contract.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    setExpandedFlag(null)
    try {
      const res = await fetch('/api/tools/red-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Scan failed')
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

  const foundFlags    = result?.flags?.filter(f => f.found) ?? []
  const notFoundFlags = result?.flags?.filter(f => !f.found) ?? []
  const highCount     = foundFlags.filter(f => f.severity?.toLowerCase() === 'high').length
  const medCount      = foundFlags.filter(f => f.severity?.toLowerCase() === 'medium').length
  const lowCount      = foundFlags.filter(f => f.severity?.toLowerCase() === 'low').length
  const vs = verdictStyle(result?.verdict)

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:SANS, color:C.textPrimary }}>

      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'#000', borderBottom:'1px solid #222', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px' }} className="tl-nav">
        <Link href="/" style={{ textDecoration:'none', fontSize:'22px', fontFamily:SERIF, fontWeight:'700', color:'#fff', letterSpacing:'-0.02em' }}>TrustLayer</Link>
        <div className="tl-nav-links" style={{ display:'flex', gap:'32px', alignItems:'center' }}>
          {[['/', 'Verify'],['/research','Research'],['/enterprise','Enterprise']].map(([href,label]) => (
            <Link key={href} href={href} style={{ fontSize:'14px', color:'#fff', textDecoration:'none', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#2563eb'}
              onMouseLeave={e=>e.currentTarget.style.color='#fff'}
            >{label}</Link>
          ))}
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

      {/* Breadcrumb */}
      <div className="tl-breadcrumb" style={{ padding:'16px 40px', borderBottom:'1px solid #222', background:'#000', display:'flex', gap:'6px', alignItems:'center', fontSize:'13px', color:'#444' }}>
        <Link href="/" style={{ color:'#888', textDecoration:'none' }} onMouseEnter={e=>e.currentTarget.style.color='#2563eb'} onMouseLeave={e=>e.currentTarget.style.color='#888'}>TrustLayer</Link>
        <span>›</span>
        <Link href="/tools" style={{ color:'#888', textDecoration:'none' }} onMouseEnter={e=>e.currentTarget.style.color='#2563eb'} onMouseLeave={e=>e.currentTarget.style.color='#888'}>Tools</Link>
        <span>›</span>
        <span style={{ color:'#fff' }}>Contract Red Flag Scanner</span>
      </div>

      {/* Hero */}
      <div className="tl-hero" style={{ background:'#000', borderBottom:'1px solid #222', padding:'56px 40px 48px' }}>
        <div style={{ maxWidth:'800px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(37,99,235,0.1)', border:'1px solid rgba(37,99,235,0.25)', borderRadius:'4px', padding:'4px 12px', marginBottom:'20px' }}>
            <span style={{ fontSize:'14px' }}>🔍</span>
            <span style={{ fontSize:'12px', color:'#2563eb', fontWeight:'600', letterSpacing:'0.08em', textTransform:'uppercase' }}>Red Flag Scanner</span>
          </div>
          <h1 style={{ fontFamily:SERIF, fontSize:'clamp(28px,4vw,48px)', fontWeight:'700', color:'#fff', margin:'0 0 16px', lineHeight:1.1, letterSpacing:'-0.02em' }}>Contract Red Flag Scanner</h1>
          <p style={{ fontSize:'17px', color:'#888', margin:0, lineHeight:1.7, maxWidth:'560px' }}>Paste your contract and instantly identify dangerous clauses, one-sided terms, and negotiation opportunities.</p>
        </div>
      </div>

      {/* Main 2-col layout */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'48px 40px', display:'grid', gridTemplateColumns:'1fr 260px', gap:'40px', alignItems:'start' }} className="tl-2col tl-section-pad">

        {/* Main content */}
        <div>
          {/* Form card */}
          <div style={{ background:'#111', border:'1px solid #222', padding:'28px' }} className="tl-card-pad">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
              <label style={{ fontSize:'14px', color:'#888', fontWeight:'600' }}>Contract Text</label>
              <span style={{ fontSize:'12px', color:'#444', fontFamily:MONO }}>{contract.length.toLocaleString()} chars</span>
            </div>
            <textarea
              value={contract}
              onChange={e => setContract(e.target.value)}
              placeholder="Paste your contract here — NDA, employment agreement, lease, service agreement, or any other contract..."
              rows={10}
              style={{ width:'100%', background:'#0a0a0a', border:'1px solid #333', color:'#fff', borderRadius:'4px', fontSize:'16px', padding:'16px', lineHeight:1.6, resize:'vertical', outline:'none', fontFamily:SANS }}
              onFocus={e=>e.currentTarget.style.borderColor='#2563eb'}
              onBlur={e=>e.currentTarget.style.borderColor='#333'}
            />
            <div style={{ display:'flex', gap:'10px', marginTop:'16px', flexWrap:'wrap' }}>
              <button
                onClick={handleSubmit}
                disabled={!contract.trim() || loading}
                style={{ background: (!contract.trim() || loading) ? '#222' : '#2563eb', color: (!contract.trim() || loading) ? '#444' : '#fff', border:'none', borderRadius:'6px', fontSize:'15px', fontWeight:'600', padding:'13px 28px', cursor: (!contract.trim() || loading) ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:'8px' }}
                onMouseEnter={e=>{ if (contract.trim() && !loading) e.currentTarget.style.background='#1d4ed8' }}
                onMouseLeave={e=>{ if (contract.trim() && !loading) e.currentTarget.style.background='#2563eb' }}
              >
                {loading ? (
                  <>
                    <span style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                    Scanning...
                  </>
                ) : '🔍 Scan for Red Flags'}
              </button>
              <button
                onClick={() => setContract(SAMPLE_CONTRACT)}
                style={{ background:'transparent', border:'1px solid #333', color:'#888', borderRadius:'6px', padding:'13px 20px', fontSize:'15px', cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#2563eb';e.currentTarget.style.color='#2563eb'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#333';e.currentTarget.style.color='#888'}}
              >Try a Sample</button>
              {contract && (
                <button
                  onClick={() => { setContract(''); setResult(null); setError(null) }}
                  style={{ background:'transparent', border:'1px solid #333', color:'#444', borderRadius:'6px', padding:'13px 16px', fontSize:'15px', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#ef4444'}
                  onMouseLeave={e=>e.currentTarget.style.color='#444'}
                >Clear</button>
              )}
            </div>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div style={{ marginTop:'24px' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background:'#111', border:'1px solid #222', padding:'28px', marginBottom:'12px' }}>
                  <div style={{ display:'flex', gap:'14px', alignItems:'center', marginBottom:'14px' }}>
                    <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:'#1a1a1a', flexShrink:0, animation:'pulse 1.4s ease infinite' }} />
                    <div style={{ flex:1 }}>
                      <div style={{ height:'16px', background:'#1a1a1a', borderRadius:'2px', marginBottom:'8px', width:'40%', animation:'pulse 1.4s ease infinite' }} />
                      <div style={{ height:'14px', background:'#1a1a1a', borderRadius:'2px', width:'70%', animation:'pulse 1.4s ease infinite' }} />
                    </div>
                  </div>
                  <div style={{ height:'14px', background:'#1a1a1a', borderRadius:'2px', marginBottom:'8px', width:'80%', animation:'pulse 1.4s ease infinite' }} />
                  <div style={{ height:'14px', background:'#1a1a1a', borderRadius:'2px', width:'65%', animation:'pulse 1.4s ease infinite' }} />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', padding:'24px', marginTop:'24px' }}>
              <div style={{ fontSize:'15px', fontWeight:'600', color:'#ef4444', marginBottom:'8px' }}>Error</div>
              <div style={{ fontSize:'14px', color:'#888' }}>{error}</div>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div style={{ marginTop:'28px', animation:'slideUp 0.2s ease' }}>

              {/* Save/Share/Print row */}
              <div style={{ display:'flex', gap:'8px', marginBottom:'24px' }}>
                {[
                  { label: saved ? '✓ Saved!' : '💾 Save', action: handleSave },
                  { label: '🔗 Share', action: () => navigator.clipboard?.writeText(window.location.href) },
                  { label: '🖨 Print', action: () => window.print() },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} style={{ background:'transparent', border:'1px solid #333', color:'#888', borderRadius:'6px', padding:'8px 14px', fontSize:'13px', cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#2563eb';e.currentTarget.style.color='#2563eb'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#333';e.currentTarget.style.color='#888'}}
                  >{btn.label}</button>
                ))}
              </div>

              {/* Score + verdict banner */}
              <div style={{ background:'#111', border:'1px solid #222', padding:'28px', marginBottom:'12px', animation:'slideUp 0.2s ease' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'28px', flexWrap:'wrap' }}>
                  <ScoreCircle target={result.safetyScore ?? 0} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'11px', color:'#444', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:'600', marginBottom:'10px' }}>Safety Score</div>
                    {/* Verdict banner */}
                    <div style={{ display:'inline-flex', alignItems:'center', padding:'8px 20px', background:vs.bg, border:`1px solid ${vs.border}`, borderRadius:'4px', marginBottom:'12px' }}>
                      <span style={{ fontSize:'15px', fontWeight:'700', color:vs.color, letterSpacing:'0.04em' }}>{result.verdict ?? 'Unknown'}</span>
                    </div>
                    <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'13px', color:'#444' }}><span style={{ color:'#fff', fontWeight:'700' }}>{foundFlags.length}</span> of {result.flags?.length ?? 0} clauses detected</span>
                      {highCount > 0 && <span style={{ fontSize:'13px', color:C.error }}>● {highCount} High</span>}
                      {medCount > 0 && <span style={{ fontSize:'13px', color:C.warning }}>● {medCount} Medium</span>}
                      {lowCount > 0 && <span style={{ fontSize:'13px', color:C.blue }}>● {lowCount} Low</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {result.summary && (
                <div style={{ background:'#111', border:'1px solid #222', padding:'28px', marginBottom:'12px', animation:'slideUp 0.2s ease' }}>
                  <div style={{ fontSize:'11px', color:'#444', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:'600', marginBottom:'12px' }}>Summary</div>
                  <p style={{ margin:0, fontSize:'16px', color:'#fff', lineHeight:1.7 }}>{result.summary}</p>
                </div>
              )}

              {/* Found flags */}
              {foundFlags.length > 0 && (
                <div style={{ marginBottom:'20px' }}>
                  <h2 style={{ fontFamily:SERIF, fontSize:'20px', color:'#fff', margin:'0 0 16px', fontWeight:'700' }}>
                    ⚠ Flags Found ({foundFlags.length})
                  </h2>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {foundFlags.map((flag, i) => {
                      const col = severityColor(flag.severity)
                      const isOpen = expandedFlag === `found-${i}`
                      return (
                        <div
                          key={i}
                          style={{ background:'#111', border:'1px solid #222', borderLeft:`3px solid ${col}`, overflow:'hidden', cursor:'pointer', animation:'slideUp 0.2s ease' }}
                          onClick={() => setExpandedFlag(isOpen ? null : `found-${i}`)}
                          onMouseEnter={e=>e.currentTarget.style.borderColor=`${col}60`}
                          onMouseLeave={e=>e.currentTarget.style.borderColor='#222'}
                        >
                          <div style={{ padding:'18px 20px', display:'flex', alignItems:'flex-start', gap:'12px' }}>
                            <span style={{ padding:'3px 8px', fontSize:'11px', fontWeight:'700', letterSpacing:'0.06em', textTransform:'uppercase', background:`${col}15`, color:col, border:`1px solid ${col}30`, borderRadius:'4px', whiteSpace:'nowrap', flexShrink:0, marginTop:'2px' }}>
                              {flag.severity ?? 'Low'}
                            </span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:'15px', fontWeight:'700', color:'#fff', marginBottom:'4px' }}>{flag.label}</div>
                              {flag.excerptHint && (
                                <p style={{ margin:0, fontSize:'13px', color:'#444', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace: isOpen ? 'normal' : 'nowrap' }}>
                                  &ldquo;{flag.excerptHint}&rdquo;
                                </p>
                              )}
                            </div>
                            <span style={{ color:'#444', fontSize:'16px', flexShrink:0, transition:'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                          </div>

                          {isOpen && (
                            <div style={{ padding:'0 20px 20px', borderTop:'1px solid #222', paddingTop:'18px', animation:'fadeIn 0.2s ease' }}>
                              {flag.plainEnglish && (
                                <div style={{ marginBottom:'16px' }}>
                                  <div style={{ fontSize:'11px', color:'#444', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'8px' }}>Plain English</div>
                                  <p style={{ margin:0, fontSize:'14px', color:'#888', lineHeight:1.7 }}>{flag.plainEnglish}</p>
                                </div>
                              )}
                              {flag.whatItMeansForYou && (
                                <div style={{ marginBottom:'16px' }}>
                                  <div style={{ fontSize:'11px', color:'#444', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'8px' }}>What This Means For You</div>
                                  <p style={{ margin:0, fontSize:'14px', color:'#888', lineHeight:1.7 }}>{flag.whatItMeansForYou}</p>
                                </div>
                              )}
                              {flag.negotiationLanguage && (
                                <div style={{ background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.2)', padding:'16px' }}>
                                  <div style={{ fontSize:'11px', color:'#22c55e', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'8px' }}>💬 Suggested Negotiation Language</div>
                                  <p style={{ margin:0, fontSize:'14px', color:'#888', lineHeight:1.7, fontStyle:'italic' }}>{flag.negotiationLanguage}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Not-found flags */}
              {notFoundFlags.length > 0 && (
                <div style={{ marginBottom:'20px' }}>
                  <button
                    onClick={() => setShowNotFound(x => !x)}
                    style={{ display:'flex', alignItems:'center', gap:'8px', background:'none', border:'none', cursor:'pointer', padding:'0 0 14px', color:'#888', fontSize:'14px', fontWeight:'600' }}
                  >
                    <span style={{ color:'#22c55e', fontSize:'16px' }}>✓</span>
                    Not Found in This Contract ({notFoundFlags.length} Good)
                    <span style={{ color:'#444', fontSize:'14px', marginLeft:'4px', transition:'transform 0.2s', display:'inline-block', transform: showNotFound ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                  </button>
                  {showNotFound && (
                    <div style={{ background:'#111', border:'1px solid #222', padding:'16px 20px', animation:'fadeIn 0.2s ease' }}>
                      {notFoundFlags.map((flag, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom: i < notFoundFlags.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                          <span style={{ color:'#22c55e', fontSize:'14px' }}>✓</span>
                          <span style={{ fontSize:'14px', color:'#888' }}>{flag.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upsell footer */}
          <div style={{ background:'#111', border:'1px solid rgba(37,99,235,0.25)', padding:'32px', textAlign:'center', marginTop:'48px' }}>
            <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:'700', color:'#fff', marginBottom:'10px' }}>Upgrade to Pro — $49/month</div>
            <div style={{ fontSize:'15px', color:'#888', marginBottom:'24px', lineHeight:1.6 }}>Unlimited searches, export to Word & PDF, team accounts, and priority support.</div>
            <Link href="/request-access" style={{ display:'inline-block', background:'#2563eb', color:'#fff', padding:'13px 32px', borderRadius:'6px', textDecoration:'none', fontSize:'15px', fontWeight:'600' }}>Start Free Trial →</Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ position:'sticky', top:'80px' }}>
          <div style={{ background:'#111', border:'1px solid #222', padding:'24px', marginBottom:'16px' }}>
            <div style={{ fontSize:'11px', color:'#444', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'16px', fontWeight:'600' }}>Other Tools</div>
            {TOOLS.filter(t => t.id !== CURRENT_TOOL_ID).map(t => (
              <Link key={t.path} href={t.path} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:'1px solid #1a1a1a', textDecoration:'none' }}
                onMouseEnter={e => e.currentTarget.querySelector('span:nth-child(2)').style.color='#2563eb'}
                onMouseLeave={e => e.currentTarget.querySelector('span:nth-child(2)').style.color='#888'}
              >
                <span style={{ fontSize:'16px', width:'22px', textAlign:'center' }}>{t.icon}</span>
                <span style={{ fontSize:'13px', color:'#888', flex:1, transition:'color 0.15s' }}>{t.name}</span>
                {t.free && <span style={{ fontSize:'10px', color:'#22c55e', fontWeight:'700', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:'3px', padding:'2px 6px' }}>FREE</span>}
              </Link>
            ))}
          </div>
          <div style={{ background:'#111', border:'1px solid rgba(37,99,235,0.3)', padding:'24px' }}>
            <div style={{ fontSize:'14px', fontFamily:SERIF, fontWeight:'700', color:'#fff', marginBottom:'8px' }}>Upgrade to Pro</div>
            <div style={{ fontSize:'13px', color:'#888', lineHeight:1.6, marginBottom:'16px' }}>Unlimited searches, priority API, export to Word/PDF, team sharing.</div>
            <Link href="/request-access" style={{ display:'block', textAlign:'center', background:'#2563eb', color:'#fff', padding:'10px 16px', borderRadius:'6px', textDecoration:'none', fontSize:'13px', fontWeight:'600' }}>See Plans →</Link>
          </div>
        </aside>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .tl-nav-links { display: none !important; }
          .tl-hamburger { display: flex !important; align-items: center; }
          .tl-2col { grid-template-columns: 1fr !important; }
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
        textarea::placeholder { color: #444; }
        body { margin: 0; }
      `}</style>
    </div>
  )
}
