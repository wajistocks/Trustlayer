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

const SENDER_TYPES = [
  { value:'debt-collector', label:'Debt Collector' },
  { value:'landlord', label:'Landlord' },
  { value:'employer', label:'Employer' },
  { value:'opposing-counsel', label:'Opposing Counsel' },
  { value:'government-agency', label:'Government Agency' },
  { value:'business-partner', label:'Business Partner' },
  { value:'other', label:'Other' },
]

function urgencyStyle(u) {
  if (!u) return { color: C.textSecondary, bg: `${C.textSecondary}15`, border: `${C.textSecondary}25` }
  if (u === 'high') return { color: C.danger, bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' }
  if (u === 'medium') return { color: C.caution, bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' }
  return { color: C.verified, bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)' }
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
          Copy your response letter, print it, and keep a copy before sending.
        </p>
      </div>

      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'10px', padding:'18px' }}>
        <h3 style={{ margin:'0 0 12px', fontSize:'12px', fontWeight:'700', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase' }}>Tips</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {[
            { icon:'✉', tip:'Always send legal responses via certified mail — keep the receipt.' },
            { icon:'⚖', tip:'Never ignore a legal letter. Even a "cease and desist" requires a response.' },
            { icon:'📋', tip:'Have an attorney review before sending if significant money or rights are involved.' },
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
      <div style={{ height:'14px', width:'30%', background:C.border, borderRadius:'4px', marginBottom:'14px' }} />
      <div style={{ height:'13px', width:'100%', background:C.border, borderRadius:'4px', marginBottom:'8px' }} />
      <div style={{ height:'13px', width:'85%', background:C.border, borderRadius:'4px', marginBottom:'8px' }} />
      <div style={{ height:'13px', width:'65%', background:C.border, borderRadius:'4px' }} />
    </div>
  )
}

export default function LetterResponsePage() {
  const [letter, setLetter]           = useState('')
  const [senderType, setSenderType]   = useState('debt-collector')
  const [state, setState]             = useState('California')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [result, setResult]           = useState(null)
  const [saved, setSaved]             = useState(false)
  const [copied, setCopied]           = useState(false)

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

  const selectStyle = {
    background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:'8px',
    color:C.textSecondary, fontSize:'13px', padding:'10px 12px', cursor:'pointer',
    outline:'none', width:'100%', transition:'border-color 0.2s',
  }

  const us = result ? urgencyStyle(result.urgency) : null

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
        <span style={{ color:C.textSecondary }}>Letter Response Generator</span>
      </div>

      {/* Hero */}
      <div style={{ textAlign:'center', paddingTop:'52px', paddingBottom:'40px', paddingLeft:'40px', paddingRight:'40px', background:`linear-gradient(180deg, rgba(212,168,83,0.04) 0%, transparent 100%)`, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:C.goldGlow2, border:`1px solid ${C.borderGold}`, borderRadius:'20px', padding:'5px 14px', marginBottom:'20px' }}>
          <span style={{ color:C.gold, fontSize:'11px' }}>✉</span>
          <span style={{ fontSize:'11px', color:C.gold, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:'600' }}>Letter Response Generator</span>
        </div>
        <h1 style={{ fontFamily:SERIF, fontSize:'clamp(28px, 4vw, 48px)', fontWeight:'700', letterSpacing:'-0.01em', lineHeight:'1.15', margin:'0 0 14px', color:C.textPrimary }}>
          Respond To Any Legal Threat<br /><span style={{ color:C.gold }}>With Confidence</span>
        </h1>
        <p style={{ fontSize:'16px', color:C.textSecondary, margin:'0 auto', maxWidth:'520px', lineHeight:'1.6', fontFamily:SERIF, fontStyle:'italic' }}>
          Understand what they're claiming, assert your rights, and get a ready-to-send response letter.
        </p>
      </div>

      {/* Main grid */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'32px 40px', display:'grid', gridTemplateColumns:'1fr 260px', gap:'28px', alignItems:'start' }}>

        {/* Left column */}
        <div>
          {/* Form */}
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'12px', padding:'28px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
              <label style={{ fontSize:'13px', color:C.textSecondary, fontWeight:'600', letterSpacing:'0.04em' }}>The Letter You Received</label>
              <span style={{ fontSize:'11px', color:C.textMuted, fontFamily:MONO }}>{letter.length.toLocaleString()} chars</span>
            </div>
            <textarea
              value={letter}
              onChange={e => setLetter(e.target.value)}
              placeholder="Paste the threatening letter you received here..."
              style={{ width:'100%', minHeight:'220px', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:'8px', color:C.textPrimary, fontSize:'13px', fontFamily:SANS, padding:'14px', resize:'vertical', outline:'none', lineHeight:'1.65', boxSizing:'border-box', transition:'border-color 0.2s', marginBottom:'16px' }}
              onFocus={e => e.target.style.borderColor=C.borderGold}
              onBlur={e => e.target.style.borderColor=C.border}
            />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px' }}>
              <div>
                <label style={{ display:'block', fontSize:'11px', color:C.textMuted, letterSpacing:'0.07em', textTransform:'uppercase', fontWeight:'700', marginBottom:'7px' }}>Sender Type</label>
                <select value={senderType} onChange={e=>setSenderType(e.target.value)} style={selectStyle} onFocus={e=>e.target.style.borderColor=C.borderGold} onBlur={e=>e.target.style.borderColor=C.border}>
                  {SENDER_TYPES.map(st => <option key={st.value} value={st.value} style={{ background:C.bgCard }}>{st.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'11px', color:C.textMuted, letterSpacing:'0.07em', textTransform:'uppercase', fontWeight:'700', marginBottom:'7px' }}>Your State</label>
                <select value={state} onChange={e=>setState(e.target.value)} style={selectStyle} onFocus={e=>e.target.style.borderColor=C.borderGold} onBlur={e=>e.target.style.borderColor=C.border}>
                  {STATES.filter(s => s !== 'Federal').map(s => <option key={s} value={s} style={{ background:C.bgCard }}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <button
                onClick={handleSubmit}
                disabled={!letter.trim() || loading}
                style={{ padding:'10px 24px', borderRadius:'8px', border:'none', background: (!letter.trim() || loading) ? C.border : `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, color: (!letter.trim() || loading) ? C.textMuted : '#0a0800', fontSize:'13px', fontWeight:'700', letterSpacing:'0.04em', cursor: (!letter.trim() || loading) ? 'not-allowed' : 'pointer', transition:'all 0.2s', display:'inline-flex', alignItems:'center', gap:'8px', boxShadow: (!letter.trim() || loading) ? 'none' : `0 4px 16px rgba(212,168,83,0.25)` }}
              >
                {loading ? (
                  <>
                    <span style={{ width:'13px', height:'13px', border:`2px solid #0a0800`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                    Analyzing...
                  </>
                ) : '✉ Analyze & Generate Response'}
              </button>
              {letter && (
                <button onClick={() => { setLetter(''); setResult(null); setError(null) }} style={{ padding:'10px 14px', borderRadius:'8px', border:`1px solid ${C.border}`, background:'transparent', color:C.textMuted, fontSize:'13px', cursor:'pointer', transition:'all 0.2s' }} onMouseEnter={e=>e.currentTarget.style.color=C.danger} onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}>
                  Clear
                </button>
              )}
            </div>
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

              {/* Attorney review warning */}
              <div style={{ background:'rgba(245,158,11,0.08)', border:`1px solid rgba(245,158,11,0.3)`, borderRadius:'10px', padding:'16px 20px', marginBottom:'20px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
                <span style={{ fontSize:'20px', flexShrink:0 }}>⚠</span>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:'700', color:C.caution, marginBottom:'4px' }}>Attorney Review Recommended</div>
                  <p style={{ margin:0, fontSize:'12px', color:C.textSecondary, lineHeight:'1.6' }}>
                    For matters involving significant money, employment, housing, or your legal rights, have a licensed attorney review this response before sending.
                  </p>
                </div>
              </div>

              {/* Empathy message if high urgency */}
              {result.urgency === 'high' && (
                <div style={{ background:`rgba(212,168,83,0.06)`, border:`1px solid ${C.borderGold}`, borderRadius:'10px', padding:'14px 18px', marginBottom:'20px', display:'flex', gap:'10px', alignItems:'center' }}>
                  <span style={{ fontSize:'18px' }}>💙</span>
                  <p style={{ margin:0, fontSize:'13px', color:C.textSecondary, lineHeight:'1.6', fontStyle:'italic' }}>
                    We know receiving this letter is stressful. You have rights, and this response will help protect them.
                  </p>
                </div>
              )}

              {/* Save/Share row */}
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px' }}>
                <button onClick={handleSave} style={{ padding:'8px 16px', borderRadius:'6px', border:`1px solid ${C.borderGold}`, background:C.goldGlow2, color:C.gold, fontSize:'12px', cursor:'pointer' }}>
                  {saved ? '✓ Results Saved!' : '💾 Save Results'}
                </button>
                <button onClick={() => navigator.clipboard?.writeText(window.location.href)} style={{ padding:'8px 16px', borderRadius:'6px', border:`1px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontSize:'12px', cursor:'pointer' }} onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.borderGold; e.currentTarget.style.color=C.gold }} onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary }}>🔗 Share</button>
                <button onClick={() => window.print()} style={{ padding:'8px 16px', borderRadius:'6px', border:`1px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontSize:'12px', cursor:'pointer' }} onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.borderGold; e.currentTarget.style.color=C.gold }} onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary }}>🖨 Print</button>
              </div>

              {/* Urgency indicator */}
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
                <span style={{ fontSize:'12px', color:C.textMuted, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:'600' }}>Urgency</span>
                {us && (
                  <span style={{ padding:'4px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:'700', background:us.bg, color:us.color, border:`1px solid ${us.border}`, textTransform:'capitalize' }}>
                    {result.urgency ?? 'Unknown'}
                  </span>
                )}
              </div>

              {/* Sender analysis */}
              {result.senderAnalysis && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'10px', padding:'18px 22px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'8px' }}>Sender Analysis</div>
                  <p style={{ margin:0, fontSize:'13px', color:C.textSecondary, lineHeight:'1.7' }}>{result.senderAnalysis}</p>
                </div>
              )}

              {/* What they're claiming */}
              {result.claims?.length > 0 && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'10px', padding:'18px 22px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'12px' }}>What They&apos;re Claiming</div>
                  <ol style={{ margin:0, padding:'0 0 0 18px', display:'flex', flexDirection:'column', gap:'8px' }}>
                    {result.claims.map((c, i) => (
                      <li key={i} style={{ fontSize:'13px', color:C.textSecondary, lineHeight:'1.6' }}>{c}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Legal accuracy */}
              {result.legalAccuracy && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'10px', padding:'18px 22px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'8px' }}>Legal Accuracy of Their Claims</div>
                  <p style={{ margin:0, fontSize:'13px', color:C.textSecondary, lineHeight:'1.7' }}>{result.legalAccuracy}</p>
                </div>
              )}

              {/* Your legal rights */}
              {result.yourRights?.length > 0 && (
                <div style={{ background:'rgba(34,197,94,0.04)', border:`1px solid rgba(34,197,94,0.18)`, borderRadius:'10px', padding:'18px 22px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:C.verified, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'12px' }}>Your Legal Rights</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {result.yourRights.map((r, i) => (
                      <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                        <span style={{ color:C.verified, fontSize:'14px', flexShrink:0, marginTop:'1px' }}>✓</span>
                        <span style={{ fontSize:'13px', color:C.textSecondary, lineHeight:'1.6' }}>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Protective laws */}
              {result.protectiveLaws?.length > 0 && (
                <div style={{ marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'12px' }}>Laws That Protect You</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {result.protectiveLaws.map((law, i) => (
                      <div key={i} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'8px', padding:'14px 16px', transition:'border-color 0.2s' }} onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderGold} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                        <div style={{ display:'flex', gap:'10px', alignItems:'flex-start', flexWrap:'wrap' }}>
                          <div style={{ fontFamily:SERIF, fontSize:'15px', fontWeight:'700', color:C.gold }}>{law.name}</div>
                          {law.citation && <span style={{ fontSize:'11px', fontFamily:MONO, color:C.textMuted, background:C.bgInput, padding:'2px 8px', borderRadius:'4px', border:`1px solid ${C.border}` }}>{law.citation}</span>}
                        </div>
                        {law.howItHelps && <p style={{ margin:'6px 0 0', fontSize:'12px', color:C.textSecondary, lineHeight:'1.6' }}>{law.howItHelps}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Response letter — the main feature */}
              {result.responseLetter && (
                <div style={{ marginBottom:'20px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', flexWrap:'wrap', gap:'8px' }}>
                    <div style={{ fontFamily:SERIF, fontSize:'20px', fontWeight:'700', color:C.textPrimary }}>✉ Your Response Letter</div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button
                        onClick={handleCopyLetter}
                        style={{ padding:'8px 16px', borderRadius:'6px', border:`1px solid ${copied ? 'rgba(34,197,94,0.4)' : C.borderGold}`, background: copied ? 'rgba(34,197,94,0.08)' : C.goldGlow2, color: copied ? C.verified : C.gold, fontSize:'12px', cursor:'pointer', transition:'all 0.2s', fontWeight:'600' }}
                      >
                        {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
                      </button>
                      <button onClick={() => window.print()} style={{ padding:'8px 14px', borderRadius:'6px', border:`1px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontSize:'12px', cursor:'pointer' }}>🖨 Print</button>
                    </div>
                  </div>
                  <div style={{ background:C.bgInput, border:`1px solid ${C.borderGold}`, borderRadius:'10px', padding:'28px 32px' }}>
                    <pre style={{ margin:0, fontFamily:MONO, fontSize:'13px', color:C.textPrimary, lineHeight:'1.85', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                      {result.responseLetter}
                    </pre>
                  </div>
                </div>
              )}

              {/* Deadlines */}
              {result.deadlines?.length > 0 && (
                <div style={{ background:'rgba(239,68,68,0.06)', border:`1px solid rgba(239,68,68,0.2)`, borderRadius:'10px', padding:'18px 22px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:C.danger, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'12px' }}>⏰ Deadlines &amp; Time-Sensitive Actions</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {result.deadlines.map((d, i) => (
                      <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                        <span style={{ color:C.danger, fontSize:'14px', flexShrink:0, marginTop:'2px' }}>!</span>
                        <span style={{ fontSize:'13px', color:C.textSecondary, lineHeight:'1.6' }}>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result.warnings?.length > 0 && (
                <div style={{ background:'rgba(239,68,68,0.06)', border:`1px solid rgba(239,68,68,0.2)`, borderRadius:'10px', padding:'18px 22px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:C.danger, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'12px' }}>🚫 Do NOT Do These Things</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {result.warnings.map((w, i) => (
                      <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                        <span style={{ color:C.danger, fontSize:'14px', flexShrink:0, marginTop:'1px' }}>✕</span>
                        <span style={{ fontSize:'13px', color:C.textSecondary, lineHeight:'1.6' }}>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              {result.disclaimer && (
                <p style={{ fontSize:'11px', color:C.textMuted, lineHeight:'1.6', fontStyle:'italic', margin:'0 0 8px' }}>{result.disclaimer}</p>
              )}
            </div>
          )}

          {/* Upsell footer */}
          <div style={{ marginTop:'40px', background:C.bgCard, border:`1px solid ${C.borderGold}`, borderRadius:'12px', padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <div style={{ fontFamily:SERIF, fontSize:'17px', fontWeight:'600', color:C.textPrimary, marginBottom:'4px' }}>Want unlimited access to all tools?</div>
              <div style={{ fontSize:'13px', color:C.textSecondary }}>Upgrade to Pro for $49/month — unlimited responses, all 7 tools, priority support.</div>
            </div>
            <Link href="/request-access" style={{ padding:'10px 24px', borderRadius:'8px', background:`linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, color:'#0a0800', fontSize:'13px', fontWeight:'700', textDecoration:'none', letterSpacing:'0.04em', whiteSpace:'nowrap', boxShadow:`0 4px 16px rgba(212,168,83,0.25)` }}>
              Upgrade to Pro →
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <ToolSidebar currentId="letter-response" />
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes barFill { from { width: 0%; } to { width: var(--w); } }
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
