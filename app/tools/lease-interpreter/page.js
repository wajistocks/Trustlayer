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

const CURRENT_TOOL_ID = 'lease-interpreter'

const TOOLS = [
  { id:'plain-english',          path:'/tools/plain-english',          name:'Plain English Translator',  icon:'📖' },
  { id:'deadlines',              path:'/tools/deadlines',              name:'Deadline Calculator',        icon:'⏰' },
  { id:'red-flags',              path:'/tools/red-flags',              name:'Contract Red Flag Scanner',  icon:'🔍' },
  { id:'letter-response',        path:'/tools/letter-response',        name:'Letter Response Generator',  icon:'✉'  },
  { id:'statute-of-limitations', path:'/tools/statute-of-limitations', name:'Statute of Limitations',     icon:'⏳' },
  { id:'ethics',                 path:'/tools/ethics',                 name:'Ethics Checker',             icon:'⚖' },
  { id:'pro-se',                 path:'/tools/pro-se',                 name:'Pro Se Assistant',           icon:'🏛', free:true },
  { id:'lease-interpreter',      path:'/tools/lease-interpreter',      name:'Lease Interpreter',          icon:'🏠' },
]

const STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']

const SAMPLE_RESIDENTIAL = `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is entered into on January 1, 2025, between Greenfield Properties LLC ("Landlord") and John Smith ("Tenant").

PROPERTY: 123 Main Street, Apt 4B, Los Angeles, CA 90001

TERM: 12 months, commencing February 1, 2025 and ending January 31, 2026.

RENT: $2,200 per month, due on the 1st of each month. A late fee of $150 will be charged if rent is received after the 5th day of the month.

SECURITY DEPOSIT: $4,400 (two months' rent). Landlord may use deposit for unpaid rent, cleaning, or damages beyond normal wear and tear.

UTILITIES: Tenant is responsible for electricity, gas, and internet. Landlord pays water and trash.

PETS: No pets permitted. Any pet found on premises will result in immediate lease termination and a $500 pet damage fee.

ENTRY: Landlord may enter the property at any time for inspections, repairs, or showings with 24-hour notice, or immediately in case of emergency.

ALTERATIONS: Tenant may not make any alterations to the property without prior written consent of Landlord.

SUBLETTING: Subletting is strictly prohibited.

EARLY TERMINATION: If Tenant terminates before the end of the lease term, Tenant shall forfeit the entire security deposit and remain liable for all remaining rent through the end of the lease term.

RENEWAL: This lease will automatically renew on a month-to-month basis unless either party gives 60 days written notice of termination.

ATTORNEY'S FEES: If Landlord must take legal action to enforce this lease, Tenant shall pay all of Landlord's attorney fees and court costs.

GOVERNING LAW: This agreement is governed by the laws of California.`

const SAMPLE_COMMERCIAL = `COMMERCIAL LEASE AGREEMENT

Landlord: Metro Commerce Properties, Inc.
Tenant: Sunrise Cafe, LLC
Property: 500 Broadway, Suite 101, New York, NY 10012
Use: Restaurant and cafe operations only

TERM: Five (5) years commencing March 1, 2025.

BASE RENT: Year 1: $8,500/month. Annual increases of 4% per year thereafter.

SECURITY DEPOSIT: $25,500 (three months). Non-interest bearing.

PERSONAL GUARANTEE: Principal owners of Tenant shall execute a personal guarantee for all obligations under this lease.

TRIPLE NET (NNN): This is a triple net lease. In addition to base rent, Tenant shall pay its proportionate share of: (a) real estate taxes, (b) building insurance, (c) all operating and maintenance costs for the building. Tenant's proportionate share is 8.5%.

COMMON AREA MAINTENANCE: Tenant shall pay CAM charges estimated at $2,100/month, subject to annual reconciliation.

IMPROVEMENTS: Tenant shall accept premises in as-is condition. All tenant improvements at Tenant's sole cost. Any improvements become property of Landlord upon lease termination.

ASSIGNMENT: Tenant may not assign this lease or sublet without Landlord's prior written consent, which may be withheld in Landlord's sole discretion.

EXCLUSIVITY: No exclusivity granted. Landlord may lease adjacent spaces to competing businesses.

DEFAULT: If Tenant defaults, Landlord may terminate lease and Tenant shall remain liable for all remaining rent through the full lease term.

RENEWAL OPTION: Tenant has one option to renew for 3 years at market rate, exercisable by written notice 6 months prior to expiration.`

function severityStyle(s) {
  if (s === 'high')   return { color:C.error,   bg:C.errorBg,   border:'rgba(239,68,68,0.3)',    dot:'#ef4444' }
  if (s === 'medium') return { color:C.warning, bg:C.warningBg, border:'rgba(245,158,11,0.3)',   dot:'#f59e0b' }
  return                     { color:C.verified, bg:C.verifiedBg, border:'rgba(34,197,94,0.25)', dot:'#22c55e' }
}

function impactStyle(impact) {
  if (impact === 'positive') return { color:C.verified, bg:'rgba(34,197,94,0.08)',  border:'rgba(34,197,94,0.2)'  }
  if (impact === 'negative') return { color:C.error,   bg:'rgba(239,68,68,0.08)',  border:'rgba(239,68,68,0.2)'  }
  return                            { color:C.textMuted, bg:'rgba(255,255,255,0.03)', border:C.border             }
}

function scoreColor(score) {
  if (score >= 70) return C.verified
  if (score >= 40) return C.warning
  return C.error
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
        <div style={{ fontSize:'13px', color:C.textSecondary, lineHeight:1.6, marginBottom:'16px' }}>Unlimited analyses, all 8 tools, export to Word/PDF, and priority support.</div>
        <Link href="/request-access" style={{ display:'block', textAlign:'center', background:C.blue, color:'#fff', padding:'10px 16px', borderRadius:'6px', textDecoration:'none', fontSize:'13px', fontWeight:'600' }}
          onMouseEnter={e=>e.currentTarget.style.background=C.blueHover}
          onMouseLeave={e=>e.currentTarget.style.background=C.blue}
        >See Plans →</Link>
      </div>
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'20px' }}>
        <div style={{ fontSize:'11px', color:C.textMuted, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'14px', fontWeight:'600' }}>Tenant Tips</div>
        {[
          { icon:'📸', tip:'Always photograph the unit before moving in and after moving out — this protects your deposit.' },
          { icon:'📬', tip:'Send all communications to your landlord via email or certified mail for a paper trail.' },
          { icon:'⚖', tip:'Many tenant rights are non-waivable — a lease clause contradicting state law is often unenforceable.' },
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

function SectionLabel({ label, count }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
      <div style={{ fontSize:'11px', fontWeight:'700', letterSpacing:'0.1em', textTransform:'uppercase', color:C.textMuted }}>{label}</div>
      {count != null && <span style={{ fontSize:'11px', color:C.blue, fontFamily:MONO, background:C.blueGlow2, border:`1px solid rgba(37,99,235,0.25)`, padding:'2px 8px', borderRadius:'3px' }}>{count}</span>}
      <div style={{ flex:1, height:'1px', background:C.border }} />
    </div>
  )
}

export default function LeaseInterpreterPage() {
  const [lease, setLease]           = useState('')
  const [leaseType, setLeaseType]   = useState('residential')
  const [state, setState]           = useState('California')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [result, setResult]         = useState(null)
  const [copied, setCopied]         = useState(false)
  const [toolsOpen, setToolsOpen]   = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleSubmit() {
    if (!lease.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/tools/lease-interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lease, leaseType, state }),
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

  function loadSample(type) {
    setLeaseType(type)
    setLease(type === 'commercial' ? SAMPLE_COMMERCIAL : SAMPLE_RESIDENTIAL)
    setState(type === 'commercial' ? 'New York' : 'California')
    setResult(null)
    setError(null)
  }

  const inputStyle = {
    background: C.bgSecondary, border:`1px solid ${C.borderLight}`, color:C.textPrimary,
    borderRadius:'4px', fontSize:'15px', padding:'11px 14px', outline:'none', width:'100%',
    cursor:'pointer', fontFamily:SANS,
  }

  const score = result?.fairnessScore?.score ?? null

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
          .tl-summary-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .tl-summary-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes pulse   { 0%,100% { opacity:0.3 } 50% { opacity:0.7 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes scoreGrow { from { width: 0% } to { width: var(--score-width) } }
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

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="tl-breadcrumb" style={{ padding:'14px 40px', borderBottom:`1px solid ${C.border}`, background:'#000', display:'flex', gap:'6px', alignItems:'center', fontSize:'13px', color:C.textMuted }}>
        <Link href="/" style={{ color:C.textSecondary, textDecoration:'none', transition:'color 0.15s' }} onMouseEnter={e=>e.currentTarget.style.color=C.blue} onMouseLeave={e=>e.currentTarget.style.color=C.textSecondary}>TrustLayer</Link>
        <span>›</span>
        <Link href="/tools" style={{ color:C.textSecondary, textDecoration:'none', transition:'color 0.15s' }} onMouseEnter={e=>e.currentTarget.style.color=C.blue} onMouseLeave={e=>e.currentTarget.style.color=C.textSecondary}>Tools</Link>
        <span>›</span>
        <span style={{ color:'#fff' }}>Lease Interpreter</span>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="tl-hero" style={{ background:'#000', borderBottom:`1px solid ${C.border}`, padding:'56px 40px 48px' }}>
        <div style={{ maxWidth:'800px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:C.blueGlow2, border:`1px solid rgba(37,99,235,0.25)`, borderRadius:'4px', padding:'4px 12px', marginBottom:'20px' }}>
            <span style={{ fontSize:'14px' }}>🏠</span>
            <span style={{ fontSize:'12px', color:C.blue, fontWeight:'600', letterSpacing:'0.08em', textTransform:'uppercase' }}>Lease Interpreter</span>
          </div>
          <h1 style={{ fontFamily:SERIF, fontSize:'clamp(28px,4vw,48px)', fontWeight:'700', color:'#fff', margin:'0 0 16px', lineHeight:1.1, letterSpacing:'-0.02em' }}>
            Understand Your Lease Before You Sign
          </h1>
          <p style={{ fontSize:'17px', color:C.textSecondary, margin:'0 0 28px', lineHeight:1.7, maxWidth:'580px' }}>
            Paste any residential or commercial lease — get plain English explanations, tenant rights analysis, red flags, and a fairness score. Know exactly what you&apos;re signing.
          </p>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            {['Residential', 'Commercial'].map(type => (
              <button key={type} onClick={() => loadSample(type.toLowerCase())}
                style={{ padding:'8px 18px', borderRadius:'5px', border:`1px solid ${C.borderLight}`, background:'transparent', color:C.textSecondary, fontSize:'13px', cursor:'pointer', transition:'all 0.15s', fontFamily:SANS }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.color=C.blue }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.borderLight; e.currentTarget.style.color=C.textSecondary }}
              >Load Sample {type} Lease</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────────── */}
      <div className="tl-2col tl-main" style={{ maxWidth:'1200px', margin:'0 auto', padding:'48px 40px', display:'grid', gridTemplateColumns:'1fr 260px', gap:'40px', alignItems:'start' }}>

        {/* Left column */}
        <div>

          {/* Form card */}
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'28px', marginBottom:'24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
              <label style={{ fontSize:'14px', color:C.textSecondary, fontWeight:'600', letterSpacing:'0.03em' }}>Paste Your Lease Agreement</label>
              <span style={{ fontSize:'12px', color:C.textMuted, fontFamily:MONO }}>{lease.length.toLocaleString()} / 50,000</span>
            </div>
            <textarea
              value={lease}
              onChange={e => setLease(e.target.value)}
              placeholder="Paste your full lease agreement text here. The more complete the text, the better the analysis. You can copy-paste from a PDF or Word document."
              style={{ width:'100%', minHeight:'260px', background:C.bgSecondary, border:`1px solid ${C.borderLight}`, color:'#fff', fontSize:'14px', fontFamily:MONO, padding:'14px 16px', resize:'vertical', outline:'none', lineHeight:1.7, boxSizing:'border-box', transition:'border-color 0.2s', marginBottom:'20px', borderRadius:'4px' }}
              onFocus={e => e.target.style.borderColor=C.blue}
              onBlur={e => e.target.style.borderColor=C.borderLight}
            />
            <div className="tl-form-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' }}>
              <div>
                <label style={{ display:'block', fontSize:'11px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600', marginBottom:'7px' }}>Lease Type</label>
                <select value={leaseType} onChange={e=>setLeaseType(e.target.value)} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor=C.blue}
                  onBlur={e=>e.target.style.borderColor=C.borderLight}
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'11px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600', marginBottom:'7px' }}>Property State</label>
                <select value={state} onChange={e=>setState(e.target.value)} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor=C.blue}
                  onBlur={e=>e.target.style.borderColor=C.borderLight}
                >
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <button
                onClick={handleSubmit}
                disabled={lease.trim().length < 100 || loading}
                className="tl-btn-full"
                style={{ padding:'13px 28px', borderRadius:'6px', border:'none', background: (lease.trim().length < 100 || loading) ? C.border : C.blue, color: (lease.trim().length < 100 || loading) ? C.textMuted : '#fff', fontSize:'15px', fontWeight:'600', cursor: (lease.trim().length < 100 || loading) ? 'not-allowed' : 'pointer', transition:'background 0.15s', display:'inline-flex', alignItems:'center', gap:'8px' }}
                onMouseEnter={e => { if (!loading && lease.trim().length >= 100) e.currentTarget.style.background=C.blueHover }}
                onMouseLeave={e => { if (!loading && lease.trim().length >= 100) e.currentTarget.style.background=C.blue }}
              >
                {loading ? (
                  <>
                    <span style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                    Analyzing Lease...
                  </>
                ) : '🏠 Interpret This Lease'}
              </button>
              {lease && (
                <button onClick={() => { setLease(''); setResult(null); setError(null) }}
                  style={{ padding:'13px 18px', borderRadius:'6px', border:`1px solid ${C.border}`, background:'transparent', color:C.textMuted, fontSize:'14px', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.error; e.currentTarget.style.color=C.error }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textMuted }}
                >Clear</button>
              )}
            </div>
            {lease.trim().length > 0 && lease.trim().length < 100 && (
              <p style={{ margin:'12px 0 0', fontSize:'12px', color:C.textMuted }}>
                Need at least 100 characters ({100 - lease.trim().length} more)
              </p>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'20px 24px', display:'flex', gap:'12px', alignItems:'center' }}>
                <span style={{ width:'16px', height:'16px', border:'2px solid rgba(37,99,235,0.3)', borderTopColor:C.blue, borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite', flexShrink:0 }} />
                <span style={{ fontSize:'14px', color:C.textSecondary }}>Reading your lease as a tenant rights attorney... This takes 15-30 seconds for a thorough analysis.</span>
              </div>
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

              {/* Disclaimer */}
              <div style={{ background:C.warningBg, border:'1px solid rgba(245,158,11,0.3)', padding:'16px 20px', marginBottom:'24px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
                <span style={{ fontSize:'20px', flexShrink:0 }}>⚠</span>
                <div>
                  <div style={{ fontSize:'14px', fontWeight:'700', color:C.warning, marginBottom:'4px' }}>Educational Analysis Only</div>
                  <p style={{ margin:0, fontSize:'13px', color:C.textSecondary, lineHeight:1.6 }}>
                    This analysis is for informational purposes. For significant lease commitments, consult a licensed real estate or tenant rights attorney in {state}.
                  </p>
                </div>
              </div>

              {/* ── Section 1: Fairness Score ────────────────────────────────── */}
              {result.fairnessScore && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'28px', marginBottom:'16px' }}>
                  <SectionLabel label="Fairness Score" />
                  <div style={{ display:'flex', gap:'24px', alignItems:'center', flexWrap:'wrap', marginBottom:'20px' }}>
                    {/* Score ring */}
                    <div style={{ flexShrink:0, position:'relative', width:'90px', height:'90px' }}>
                      <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform:'rotate(-90deg)' }}>
                        <circle cx="45" cy="45" r="38" fill="none" stroke="#1a1a1a" strokeWidth="8" />
                        <circle cx="45" cy="45" r="38" fill="none" stroke={scoreColor(score)} strokeWidth="8"
                          strokeDasharray={`${2 * Math.PI * 38 * (score / 100)} ${2 * Math.PI * 38}`}
                          strokeLinecap="round" style={{ transition:'stroke-dasharray 1s ease' }}
                        />
                      </svg>
                      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontFamily:MONO, fontSize:'22px', fontWeight:'700', color:scoreColor(score), lineHeight:1 }}>{score}</span>
                        <span style={{ fontSize:'10px', color:C.textMuted, marginTop:'2px' }}>/100</span>
                      </div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:SERIF, fontSize:'20px', fontWeight:'700', color:'#fff', marginBottom:'6px' }}>
                        {result.fairnessScore.rating}
                      </div>
                      <p style={{ margin:'0 0 12px', fontSize:'14px', color:C.textSecondary, lineHeight:1.7 }}>
                        {result.fairnessScore.explanation}
                      </p>
                      {result.fairnessScore.keyReasons?.map((r, i) => (
                        <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'6px' }}>
                          <span style={{ color:scoreColor(score), fontSize:'13px', flexShrink:0, marginTop:'2px' }}>•</span>
                          <span style={{ fontSize:'13px', color:C.textSecondary, lineHeight:1.6 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height:'6px', background:'#1a1a1a', borderRadius:'3px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${score}%`, background:scoreColor(score), borderRadius:'3px', transition:'width 1s ease' }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px' }}>
                    <span style={{ fontSize:'10px', color:C.textMuted }}>Landlord-Favorable</span>
                    <span style={{ fontSize:'10px', color:C.textMuted }}>Tenant-Favorable</span>
                  </div>
                </div>
              )}

              {/* ── Section 2: Key Terms Summary ─────────────────────────────── */}
              {result.summary && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'28px', marginBottom:'16px' }}>
                  <SectionLabel label="Key Terms Summary" />
                  <div className="tl-summary-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px' }}>
                    {[
                      { label:'Monthly Rent',    value:result.summary.rent },
                      { label:'Security Deposit', value:result.summary.deposit },
                      { label:'Lease Term',       value:result.summary.leaseStart && result.summary.leaseEnd ? `${result.summary.leaseStart} – ${result.summary.leaseEnd}` : (result.summary.leaseEnd ?? null) },
                      { label:'Notice to Vacate', value:result.summary.notice },
                      { label:'Pet Policy',       value:result.summary.petPolicy },
                      { label:'Utilities',        value:result.summary.utilities },
                    ].filter(f => f.value).map((field, i) => (
                      <div key={i} style={{ background:C.bgSecondary, border:`1px solid ${C.border}`, padding:'16px' }}>
                        <div style={{ fontSize:'10px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600', marginBottom:'6px' }}>{field.label}</div>
                        <div style={{ fontSize:'14px', color:C.textPrimary, lineHeight:1.5 }}>{field.value}</div>
                      </div>
                    ))}
                  </div>
                  {(result.summary.landlord || result.summary.tenant || result.summary.address) && (
                    <div style={{ marginTop:'16px', padding:'16px', background:C.bgSecondary, border:`1px solid ${C.border}`, display:'flex', gap:'24px', flexWrap:'wrap' }}>
                      {result.summary.address  && <div><span style={{ fontSize:'11px', color:C.textMuted, fontWeight:'600' }}>PROPERTY: </span><span style={{ fontSize:'13px', color:C.textSecondary }}>{result.summary.address}</span></div>}
                      {result.summary.landlord && <div><span style={{ fontSize:'11px', color:C.textMuted, fontWeight:'600' }}>LANDLORD: </span><span style={{ fontSize:'13px', color:C.textSecondary }}>{result.summary.landlord}</span></div>}
                      {result.summary.tenant   && <div><span style={{ fontSize:'11px', color:C.textMuted, fontWeight:'600' }}>TENANT: </span><span style={{ fontSize:'13px', color:C.textSecondary }}>{result.summary.tenant}</span></div>}
                    </div>
                  )}
                </div>
              )}

              {/* ── Section 3: Red Flags ─────────────────────────────────────── */}
              {result.redFlags?.length > 0 && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'28px', marginBottom:'16px' }}>
                  <SectionLabel label="Red Flags" count={result.redFlags.length} />
                  <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                    {result.redFlags.map((flag, i) => {
                      const st = severityStyle(flag.severity)
                      return (
                        <div key={i} style={{ background:st.bg, border:`1px solid ${st.border}`, padding:'16px 20px' }}>
                          <div style={{ display:'flex', gap:'12px', alignItems:'flex-start', marginBottom:'8px' }}>
                            <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:st.dot, flexShrink:0, marginTop:'6px' }} />
                            <div style={{ flex:1 }}>
                              <div style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap', marginBottom:'4px' }}>
                                <span style={{ fontFamily:SERIF, fontSize:'15px', fontWeight:'700', color:'#fff' }}>{flag.issue}</span>
                                <span style={{ fontSize:'10px', fontWeight:'700', color:st.color, padding:'2px 8px', background:`${st.dot}18`, border:`1px solid ${st.border}`, textTransform:'uppercase', letterSpacing:'0.06em' }}>{flag.severity}</span>
                              </div>
                              {flag.clause && <div style={{ fontSize:'11px', color:st.color, fontFamily:MONO, marginBottom:'8px' }}>{flag.clause}</div>}
                              <p style={{ margin:0, fontSize:'14px', color:C.textSecondary, lineHeight:1.7 }}>{flag.explanation}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Section 4: Plain English Clauses ────────────────────────── */}
              {result.clauses?.length > 0 && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'28px', marginBottom:'16px' }}>
                  <SectionLabel label="Plain English Clauses" count={result.clauses.length} />
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {result.clauses.map((clause, i) => {
                      const ist = impactStyle(clause.impact)
                      return (
                        <div key={i} style={{ border:`1px solid ${C.border}`, borderLeft:`3px solid ${ist.color}`, padding:'16px 20px', background:C.bgSecondary, transition:'border-color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor=ist.color}
                          onMouseLeave={e => e.currentTarget.style.borderColor=C.border}
                        >
                          <div style={{ display:'flex', gap:'10px', alignItems:'center', marginBottom:'10px', flexWrap:'wrap' }}>
                            <span style={{ fontFamily:SERIF, fontSize:'15px', fontWeight:'700', color:'#fff' }}>{clause.title}</span>
                            {clause.impact && (
                              <span style={{ fontSize:'10px', fontWeight:'700', color:ist.color, padding:'2px 8px', background:ist.bg, border:`1px solid ${ist.border}`, textTransform:'capitalize', letterSpacing:'0.05em' }}>{clause.impact}</span>
                            )}
                          </div>
                          {clause.originalLanguage && (
                            <div style={{ background:'#0a0a0a', border:`1px solid ${C.border}`, padding:'10px 14px', marginBottom:'10px', borderRadius:'3px' }}>
                              <div style={{ fontSize:'10px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>Original</div>
                              <p style={{ margin:0, fontSize:'12px', fontFamily:MONO, color:C.textMuted, lineHeight:1.7, fontStyle:'italic' }}>&ldquo;{clause.originalLanguage}&rdquo;</p>
                            </div>
                          )}
                          <p style={{ margin:0, fontSize:'14px', color:C.textSecondary, lineHeight:1.7 }}>{clause.plainEnglish}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Section 5: Tenant Rights ─────────────────────────────────── */}
              {result.tenantRights && (
                <div style={{ background:'rgba(34,197,94,0.04)', border:'1px solid rgba(34,197,94,0.18)', padding:'28px', marginBottom:'16px' }}>
                  <SectionLabel label={`Tenant Rights — ${result.tenantRights.state ?? state}`} />
                  <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                    {[
                      { label:'Security Deposit Return', value:result.tenantRights.depositReturn },
                      { label:'Notice Requirements',      value:result.tenantRights.noticePeriod },
                      { label:'Habitability Standards',   value:result.tenantRights.habitability },
                      { label:'Anti-Retaliation',         value:result.tenantRights.retaliation },
                      { label:'Early Termination Rights', value:result.tenantRights.earlyTermination },
                    ].filter(f => f.value).map((right, i) => (
                      <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start', paddingBottom:'14px', borderBottom: i < 4 ? '1px solid rgba(34,197,94,0.1)' : 'none' }}>
                        <span style={{ color:C.verified, fontSize:'14px', flexShrink:0, marginTop:'2px' }}>✓</span>
                        <div>
                          <div style={{ fontSize:'12px', color:C.verified, fontWeight:'600', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:'4px' }}>{right.label}</div>
                          <p style={{ margin:0, fontSize:'14px', color:C.textSecondary, lineHeight:1.7 }}>{right.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Section 6: Negotiation Opportunities ─────────────────────── */}
              {result.negotiationOpportunities?.length > 0 && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'28px', marginBottom:'16px' }}>
                  <SectionLabel label="Negotiation Opportunities" count={result.negotiationOpportunities.length} />
                  <p style={{ fontSize:'13px', color:C.textMuted, margin:'0 0 16px', lineHeight:1.6 }}>
                    These are clauses where landlords commonly agree to modifications. Ask for these before signing.
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                    {result.negotiationOpportunities.map((opp, i) => (
                      <div key={i} style={{ border:`1px solid ${C.borderLight}`, padding:'18px 20px', background:C.bgSecondary }}>
                        <div style={{ fontFamily:SERIF, fontSize:'15px', fontWeight:'700', color:'#fff', marginBottom:'10px' }}>{opp.clause}</div>
                        {opp.currentLanguage && (
                          <div style={{ marginBottom:'10px' }}>
                            <div style={{ fontSize:'10px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' }}>Current Language</div>
                            <p style={{ margin:0, fontSize:'13px', color:C.textMuted, fontFamily:MONO, lineHeight:1.65, fontStyle:'italic' }}>&ldquo;{opp.currentLanguage}&rdquo;</p>
                          </div>
                        )}
                        {opp.suggested && (
                          <div style={{ background:'rgba(37,99,235,0.06)', border:'1px solid rgba(37,99,235,0.2)', padding:'10px 14px', marginBottom:'10px', borderRadius:'3px' }}>
                            <div style={{ fontSize:'10px', color:C.blue, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px', fontWeight:'600' }}>Suggest This Instead</div>
                            <p style={{ margin:0, fontSize:'13px', color:C.textSecondary, lineHeight:1.65 }}>{opp.suggested}</p>
                          </div>
                        )}
                        {opp.rationale && (
                          <p style={{ margin:0, fontSize:'13px', color:C.textMuted, lineHeight:1.6 }}>{opp.rationale}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Section 7: Questions to Ask ──────────────────────────────── */}
              {result.questionsToAsk?.length > 0 && (
                <div style={{ background:C.bgCard, border:`1px solid rgba(37,99,235,0.25)`, padding:'28px', marginBottom:'16px' }}>
                  <SectionLabel label="Questions to Ask Before Signing" count={result.questionsToAsk.length} />
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {result.questionsToAsk.map((q, i) => (
                      <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start', padding:'12px 0', borderBottom: i < result.questionsToAsk.length - 1 ? `1px solid #1a1a1a` : 'none' }}>
                        <span style={{ fontFamily:MONO, fontSize:'12px', color:C.blue, flexShrink:0, marginTop:'2px', minWidth:'20px' }}>{String(i+1).padStart(2,'0')}</span>
                        <p style={{ margin:0, fontSize:'14px', color:C.textSecondary, lineHeight:1.7 }}>{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy / Print row */}
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'32px' }}>
                <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(result, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                  style={{ padding:'8px 16px', borderRadius:'6px', border:`1px solid ${copied ? 'rgba(34,197,94,0.4)' : C.borderLight}`, background: copied ? C.verifiedBg : 'transparent', color: copied ? C.verified : C.textSecondary, fontSize:'13px', cursor:'pointer', transition:'all 0.15s' }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy Full Analysis'}
                </button>
                <button onClick={() => window.print()}
                  style={{ padding:'8px 16px', borderRadius:'6px', border:`1px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontSize:'13px', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.color=C.blue }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary }}
                >🖨 Print Analysis</button>
              </div>

              {/* Upsell */}
              <div style={{ background:C.bgCard, border:'1px solid rgba(37,99,235,0.25)', padding:'32px', textAlign:'center' }}>
                <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:'700', color:'#fff', marginBottom:'10px' }}>Upgrade to Pro — $49/month</div>
                <div style={{ fontSize:'15px', color:C.textSecondary, marginBottom:'24px', lineHeight:1.6 }}>Unlimited lease analyses, export to Word & PDF, side-by-side comparison, and attorney review scheduling.</div>
                <Link href="/request-access" style={{ display:'inline-block', background:C.blue, color:'#fff', padding:'13px 32px', borderRadius:'6px', textDecoration:'none', fontSize:'15px', fontWeight:'600' }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.blueHover}
                  onMouseLeave={e=>e.currentTarget.style.background=C.blue}
                >Start Free Trial →</Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <ToolSidebar />
      </div>
    </div>
  )
}
