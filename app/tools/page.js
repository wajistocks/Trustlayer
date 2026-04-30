'use client'

import Link from 'next/link'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:           '#05070d',
  bgCard:       '#0a0d1a',
  bgInput:      '#080b14',
  border:       '#1a2035',
  borderGold:   'rgba(212,168,83,0.25)',
  gold:         '#d4a853',
  goldDim:      '#a07835',
  goldGlow:     'rgba(212,168,83,0.12)',
  goldGlow2:    'rgba(212,168,83,0.06)',
  textPrimary:  '#e8e0d0',
  textSecondary:'#8a8070',
  textMuted:    '#3a3530',
  verified:     '#22c55e',
  caution:      '#f59e0b',
  danger:       '#ef4444',
  blue:         '#3b82f6',
  purple:       '#8b5cf6',
}

const SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, "Times New Roman", serif'
const SANS  = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

// ─── Tools registry ───────────────────────────────────────────────────────────
const TOOLS = [
  { id:'plain-english',          path:'/tools/plain-english',          name:'Plain English Translator',   icon:'📖', color:'#60a5fa', desc:'Understand any legal document instantly. Paste legalese — get plain English back with a full glossary.',       free:false, category:'Documents'  },
  { id:'deadlines',              path:'/tools/deadlines',              name:'Deadline Calculator',         icon:'⏰', color:'#f59e0b', desc:'Never miss a filing deadline. Enter your case type and triggering event — get every deadline with rule citations.', free:false, category:'Litigation' },
  { id:'red-flags',              path:'/tools/red-flags',              name:'Contract Red Flag Scanner',  icon:'🔍', color:'#ef4444', desc:'Scan any contract for 20 dangerous clause types in 30 seconds. Get a safety score and negotiation language.',    free:false, category:'Contracts'  },
  { id:'letter-response',        path:'/tools/letter-response',        name:'Letter Response Generator',  icon:'✉',  color:'#c084fc', desc:'Respond to legal threats with confidence. Paste the letter — get a professionally drafted response.',              free:false, category:'Disputes'   },
  { id:'statute-of-limitations', path:'/tools/statute-of-limitations', name:'Statute of Limitations',     icon:'⏳', color:'#34d399', desc:'Know exactly how long you have to file. Get the exact deadline, statute citation, tolling exceptions.',            free:false, category:'Litigation' },
  { id:'ethics',                 path:'/tools/ethics',                 name:'Ethics Checker',              icon:'⚖', color:'#d4a853', desc:'Instant answers to attorney ethics questions. ABA Model Rules + state-specific bar opinions.',                     free:false, category:'Attorneys'  },
  { id:'pro-se',                 path:'/tools/pro-se',                 name:'Pro Se Legal Assistant',     icon:'🏛', color:'#22c55e', desc:'Navigate the legal system without an attorney. Step-by-step guidance, documents, hearing prep.',                   free:true,  category:'Self-Help'  },
]

// ─── Category color map ───────────────────────────────────────────────────────
const CAT_COLORS = {
  Documents:  '#60a5fa',
  Litigation: '#f59e0b',
  Contracts:  '#ef4444',
  Disputes:   '#c084fc',
  Attorneys:  '#d4a853',
  'Self-Help':'#22c55e',
}

// ─── Tool Card ────────────────────────────────────────────────────────────────
function ToolCard({ tool }) {
  const catColor = CAT_COLORS[tool.category] ?? C.gold

  function handleEnter(e) {
    e.currentTarget.style.borderColor = C.borderGold
    e.currentTarget.style.transform   = 'translateY(-2px)'
    e.currentTarget.style.boxShadow   = `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px ${C.borderGold}`
  }
  function handleLeave(e) {
    e.currentTarget.style.borderColor = C.border
    e.currentTarget.style.transform   = 'translateY(0)'
    e.currentTarget.style.boxShadow   = '0 2px 12px rgba(0,0,0,0.2)'
  }

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        background:   C.bgCard,
        border:       `1px solid ${C.border}`,
        borderRadius: '14px',
        padding:      '28px',
        display:      'flex',
        flexDirection:'column',
        gap:          '18px',
        cursor:       'default',
        transition:   'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        boxShadow:    '0 2px 12px rgba(0,0,0,0.2)',
        position:     'relative',
        overflow:     'hidden',
      }}
    >
      {/* Subtle glow accent top-right */}
      <div style={{
        position:   'absolute',
        top:        '-40px',
        right:      '-40px',
        width:      '120px',
        height:     '120px',
        borderRadius:'50%',
        background: `radial-gradient(circle, ${tool.color}14 0%, transparent 70%)`,
        pointerEvents:'none',
      }} />

      {/* Top row: icon + category */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        {/* Icon circle */}
        <div style={{
          width:        '48px',
          height:       '48px',
          borderRadius: '12px',
          background:   `${tool.color}18`,
          border:       `1px solid ${tool.color}35`,
          display:      'flex',
          alignItems:   'center',
          justifyContent:'center',
          fontSize:     '22px',
          flexShrink:   0,
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
          borderRadius:  '4px',
          background:    `${catColor}15`,
          border:        `1px solid ${catColor}30`,
        }}>
          {tool.category}
        </span>
      </div>

      {/* Body: name + description */}
      <div style={{ flex:1 }}>
        <h3 style={{
          fontFamily:  SERIF,
          fontSize:    '19px',
          fontWeight:  '700',
          color:       C.textPrimary,
          margin:      '0 0 8px',
          lineHeight:  '1.25',
        }}>
          {tool.name}
        </h3>
        <p style={{
          fontSize:   '13px',
          color:      C.textSecondary,
          lineHeight: '1.65',
          margin:     0,
          display:    '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient:'vertical',
          overflow:   'hidden',
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
              borderRadius:  '4px',
              background:    'rgba(34,197,94,0.1)',
              border:        '1px solid rgba(34,197,94,0.25)',
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
            padding:       '9px 18px',
            borderRadius:  '7px',
            fontSize:      '12px',
            fontWeight:    '700',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            textDecoration:'none',
            transition:    'all 0.18s',
            ...(tool.free
              ? {
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                  color:      '#0a0800',
                  border:     'none',
                  boxShadow:  '0 2px 12px rgba(212,168,83,0.25)',
                }
              : {
                  background: 'transparent',
                  color:      C.gold,
                  border:     `1px solid ${C.borderGold}`,
                }),
          }}
          onMouseEnter={e => {
            if (tool.free) {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(212,168,83,0.45)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            } else {
              e.currentTarget.style.background   = C.goldGlow
              e.currentTarget.style.borderColor  = C.gold
            }
          }}
          onMouseLeave={e => {
            if (tool.free) {
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(212,168,83,0.25)'
              e.currentTarget.style.transform = 'translateY(0)'
            } else {
              e.currentTarget.style.background  = 'transparent'
              e.currentTarget.style.borderColor = C.borderGold
            }
          }}
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
  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.textPrimary, fontFamily:SANS }}>

      {/* ── Nav ── */}
      <nav style={{
        position:     'sticky',
        top:          0,
        zIndex:       100,
        display:      'flex',
        alignItems:   'center',
        justifyContent:'space-between',
        padding:      '0 40px',
        height:       '68px',
        background:   'rgba(5,7,13,0.92)',
        backdropFilter:'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:'12px', textDecoration:'none' }}>
          <div style={{
            width:        '36px',
            height:       '36px',
            borderRadius: '8px',
            background:   `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
            display:      'flex',
            alignItems:   'center',
            justifyContent:'center',
            boxShadow:    `0 0 16px ${C.goldGlow}`,
          }}>
            <span style={{ fontSize:'18px', fontFamily:SERIF, fontWeight:'700', color:'#0a0800' }}>T</span>
          </div>
          <span style={{ fontSize:'20px', fontFamily:SERIF, fontWeight:'700', letterSpacing:'0.02em', color:C.textPrimary }}>
            Trust<span style={{ color:C.gold }}>Layer</span>
          </span>
        </Link>

        {/* Links */}
        <div style={{ display:'flex', gap:'32px', alignItems:'center' }}>
          <Link href="/" style={{
            fontSize:'13px', color:C.textSecondary, textDecoration:'none',
            letterSpacing:'0.04em', transition:'color 0.2s',
          }}
            onMouseEnter={e => e.target.style.color = C.gold}
            onMouseLeave={e => e.target.style.color = C.textSecondary}
          >Verify</Link>

          <Link href="/research" style={{
            fontSize:'13px', color:C.textSecondary, textDecoration:'none',
            letterSpacing:'0.04em', transition:'color 0.2s',
          }}
            onMouseEnter={e => e.target.style.color = C.gold}
            onMouseLeave={e => e.target.style.color = C.textSecondary}
          >Research</Link>

          {/* Tools — active */}
          <Link href="/tools" style={{
            fontSize:'13px', color:C.gold, textDecoration:'none',
            letterSpacing:'0.04em',
            borderBottom:`2px solid ${C.gold}`,
            paddingBottom:'2px',
          }}>Tools</Link>

          <Link href="/enterprise" style={{
            fontSize:'13px', color:C.textSecondary, textDecoration:'none',
            letterSpacing:'0.04em', transition:'color 0.2s',
          }}
            onMouseEnter={e => e.target.style.color = C.gold}
            onMouseLeave={e => e.target.style.color = C.textSecondary}
          >Enterprise</Link>

          <Link href="/request-access" style={{
            padding:      '8px 20px',
            borderRadius: '6px',
            border:       `1px solid ${C.borderGold}`,
            background:   C.goldGlow2,
            color:        C.gold,
            fontSize:     '13px',
            cursor:       'pointer',
            letterSpacing:'0.04em',
            transition:   'all 0.2s',
            textDecoration:'none',
            display:      'inline-block',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.goldGlow; e.currentTarget.style.borderColor = C.gold }}
            onMouseLeave={e => { e.currentTarget.style.background = C.goldGlow2; e.currentTarget.style.borderColor = C.borderGold }}
          >Request Access</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        textAlign:  'center',
        padding:    '100px 24px 72px',
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
          background:`radial-gradient(ellipse, rgba(212,168,83,0.07) 0%, transparent 65%)`,
          pointerEvents:'none',
        }} />

        {/* Eyebrow badge */}
        <div style={{
          display:       'inline-flex',
          alignItems:    'center',
          gap:           '8px',
          padding:       '7px 18px',
          borderRadius:  '999px',
          background:    C.goldGlow2,
          border:        `1px solid ${C.borderGold}`,
          fontSize:      '11px',
          color:         C.gold,
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
          fontSize:    'clamp(38px, 6vw, 68px)',
          fontFamily:  SERIF,
          fontWeight:  '700',
          letterSpacing:'-0.01em',
          lineHeight:  '1.08',
          margin:      '0 auto 24px',
          maxWidth:    '820px',
          color:       C.textPrimary,
          animation:   'slideUp 0.55s 0.05s ease-out both',
        }}>
          Your Complete<br />
          <span style={{ color:C.gold }}>Legal Toolkit</span>
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
          Seven AI-powered tools built for solo attorneys, small firms, and pro se
          individuals — free to try, world-class results.
        </p>

        {/* Stats strip */}
        <div style={{
          display:        'inline-flex',
          alignItems:     'center',
          gap:            '0',
          background:     C.bgCard,
          border:         `1px solid ${C.border}`,
          borderRadius:   '12px',
          overflow:       'hidden',
          animation:      'slideUp 0.65s 0.15s ease-out both',
        }}>
          {[
            { value:'7 Tools',              label:'Available Now'         },
            { value:'Free to Start',        label:'No Credit Card'        },
            { value:'50 States',            label:'Full Coverage'         },
            { value:'No Subscription',      label:'Required'              },
          ].map((stat, i) => (
            <div key={i} style={{
              padding:    '20px 32px',
              textAlign:  'center',
              borderRight: i < 3 ? `1px solid ${C.border}` : 'none',
              minWidth:   '130px',
            }}>
              <div style={{
                fontSize:   '15px',
                fontFamily: SERIF,
                fontWeight: '700',
                color:      C.gold,
                lineHeight: 1,
                marginBottom:'4px',
              }}>{stat.value}</div>
              <div style={{
                fontSize:   '10px',
                color:      C.textMuted,
                letterSpacing:'0.06em',
                textTransform:'uppercase',
              }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tools grid ── */}
      <section style={{
        padding:   '16px 24px 96px',
        maxWidth:  '1080px',
        margin:    '0 auto',
      }}>
        {/* Section label */}
        <div style={{
          display:       'flex',
          alignItems:    'center',
          gap:           '12px',
          marginBottom:  '28px',
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
            fontSize:   '11px',
            color:      C.textMuted,
            letterSpacing:'0.05em',
          }}>{TOOLS.length} tools</span>
        </div>

        {/* Grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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
        padding:     '72px 24px',
        textAlign:   'center',
      }}>
        <div style={{ maxWidth:'640px', margin:'0 auto' }}>
          <p style={{
            fontSize:      '11px',
            fontWeight:    '700',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         C.gold,
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
            World-class AI. <span style={{ color:C.gold }}>No law degree required.</span>
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
              borderRadius:  '7px',
              background:    `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
              color:         '#0a0800',
              fontSize:      '13px',
              fontWeight:    '700',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration:'none',
              boxShadow:     '0 4px 24px rgba(212,168,83,0.3)',
              transition:    'transform 0.15s, box-shadow 0.15s',
              display:       'inline-block',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(212,168,83,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 24px rgba(212,168,83,0.3)' }}
            >
              Try Pro Se Free
            </Link>
            <Link href="/request-access" style={{
              padding:       '15px 36px',
              borderRadius:  '7px',
              border:        `1px solid ${C.border}`,
              background:    'transparent',
              color:         C.textSecondary,
              fontSize:      '13px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration:'none',
              display:       'inline-block',
              transition:    'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=C.borderGold; e.currentTarget.style.color=C.gold; e.currentTarget.style.background=C.goldGlow2 }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary; e.currentTarget.style.background='transparent' }}
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
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{
            width:'28px', height:'28px', borderRadius:'6px',
            background:`linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{ fontFamily:SERIF, fontWeight:'700', fontSize:'14px', color:'#0a0800' }}>T</span>
          </div>
          <span style={{ fontFamily:SERIF, fontWeight:'700', fontSize:'16px' }}>
            Trust<span style={{ color:C.gold }}>Layer</span>
          </span>
        </div>
        <p style={{ fontSize:'12px', color:C.textMuted, margin:0 }}>
          © 2026 TrustLayer Inc. Not a substitute for qualified legal counsel.
        </p>
        <div style={{ display:'flex', gap:'24px' }}>
          {['Privacy', 'Terms', 'Security', 'Contact'].map(item => (
            <a key={item} href="#" style={{
              fontSize:'12px', color:C.textMuted, textDecoration:'none',
              transition:'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = C.gold}
              onMouseLeave={e => e.target.style.color = C.textMuted}
            >{item}</a>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        * { box-sizing:border-box; }
        body { margin:0; background:${C.bg}; }
        ::-webkit-scrollbar { width:7px; }
        ::-webkit-scrollbar-track { background:${C.bg}; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:4px; }
      `}</style>
    </div>
  )
}
