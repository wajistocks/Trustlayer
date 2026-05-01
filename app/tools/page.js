'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Design tokens ────────────────────────────────────────────────────────────
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

// ─── Tools registry ───────────────────────────────────────────────────────────
const TOOLS_NAV = [
  { path:'/tools/plain-english',          name:'Plain English Translator',  icon:'📖' },
  { path:'/tools/deadlines',              name:'Deadline Calculator',        icon:'⏰' },
  { path:'/tools/red-flags',              name:'Contract Red Flag Scanner',  icon:'🔍' },
  { path:'/tools/letter-response',        name:'Letter Response Generator',  icon:'✉'  },
  { path:'/tools/statute-of-limitations', name:'Statute of Limitations',     icon:'⏳' },
  { path:'/tools/ethics',                 name:'Ethics Checker',             icon:'⚖' },
  { path:'/tools/pro-se',                 name:'Pro Se Assistant',           icon:'🏛' },
  { path:'/tools/lease-interpreter',     name:'Lease Interpreter',          icon:'🏠' },
]

const TOOLS = [
  { id:'plain-english',          path:'/tools/plain-english',          name:'Plain English Translator',   icon:'📖', color:'#60a5fa', desc:'Understand any legal document instantly. Paste legalese — get plain English back with a full glossary.',       free:false, category:'Documents'  },
  { id:'deadlines',              path:'/tools/deadlines',              name:'Deadline Calculator',         icon:'⏰', color:'#f59e0b', desc:'Never miss a filing deadline. Enter your case type and triggering event — get every deadline with rule citations.', free:false, category:'Litigation' },
  { id:'red-flags',              path:'/tools/red-flags',              name:'Contract Red Flag Scanner',  icon:'🔍', color:'#ef4444', desc:'Scan any contract for 20 dangerous clause types in 30 seconds. Get a safety score and negotiation language.',    free:false, category:'Contracts'  },
  { id:'letter-response',        path:'/tools/letter-response',        name:'Letter Response Generator',  icon:'✉',  color:'#c084fc', desc:'Respond to legal threats with confidence. Paste the letter — get a professionally drafted response.',              free:false, category:'Disputes'   },
  { id:'statute-of-limitations', path:'/tools/statute-of-limitations', name:'Statute of Limitations',     icon:'⏳', color:'#34d399', desc:'Know exactly how long you have to file. Get the exact deadline, statute citation, tolling exceptions.',            free:false, category:'Litigation' },
  { id:'ethics',                 path:'/tools/ethics',                 name:'Ethics Checker',              icon:'⚖', color:'#a78bfa', desc:'Instant answers to attorney ethics questions. ABA Model Rules + state-specific bar opinions.',                     free:false, category:'Attorneys'  },
  { id:'pro-se',                 path:'/tools/pro-se',                 name:'Pro Se Legal Assistant',     icon:'🏛', color:'#22c55e', desc:'Navigate the legal system without an attorney. Step-by-step guidance, documents, hearing prep.',                   free:true,  category:'Self-Help'  },
  { id:'lease-interpreter',     path:'/tools/lease-interpreter',     name:'Lease Interpreter',           icon:'🏠', color:'#38bdf8', desc:'Understand any residential or commercial lease before signing. Plain English clauses, red flags, tenant rights, and a fairness score.', free:false, category:'Housing'    },
]

// ─── Category color map ───────────────────────────────────────────────────────
const CAT_COLORS = {
  Documents:  '#60a5fa',
  Litigation: '#f59e0b',
  Contracts:  '#ef4444',
  Disputes:   '#c084fc',
  Attorneys:  '#a78bfa',
  'Self-Help':'#22c55e',
  Housing:    '#38bdf8',
}

// ─── Tool Card ────────────────────────────────────────────────────────────────
function ToolCard({ tool }) {
  const [hovered, setHovered] = useState(false)
  const catColor = CAT_COLORS[tool.category] ?? C.blue

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:    C.bgCard,
        border:        `1px solid ${hovered ? C.blue : C.border}`,
        padding:       '32px',
        display:       'flex',
        flexDirection: 'column',
        gap:           '20px',
        cursor:        'default',
        transition:    'border-color 0.2s, box-shadow 0.2s',
        boxShadow:     hovered ? `0 8px 40px rgba(37,99,235,0.12)` : '0 2px 12px rgba(0,0,0,0.2)',
        position:      'relative',
        overflow:      'hidden',
      }}
    >
      {/* Subtle glow accent */}
      <div style={{
        position:      'absolute',
        top:           '-40px',
        right:         '-40px',
        width:         '120px',
        height:        '120px',
        borderRadius:  '50%',
        background:    `radial-gradient(circle, ${tool.color}14 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Top row: icon + category */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        {/* Icon circle */}
        <div style={{
          width:         '52px',
          height:        '52px',
          borderRadius:  '50%',
          background:    'rgba(37,99,235,0.1)',
          border:        '1px solid rgba(37,99,235,0.2)',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          fontSize:      '22px',
          flexShrink:    0,
        }}>
          {tool.icon}
        </div>

        {/* Category tag */}
        <span style={{
          fontSize:      '10px',
          fontWeight:    '700',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color:         catColor,
          padding:       '3px 9px',
          background:    `${catColor}15`,
          border:        `1px solid ${catColor}30`,
        }}>
          {tool.category}
        </span>
      </div>

      {/* Body: name + description */}
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontFamily:  SERIF,
          fontSize:    '19px',
          fontWeight:  '700',
          color:       C.textPrimary,
          margin:      '0 0 10px',
          lineHeight:  '1.25',
        }}>
          {tool.name}
        </h3>
        <p style={{
          fontSize:         '14px',
          color:            C.textSecondary,
          lineHeight:       '1.65',
          margin:           0,
          display:          '-webkit-box',
          WebkitLineClamp:  2,
          WebkitBoxOrient:  'vertical',
          overflow:         'hidden',
        }}>
          {tool.desc}
        </p>
      </div>

      {/* Bottom row: FREE badge + launch button */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
        <div>
          {tool.free && (
            <span style={{
              fontSize:      '10px',
              fontWeight:    '800',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         C.verified,
              padding:       '3px 9px',
              background:    'rgba(34,197,94,0.1)',
              border:        '1px solid rgba(34,197,94,0.3)',
            }}>
              FREE
            </span>
          )}
        </div>

        <Link
          href={tool.path}
          style={{
            display:       'inline-flex',
            alignItems:    'center',
            gap:           '6px',
            padding:       '10px 20px',
            borderRadius:  '6px',
            fontSize:      '13px',
            fontWeight:    '600',
            textDecoration:'none',
            transition:    'background 0.15s',
            background:    C.blue,
            color:         '#fff',
            border:        'none',
          }}
          onMouseEnter={e => e.currentTarget.style.background = C.blueHover}
          onMouseLeave={e => e.currentTarget.style.background = C.blue}
        >
          Launch Tool
          <span style={{ fontSize:'13px', lineHeight:1 }}>→</span>
        </Link>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ToolsHub() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen]           = useState(false)

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.textPrimary, fontFamily:SANS }}>

      {/* ── Nav ── */}
      <nav className="tl-nav" style={{ position:'sticky', top:0, zIndex:100, background:'#000', borderBottom:'1px solid #222', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px' }}>
        <Link href="/" style={{ textDecoration:'none', fontSize:'22px', fontFamily:SERIF, fontWeight:'700', color:'#fff', letterSpacing:'-0.02em' }}>TrustLayer</Link>
        <div className="tl-nav-links" style={{ display:'flex', gap:'32px', alignItems:'center' }}>
          {[['/', 'Verify'],['/research','Research']].map(([href,label]) => (
            <Link key={href} href={href} style={{ fontSize:'14px', color:'#fff', textDecoration:'none', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#2563eb'}
              onMouseLeave={e=>e.currentTarget.style.color='#fff'}
            >{label}</Link>
          ))}
          {/* Tools dropdown — active */}
          <div style={{ position:'relative' }} onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <Link href="/tools" style={{ fontSize:'14px', color:'#2563eb', textDecoration:'none', display:'flex', alignItems:'center', gap:'3px', borderBottom:'2px solid #2563eb', paddingBottom:'2px' }}
            >Tools <span style={{ fontSize:'9px', opacity:0.6 }}>▾</span></Link>
            {toolsOpen && (
              <div style={{ position:'absolute', top:'calc(100% + 10px)', left:'-10px', background:'#111', border:'1px solid #222', borderRadius:'6px', padding:'8px 6px', minWidth:'240px', boxShadow:'0 8px 32px rgba(0,0,0,0.8)', zIndex:200, animation:'fadeIn 0.15s ease' }}>
                {TOOLS_NAV.map(t => (
                  <Link key={t.path} href={t.path} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 10px', borderRadius:'4px', textDecoration:'none' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(37,99,235,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <span style={{ fontSize:'14px', width:'20px', textAlign:'center' }}>{t.icon}</span>
                    <span style={{ fontSize:'13px', color:'#888' }}>{t.name}</span>
                  </Link>
                ))}
                <div style={{ borderTop:'1px solid #222', margin:'5px 4px' }} />
                <Link href="/tools" style={{ display:'block', textAlign:'center', padding:'8px 10px', borderRadius:'4px', fontSize:'12px', color:'#2563eb', fontWeight:'600', textDecoration:'none' }}>View All Tools →</Link>
              </div>
            )}
          </div>
          <Link href="/enterprise" style={{ fontSize:'14px', color:'#fff', textDecoration:'none', transition:'color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#2563eb'}
            onMouseLeave={e=>e.currentTarget.style.color='#fff'}
          >Enterprise</Link>
          <Link href="/request-access" style={{ background:'#2563eb', color:'#fff', padding:'9px 22px', borderRadius:'6px', fontSize:'14px', fontWeight:'600', textDecoration:'none', transition:'background 0.15s' }}
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
        {TOOLS_NAV.map(t => (
          <Link key={t.path} href={t.path} style={{ display:'flex', gap:'10px', alignItems:'center', padding:'10px 8px', fontSize:'14px', color:'#888', textDecoration:'none' }}>
            <span>{t.icon}</span><span>{t.name}</span>
          </Link>
        ))}
        <Link href="/request-access" style={{ marginTop:'auto', background:'#2563eb', color:'#fff', padding:'14px 20px', borderRadius:'6px', textDecoration:'none', fontSize:'15px', fontWeight:'600', textAlign:'center', display:'block' }}>Request Access</Link>
      </div>

      {/* ── Hero ── */}
      <section className="tl-section-pad" style={{
        textAlign:  'center',
        padding:    '96px 40px 72px',
        position:   'relative',
        overflow:   'hidden',
      }}>
        {/* Background radial */}
        <div style={{
          position:  'absolute',
          top:       0,
          left:      '50%',
          transform: 'translateX(-50%)',
          width:     '900px',
          height:    '480px',
          background:`radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 65%)`,
          pointerEvents:'none',
        }} />

        {/* Eyebrow badge */}
        <div style={{
          display:       'inline-flex',
          alignItems:    'center',
          gap:           '8px',
          padding:       '7px 18px',
          background:    C.blueGlow2,
          border:        `1px solid rgba(37,99,235,0.3)`,
          fontSize:      '11px',
          color:         C.blue,
          fontWeight:    '600',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom:  '32px',
          animation:     'slideUp 0.5s ease-out both',
        }}>
          <span style={{ fontSize:'14px' }}>⚖</span>
          Legal Tools Suite
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize:     'clamp(38px, 6vw, 64px)',
          fontFamily:   SERIF,
          fontWeight:   '700',
          letterSpacing:'-0.01em',
          lineHeight:   '1.08',
          margin:       '0 auto 24px',
          maxWidth:     '820px',
          color:        C.textPrimary,
          animation:    'slideUp 0.55s 0.05s ease-out both',
        }}>
          Your Complete<br />
          <span style={{ color:C.blue }}>Legal Toolkit</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize:   '18px',
          fontFamily: SERIF,
          fontStyle:  'italic',
          color:      C.textSecondary,
          maxWidth:   '600px',
          margin:     '0 auto 56px',
          lineHeight: '1.7',
          animation:  'slideUp 0.6s 0.1s ease-out both',
        }}>
          Eight AI-powered tools built for solo attorneys, small firms, and pro se
          individuals — free to try, world-class results.
        </p>

        {/* Stats strip */}
        <div style={{
          display:      'inline-flex',
          alignItems:   'center',
          background:   C.bgCard,
          border:       `1px solid ${C.border}`,
          overflow:     'hidden',
          animation:    'slideUp 0.65s 0.15s ease-out both',
        }}>
          {[
            { value:'8 Tools',         label:'Available Now'  },
            { value:'Free to Start',   label:'No Credit Card' },
            { value:'50 States',       label:'Full Coverage'  },
            { value:'No Subscription', label:'Required'       },
          ].map((stat, i) => (
            <div key={i} style={{
              padding:     '20px 32px',
              textAlign:   'center',
              borderRight: i < 3 ? `1px solid ${C.border}` : 'none',
              minWidth:    '130px',
            }}>
              <div style={{
                fontSize:    '15px',
                fontFamily:  SERIF,
                fontWeight:  '700',
                color:       C.textPrimary,
                lineHeight:  1,
                marginBottom:'4px',
              }}>{stat.value}</div>
              <div style={{
                fontSize:     '10px',
                color:        C.textMuted,
                letterSpacing:'0.06em',
                textTransform:'uppercase',
              }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tools grid ── */}
      <section className="tl-section-pad" style={{
        padding:  '16px 40px 96px',
        maxWidth: '1080px',
        margin:   '0 auto',
      }}>
        {/* Section label */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '12px',
          marginBottom: '28px',
        }}>
          <p style={{
            fontSize:      '11px',
            fontWeight:    '700',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         C.textMuted,
            margin:        0,
          }}>All Tools</p>
          <div style={{ flex:1, height:'1px', background:C.border }} />
          <span style={{
            fontSize:     '11px',
            color:        C.textMuted,
            letterSpacing:'0.05em',
          }}>{TOOLS.length} tools</span>
        </div>

        {/* Grid */}
        <div className="tl-tool-grid" style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap:                 '20px',
        }}>
          {TOOLS.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{
        borderTop:   `1px solid ${C.border}`,
        borderBottom:`1px solid ${C.border}`,
        background:  C.bgCard,
        padding:     '72px 40px',
        textAlign:   'center',
      }}>
        <div style={{ maxWidth:'640px', margin:'0 auto' }}>
          <p style={{
            fontSize:      '11px',
            fontWeight:    '700',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         C.blue,
            margin:        '0 0 16px',
          }}>Limited Access</p>
          <h2 style={{
            fontFamily:  SERIF,
            fontSize:    '36px',
            fontWeight:  '700',
            color:       C.textPrimary,
            margin:      '0 0 16px',
            lineHeight:  '1.15',
          }}>
            World-class AI. <span style={{ color:C.blue }}>No law degree required.</span>
          </h2>
          <p style={{
            fontFamily: SERIF,
            fontStyle:  'italic',
            fontSize:   '16px',
            color:      C.textSecondary,
            margin:     '0 0 36px',
            lineHeight: '1.7',
          }}>
            Every tool is backed by Claude, the industry-leading AI, with prompts engineered
            by legal professionals. Start with Pro Se for free — no account required.
          </p>
          <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/tools/pro-se" style={{
              padding:       '15px 36px',
              borderRadius:  '6px',
              background:    C.blue,
              color:         '#fff',
              fontSize:      '14px',
              fontWeight:    '600',
              textDecoration:'none',
              transition:    'background 0.15s',
              display:       'inline-block',
              fontFamily:    SANS,
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.blueHover}
              onMouseLeave={e => e.currentTarget.style.background = C.blue}
            >
              Try Pro Se Free
            </Link>
            <Link href="/request-access" style={{
              padding:       '15px 36px',
              borderRadius:  '6px',
              border:        `1px solid ${C.borderLight}`,
              background:    'transparent',
              color:         C.textSecondary,
              fontSize:      '14px',
              textDecoration:'none',
              display:       'inline-block',
              transition:    'all 0.15s',
              fontFamily:    SANS,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.blueGlow2 }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderLight; e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.background = 'transparent' }}
            >
              Request Full Access
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding:        '32px 40px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        borderTop:      `1px solid ${C.border}`,
        flexWrap:       'wrap',
        gap:            '16px',
      }}>
        <span style={{ fontFamily:SERIF, fontWeight:'700', fontSize:'18px', color:C.textPrimary, letterSpacing:'-0.02em' }}>TrustLayer</span>
        <p style={{ fontSize:'13px', color:C.textMuted, margin:0 }}>
          © 2026 TrustLayer Inc. Not a substitute for qualified legal counsel.
        </p>
        <div style={{ display:'flex', gap:'24px' }}>
          {['Privacy', 'Terms', 'Security', 'Contact'].map(item => (
            <a key={item} href="#" style={{
              fontSize:'13px', color:C.textMuted, textDecoration:'none',
              transition:'color 0.15s',
            }}
              onMouseEnter={e => e.target.style.color = C.textSecondary}
              onMouseLeave={e => e.target.style.color = C.textMuted}
            >{item}</a>
          ))}
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .tl-nav-links { display: none !important; }
          .tl-hamburger { display: flex !important; align-items: center; }
          .tl-2col { grid-template-columns: 1fr !important; }
          .tl-3col { grid-template-columns: 1fr !important; }
          .tl-section-pad { padding-left: 20px !important; padding-right: 20px !important; padding-top: 56px !important; padding-bottom: 56px !important; }
          .tl-card-pad { padding: 20px !important; }
          .tl-btn-full { width: 100% !important; }
          .tl-nav { padding: 0 20px !important; }
          .tl-hide-mobile { display: none !important; }
          .tl-tool-grid { grid-template-columns: 1fr !important; }
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
      `}</style>
    </div>
  )
}
