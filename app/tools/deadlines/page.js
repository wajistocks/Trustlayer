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

const CURRENT_TOOL_ID = 'deadlines'

const STATES = ['Federal','Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']

const CASE_TYPES = [
  { value:'civil', label:'Civil' },
  { value:'criminal', label:'Criminal' },
  { value:'family', label:'Family' },
  { value:'probate', label:'Probate' },
  { value:'bankruptcy', label:'Bankruptcy' },
  { value:'immigration', label:'Immigration' },
  { value:'appeal', label:'Appeal' },
  { value:'discovery', label:'Discovery' },
]

const TODAY = new Date().toISOString().split('T')[0]

function criticalityColor(c) {
  if (!c) return C.verified
  const lc = c.toLowerCase()
  if (lc === 'critical') return C.error
  if (lc === 'warning' || lc === 'important') return C.warning
  return C.verified
}

function exportToICS(deadlines, caseType) {
  const events = deadlines.map(d => {
    const dt = d.date.replace(/-/g,'')
    return `BEGIN:VEVENT\nSUMMARY:${d.name} (${caseType})\nDTSTART;VALUE=DATE:${dt}\nDTEND;VALUE=DATE:${dt}\nDESCRIPTION:${d.description} - ${d.rule}\nEND:VEVENT`
  }).join('\n')
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TrustLayer//Legal Deadlines//EN\n${events}\nEND:VCALENDAR`
  const blob = new Blob([ics], { type:'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href=url; a.download=`legal-deadlines-${caseType}.ics`; a.click()
  URL.revokeObjectURL(url)
}

export default function DeadlinesPage() {
  const [state, setState]               = useState('Federal')
  const [caseType, setCaseType]         = useState('civil')
  const [triggeringDate, setTriggering] = useState(TODAY)
  const [caseNumber, setCaseNumber]     = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [result, setResult]             = useState(null)
  const [saved, setSaved]               = useState(false)
  const [toolsOpen, setToolsOpen]       = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleSubmit() {
    if (loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/tools/deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, caseType, triggeringDate, caseNumber }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Deadline calculation failed')
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

  const inputStyle = {
    background:'#0a0a0a', border:'1px solid #333', color:'#fff', borderRadius:'4px',
    fontSize:'15px', padding:'11px 14px', outline:'none', cursor:'pointer', width:'100%',
  }

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
        <span style={{ color:'#fff' }}>Deadline Calculator</span>
      </div>

      {/* Hero */}
      <div className="tl-hero" style={{ background:'#000', borderBottom:'1px solid #222', padding:'56px 40px 48px' }}>
        <div style={{ maxWidth:'800px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(37,99,235,0.1)', border:'1px solid rgba(37,99,235,0.25)', borderRadius:'4px', padding:'4px 12px', marginBottom:'20px' }}>
            <span style={{ fontSize:'14px' }}>⏰</span>
            <span style={{ fontSize:'12px', color:'#2563eb', fontWeight:'600', letterSpacing:'0.08em', textTransform:'uppercase' }}>Deadline Calculator</span>
          </div>
          <h1 style={{ fontFamily:SERIF, fontSize:'clamp(28px,4vw,48px)', fontWeight:'700', color:'#fff', margin:'0 0 16px', lineHeight:1.1, letterSpacing:'-0.02em' }}>Deadline Calculator</h1>
          <p style={{ fontSize:'17px', color:'#888', margin:0, lineHeight:1.7, maxWidth:'560px' }}>Calculate every critical deadline for your case — with calendar export and jurisdiction-specific rules.</p>
        </div>
      </div>

      {/* Main 2-col layout */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'48px 40px', display:'grid', gridTemplateColumns:'1fr 260px', gap:'40px', alignItems:'start' }} className="tl-2col tl-section-pad">

        {/* Main content */}
        <div>
          {/* Form card */}
          <div style={{ background:'#111', border:'1px solid #222', padding:'28px', marginBottom:'0' }} className="tl-card-pad">
            <h2 style={{ fontFamily:SERIF, fontSize:'18px', fontWeight:'700', color:'#fff', margin:'0 0 24px' }}>Case Details</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }} className="tl-form-grid">
              <div>
                <label style={{ display:'block', fontSize:'12px', color:'#444', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600', marginBottom:'8px' }}>Jurisdiction</label>
                <select value={state} onChange={e=>setState(e.target.value)} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#2563eb'} onBlur={e=>e.target.style.borderColor='#333'}>
                  {STATES.map(s => <option key={s} value={s} style={{ background:'#111' }}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'12px', color:'#444', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600', marginBottom:'8px' }}>Case Type</label>
                <select value={caseType} onChange={e=>setCaseType(e.target.value)} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#2563eb'} onBlur={e=>e.target.style.borderColor='#333'}>
                  {CASE_TYPES.map(ct => <option key={ct.value} value={ct.value} style={{ background:'#111' }}>{ct.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' }} className="tl-form-grid">
              <div>
                <label style={{ display:'block', fontSize:'12px', color:'#444', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600', marginBottom:'8px' }}>Triggering Event Date</label>
                <input
                  type="date"
                  value={triggeringDate}
                  onChange={e=>setTriggering(e.target.value)}
                  style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#2563eb'}
                  onBlur={e=>e.target.style.borderColor='#333'}
                />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'12px', color:'#444', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600', marginBottom:'8px' }}>Case Number <span style={{ fontWeight:'400', textTransform:'none', color:'#444' }}>(optional)</span></label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={e=>setCaseNumber(e.target.value)}
                  placeholder="Case No. (optional)"
                  style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#2563eb'}
                  onBlur={e=>e.target.style.borderColor='#333'}
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ background: loading ? '#222' : '#2563eb', color: loading ? '#444' : '#fff', border:'none', borderRadius:'6px', fontSize:'15px', fontWeight:'600', padding:'13px 28px', cursor: loading ? 'not-allowed' : 'pointer', display:'inline-flex', alignItems:'center', gap:'8px' }}
              onMouseEnter={e=>{ if (!loading) e.currentTarget.style.background='#1d4ed8' }}
              onMouseLeave={e=>{ if (!loading) e.currentTarget.style.background='#2563eb' }}
            >
              {loading ? (
                <>
                  <span style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                  Calculating...
                </>
              ) : '⏰ Calculate Deadlines'}
            </button>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div style={{ marginTop:'24px' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background:'#111', border:'1px solid #222', padding:'28px', marginBottom:'12px' }}>
                  <div style={{ height:'18px', background:'#1a1a1a', borderRadius:'2px', marginBottom:'12px', width:'55%', animation:'pulse 1.4s ease infinite' }} />
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

              {/* Header row */}
              <div style={{ background:'#111', border:'1px solid #222', padding:'24px', marginBottom:'16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'16px' }}>
                  <div>
                    <div style={{ fontFamily:SERIF, fontSize:'20px', fontWeight:'700', color:'#fff', marginBottom:'4px' }}>{result.jurisdiction} — {result.caseType}</div>
                    {result.triggeringEvent && <div style={{ fontSize:'13px', color:'#444' }}>Triggering event: <span style={{ color:'#888' }}>{result.triggeringEvent}</span></div>}
                  </div>
                  {/* Save/Share/Print + ICS */}
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
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
                    {result.deadlines?.length > 0 && (
                      <button
                        onClick={() => exportToICS(result.deadlines, result.caseType ?? caseType)}
                        style={{ background:'#2563eb', border:'none', color:'#fff', borderRadius:'6px', padding:'8px 14px', fontSize:'13px', fontWeight:'600', cursor:'pointer', transition:'background 0.15s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#1d4ed8'}
                        onMouseLeave={e=>e.currentTarget.style.background='#2563eb'}
                      >📅 Export .ics</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Deadline cards */}
              {result.deadlines?.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'24px' }}>
                  {result.deadlines.map((d, i) => {
                    const col = criticalityColor(d.criticality)
                    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(d.name)}&dates=${d.date.replace(/-/g,'')}/${d.date.replace(/-/g,'')}&details=${encodeURIComponent(d.description)}`
                    return (
                      <div key={i} style={{ background:'#111', border:'1px solid #222', borderLeft:`3px solid ${col}`, padding:'20px 24px', animation:'slideUp 0.2s ease', animationDelay:`${i * 40}ms` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'16px', flexWrap:'wrap' }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:'700', color:col, marginBottom:'4px' }}>{d.date}</div>
                            <div style={{ fontSize:'16px', fontWeight:'700', color:'#fff', marginBottom:'6px' }}>{d.name}</div>
                            {d.rule && <div style={{ fontSize:'12px', fontFamily:MONO, color:'#444', marginBottom:'8px' }}>{d.rule}</div>}
                            {d.description && <p style={{ margin:'0 0 6px', fontSize:'14px', color:'#888', lineHeight:1.6 }}>{d.description}</p>}
                            {d.notes && <p style={{ margin:0, fontSize:'13px', color:'#444', fontStyle:'italic' }}>{d.notes}</p>}
                          </div>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px', flexShrink:0 }}>
                            <span style={{ padding:'3px 10px', fontSize:'11px', fontWeight:'700', letterSpacing:'0.06em', textTransform:'uppercase', background:`${col}18`, color:col, border:`1px solid ${col}30`, borderRadius:'4px' }}>
                              {d.criticality ?? 'Standard'}
                            </span>
                            <span style={{ fontSize:'12px', color:'#444', fontFamily:MONO }}>+{d.daysFromTrigger}d</span>
                            <a href={calUrl} target="_blank" rel="noopener noreferrer" style={{ padding:'5px 10px', fontSize:'12px', color:'#888', border:'1px solid #333', textDecoration:'none', borderRadius:'4px', whiteSpace:'nowrap', transition:'all 0.15s' }}
                              onMouseEnter={e=>{e.currentTarget.style.borderColor='#2563eb';e.currentTarget.style.color='#2563eb'}}
                              onMouseLeave={e=>{e.currentTarget.style.borderColor='#333';e.currentTarget.style.color='#888'}}
                            >+ Google Cal</a>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Important notes */}
              {result.importantNotes?.length > 0 && (
                <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.25)', padding:'24px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'12px', color:'#f59e0b', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'12px' }}>⚠ Important Notes</div>
                  <ul style={{ margin:0, padding:'0 0 0 18px', display:'flex', flexDirection:'column', gap:'8px' }}>
                    {result.importantNotes.map((n, i) => (
                      <li key={i} style={{ fontSize:'14px', color:'#888', lineHeight:1.6 }}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              {result.disclaimer && (
                <p style={{ fontSize:'13px', color:'#444', lineHeight:1.6, fontStyle:'italic', margin:0 }}>{result.disclaimer}</p>
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
          .tl-form-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:0.3 } 50% { opacity:0.7 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        ::selection { background: rgba(37,99,235,0.4); color: #fff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        input::placeholder { color: #444; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }
        select option { background: #111; color: #fff; }
        body { margin: 0; }
      `}</style>
    </div>
  )
}
