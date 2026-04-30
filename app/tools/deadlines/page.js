'use client'

import { useState } from 'react'
import Link from 'next/link'

const C = { bg:'#05070d', bgCard:'#0a0d1a', bgInput:'#080b14', border:'#1a2035', borderGold:'rgba(212,168,83,0.25)', gold:'#d4a853', goldDim:'#a07835', goldGlow:'rgba(212,168,83,0.12)', goldGlow2:'rgba(212,168,83,0.06)', textPrimary:'#e8e0d0', textSecondary:'#8a8070', textMuted:'#3a3530', verified:'#22c55e', caution:'#f59e0b', danger:'#ef4444', blue:'#3b82f6', purple:'#8b5cf6' }
const SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, "Times New Roman", serif'
const SANS  = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const MONO  = '"SF Mono", "Fira Code", "Courier New", monospace'

const TOOLS = [
  { id:'plain-english', path:'/tools/plain-english', name:'Plain English Translator', icon:'📖' },
  { id:'deadlines', path:'/tools/deadlines', name:'Deadline Calculator', icon:'⏰' },
  { id:'red-flags', path:'/tools/red-flags', name:'Contract Red Flag Scanner', icon:'🔍' },
  { id:'letter-response', path:'/tools/letter-response', name:'Letter Response Generator', icon:'✉' },
  { id:'statute-of-limitations', path:'/tools/statute-of-limitations', name:'Statute of Limitations', icon:'⏳' },
  { id:'ethics', path:'/tools/ethics', name:'Ethics Checker', icon:'⚖' },
  { id:'pro-se', path:'/tools/pro-se', name:'Pro Se Assistant', icon:'🏛', free:true },
]

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
  if (lc === 'critical') return C.danger
  if (lc === 'warning' || lc === 'important') return C.caution
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

function ToolSidebar({ currentId }) {
  const related = TOOLS.filter(t => t.id !== currentId)
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'10px', padding:'18px' }}>
        <h3 style={{ margin:'0 0 14px', fontSize:'12px', fontWeight:'700', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase' }}>Other Tools</h3>
        {related.map(tool => (
          <Link key={tool.id} href={tool.path} style={{ display:'flex', alignItems:'center', gap:'9px', padding:'8px 10px', borderRadius:'6px', textDecoration:'none', transition:'background 0.15s', marginBottom:'2px' }}
            onMouseEnter={e => e.currentTarget.style.background=C.goldGlow2}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <span style={{ fontSize:'14px' }}>{tool.icon}</span>
            <span style={{ fontSize:'12px', color:C.textSecondary }}>{tool.name}</span>
            {tool.free && <span style={{ marginLeft:'auto', fontSize:'9px', color:C.verified, border:'1px solid rgba(34,197,94,0.3)', borderRadius:'3px', padding:'1px 5px' }}>FREE</span>}
          </Link>
        ))}
      </div>

      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'10px', padding:'18px' }}>
        <h3 style={{ margin:'0 0 12px', fontSize:'12px', fontWeight:'700', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase' }}>Save &amp; Share</h3>
        <p style={{ margin:0, fontSize:'11px', color:C.textMuted, lineHeight:'1.6' }}>
          Export deadlines to your calendar or share results with your legal team.
        </p>
      </div>

      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'10px', padding:'18px' }}>
        <h3 style={{ margin:'0 0 12px', fontSize:'12px', fontWeight:'700', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase' }}>Tips</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {[
            { icon:'⏰', tip:'Always verify deadlines with a licensed attorney — rules change and local variations exist.' },
            { icon:'📅', tip:'Export to .ics to add all deadlines to Google, Apple, or Outlook calendar at once.' },
            { icon:'⚠', tip:'Critical deadlines are jurisdictional — missing them can end your case.' },
          ].map((t, i) => (
            <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', paddingBottom:'10px', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
              <span style={{ fontSize:'13px', flexShrink:0, marginTop:'1px' }}>{t.icon}</span>
              <p style={{ margin:0, fontSize:'11px', color:C.textMuted, lineHeight:'1.5' }}>{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'10px', padding:'22px 24px', animation:'pulse 1.6s ease-in-out infinite' }}>
      <div style={{ height:'14px', width:'25%', background:C.border, borderRadius:'4px', marginBottom:'14px' }} />
      <div style={{ height:'18px', width:'55%', background:C.border, borderRadius:'4px', marginBottom:'10px' }} />
      <div style={{ height:'13px', width:'80%', background:C.border, borderRadius:'4px', marginBottom:'6px' }} />
      <div style={{ height:'13px', width:'60%', background:C.border, borderRadius:'4px' }} />
    </div>
  )
}

export default function DeadlinesPage() {
  const [state, setState]             = useState('Federal')
  const [caseType, setCaseType]       = useState('civil')
  const [triggeringDate, setTriggering] = useState(TODAY)
  const [caseNumber, setCaseNumber]   = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [result, setResult]           = useState(null)
  const [saved, setSaved]             = useState(false)

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

  const selectStyle = {
    background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:'8px',
    color:C.textSecondary, fontSize:'13px', padding:'10px 12px', cursor:'pointer',
    outline:'none', width:'100%', transition:'border-color 0.2s',
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:SANS, color:C.textPrimary }}>

      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', height:'68px', background:'rgba(5,7,13,0.92)', backdropFilter:'blur(16px)', borderBottom:`1px solid ${C.border}` }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:'12px', textDecoration:'none' }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:`linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 16px ${C.goldGlow}` }}>
            <span style={{ fontSize:'18px', fontFamily:SERIF, fontWeight:'700', color:'#0a0800' }}>T</span>
          </div>
          <span style={{ fontSize:'20px', fontFamily:SERIF, fontWeight:'700', letterSpacing:'0.02em', color:C.textPrimary }}>
            Trust<span style={{ color:C.gold }}>Layer</span>
          </span>
        </Link>
        <div style={{ display:'flex', gap:'28px', alignItems:'center' }}>
          <Link href="/" style={{ fontSize:'13px', color:C.textSecondary, textDecoration:'none', letterSpacing:'0.04em', transition:'color 0.2s' }} onMouseEnter={e=>e.target.style.color=C.gold} onMouseLeave={e=>e.target.style.color=C.textSecondary}>Verify</Link>
          <Link href="/research" style={{ fontSize:'13px', color:C.textSecondary, textDecoration:'none', letterSpacing:'0.04em', transition:'color 0.2s' }} onMouseEnter={e=>e.target.style.color=C.gold} onMouseLeave={e=>e.target.style.color=C.textSecondary}>Research</Link>
          <Link href="/tools" style={{ fontSize:'13px', color:C.gold, textDecoration:'none', letterSpacing:'0.04em', borderBottom:`1px solid ${C.gold}`, paddingBottom:'2px' }}>Tools</Link>
          <Link href="/enterprise" style={{ fontSize:'13px', color:C.textSecondary, textDecoration:'none', letterSpacing:'0.04em', transition:'color 0.2s' }} onMouseEnter={e=>e.target.style.color=C.gold} onMouseLeave={e=>e.target.style.color=C.textSecondary}>Enterprise</Link>
          <Link href="/request-access" style={{ padding:'8px 20px', borderRadius:'6px', border:`1px solid ${C.borderGold}`, background:C.goldGlow2, color:C.gold, fontSize:'13px', textDecoration:'none', display:'inline-block', letterSpacing:'0.04em', transition:'all 0.2s' }} onMouseEnter={e=>{ e.currentTarget.style.background=C.goldGlow; e.currentTarget.style.borderColor=C.gold }} onMouseLeave={e=>{ e.currentTarget.style.background=C.goldGlow2; e.currentTarget.style.borderColor=C.borderGold }}>Request Access</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div style={{ padding:'10px 40px', fontSize:'12px', color:C.textMuted, display:'flex', gap:'6px', alignItems:'center' }}>
        <Link href="/" style={{ color:C.textMuted, textDecoration:'none' }} onMouseEnter={e=>e.target.style.color=C.gold} onMouseLeave={e=>e.target.style.color=C.textMuted}>TrustLayer</Link>
        <span>›</span>
        <Link href="/tools" style={{ color:C.textMuted, textDecoration:'none' }} onMouseEnter={e=>e.target.style.color=C.gold} onMouseLeave={e=>e.target.style.color=C.textMuted}>Tools</Link>
        <span>›</span>
        <span style={{ color:C.textSecondary }}>Deadline Calculator</span>
      </div>

      {/* Hero */}
      <div style={{ textAlign:'center', paddingTop:'52px', paddingBottom:'40px', paddingLeft:'40px', paddingRight:'40px', background:`linear-gradient(180deg, rgba(212,168,83,0.04) 0%, transparent 100%)`, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:C.goldGlow2, border:`1px solid ${C.borderGold}`, borderRadius:'20px', padding:'5px 14px', marginBottom:'20px' }}>
          <span style={{ color:C.gold, fontSize:'11px' }}>⏰</span>
          <span style={{ fontSize:'11px', color:C.gold, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:'600' }}>Deadline Calculator</span>
        </div>
        <h1 style={{ fontFamily:SERIF, fontSize:'clamp(28px, 4vw, 48px)', fontWeight:'700', letterSpacing:'-0.01em', lineHeight:'1.15', margin:'0 0 14px', color:C.textPrimary }}>
          Never Miss A Filing<br /><span style={{ color:C.gold }}>Deadline Again</span>
        </h1>
        <p style={{ fontSize:'16px', color:C.textSecondary, margin:'0 auto', maxWidth:'520px', lineHeight:'1.6', fontFamily:SERIF, fontStyle:'italic' }}>
          Calculate every critical deadline for your case — with calendar export and jurisdiction-specific rules.
        </p>
      </div>

      {/* Main grid */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'32px 40px', display:'grid', gridTemplateColumns:'1fr 260px', gap:'28px', alignItems:'start' }}>

        {/* Left column */}
        <div>
          {/* Form */}
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'12px', padding:'28px', marginBottom:'0' }}>
            <h2 style={{ fontFamily:SERIF, fontSize:'17px', fontWeight:'600', color:C.textPrimary, margin:'0 0 20px' }}>Case Details</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              <div>
                <label style={{ display:'block', fontSize:'11px', color:C.textMuted, letterSpacing:'0.07em', textTransform:'uppercase', fontWeight:'700', marginBottom:'7px' }}>Jurisdiction</label>
                <select value={state} onChange={e=>setState(e.target.value)} style={selectStyle} onFocus={e=>e.target.style.borderColor=C.borderGold} onBlur={e=>e.target.style.borderColor=C.border}>
                  {STATES.map(s => <option key={s} value={s} style={{ background:C.bgCard }}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'11px', color:C.textMuted, letterSpacing:'0.07em', textTransform:'uppercase', fontWeight:'700', marginBottom:'7px' }}>Case Type</label>
                <select value={caseType} onChange={e=>setCaseType(e.target.value)} style={selectStyle} onFocus={e=>e.target.style.borderColor=C.borderGold} onBlur={e=>e.target.style.borderColor=C.border}>
                  {CASE_TYPES.map(ct => <option key={ct.value} value={ct.value} style={{ background:C.bgCard }}>{ct.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px' }}>
              <div>
                <label style={{ display:'block', fontSize:'11px', color:C.textMuted, letterSpacing:'0.07em', textTransform:'uppercase', fontWeight:'700', marginBottom:'7px' }}>Triggering Event Date</label>
                <input
                  type="date"
                  value={triggeringDate}
                  onChange={e=>setTriggering(e.target.value)}
                  style={{ ...selectStyle, color:C.textPrimary }}
                  onFocus={e=>e.target.style.borderColor=C.borderGold}
                  onBlur={e=>e.target.style.borderColor=C.border}
                />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'11px', color:C.textMuted, letterSpacing:'0.07em', textTransform:'uppercase', fontWeight:'700', marginBottom:'7px' }}>Case Number <span style={{ color:C.textMuted, fontWeight:'400' }}>(optional)</span></label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={e=>setCaseNumber(e.target.value)}
                  placeholder="Case No. (optional)"
                  style={{ ...selectStyle, color:C.textPrimary }}
                  onFocus={e=>e.target.style.borderColor=C.borderGold}
                  onBlur={e=>e.target.style.borderColor=C.border}
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ padding:'11px 28px', borderRadius:'8px', border:'none', background: loading ? C.border : `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, color: loading ? C.textMuted : '#0a0800', fontSize:'13px', fontWeight:'700', letterSpacing:'0.04em', cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.2s', display:'inline-flex', alignItems:'center', gap:'8px', boxShadow: loading ? 'none' : `0 4px 16px rgba(212,168,83,0.25)` }}
            >
              {loading ? (
                <>
                  <span style={{ width:'13px', height:'13px', border:`2px solid #0a0800`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                  Calculating...
                </>
              ) : '⏰ Calculate Deadlines'}
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ marginTop:'24px', display:'flex', flexDirection:'column', gap:'14px' }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop:'24px', background:'rgba(239,68,68,0.08)', border:`1px solid rgba(239,68,68,0.2)`, borderRadius:'10px', padding:'16px 20px', color:C.danger, fontSize:'13px' }}>
              ⚠ {error}
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div style={{ marginTop:'28px', animation:'slideUp 0.35s ease both' }}>

              {/* Header */}
              <div style={{ background:C.bgCard, border:`1px solid ${C.borderGold}`, borderRadius:'10px', padding:'18px 22px', marginBottom:'16px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px' }}>
                <div>
                  <div style={{ fontFamily:SERIF, fontSize:'20px', fontWeight:'700', color:C.textPrimary, marginBottom:'4px' }}>{result.jurisdiction} — {result.caseType}</div>
                  {result.triggeringEvent && <div style={{ fontSize:'12px', color:C.textMuted }}>Triggering event: <span style={{ color:C.textSecondary }}>{result.triggeringEvent}</span></div>}
                </div>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  <button onClick={handleSave} style={{ padding:'7px 14px', borderRadius:'6px', border:`1px solid ${C.borderGold}`, background:C.goldGlow2, color:C.gold, fontSize:'11px', cursor:'pointer', transition:'all 0.2s' }}>
                    {saved ? '✓ Saved!' : '💾 Save Results'}
                  </button>
                  <button onClick={() => navigator.clipboard?.writeText(window.location.href)} style={{ padding:'7px 14px', borderRadius:'6px', border:`1px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontSize:'11px', cursor:'pointer' }}>🔗 Share</button>
                  <button onClick={() => window.print()} style={{ padding:'7px 14px', borderRadius:'6px', border:`1px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontSize:'11px', cursor:'pointer' }}>🖨 Print</button>
                  {result.deadlines?.length > 0 && (
                    <button onClick={() => exportToICS(result.deadlines, result.caseType ?? caseType)} style={{ padding:'7px 14px', borderRadius:'6px', border:`1px solid rgba(59,130,246,0.3)`, background:'rgba(59,130,246,0.08)', color:C.blue, fontSize:'11px', cursor:'pointer' }}>
                      📅 Export .ics
                    </button>
                  )}
                </div>
              </div>

              {/* Deadline timeline */}
              {result.deadlines?.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'24px' }}>
                  {result.deadlines.map((d, i) => {
                    const col = criticalityColor(d.criticality)
                    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(d.name)}&dates=${d.date.replace(/-/g,'')}/${d.date.replace(/-/g,'')}&details=${encodeURIComponent(d.description)}`
                    return (
                      <div key={i} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderLeft:`3px solid ${col}`, borderRadius:'10px', padding:'18px 20px', animation:'slideUp 0.3s ease both', animationDelay:`${i * 50}ms`, transition:'border-color 0.2s' }} onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderGold} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px', flexWrap:'wrap' }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontFamily:SERIF, fontSize:'20px', fontWeight:'700', color:col, marginBottom:'4px' }}>{d.date}</div>
                            <div style={{ fontSize:'14px', fontWeight:'700', color:C.textPrimary, marginBottom:'4px' }}>{d.name}</div>
                            {d.rule && <div style={{ fontSize:'11px', fontFamily:MONO, color:C.gold, marginBottom:'6px' }}>{d.rule}</div>}
                            {d.description && <p style={{ margin:'0 0 8px', fontSize:'12px', color:C.textSecondary, lineHeight:'1.6' }}>{d.description}</p>}
                            {d.notes && <p style={{ margin:0, fontSize:'11px', color:C.textMuted, fontStyle:'italic' }}>{d.notes}</p>}
                          </div>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px', flexShrink:0 }}>
                            <span style={{ padding:'3px 10px', borderRadius:'12px', fontSize:'10px', fontWeight:'700', letterSpacing:'0.06em', textTransform:'uppercase', background:`${col}18`, color:col, border:`1px solid ${col}30` }}>
                              {d.criticality ?? 'Standard'}
                            </span>
                            <span style={{ fontSize:'11px', color:C.textMuted, fontFamily:MONO }}>+{d.daysFromTrigger}d</span>
                            <a href={calUrl} target="_blank" rel="noopener noreferrer" style={{ padding:'5px 10px', borderRadius:'5px', fontSize:'10px', color:C.blue, border:`1px solid rgba(59,130,246,0.25)`, background:'rgba(59,130,246,0.06)', textDecoration:'none', whiteSpace:'nowrap' }}>
                              + Google Cal
                            </a>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Important notes */}
              {result.importantNotes?.length > 0 && (
                <div style={{ background:'rgba(245,158,11,0.06)', border:`1px solid rgba(245,158,11,0.2)`, borderRadius:'10px', padding:'16px 20px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:C.caution, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'10px' }}>⚠ Important Notes</div>
                  <ul style={{ margin:0, padding:'0 0 0 18px', display:'flex', flexDirection:'column', gap:'6px' }}>
                    {result.importantNotes.map((n, i) => (
                      <li key={i} style={{ fontSize:'12px', color:C.textSecondary, lineHeight:'1.6' }}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              {result.disclaimer && (
                <p style={{ fontSize:'11px', color:C.textMuted, lineHeight:'1.6', fontStyle:'italic', margin:0 }}>{result.disclaimer}</p>
              )}
            </div>
          )}

          {/* Upsell footer */}
          <div style={{ marginTop:'40px', background:C.bgCard, border:`1px solid ${C.borderGold}`, borderRadius:'12px', padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <div style={{ fontFamily:SERIF, fontSize:'17px', fontWeight:'600', color:C.textPrimary, marginBottom:'4px' }}>Want unlimited access to all tools?</div>
              <div style={{ fontSize:'13px', color:C.textSecondary }}>Upgrade to Pro for $49/month — unlimited deadline calculations, all 7 tools, priority support.</div>
            </div>
            <Link href="/request-access" style={{ padding:'10px 24px', borderRadius:'8px', background:`linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, color:'#0a0800', fontSize:'13px', fontWeight:'700', textDecoration:'none', letterSpacing:'0.04em', whiteSpace:'nowrap', boxShadow:`0 4px 16px rgba(212,168,83,0.25)` }}>
              Upgrade to Pro →
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <ToolSidebar currentId="deadlines" />
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes barFill { from { width: 0%; } to { width: var(--w); } }
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; }
        input::placeholder { color: #3a3530; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
        select option { background: #0a0d1a; color: #e8e0d0; }
        ::-webkit-scrollbar { width: 7px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>
    </div>
  )
}
