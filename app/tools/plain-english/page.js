'use client'

import { useState, useEffect } from 'react'
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

const SAMPLE_TEXT = `WHEREAS, the Disclosing Party desires to disclose certain Confidential Information (as defined herein) to the Receiving Party for the purpose of evaluating a potential business relationship (the "Permitted Purpose"), and the Receiving Party desires to receive such Confidential Information subject to the terms and conditions set forth herein; NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows: The Receiving Party shall hold all Confidential Information in strict confidence and shall not disclose any Confidential Information to any third party without the prior written consent of the Disclosing Party, except as expressly permitted herein or as required by applicable law.`

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
        <p style={{ margin:'0', fontSize:'11px', color:C.textMuted, lineHeight:'1.6' }}>
          After translating, use the Save / Share / Print buttons to keep a record or share with your attorney.
        </p>
      </div>

      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'10px', padding:'18px' }}>
        <h3 style={{ margin:'0 0 12px', fontSize:'12px', fontWeight:'700', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase' }}>Tips</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {[
            { icon:'📖', tip:'Works best on a single clause, paragraph, or short section at a time.' },
            { icon:'⚖', tip:'Grade levels are Flesch–Kincaid U.S. school grade equivalents.' },
            { icon:'📝', tip:'The glossary explains key legal terms found in your document.' },
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

function gradeColor(n) {
  if (n <= 7) return C.verified
  if (n <= 12) return C.caution
  return C.danger
}

export default function PlainEnglishPage() {
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [result, setResult]   = useState(null)
  const [saved, setSaved]     = useState(false)

  async function handleSubmit() {
    if (!input.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/tools/plain-english', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Translation failed')
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
        <span style={{ color:C.textSecondary }}>Plain English Translator</span>
      </div>

      {/* Hero */}
      <div style={{ textAlign:'center', paddingTop:'52px', paddingBottom:'40px', paddingLeft:'40px', paddingRight:'40px', background:`linear-gradient(180deg, rgba(212,168,83,0.04) 0%, transparent 100%)`, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:C.goldGlow2, border:`1px solid ${C.borderGold}`, borderRadius:'20px', padding:'5px 14px', marginBottom:'20px' }}>
          <span style={{ color:C.gold, fontSize:'11px' }}>📖</span>
          <span style={{ fontSize:'11px', color:C.gold, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:'600' }}>Plain English Translator</span>
        </div>
        <h1 style={{ fontFamily:SERIF, fontSize:'clamp(28px, 4vw, 48px)', fontWeight:'700', letterSpacing:'-0.01em', lineHeight:'1.15', margin:'0 0 14px', color:C.textPrimary }}>
          Understand Any Legal Document<br /><span style={{ color:C.gold }}>Instantly</span>
        </h1>
        <p style={{ fontSize:'16px', color:C.textSecondary, margin:'0 auto', maxWidth:'520px', lineHeight:'1.6', fontFamily:SERIF, fontStyle:'italic' }}>
          Paste any legal text and get a plain-language explanation, reading level analysis, and a glossary of legal terms.
        </p>
      </div>

      {/* Main grid */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'32px 40px', display:'grid', gridTemplateColumns:'1fr 260px', gap:'28px', alignItems:'start' }}>

        {/* Left column */}
        <div>
          {/* Form */}
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'12px', padding:'28px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
              <label style={{ fontSize:'13px', color:C.textSecondary, fontWeight:'600', letterSpacing:'0.04em' }}>Legal Text</label>
              <span style={{ fontSize:'11px', color:C.textMuted, fontFamily:MONO }}>{input.length.toLocaleString()} chars</span>
            </div>
            <div style={{ position:'relative' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Paste any legal document, contract, court filing, or statute here..."
                style={{ width:'100%', minHeight:'200px', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:'8px', color:C.textPrimary, fontSize:'13px', fontFamily:SANS, padding:'14px', resize:'vertical', outline:'none', lineHeight:'1.65', boxSizing:'border-box', transition:'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor=C.borderGold}
                onBlur={e => e.target.style.borderColor=C.border}
              />
            </div>
            <div style={{ display:'flex', gap:'10px', marginTop:'14px', flexWrap:'wrap' }}>
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || loading}
                style={{ padding:'10px 24px', borderRadius:'8px', border:'none', background: (!input.trim() || loading) ? C.border : `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, color: (!input.trim() || loading) ? C.textMuted : '#0a0800', fontSize:'13px', fontWeight:'700', letterSpacing:'0.04em', cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', gap:'8px', boxShadow: (!input.trim() || loading) ? 'none' : `0 4px 16px rgba(212,168,83,0.25)` }}
              >
                {loading ? (
                  <>
                    <span style={{ width:'13px', height:'13px', border:`2px solid #0a0800`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                    Translating...
                  </>
                ) : '📖 Translate to Plain English'}
              </button>
              <button
                onClick={() => setInput(SAMPLE_TEXT)}
                style={{ padding:'10px 18px', borderRadius:'8px', border:`1px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontSize:'13px', cursor:'pointer', transition:'all 0.2s', letterSpacing:'0.02em' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=C.borderGold; e.currentTarget.style.color=C.gold }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary }}
              >
                Try a Sample Document
              </button>
              {input && (
                <button
                  onClick={() => { setInput(''); setResult(null); setError(null) }}
                  style={{ padding:'10px 14px', borderRadius:'8px', border:`1px solid ${C.border}`, background:'transparent', color:C.textMuted, fontSize:'13px', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color=C.danger}
                  onMouseLeave={e => e.currentTarget.style.color=C.textMuted}
                >
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

              {/* Save / Share */}
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px' }}>
                <button onClick={handleSave} style={{ padding:'8px 16px', borderRadius:'6px', border:`1px solid ${C.borderGold}`, background:C.goldGlow2, color:C.gold, fontSize:'12px', cursor:'pointer', transition:'all 0.2s' }}>
                  {saved ? '✓ Results Saved!' : '💾 Save Results'}
                </button>
                <button onClick={() => navigator.clipboard?.writeText(window.location.href)} style={{ padding:'8px 16px', borderRadius:'6px', border:`1px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontSize:'12px', cursor:'pointer', transition:'all 0.2s' }} onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.borderGold; e.currentTarget.style.color=C.gold }} onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary }}>🔗 Share</button>
                <button onClick={() => window.print()} style={{ padding:'8px 16px', borderRadius:'6px', border:`1px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontSize:'12px', cursor:'pointer', transition:'all 0.2s' }} onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.borderGold; e.currentTarget.style.color=C.gold }} onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary }}>🖨 Print</button>
              </div>

              {/* Reading level */}
              {result.overallReadingLevel && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'10px', padding:'18px 22px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'14px', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'12px', color:C.textMuted, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:'600' }}>Reading Level</span>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'13px', fontWeight:'700', background:`${gradeColor(result.overallReadingLevel.original)}18`, color:gradeColor(result.overallReadingLevel.original), border:`1px solid ${gradeColor(result.overallReadingLevel.original)}30` }}>
                      Original: Grade {result.overallReadingLevel.original}
                    </span>
                    <span style={{ fontSize:'18px', color:C.textMuted }}>→</span>
                    <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'13px', fontWeight:'700', background:'rgba(34,197,94,0.1)', color:C.verified, border:`1px solid rgba(34,197,94,0.25)` }}>
                      Translated: Grade {result.overallReadingLevel.translated}
                    </span>
                  </div>
                </div>
              )}

              {/* Summary */}
              {result.summary && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.borderGold}`, borderRadius:'10px', padding:'20px 22px', marginBottom:'20px' }}>
                  <div style={{ fontSize:'11px', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'10px' }}>Summary</div>
                  <p style={{ margin:0, fontSize:'14px', color:C.textPrimary, lineHeight:'1.7' }}>{result.summary}</p>
                </div>
              )}

              {/* Paragraphs */}
              {result.paragraphs?.length > 0 && (
                <div style={{ marginBottom:'28px' }}>
                  <h2 style={{ fontFamily:SERIF, fontSize:'18px', color:C.textPrimary, margin:'0 0 16px', fontWeight:'600' }}>Section by Section</h2>
                  <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                    {result.paragraphs.map((para, i) => (
                      <div key={para.id ?? i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                        {/* Original */}
                        <div style={{ background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:'8px', padding:'16px', position:'relative' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                            <span style={{ fontSize:'10px', color:C.textMuted, letterSpacing:'0.07em', textTransform:'uppercase', fontWeight:'700' }}>Original</span>
                            {para.readingLevel?.original != null && (
                              <span style={{ fontSize:'9px', padding:'2px 7px', borderRadius:'3px', background:`${gradeColor(para.readingLevel.original)}15`, color:gradeColor(para.readingLevel.original), border:`1px solid ${gradeColor(para.readingLevel.original)}30` }}>
                                Grade {para.readingLevel.original}
                              </span>
                            )}
                          </div>
                          <p style={{ margin:0, fontSize:'12px', color:C.textSecondary, lineHeight:'1.7', fontStyle:'italic' }}>{para.original}</p>
                        </div>
                        {/* Translated */}
                        <div style={{ background:'rgba(34,197,94,0.04)', border:`1px solid rgba(34,197,94,0.2)`, borderRadius:'8px', padding:'16px', position:'relative' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                            <span style={{ fontSize:'10px', color:C.verified, letterSpacing:'0.07em', textTransform:'uppercase', fontWeight:'700' }}>Plain English</span>
                            {para.readingLevel?.translated != null && (
                              <span style={{ fontSize:'9px', padding:'2px 7px', borderRadius:'3px', background:'rgba(34,197,94,0.1)', color:C.verified, border:'1px solid rgba(34,197,94,0.25)' }}>
                                Grade {para.readingLevel.translated}
                              </span>
                            )}
                          </div>
                          <p style={{ margin:0, fontSize:'13px', color:C.textPrimary, lineHeight:'1.7' }}>{para.translation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Glossary */}
              {result.glossary?.length > 0 && (
                <div>
                  <h2 style={{ fontFamily:SERIF, fontSize:'18px', color:C.textPrimary, margin:'0 0 16px', fontWeight:'600' }}>Legal Term Glossary</h2>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                    {result.glossary.map((item, i) => (
                      <div key={i} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'8px', padding:'14px 16px', transition:'border-color 0.2s' }} onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderGold} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                        <div style={{ fontFamily:SERIF, fontSize:'15px', fontWeight:'700', color:C.gold, marginBottom:'6px' }}>{item.term}</div>
                        <p style={{ margin:'0 0 6px', fontSize:'12px', color:C.textSecondary, lineHeight:'1.6' }}>{item.definition}</p>
                        {item.context && <p style={{ margin:0, fontSize:'11px', color:C.textMuted, fontStyle:'italic', lineHeight:'1.5' }}>{item.context}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upsell footer */}
          <div style={{ marginTop:'40px', background:C.bgCard, border:`1px solid ${C.borderGold}`, borderRadius:'12px', padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <div style={{ fontFamily:SERIF, fontSize:'17px', fontWeight:'600', color:C.textPrimary, marginBottom:'4px' }}>Want unlimited access to all tools?</div>
              <div style={{ fontSize:'13px', color:C.textSecondary }}>Upgrade to Pro for $49/month — unlimited translations, all 7 tools, priority support.</div>
            </div>
            <Link href="/request-access" style={{ padding:'10px 24px', borderRadius:'8px', background:`linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, color:'#0a0800', fontSize:'13px', fontWeight:'700', textDecoration:'none', letterSpacing:'0.04em', whiteSpace:'nowrap', boxShadow:`0 4px 16px rgba(212,168,83,0.25)` }}>
              Upgrade to Pro →
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <ToolSidebar currentId="plain-english" />
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
