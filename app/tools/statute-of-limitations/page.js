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

const CURRENT_TOOL_ID = 'statute-of-limitations'

const STATES_50 = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
]

const CLAIM_TYPES = [
  { value: 'personal-injury',           label: 'Personal Injury' },
  { value: 'contract-breach',           label: 'Contract Breach' },
  { value: 'employment-discrimination', label: 'Employment Discrimination' },
  { value: 'medical-malpractice',       label: 'Medical Malpractice' },
  { value: 'property-damage',           label: 'Property Damage' },
  { value: 'fraud',                     label: 'Fraud' },
  { value: 'defamation',                label: 'Defamation' },
  { value: 'civil-rights',              label: 'Civil Rights' },
  { value: 'consumer-protection',       label: 'Consumer Protection' },
  { value: 'other',                     label: 'Other' },
]

const TODAY = new Date().toISOString().split('T')[0]

// ─── Urgency config ────────────────────────────────────────────────────────────
function urgencyConfig(urgency) {
  switch (urgency) {
    case 'expired':  return { bg: C.errorBg,   border: 'rgba(239,68,68,0.30)',  color: C.error,   icon: '⛔', label: 'DEADLINE LIKELY EXPIRED — Consult an attorney immediately to determine if any exceptions apply' }
    case 'critical': return { bg: C.errorBg,   border: 'rgba(239,68,68,0.30)',  color: C.error,   icon: '🚨', label: 'CRITICAL — Your deadline is within 30 days. Do not delay.' }
    case 'warning':  return { bg: C.warningBg, border: 'rgba(245,158,11,0.30)', color: C.warning, icon: '⚠',  label: 'Approaching — You have time but should act now.' }
    default:         return { bg: C.verifiedBg,border: 'rgba(34,197,94,0.25)',  color: C.verified,icon: '✓',  label: "You have time — but don't wait. Statutes of limitations can be affected by many factors." }
  }
}

function deadlineColor(urgency) {
  if (urgency === 'expired' || urgency === 'critical') return C.error
  if (urgency === 'warning') return C.warning
  return C.verified
}

function formatDeadlineDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return dateStr }
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: '28px', animation: 'pulse 1.6s ease-in-out infinite' }}>
      <div style={{ height: '12px', width: '30%', background: C.border, marginBottom: '14px' }} />
      <div style={{ height: '16px', width: '60%', background: C.border, marginBottom: '10px' }} />
      <div style={{ height: '13px', width: '90%', background: C.border, marginBottom: '8px' }} />
      <div style={{ height: '13px', width: '75%', background: C.border }} />
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function StatuteOfLimitationsPage() {
  const [claimType,    setClaimType]    = useState('personal-injury')
  const [state,        setState]        = useState('California')
  const [incidentDate, setIncidentDate] = useState('')
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

  async function handleCalculate() {
    if (!incidentDate) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res  = await fetch('/api/tools/statute-of-limitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimType, state, incidentDate }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Calculation failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
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
        <span style={{ color:'#fff' }}>Statute of Limitations</span>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div style={{ background:'#000', borderBottom:'1px solid #222', padding:'56px 40px 48px' }} className="tl-hero">
        <div style={{ maxWidth:'720px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(37,99,235,0.08)', border:'1px solid rgba(37,99,235,0.2)', borderRadius:'4px', padding:'5px 14px', marginBottom:'20px' }}>
            <span style={{ fontSize:'13px' }}>⏳</span>
            <span style={{ fontSize:'11px', color:'#2563eb', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:'600' }}>Statute of Limitations Checker</span>
          </div>
          <h1 style={{ fontFamily:SERIF, fontSize:'clamp(28px, 4vw, 46px)', fontWeight:'700', letterSpacing:'-0.01em', lineHeight:'1.15', margin:'0 0 16px', color:'#fff' }}>
            Know Exactly How Long<br />
            <span style={{ color:'#2563eb' }}>You Have To File</span>
          </h1>
          <p style={{ fontSize:'17px', color:'#888', margin:0, maxWidth:'580px', lineHeight:'1.65' }}>
            Missing a statute of limitations is the most common and most devastating legal mistake.
            Know your exact deadline before it's too late.
          </p>
        </div>
      </div>

      {/* ── Main grid ───────────────────────────────────────────────────────── */}
      <div className="tl-2col" style={{ maxWidth:'1100px', margin:'0 auto', padding:'40px 40px', display:'grid', gridTemplateColumns:'1fr 280px', gap:'32px', alignItems:'start' }} >

        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div>

          {/* ── Form card ─────────────────────────────────────────────────── */}
          <div className="tl-card-pad" style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'32px', marginBottom:'24px' }}>
            <h2 style={{ margin:'0 0 24px', fontFamily:SERIF, fontSize:'20px', fontWeight:'700', color:'#fff' }}>
              Calculate Your Deadline
            </h2>

            {/* 3-column inputs */}
            <div className="tl-3col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'24px' }}>
              <div>
                <label style={{ display:'block', fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'8px', fontWeight:'600' }}>Claim Type</label>
                <select value={claimType} onChange={e => setClaimType(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor='#2563eb'}
                  onBlur={e => e.target.style.borderColor=C.borderLight}
                >
                  {CLAIM_TYPES.map(ct => (
                    <option key={ct.value} value={ct.value} style={{ background:'#111' }}>{ct.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display:'block', fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'8px', fontWeight:'600' }}>State</label>
                <select value={state} onChange={e => setState(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor='#2563eb'}
                  onBlur={e => e.target.style.borderColor=C.borderLight}
                >
                  {STATES_50.map(s => (
                    <option key={s} value={s} style={{ background:'#111' }}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display:'block', fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'8px', fontWeight:'600' }}>Date of Incident or Discovery</label>
                <input
                  type="date"
                  max={TODAY}
                  value={incidentDate}
                  onChange={e => setIncidentDate(e.target.value)}
                  style={{ ...inputStyle, colorScheme:'dark' }}
                  onFocus={e => e.target.style.borderColor='#2563eb'}
                  onBlur={e => e.target.style.borderColor=C.borderLight}
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading || !incidentDate}
              className="tl-btn-full"
              style={{
                width:'100%', padding:'14px', borderRadius:'6px', border:'none',
                background: loading || !incidentDate ? '#222' : '#2563eb',
                color: loading || !incidentDate ? C.textMuted : '#fff',
                fontSize:'15px', fontWeight:'600', cursor: loading || !incidentDate ? 'not-allowed' : 'pointer',
                transition:'background 0.15s',
              }}
              onMouseEnter={e => { if (!loading && incidentDate) e.currentTarget.style.background='#1d4ed8' }}
              onMouseLeave={e => { if (!loading && incidentDate) e.currentTarget.style.background='#2563eb' }}
            >
              {loading ? (
                <span style={{ display:'inline-flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                  Calculating…
                </span>
              ) : 'Calculate Deadline'}
            </button>
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
            const uc = urgencyConfig(result.urgency)
            return (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px', animation:'slideUp 0.2s ease' }}>

                {/* Save / Share / Print row — above results */}
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  {[
                    { label: saved ? '✓ Saved!' : '💾 Save Results', onClick: handleSave, active: saved },
                    { label: shareMsg || '🔗 Share',                  onClick: handleShare, active: !!shareMsg },
                    { label: '🖨 Print',                               onClick: () => window.print(), active: false },
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

                {/* Urgency banner */}
                <div style={{ background:uc.bg, border:`1px solid ${uc.border}`, padding:'16px 20px' }}>
                  <p style={{ margin:0, fontSize:'15px', fontWeight:'700', color:uc.color, lineHeight:'1.4' }}>
                    {uc.icon} {uc.label}
                  </p>
                </div>

                {/* Deadline display */}
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'32px', textAlign:'center', animation:'slideUp 0.2s ease' }}>
                  <p style={{ margin:'0 0 8px', fontSize:'12px', color:C.textMuted, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:'600' }}>
                    Filing Deadline
                  </p>
                  <p style={{ margin:'0 0 10px', fontFamily:SERIF, fontSize:'40px', fontWeight:'700', color:deadlineColor(result.urgency), lineHeight:1 }}>
                    {formatDeadlineDate(result.deadline)}
                  </p>
                  <p style={{ margin:'0 0 8px', fontSize:'15px', color:C.textSecondary }}>
                    {result.urgency === 'expired'
                      ? 'Deadline has passed'
                      : `Days Remaining: ${result.daysRemaining?.toLocaleString() ?? '—'}`}
                  </p>
                  <p style={{ margin:0, fontSize:'13px', color:C.textMuted }}>
                    Statute of limitations: <span style={{ color:C.textPrimary, fontFamily:MONO }}>{result.yearsToFile} {result.yearsToFile === 1 ? 'year' : 'years'}</span> in {result.state}
                  </p>
                </div>

                {/* Statute citation card */}
                {result.statute && (
                  <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'24px', animation:'slideUp 0.2s ease' }}>
                    <p style={{ margin:'0 0 10px', fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' }}>Controlling Statute</p>
                    <div style={{ background:C.bgSecondary, borderLeft:'3px solid #2563eb', padding:'14px 18px', marginBottom: result.statuteText ? '14px' : '0' }}>
                      <p style={{ margin:0, fontFamily:MONO, fontSize:'15px', color:'#2563eb', fontWeight:'600' }}>{result.statute}</p>
                    </div>
                    {result.statuteText && (
                      <p style={{ margin:0, fontSize:'14px', color:C.textSecondary, lineHeight:'1.65', fontStyle:'italic', borderLeft:'3px solid #222', paddingLeft:'16px' }}>
                        "{result.statuteText}"
                      </p>
                    )}
                  </div>
                )}

                {/* Discovery rule */}
                {result.discoveryRule && (
                  <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'24px', animation:'slideUp 0.2s ease' }}>
                    <p style={{ margin:'0 0 10px', fontSize:'12px', color:'#2563eb', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' }}>Discovery Rule</p>
                    <p style={{ margin:'0 0 10px', fontSize:'15px', color:C.textSecondary, lineHeight:'1.65' }}>{result.discoveryRule}</p>
                    {result.discoveryDeadline && (
                      <p style={{ margin:0, fontSize:'13px', color:C.textMuted }}>
                        Discovery deadline: <span style={{ color:C.textPrimary, fontFamily:MONO }}>{formatDeadlineDate(result.discoveryDeadline)}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Tolling exceptions */}
                {result.tollingExceptions?.length > 0 && (
                  <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'24px', animation:'slideUp 0.2s ease' }}>
                    <p style={{ margin:'0 0 16px', fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' }}>Tolling Exceptions</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                      {result.tollingExceptions.map((ex, i) => (
                        <div key={i} style={{ background:C.bgSecondary, border:`1px solid ${C.border}`, padding:'14px 16px' }}>
                          <p style={{ margin:'0 0 6px', fontSize:'13px', fontWeight:'700', color:C.warning }}>{ex.exception}</p>
                          <p style={{ margin:0, fontSize:'14px', color:C.textSecondary, lineHeight:'1.55' }}>{ex.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Government claim alert */}
                {result.governmentClaim?.required && (
                  <div style={{ background:C.warningBg, border:`1px solid rgba(245,158,11,0.3)`, padding:'24px', animation:'slideUp 0.2s ease' }}>
                    <p style={{ margin:'0 0 10px', fontSize:'13px', fontWeight:'700', color:C.warning, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                      ⚠ Government Claim Required
                    </p>
                    <p style={{ margin:'0 0 10px', fontSize:'15px', color:C.textSecondary, lineHeight:'1.65' }}>
                      {result.governmentClaim.description}
                    </p>
                    <p style={{ margin:'0 0 4px', fontSize:'13px', color:C.textMuted }}>
                      File within: <span style={{ color:C.warning, fontWeight:'700' }}>{result.governmentClaim.daysFromIncident} days</span> of the incident
                    </p>
                    {result.governmentClaim.authority && (
                      <p style={{ margin:0, fontSize:'13px', color:C.textMuted }}>
                        Authority: <span style={{ color:C.textSecondary, fontFamily:MONO }}>{result.governmentClaim.authority}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Important notes */}
                {result.importantNotes?.length > 0 && (
                  <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:'24px', animation:'slideUp 0.2s ease' }}>
                    <p style={{ margin:'0 0 14px', fontSize:'12px', color:C.textMuted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' }}>Important Notes</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                      {result.importantNotes.map((note, i) => (
                        <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
                          <span style={{ color:'#2563eb', fontSize:'10px', marginTop:'6px', flexShrink:0 }}>■</span>
                          <p style={{ margin:0, fontSize:'15px', color:C.textSecondary, lineHeight:'1.65' }}>{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legal disclaimer */}
                <div style={{ background:C.bgCard, border:`1px solid rgba(37,99,235,0.2)`, padding:'24px', animation:'slideUp 0.2s ease' }}>
                  <p style={{ margin:'0 0 10px', fontSize:'12px', fontWeight:'700', color:'#2563eb', letterSpacing:'0.08em', textTransform:'uppercase' }}>
                    Legal Disclaimer
                  </p>
                  <p style={{ margin:0, fontSize:'14px', color:C.textSecondary, lineHeight:'1.65' }}>
                    {result.disclaimer ?? 'Consult an attorney — statute of limitations questions are jurisdiction-specific and fact-dependent. This tool provides general information only and does not constitute legal advice. Deadlines may vary based on your specific facts, applicable exceptions, and changes in the law. Always verify with a licensed attorney in your jurisdiction before relying on any deadline.'}
                  </p>
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
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        select option { background: #111; color: #fff; }
        input::placeholder { color: #444; }
      `}</style>
    </div>
  )
}
