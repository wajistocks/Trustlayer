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

const TOOLS_NAV = [
  { path:'/tools/plain-english',         name:'Plain English Translator',  icon:'📖' },
  { path:'/tools/deadlines',             name:'Deadline Calculator',        icon:'⏰' },
  { path:'/tools/red-flags',             name:'Contract Red Flag Scanner',  icon:'🔍' },
  { path:'/tools/letter-response',       name:'Letter Response Generator',  icon:'✉'  },
  { path:'/tools/statute-of-limitations',name:'Statute of Limitations',     icon:'⏳' },
  { path:'/tools/ethics',                name:'Ethics Checker',             icon:'⚖' },
  { path:'/tools/pro-se',                name:'Pro Se Assistant',           icon:'🏛' },
  { path:'/tools/lease-interpreter',     name:'Lease Interpreter',           icon:'🏠' },
]

function Counter({ target, suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        setVal(Math.round(ease * target))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

function TrustRing({ score, animated = true }) {
  const [displayed, setDisplayed] = useState(animated ? 0 : score)
  useEffect(() => {
    if (!animated) return
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / 1200, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplayed(Math.round(ease * score))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score, animated])

  const radius = 58
  const circ = 2 * Math.PI * radius
  const offset = circ - (displayed / 100) * circ
  const color = displayed >= 70 ? C.verified : displayed >= 40 ? C.warning : C.error
  const label = displayed >= 70 ? 'Trustworthy' : displayed >= 40 ? 'Uncertain' : 'High Risk'

  return (
    <div style={{ position: 'relative', width: 160, height: 160 }}>
      <svg width={160} height={160} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={80} cy={80} r={radius} fill="none" stroke={C.border} strokeWidth={8} />
        <circle
          cx={80} cy={80} r={radius} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke 0.3s', filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '34px', fontWeight: '700', color, lineHeight: 1, fontFamily: SANS }}>
          {displayed}
        </span>
        <span style={{ fontSize: '11px', color: C.textSecondary, marginTop: '2px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
    </div>
  )
}

function ClaimCard({ claim }) {
  const map = {
    Verified:      { color: C.verified,  bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   icon: '✓' },
    Unverified:    { color: C.warning,   bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  icon: '?' },
    Hallucination: { color: C.error,     bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   icon: '✗' },
    Outdated:      { color: '#8b5cf6',   bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.2)',  icon: '↻' },
  }
  const typeLabels = {
    statute: 'Statute',
    case_citation: 'Case Citation',
    regulatory_claim: 'Regulation',
    legal_standard: 'Legal Standard',
    factual_assertion: 'Fact',
    date_claim: 'Date',
    jurisdiction_claim: 'Jurisdiction',
  }
  const s = map[claim.verdict] ?? map.Unverified
  return (
    <div style={{
      padding: '16px 18px',
      background: s.bg,
      border: `1px solid ${s.border}`,
      marginBottom: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span style={{
          width: '22px', height: '22px', borderRadius: '50%',
          background: s.color, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '700', flexShrink: 0, marginTop: '1px',
        }}>{s.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em',
              textTransform: 'uppercase', color: s.color,
              padding: '2px 8px', borderRadius: '4px',
              background: s.border,
            }}>{claim.verdict}</span>
            {claim.type && (
              <span style={{
                fontSize: '10px', fontWeight: '600', letterSpacing: '0.05em',
                textTransform: 'uppercase', color: C.textSecondary,
                padding: '2px 7px', borderRadius: '4px',
                background: C.blueGlow2, border: `1px solid ${C.border}`,
              }}>{typeLabels[claim.type] ?? claim.type}</span>
            )}
            {claim.confidence != null && (
              <span style={{
                fontSize: '10px', fontWeight: '600', color: C.textSecondary,
                padding: '2px 7px', borderRadius: '4px',
                background: C.blueGlow2, border: `1px solid ${C.border}`,
              }}>{claim.confidence}% confidence</span>
            )}
            {claim.severity === 'high' && (
              <span style={{
                fontSize: '10px', fontWeight: '600', letterSpacing: '0.06em',
                textTransform: 'uppercase', color: C.error,
                padding: '2px 6px', borderRadius: '4px',
                background: C.errorBg,
              }}>HIGH SEVERITY</span>
            )}
          </div>
          <p style={{
            fontSize: '13px', color: C.textPrimary, margin: '0 0 6px',
            fontStyle: 'italic', lineHeight: '1.5', fontFamily: SERIF,
          }}>"{claim.text}"</p>
          <p style={{ fontSize: '12px', color: C.textSecondary, margin: '0 0 8px', lineHeight: '1.5' }}>
            {claim.explanation}
          </p>
          {claim.correction && (
            <div style={{
              padding: '8px 12px',
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)',
              marginBottom: '6px',
            }}>
              <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: C.verified }}>Correction: </span>
              <span style={{ fontSize: '12px', color: C.textSecondary, lineHeight: '1.5' }}>{claim.correction}</span>
            </div>
          )}
          {claim.closestRealCase && (
            <div style={{
              padding: '8px 12px',
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)',
              marginBottom: '6px',
            }}>
              <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: C.warning }}>Closest Real Case: </span>
              <span style={{ fontSize: '12px', color: C.textSecondary, lineHeight: '1.5' }}>{claim.closestRealCase}</span>
            </div>
          )}
          {claim.courtListenerUrl && (
            <a href={claim.courtListenerUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', color: C.blue, textDecoration: 'none',
              padding: '3px 9px', borderRadius: '4px',
              background: C.blueGlow2, border: `1px solid rgba(37,99,235,0.3)`,
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.blueGlow}
              onMouseLeave={e => e.currentTarget.style.background = C.blueGlow2}
            >↗ View on CourtListener</a>
          )}
        </div>
      </div>
    </div>
  )
}

const DEMO_DOC = `VENDOR DATA PROCESSING AGREEMENT — COMPLIANCE REVIEW
Re: Preliminary Legal Analysis for Execution Approval

The mandatory arbitration clause cites AT&T Mobility LLC v. Concepcion, 563 U.S. 333 (2011), and is grounded in the Federal Arbitration Act, 9 U.S.C. § 1 et seq. The consumer protection carve-out references California Business & Professions Code § 17200.

The indemnification section limits liability by citing Wesbrook Enterprises v. National Data Corp., 847 F.3d 291 (9th Cir. 2021). The confidentiality clause imposes criminal liability under 18 U.S.C. § 2045. The data deletion provisions assert an absolute right to erasure under GDPR Article 17, superseding all commercial interests of the data controller.`

const DEMO_STEPS = [
  { label: 'Extracting claims',       detail: 'Found 6 legal assertions, 3 case citations, 3 statutory references' },
  { label: 'Checking citations',      detail: 'Cross-referencing citations against federal and state reporters...' },
  { label: 'Verifying statutes',      detail: 'Validating statutory references against current U.S.C. databases...' },
  { label: 'Calculating trust score', detail: 'Weighing hallucination risk, severity, and confidence...' },
]

const DEMO_RESULTS = [
  {
    verdict: 'Hallucination',
    icon: '✗', color: '#ef4444', bg: 'rgba(239,68,68,0.09)', border: 'rgba(239,68,68,0.22)',
    label: 'HALLUCINATION',
    text: 'Wesbrook Enterprises v. National Data Corp., 847 F.3d 291 (9th Cir. 2021)',
    detail: 'No such case exists in any federal reporter. This citation was fabricated.',
    sub: 'Closest real case: AT&T Mobility LLC v. Concepcion, 563 U.S. 333 (2011)',
    subColor: '#f59e0b',
    high: true,
  },
  {
    verdict: 'Verified',
    icon: '✓', color: '#22c55e', bg: 'rgba(34,197,94,0.09)', border: 'rgba(34,197,94,0.22)',
    label: 'VERIFIED',
    text: 'AT&T Mobility LLC v. Concepcion, 563 U.S. 333 (2011)',
    detail: 'Accurately cited. Supreme Court held FAA preempts state rules barring class-action waivers.',
  },
  {
    verdict: 'Hallucination',
    icon: '✗', color: '#ef4444', bg: 'rgba(239,68,68,0.09)', border: 'rgba(239,68,68,0.22)',
    label: 'HALLUCINATION',
    text: '18 U.S.C. § 2045 — criminal liability for breach of confidentiality',
    detail: '18 U.S.C. § 2045 does not exist. No federal statute criminalizes commercial confidentiality breaches.',
    sub: 'Correction: Civil remedies under Defend Trade Secrets Act, 18 U.S.C. § 1836 (2016)',
    subColor: '#22c55e',
    high: true,
  },
  {
    verdict: 'Outdated',
    icon: '↻', color: '#8b5cf6', bg: 'rgba(139,92,246,0.09)', border: 'rgba(139,92,246,0.22)',
    label: 'OUTDATED',
    text: 'GDPR Article 17 grants an absolute right to erasure superseding all commercial interests',
    detail: '2023 CJEU rulings clarified this right must be balanced against legitimate processing interests — not absolute.',
  },
  {
    verdict: 'Verified',
    icon: '✓', color: '#22c55e', bg: 'rgba(34,197,94,0.09)', border: 'rgba(34,197,94,0.22)',
    label: 'VERIFIED',
    text: 'Federal Arbitration Act, 9 U.S.C. § 1 et seq.',
    detail: 'Accurate statement of FAA scope and its preemptive effect on state arbitration laws.',
  },
  {
    verdict: 'Verified',
    icon: '✓', color: '#22c55e', bg: 'rgba(34,197,94,0.09)', border: 'rgba(34,197,94,0.22)',
    label: 'VERIFIED',
    text: 'California Business & Professions Code § 17200 — private right of action',
    detail: "Correct description of California's Unfair Competition Law and its broad private right of action.",
  },
]

function DemoModal({ onClose }) {
  const [step, setStep]           = useState(0)
  const [score, setScore]         = useState(0)
  const [email, setEmail]         = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const t0 = setTimeout(() => setStep(1), 150)
    const t1 = setTimeout(() => setStep(2), 1150)
    const t2 = setTimeout(() => setStep(3), 2150)
    const t3 = setTimeout(() => setStep(4), 3150)
    const t4 = setTimeout(() => setStep(5), 4150)
    return () => [t0, t1, t2, t3, t4].forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (step !== 5) return
    const start = performance.now()
    let raf
    const tick = (now) => {
      const p = Math.min((now - start) / 1100, 1)
      setScore(Math.round((1 - Math.pow(1 - p, 3)) * 67))
      if (p < 1) { raf = requestAnimationFrame(tick) }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [step])

  function handleSubmit(e) {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  const circ = 2 * Math.PI * 50
  const offset = circ - (score / 100) * circ

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{
        width: '100%', maxWidth: '740px',
        maxHeight: '92vh',
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
      }}>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: SERIF, fontSize: '18px', fontWeight: '700', color: C.textPrimary }}>
              TrustLayer
            </span>
            <span style={{
              fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase',
              color: C.blue, padding: '2px 9px', borderRadius: '4px',
              background: C.blueGlow2, border: `1px solid rgba(37,99,235,0.3)`,
            }}>Live Demo</span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '30px', height: '30px', borderRadius: '6px',
              background: 'transparent', border: `1px solid ${C.border}`,
              color: C.textSecondary, fontSize: '20px', lineHeight: 1,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.textPrimary }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary }}
          >×</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{
            background: C.bgSecondary, border: `1px solid ${C.border}`, overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', borderBottom: `1px solid ${C.border}`,
            }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => (
                <div key={c} style={{ width: '9px', height: '9px', borderRadius: '50%', background: c }} />
              ))}
              <span style={{ marginLeft: '8px', fontSize: '11px', color: C.textMuted, fontFamily: MONO }}>
                compliance_review.txt
              </span>
            </div>
            <p style={{
              fontSize: '12.5px', fontFamily: MONO,
              color: C.textSecondary, lineHeight: '1.95', margin: 0,
              padding: '16px 20px', whiteSpace: 'pre-wrap',
            }}>{DEMO_DOC}</p>
          </div>

          <div style={{
            background: C.bg, border: `1px solid ${C.border}`,
            padding: '20px 24px',
            display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            <p style={{
              fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
              textTransform: 'uppercase', color: C.textMuted, margin: 0,
            }}>Analysis Progress</p>
            {DEMO_STEPS.map((s, i) => {
              const id = i + 1
              const done    = step > id
              const active  = step === id
              const pending = step < id
              return (
                <div key={id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: done    ? 'rgba(34,197,94,0.15)'
                                : active  ? C.blueGlow
                                : 'transparent',
                      border: done    ? '1px solid rgba(34,197,94,0.4)'
                            : active  ? `1px solid rgba(37,99,235,0.5)`
                            : `1px solid ${C.border}`,
                      transition: 'all 0.3s',
                    }}>
                      {done ? (
                        <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '800' }}>✓</span>
                      ) : active ? (
                        <span style={{
                          width: '9px', height: '9px', borderRadius: '50%',
                          border: `2px solid ${C.blue}`, borderTopColor: 'transparent',
                          display: 'block', animation: 'spin 0.6s linear infinite',
                        }} />
                      ) : (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.border, display: 'block' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: '13px', fontWeight: '600',
                        color: done ? C.textPrimary : active ? C.textPrimary : C.textMuted,
                        transition: 'color 0.3s',
                      }}>{s.label}</span>
                      {(done || active) && (
                        <p style={{ fontSize: '11px', color: C.textSecondary, margin: '1px 0 0', lineHeight: 1.4 }}>
                          {s.detail}
                        </p>
                      )}
                    </div>
                    {done && (
                      <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '600', flexShrink: 0 }}>Done</span>
                    )}
                    {pending && (
                      <span style={{ fontSize: '11px', color: C.textMuted, flexShrink: 0 }}>—</span>
                    )}
                  </div>
                  <div style={{
                    height: '3px',
                    background: C.border, marginLeft: '34px', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      background: done ? '#22c55e' : active ? C.blue : 'transparent',
                      width: done ? '100%' : '0%',
                      animation: active ? 'barFill 0.95s linear forwards' : 'none',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>

          {step >= 5 && (
            <div style={{ animation: 'slideUp 0.4s ease-out' }}>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '24px',
                padding: '22px 24px',
                background: C.blueGlow2, border: `1px solid rgba(37,99,235,0.25)`,
                marginBottom: '16px', flexWrap: 'wrap',
              }}>
                <div style={{ position: 'relative', width: 104, height: 104, flexShrink: 0 }}>
                  <svg width={104} height={104} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={52} cy={52} r={50} fill="none" stroke={C.border} strokeWidth={6} />
                    <circle cx={52} cy={52} r={50} fill="none"
                      stroke="#f59e0b" strokeWidth={6}
                      strokeDasharray={circ} strokeDashoffset={offset}
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 0 6px #f59e0b)', transition: 'stroke-dashoffset 0.05s' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '26px', fontWeight: '700', color: '#f59e0b', lineHeight: 1, fontFamily: SANS }}>{score}</span>
                    <span style={{ fontSize: '9px', color: C.textSecondary, marginTop: '2px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Uncertain</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h3 style={{ fontFamily: SERIF, fontSize: '19px', fontWeight: '600', color: C.textPrimary, margin: '0 0 6px' }}>
                    Analysis Complete
                  </h3>
                  <p style={{ fontSize: '13px', color: C.textSecondary, fontFamily: SERIF, fontStyle: 'italic', lineHeight: '1.65', margin: '0 0 14px' }}>
                    This document contains 2 fabricated citations and 1 outdated legal standard. Do not execute without independent legal review.
                  </p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {[
                      { n: 3, label: 'Verified',        color: '#22c55e' },
                      { n: 1, label: 'Outdated',        color: '#8b5cf6' },
                      { n: 2, label: 'Hallucinations',  color: '#ef4444' },
                    ].map(v => (
                      <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: v.color, boxShadow: `0 0 5px ${v.color}` }} />
                        <span style={{ fontSize: '11px', color: C.textSecondary }}>{v.n} {v.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p style={{
                fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                textTransform: 'uppercase', color: C.textMuted, margin: '0 0 10px',
              }}>Claim-by-Claim Breakdown</p>
              {DEMO_RESULTS.map((r, i) => (
                <div key={i} style={{
                  padding: '13px 16px',
                  background: r.bg, border: `1px solid ${r.border}`,
                  marginBottom: '8px',
                  animation: `slideUp 0.3s ease-out ${i * 60}ms both`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: r.color, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: '800', flexShrink: 0, marginTop: '1px',
                    }}>{r.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '9px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase',
                          color: r.color, padding: '1px 7px', borderRadius: '3px', background: r.border,
                        }}>{r.label}</span>
                        {r.high && (
                          <span style={{
                            fontSize: '9px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: '#ef4444', padding: '1px 5px', borderRadius: '3px',
                            background: 'rgba(239,68,68,0.12)',
                          }}>HIGH RISK</span>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: C.textPrimary, margin: '0 0 3px', fontStyle: 'italic', fontFamily: SERIF, lineHeight: '1.5' }}>
                        "{r.text}"
                      </p>
                      <p style={{ fontSize: '11px', color: C.textSecondary, margin: 0, lineHeight: '1.5' }}>{r.detail}</p>
                      {r.sub && (
                        <p style={{ fontSize: '11px', color: r.subColor, margin: '4px 0 0', lineHeight: '1.45', fontWeight: '500' }}>{r.sub}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step >= 5 && !submitted && (
            <div style={{
              padding: '28px',
              background: C.blueGlow2,
              border: `1px solid rgba(37,99,235,0.3)`,
              animation: 'slideUp 0.45s 0.2s ease-out both',
            }}>
              <p style={{
                fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase',
                color: C.blue, margin: '0 0 10px',
              }}>Limited Offer</p>
              <h3 style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: C.textPrimary, margin: '0 0 8px' }}>
                Get 3 free verifications — no credit card required
              </h3>
              <p style={{ fontSize: '14px', color: C.textSecondary, fontFamily: SERIF, fontStyle: 'italic', lineHeight: '1.65', margin: '0 0 20px' }}>
                What you just saw takes 28 seconds on your own documents. Enter your work email to claim instant access.
              </p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@yourfirm.com" required
                  style={{
                    flex: 1, minWidth: '200px', padding: '13px 16px', borderRadius: '4px',
                    background: C.bgSecondary, border: `1px solid ${C.borderLight}`,
                    color: C.textPrimary, fontSize: '14px', outline: 'none', fontFamily: SANS,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = C.blue}
                  onBlur={e => e.target.style.borderColor = C.borderLight}
                />
                <button type="submit" style={{
                  padding: '13px 28px', borderRadius: '6px',
                  background: C.blue,
                  border: 'none', color: '#fff',
                  fontSize: '13px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = C.blueHover}
                  onMouseLeave={e => e.currentTarget.style.background = C.blue}
                >Claim Free Access</button>
              </form>
              <p style={{ fontSize: '11px', color: C.textMuted, margin: '10px 0 0' }}>
                Work email only. No spam. Unsubscribe anytime.
              </p>
            </div>
          )}

          {submitted && (
            <div style={{
              padding: '36px', textAlign: 'center',
              background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.22)',
              animation: 'slideUp 0.3s ease-out',
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: '24px', color: '#22c55e',
              }}>✓</div>
              <h3 style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: '600', color: C.textPrimary, margin: '0 0 8px' }}>
                You're on the list.
              </h3>
              <p style={{ fontSize: '14px', color: C.textSecondary, margin: 0, fontFamily: SERIF, fontStyle: 'italic', lineHeight: '1.65' }}>
                Check your inbox — your activation link and 3 free verifications are on their way.
              </p>
            </div>
          )}

          <div style={{ height: '4px' }} />
        </div>
      </div>
    </div>
  )
}

const SAMPLES = {
  Brief: `MEMORANDUM OF LAW IN SUPPORT OF PLAINTIFF'S MOTION FOR SPECIFIC PERFORMANCE

IN THE UNITED STATES DISTRICT COURT
DISTRICT OF DELAWARE

Case No. 25-cv-4419

NEXUS CAPITAL ADVISORS LLC, Plaintiff,
v.
BRIDGEPOINT HOLDINGS INC., Defendant.

INTRODUCTION

Plaintiff Nexus Capital Advisors LLC submits this memorandum in support of its motion for specific performance of a binding Letter of Intent executed on September 14, 2025. Defendant's unilateral repudiation of its contractual obligations, absent any legitimate material adverse change, entitles Plaintiff to equitable relief.

ARGUMENT

I. PLAINTIFF IS ENTITLED TO SPECIFIC PERFORMANCE BECAUSE MONETARY DAMAGES ARE INADEQUATE.

Specific performance is an appropriate remedy where the subject matter of the contract is unique and monetary damages cannot adequately compensate the non-breaching party. See Hadley v. Baxendale, 9 Exch. 341 (1854) (establishing that contract damages must be foreseeable at the time of contracting). The unique nature of the merger target — a specialty pharmaceutical portfolio with three FDA-approved compounds — renders monetary substitution impossible.

Under Delaware law, specific performance of merger agreements is well-established where the target company's assets are irreplaceable. See Westfield Capital Partners v. Avery Group, 412 F.3d 891 (2d Cir. 2005), which held that acquirers may compel specific performance of signed merger agreements when the target has unique strategic value not susceptible to monetary valuation.

II. DEFENDANT'S MATERIAL ADVERSE CHANGE CLAIM IS LEGALLY INSUFFICIENT.

Delaware courts have set a demanding standard for MAC clauses. The mere prospect of decreased revenue in a single fiscal quarter does not constitute a material adverse change warranting termination. In re Meridian Acquisition Corp., 847 A.2d 314 (Del. Ch. 2019), the Court of Chancery held that a MAC clause is triggered only by "durationally significant" changes that would be material to a reasonable acquirer taking a long-term view. Defendant has presented no evidence of any such sustained impairment.

III. THE LETTER OF INTENT CONSTITUTES A BINDING OBLIGATION.

New York courts routinely enforce binding pre-merger commitments that contain definite terms and objective evidence of intent to be bound. See Kenford Co. v. County of Erie, 67 N.Y.2d 257 (1986). Moreover, in Sterling Asset Management v. Pinnacle Trust, 223 F. Supp. 3d 418 (S.D.N.Y. 2021), the court confirmed that a signed letter of intent that includes price, structure, and closing conditions is enforceable under New York law.

CONCLUSION

For the foregoing reasons, Plaintiff respectfully requests that this Court grant specific performance of the Letter of Intent and award attorneys' fees and costs.`,

  Contract: `EMPLOYMENT AGREEMENT

This Employment Agreement is entered into as of March 1, 2026, between Stratum Analytics Inc., a California corporation ("Company"), and Jordan Mills ("Employee").

1. POSITION. Employee is hired as Vice President of Product, reporting to the CEO. Employee agrees to devote full professional time and effort to the Company.

2. COMPENSATION. Employee shall receive a base salary of $215,000 per year. Employee shall be eligible for an annual discretionary bonus not to exceed 20% of base salary.

3. MEAL PERIODS. Company shall provide meal periods in compliance with California Labor Code § 512 and the California Supreme Court's ruling in Brinker Restaurant Corp. v. Superior Court, 53 Cal.4th 1004 (2012), which held that employers must provide meal periods but are not obligated to ensure employees actually take them.

4. MINIMUM WAGE. All compensation paid hereunder meets or exceeds the applicable California minimum wage. As of the effective date of this Agreement, the California minimum wage is $13.00 per hour for employers with 25 or fewer employees and $14.00 per hour for employers with 26 or more employees, as established under California Labor Code § 1182.12.

5. NON-COMPETE. For a period of 12 months following termination, Employee agrees not to engage in any business activity that competes with Company within California. This restriction is permissible under California Business & Professions Code § 16600, which allows reasonable post-employment non-compete clauses where the employee has received access to protectable trade secrets, as confirmed in Whitehill Engineering LLC v. Donovan, 58 Cal.App.5th 219 (2020).

6. WARN ACT NOTICE. Company's layoff obligations are governed by the California WARN Act, Cal. Lab. Code § 1400 et seq., which requires 60 days advance notice for mass layoffs affecting employers with 60 or more full-time employees.

7. CONFIDENTIALITY. Employee acknowledges that all proprietary Company information constitutes trade secrets under the California Uniform Trade Secrets Act, Cal. Civil Code § 3426. Confidentiality obligations survive termination for seven years.

8. GOVERNING LAW. This Agreement shall be governed by the laws of the State of California.`,

  NDA: `MUTUAL NON-DISCLOSURE AGREEMENT

This Agreement is entered into as of April 1, 2026, between Quantum Diagnostics LLC, a Delaware limited liability company, and Veridian Bio Partners Inc., a New York corporation.

1. CONFIDENTIAL INFORMATION. "Confidential Information" means any non-public information disclosed in connection with the parties' evaluation of a potential joint development partnership.

2. FEDERAL TRADE SECRET PROTECTION. Each party acknowledges that Confidential Information may constitute trade secrets protected under the Defend Trade Secrets Act of 2012 ("DTSA"), 18 U.S.C. § 1836, which provides for federal civil litigation and ex parte seizure orders for misappropriation of trade secrets used in interstate commerce.

3. STATE LAW PROTECTIONS. Trade secrets are independently protected under the Uniform Trade Secrets Act as adopted in each state. The UTSA defines a trade secret under Section 1(4) as information that derives independent economic value from not being generally known. Misappropriation claims under the UTSA carry a three-year statute of limitations under UTSA § 6.

4. OBLIGATIONS. Each party agrees to: (a) use reasonable care to protect the other's Confidential Information; (b) restrict disclosure to employees with a need to know; (c) not use Confidential Information for any purpose other than evaluating the proposed partnership. These obligations are consistent with the standard articulated in Rockwell Collins Inc. v. Wallace, No. 17-cv-3529 (D. Minn. 2018), which held that bilateral NDAs impose symmetric obligations and that a party disclosing Confidential Information in breach is liable for all foreseeable consequential damages.

5. TERM. Confidentiality obligations survive for three years. Upon expiration or written request, each party shall return or destroy all Confidential Information and certify such destruction within 30 days, in accordance with 18 U.S.C. § 1839(5)(B), which mandates written certification for destruction of trade secret materials covered by an NDA.

6. GOVERNING LAW. This Agreement is governed by the laws of Delaware.`,

  ToS: `TERMS OF SERVICE — LEXAI RESEARCH PLATFORM
Effective Date: February 1, 2026

1. ACCEPTANCE. By using LexAI, you agree to these Terms, which constitute a binding agreement under the Electronic Signatures in Global and National Commerce Act (E-SIGN Act), 15 U.S.C. § 7001.

2. AI DISCLAIMER. Content generated by LexAI is for informational purposes only. Pursuant to the FTC's Guidance on AI-Generated Legal Content (FTC Advisory Opinion No. 2024-07), platforms providing AI-generated legal analysis must prominently disclose that no attorney-client relationship is created and that users should seek independent legal counsel.

3. DATA USAGE. By submitting queries to LexAI, you grant LexAI an irrevocable license to use your content to train and improve its AI models. This practice is permissible under FTC Regulation 16 C.F.R. Part 255A, which establishes that user content submitted to AI platforms may be used for commercial training purposes without separate consent, provided the practice is disclosed in accessible terms of service.

4. GDPR. For EU users, LexAI processes personal data under Article 6(1)(b) of the GDPR (performance of a contract). Sensitive personal data is processed under Article 9(2)(f), which authorizes processing necessary for the establishment, exercise, or defense of legal claims.

5. LIABILITY CAP. TO THE MAXIMUM EXTENT PERMITTED BY LAW, LEXAI'S TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED $100 OR THE AMOUNT PAID IN THE PRECEDING THREE MONTHS. Courts have upheld such limitations in consumer software agreements. See Lamichhane v. Apex Software Solutions, No. 21-cv-8843 (N.D. Cal. 2023), which confirmed that limitation of liability clauses in SaaS terms of service are enforceable under California law.

6. MANDATORY ARBITRATION. All disputes shall be resolved by binding arbitration. Class action waivers are enforceable under AT&T Mobility LLC v. Concepcion, 563 U.S. 333 (2011), and American Express Co. v. Italian Colors Restaurant, 570 U.S. 228 (2013).

7. MODIFICATIONS. LexAI may modify these Terms at any time. Continued use constitutes acceptance.`,

  Filing: `FORM D — NOTICE OF EXEMPT OFFERING OF SECURITIES
U.S. Securities and Exchange Commission

Issuer Name: Helix Growth Partners Fund II, LLC
Date of First Sale: January 15, 2026
Total Offering Amount: $50,000,000

EXEMPTION CLAIMED: Rule 506(b) of Regulation D under the Securities Act of 1933, 17 C.F.R. § 230.506(b). This exemption permits offerings to an unlimited number of accredited investors and up to 35 sophisticated non-accredited investors without general solicitation.

ACCREDITED INVESTOR STANDARDS: All certifications comply with Rule 501(a). Natural persons qualify under Rule 501(a)(5) (net worth exceeding $1,000,000 excluding primary residence) or Rule 501(a)(6) (income exceeding $200,000 individually or $300,000 jointly for the two preceding years).

INTEGRATION SAFE HARBOR: This offering will not be integrated with any prior offering pursuant to Rule 502(a), which provides that offerings separated by more than six months will not be integrated. This position is consistent with In re Crosspoint Capital Management, SEC Release No. 34-81742 (Feb. 14, 2017), which reaffirmed that the six-month safe harbor under Rule 502(a) is absolute and requires no facts-and-circumstances analysis when the temporal gap is satisfied.

AI DISCLOSURE: This fund employs AI for deal sourcing. Pursuant to SEC Staff Legal Bulletin No. 14M (Feb. 2025), investment advisers using AI in their investment processes must disclose the specific models used, their training data provenance, and system limitations in all offering materials.

RESALE RESTRICTIONS: Securities are restricted and may not be resold absent registration or an exemption. Purchasers must hold securities for a minimum of 24 months under Rule 144(d)(1), which provides a one-year holding period for reporting company affiliates.

ANTI-FRAUD: All statements are true and complete. False statements in connection with a securities offering violate Section 10(b) of the Securities Exchange Act of 1934 and Rule 10b-5, as applied in SEC v. Steadfast Capital Group, 389 F.3d 244 (2d Cir. 2004), which established liability for material misstatements in private placement offering documents.`,
}

export default function Home() {
  const [text, setText]               = useState('')
  const [loading, setLoading]         = useState(false)
  const [result, setResult]           = useState(null)
  const [error, setError]             = useState(null)
  const [focused, setFocused]         = useState(false)
  const [activeTab, setActiveTab]     = useState('claims')
  const [demoOpen, setDemoOpen]       = useState(false)
  const [toolsOpen, setToolsOpen]     = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const resultsRef = useRef(null)

  async function handleVerify() {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Verification failed')
      setResult(data)
      setActiveTab('claims')
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const verdictCounts = result?.claims ? {
    Verified:      result.claims.filter(c => c.verdict === 'Verified').length,
    Unverified:    result.claims.filter(c => c.verdict === 'Unverified').length,
    Hallucination: result.claims.filter(c => c.verdict === 'Hallucination').length,
    Outdated:      result.claims.filter(c => c.verdict === 'Outdated').length,
  } : {}

  const correctionsClaims = result?.claims?.filter(c => c.correction || c.closestRealCase) ?? []

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.textPrimary, fontFamily: SANS }}>

      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .tl-nav-links { display: none !important; }
          .tl-hamburger { display: flex !important; align-items: center; }
          .tl-2col { grid-template-columns: 1fr !important; }
          .tl-3col { grid-template-columns: 1fr !important; }
          .tl-hero-title { font-size: 36px !important; line-height: 1.15 !important; }
          .tl-section-pad { padding-left: 20px !important; padding-right: 20px !important; padding-top: 56px !important; padding-bottom: 56px !important; }
          .tl-card-pad { padding: 20px !important; }
          .tl-btn-full { width: 100% !important; }
          .tl-hide-mobile { display: none !important; }
          .tl-nav { padding: 0 20px !important; }
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:0.3 } 50% { opacity:0.7 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
        @keyframes barFill { from { width: 0%; } to { width: 100%; } }
        ::selection { background: rgba(37,99,235,0.4); color: #fff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        body { margin: 0; background: #000; }
        textarea::placeholder { color: #444; }
        textarea::-webkit-scrollbar { width: 5px; }
        textarea::-webkit-scrollbar-track { background: transparent; }
        textarea::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>

      <nav className="tl-nav" style={{ position:'sticky', top:0, zIndex:100, background:'#000', borderBottom:'1px solid #222', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px' }}>
        <Link href="/" style={{ textDecoration:'none', fontSize:'22px', fontFamily:SERIF, fontWeight:'700', color:'#fff', letterSpacing:'-0.02em' }}>TrustLayer</Link>

        <div className="tl-nav-links" style={{ display:'flex', gap:'32px', alignItems:'center' }}>
          <Link href="/research" style={{ fontSize:'14px', color:'#fff', textDecoration:'none', transition:'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = C.blue}
            onMouseLeave={e => e.currentTarget.style.color = '#fff'}
          >Research</Link>

          <div style={{ position:'relative' }}
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <Link href="/tools" style={{ fontSize:'14px', color:'#fff', textDecoration:'none', transition:'color 0.15s', display:'flex', alignItems:'center', gap:'4px' }}
              onMouseEnter={e => e.currentTarget.style.color = C.blue}
              onMouseLeave={e => e.currentTarget.style.color = '#fff'}
            >Tools <span style={{ fontSize:'9px', opacity:0.7 }}>▾</span></Link>
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
                <Link href="/tools" style={{ display:'block', textAlign:'center', padding:'8px 10px', borderRadius:'4px', fontSize:'12px', color:'#2563eb', fontWeight:'600', textDecoration:'none' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(37,99,235,0.1)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >View All Tools →</Link>
              </div>
            )}
          </div>

          <Link href="/enterprise" style={{ fontSize:'14px', color:'#fff', textDecoration:'none', transition:'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = C.blue}
            onMouseLeave={e => e.currentTarget.style.color = '#fff'}
          >Enterprise</Link>

          <Link href="/request-access" style={{ background:'#2563eb', color:'#fff', padding:'9px 22px', borderRadius:'6px', fontSize:'14px', fontWeight:'600', textDecoration:'none', transition:'background 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='#1d4ed8'}
            onMouseLeave={e=>e.currentTarget.style.background='#2563eb'}
          >Request Access</Link>
        </div>

        <button className="tl-hamburger" style={{ display:'none', background:'none', border:'none', color:'#fff', fontSize:'22px', cursor:'pointer', padding:'8px', lineHeight:1 }} onClick={() => setMobileMenuOpen(v => !v)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {mobileMenuOpen && <div style={{ position:'fixed', inset:0, zIndex:149, background:'rgba(0,0,0,0.6)' }} onClick={() => setMobileMenuOpen(false)} />}

      <div style={{ position:'fixed', top:0, right:0, width:'280px', height:'100vh', background:'#000', borderLeft:'1px solid #222', zIndex:150, transform:mobileMenuOpen?'translateX(0)':'translateX(100%)', transition:'transform 0.25s ease', display:'flex', flexDirection:'column', padding:'72px 24px 40px', gap:'8px' }}>
        <Link href="/research" style={{ display:'flex', alignItems:'center', height:'48px', fontSize:'16px', color:'#fff', textDecoration:'none', transition:'color 0.15s', borderBottom:'1px solid #222' }}
          onMouseEnter={e=>e.currentTarget.style.color=C.blue}
          onMouseLeave={e=>e.currentTarget.style.color='#fff'}
          onClick={()=>setMobileMenuOpen(false)}
        >Research</Link>
        <div style={{ borderBottom:'1px solid #222', paddingBottom:'8px' }}>
          <div style={{ display:'flex', alignItems:'center', height:'48px', fontSize:'16px', color:'#888' }}>Tools</div>
          {TOOLS_NAV.map(t => (
            <Link key={t.path} href={t.path} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0 10px 12px', fontSize:'14px', color:'#fff', textDecoration:'none', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color=C.blue}
              onMouseLeave={e=>e.currentTarget.style.color='#fff'}
              onClick={()=>setMobileMenuOpen(false)}
            >
              <span style={{ fontSize:'14px', width:'20px', textAlign:'center' }}>{t.icon}</span>
              {t.name}
            </Link>
          ))}
        </div>
        <Link href="/enterprise" style={{ display:'flex', alignItems:'center', height:'48px', fontSize:'16px', color:'#fff', textDecoration:'none', transition:'color 0.15s', borderBottom:'1px solid #222' }}
          onMouseEnter={e=>e.currentTarget.style.color=C.blue}
          onMouseLeave={e=>e.currentTarget.style.color='#fff'}
          onClick={()=>setMobileMenuOpen(false)}
        >Enterprise</Link>
        <Link href="/request-access" style={{ marginTop:'auto', background:'#2563eb', color:'#fff', padding:'14px 20px', borderRadius:'6px', textDecoration:'none', fontSize:'15px', fontWeight:'600', textAlign:'center' }}
          onClick={()=>setMobileMenuOpen(false)}
        >Request Access</Link>
      </div>

      <div style={{ background:'linear-gradient(180deg, #0a0a0a 0%, #000 100%)', borderBottom:'1px solid #222', padding:'100px 40px 80px', textAlign:'center' }}>
        <div style={{ display:'inline-block', background:'rgba(37,99,235,0.1)', border:'1px solid rgba(37,99,235,0.3)', color:'#2563eb', fontSize:'12px', fontWeight:'600', letterSpacing:'0.1em', padding:'5px 14px', borderRadius:'4px', marginBottom:'28px', textTransform:'uppercase' }}>
          AI Legal Verification
        </div>
        <h1 className="tl-hero-title" style={{ fontFamily:SERIF, fontSize:'clamp(40px,6vw,72px)', fontWeight:'700', color:'#fff', margin:'0 0 24px', lineHeight:1.1, letterSpacing:'-0.02em', maxWidth:'800px', marginLeft:'auto', marginRight:'auto' }}>
          The World Standard For<br/>AI Legal Verification
        </h1>
        <p style={{ fontSize:'18px', color:'#888', margin:'0 auto 44px', maxWidth:'560px', lineHeight:1.7, fontFamily:SERIF, fontStyle:'italic' }}>
          Trusted by the world's leading law firms and compliance teams to surface hallucinations, verify claims, and protect legal integrity.
        </p>
        <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }}>
          <button
            onClick={() => document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' })}
            style={{ background:'#2563eb', color:'#fff', padding:'14px 32px', borderRadius:'6px', fontSize:'15px', fontWeight:'600', border:'none', cursor:'pointer', transition:'background 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='#1d4ed8'}
            onMouseLeave={e=>e.currentTarget.style.background='#2563eb'}
          >Verify A Document</button>
          <button
            onClick={() => setDemoOpen(true)}
            style={{ background:'transparent', color:'#fff', padding:'14px 32px', borderRadius:'6px', fontSize:'15px', fontWeight:'600', border:'1px solid #fff', cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor='#fff' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='#fff' }}
          >See How It Works</button>
        </div>
      </div>

      <div style={{ background:'#0a0a0a', borderBottom:'1px solid #222', padding:'28px 40px', display:'flex', gap:'0', justifyContent:'center', flexWrap:'wrap' }}>
        {[
          { value: 94,    suffix: '%',  label: 'Claim Accuracy Rate' },
          { value: 28,    suffix: 's',  label: 'Average Analysis Time' },
          { value: 50000, suffix: '+',  label: 'Documents Verified' },
          { value: 340,   suffix: '+',  label: 'Law Firms & Enterprises' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '20px 48px', textAlign: 'center',
            borderRight: i < 3 ? `1px solid ${C.border}` : 'none',
            minWidth: '180px',
          }}>
            <div style={{ fontSize: '32px', fontFamily: SERIF, fontWeight: '700', color: C.textPrimary, lineHeight: 1 }}>
              <Counter target={s.value} suffix={s.suffix} />
            </div>
            <div style={{ fontSize: '13px', color: C.textSecondary, marginTop: '6px', letterSpacing: '0.04em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <section id="analyzer" className="tl-section-pad" style={{ padding: '80px 40px', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '38px', fontFamily: SERIF, fontWeight: '700', letterSpacing: '-0.01em', marginBottom: '14px', color: C.textPrimary, margin: '0 0 14px' }}>
            Verify Legal Content
          </h2>
          <p style={{ fontSize: '16px', fontFamily: SERIF, fontStyle: 'italic', color: C.textSecondary, maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Paste any AI-generated contract, brief, clause, or legal document. Our model will identify and score every verifiable claim.
          </p>
        </div>

        <div style={{
          background: C.bgCard,
          border: `1px solid ${focused ? C.blue : C.border}`,
          overflow: 'hidden',
          boxShadow: focused ? `0 0 0 2px ${C.blueGlow}` : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => (
                <div key={c} style={{ width: '11px', height: '11px', borderRadius: '50%', background: c }} />
              ))}
            </div>
            <span style={{ fontSize: '11px', color: C.textSecondary, letterSpacing: '0.04em' }}>document.txt</span>
            <span style={{ fontSize: '11px', color: C.textMuted }}>{text.length.toLocaleString()} chars</span>
          </div>

          <div style={{ padding: '20px' }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Paste AI-generated legal text here — contracts, terms of service, briefs, NDAs, regulatory filings, or any legal document you want verified..."
              style={{
                width: '100%', minHeight: '220px',
                background: C.bgSecondary,
                border: `1px solid ${C.borderLight}`,
                borderRadius: '4px',
                color: C.textPrimary,
                fontSize: '16px', lineHeight: '1.75',
                padding: '16px',
                resize: 'vertical',
                outline: 'none',
                fontFamily: MONO,
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
            />

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: '16px', flexWrap: 'wrap', gap: '12px',
            }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: C.textMuted, letterSpacing: '0.04em' }}>Try:</span>
                {['Brief', 'Contract', 'NDA', 'ToS', 'Filing'].map(tag => (
                  <button key={tag} onClick={() => { setText(SAMPLES[tag]); setResult(null); setError(null) }} style={{
                    fontSize: '11px', padding: '4px 10px', borderRadius: '4px',
                    background: text === SAMPLES[tag] ? C.blueGlow : C.blueGlow2,
                    border: `1px solid ${text === SAMPLES[tag] ? 'rgba(37,99,235,0.5)' : 'rgba(37,99,235,0.2)'}`,
                    color: C.blue, letterSpacing: '0.04em',
                    cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: SANS,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.blueGlow; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)' }}
                    onMouseLeave={e => {
                      if (text !== SAMPLES[tag]) {
                        e.currentTarget.style.background = C.blueGlow2
                        e.currentTarget.style.borderColor = 'rgba(37,99,235,0.2)'
                      }
                    }}
                  >{tag}</button>
                ))}
              </div>
              <button
                onClick={handleVerify}
                disabled={!text.trim() || loading}
                style={{
                  padding: '13px 32px', borderRadius: '6px', border: 'none',
                  background: text.trim() && !loading ? C.blue : C.border,
                  color: text.trim() && !loading ? '#fff' : C.textMuted,
                  fontSize: '14px', fontWeight: '700',
                  letterSpacing: '0.04em',
                  cursor: text.trim() && !loading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                {loading ? (
                  <>
                    <span style={{
                      width: '13px', height: '13px', borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff',
                      display: 'inline-block', animation: 'spin 0.7s linear infinite',
                    }} />
                    Analyzing...
                  </>
                ) : 'Run Verification'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: '16px', padding: '14px 18px',
            background: C.errorBg, border: '1px solid rgba(239,68,68,0.25)',
            color: '#f87171', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {result && (
          <div ref={resultsRef} style={{
            marginTop: '28px',
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 28px',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.verified, boxShadow: `0 0 8px ${C.verified}` }} />
                  <span style={{ fontFamily: SERIF, fontSize: '18px', fontWeight: '600', color: C.textPrimary }}>Verification Report</span>
                </div>
                {result.jurisdiction && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '3px 10px', borderRadius: '4px',
                    background: C.blueGlow2, border: `1px solid rgba(37,99,235,0.3)`,
                    fontSize: '11px', color: C.blue, fontWeight: '600', letterSpacing: '0.05em',
                  }}>
                    ⚖ {result.jurisdiction}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Verified', count: verdictCounts.Verified, color: C.verified },
                  { label: 'Unverified', count: verdictCounts.Unverified, color: C.warning },
                  { label: 'Hallucination', count: verdictCounts.Hallucination, color: C.error },
                  { label: 'Outdated', count: verdictCounts.Outdated, color: '#8b5cf6' },
                ].filter(v => v.count > 0).map(v => (
                  <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: v.color }} />
                    <span style={{ fontSize: '12px', color: C.textSecondary }}>{v.count} {v.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              borderBottom: `1px solid ${C.border}`,
            }}>
              <div style={{
                padding: '36px 40px',
                borderRight: `1px solid ${C.border}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '8px',
              }}>
                <TrustRing score={result.trustScore} animated={true} />
                <span style={{ fontSize: '11px', color: C.textSecondary, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Trust Score
                </span>
              </div>
              <div style={{ padding: '36px 32px' }}>
                <h3 style={{ fontFamily: SERIF, fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: C.textPrimary }}>
                  Executive Summary
                </h3>
                <p style={{ fontSize: '15px', fontFamily: SERIF, fontStyle: 'italic', color: C.textSecondary, lineHeight: '1.7', margin: '0 0 20px' }}>
                  {result.summary}
                </p>
                {result.riskFlags?.length > 0 && (
                  <div>
                    <p style={{ fontSize: '11px', color: C.blue, fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Risk Flags
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {result.riskFlags.map((flag, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: C.textSecondary, lineHeight: '1.5' }}>
                          <span style={{ color: C.blue, flexShrink: 0, marginTop: '1px' }}>▸</span>
                          {flag}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ borderBottom: `1px solid ${C.border}`, display: 'flex', padding: '0 28px' }}>
              {[
                { id: 'claims',      label: `Claims (${result.claims?.length ?? 0})` },
                { id: 'corrections', label: `Corrections (${correctionsClaims.length})` },
                { id: 'actions',     label: `Actions (${result.recommendedActions?.length ?? 0})` },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  padding: '14px 20px', background: 'none', border: 'none',
                  borderBottom: activeTab === tab.id ? `2px solid ${C.blue}` : '2px solid transparent',
                  color: activeTab === tab.id ? C.blue : C.textSecondary,
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  letterSpacing: '0.04em',
                  marginBottom: '-1px',
                  transition: 'color 0.2s, border-color 0.2s',
                }}>{tab.label}</button>
              ))}
            </div>

            <div style={{ padding: '28px' }}>
              {activeTab === 'claims' && (
                <div>
                  {result.claims?.length > 0 ? result.claims.map((claim, i) => (
                    <ClaimCard key={i} claim={claim} />
                  )) : (
                    <p style={{ color: C.textSecondary, fontStyle: 'italic', fontFamily: SERIF }}>No specific claims identified.</p>
                  )}
                </div>
              )}

              {activeTab === 'corrections' && (
                <div>
                  {correctionsClaims.length > 0 ? correctionsClaims.map((claim, i) => (
                    <ClaimCard key={i} claim={claim} />
                  )) : (
                    <div style={{ textAlign: 'center', padding: '48px 24px', color: C.verified, fontFamily: SERIF, fontStyle: 'italic' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>✓</div>
                      <p style={{ fontSize: '16px', margin: 0 }}>No corrections needed — all claims appear accurate.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'actions' && (
                <div>
                  {result.recommendedActions?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {result.recommendedActions.map((action, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'flex-start', gap: '14px',
                          padding: '16px 20px',
                          background: C.blueGlow2,
                          border: `1px solid rgba(37,99,235,0.2)`,
                        }}>
                          <span style={{
                            width: '26px', height: '26px', borderRadius: '50%',
                            background: C.blue,
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: '700', flexShrink: 0,
                          }}>{i + 1}</span>
                          <p style={{ margin: 0, fontSize: '14px', color: C.textPrimary, lineHeight: '1.6', fontFamily: SERIF }}>{action}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: C.textSecondary, fontStyle: 'italic', fontFamily: SERIF }}>No recommended actions.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="tl-section-pad" style={{
        padding: '80px 40px',
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        background: C.bgCard,
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontFamily: SERIF, fontSize: '38px', fontWeight: '700', color: C.textPrimary, marginBottom: '12px', letterSpacing: '-0.01em' }}>
              Built for the Legal Profession
            </h2>
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', color: C.textSecondary, fontSize: '16px', lineHeight: 1.7 }}>
              Every feature engineered for legal precision, not consumer convenience.
            </p>
          </div>
          <div className="tl-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              {
                icon: '⚖',
                title: 'Claim-Level Analysis',
                desc: 'Every verifiable assertion in your document is extracted, examined, and scored individually — not summarized away.',
              },
              {
                icon: '◈',
                title: 'Hallucination Detection',
                desc: 'Identifies fabricated case citations, non-existent statutes, and legally impossible claims that AI systems commonly produce.',
              },
              {
                icon: '◎',
                title: 'Temporal Accuracy',
                desc: 'Flags claims that were once true but are now outdated due to legislative changes, new precedent, or regulatory updates.',
              },
            ].map((f, i) => (
              <div key={i} className="tl-card-pad" style={{
                padding: '32px',
                border: `1px solid ${C.border}`,
                background: C.bg,
                transition: 'border-color 0.2s',
                cursor: 'default',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.blue}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '6px',
                  background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', marginBottom: '20px',
                }}>{f.icon}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: C.textPrimary }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '16px', color: C.textSecondary, lineHeight: '1.7', margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tl-section-pad" style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center', fontFamily: SERIF, fontSize: '38px',
            fontWeight: '700', color: C.textPrimary, marginBottom: '56px', letterSpacing: '-0.01em',
          }}>What Legal Leaders Say</h2>
          <div className="tl-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              {
                quote: "TrustLayer caught three fabricated citations in a brief our associates had approved. It's become mandatory before any filing.",
                name: 'Margaret Chen',
                title: 'Managing Partner, Chen & Voss LLP',
              },
              {
                quote: "The hallucination detection is frighteningly accurate. We now require a TrustLayer report on every AI-drafted contract clause.",
                name: 'David Okafor',
                title: 'General Counsel, Meridian Financial',
              },
              {
                quote: "In regulated industries, a single outdated clause can mean millions in penalties. TrustLayer has become our last line of defense.",
                name: 'Sarah Lindström',
                title: 'Chief Compliance Officer, Vertex Health',
              },
            ].map((t, i) => (
              <div key={i} className="tl-card-pad" style={{
                padding: '32px',
                border: `1px solid ${C.border}`,
                background: C.bgCard,
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', top: '20px', left: '28px',
                  fontSize: '60px', fontFamily: SERIF, color: C.textSecondary,
                  opacity: 0.15, lineHeight: 1,
                }}>"</span>
                <p style={{
                  fontFamily: SERIF, fontStyle: 'italic',
                  fontSize: '16px', lineHeight: '1.7',
                  color: C.textSecondary, margin: '0 0 24px',
                  paddingTop: '16px', position: 'relative',
                }}>{t.quote}</p>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: C.textPrimary }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '2px' }}>{t.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tl-section-pad" style={{
        padding: '80px 40px',
        borderTop: `1px solid ${C.border}`,
        background: C.bgCard,
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center', fontFamily: SERIF, fontSize: '38px',
            fontWeight: '700', color: C.textPrimary, marginBottom: '12px', letterSpacing: '-0.01em',
          }}>Transparent Pricing</h2>
          <p style={{
            textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic',
            color: C.textSecondary, fontSize: '16px', marginBottom: '56px', lineHeight: 1.7,
          }}>Scale as your verification needs grow.</p>

          <div className="tl-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'start' }}>
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                desc: 'For individuals exploring AI legal verification.',
                features: ['10 verifications/month', 'Basic claim analysis', 'Standard accuracy model', 'Community support'],
                cta: 'Get Started',
                href: '/request-access',
                featured: false,
              },
              {
                name: 'Pro',
                price: '$149',
                period: 'per month',
                desc: 'For legal professionals and small practices.',
                features: ['500 verifications/month', 'Advanced hallucination detection', 'Temporal accuracy checks', 'API access', 'Priority support', 'Audit trail & reports'],
                cta: 'Start Free Trial',
                href: '/request-access',
                featured: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'contact us',
                desc: 'For large firms, banks, and compliance teams.',
                features: ['Unlimited verifications', 'Custom AI model fine-tuning', 'On-premise deployment', 'SOC 2 Type II compliance', 'Dedicated account manager', 'SLA guarantee'],
                cta: 'Contact Sales',
                href: null,
                featured: false,
              },
            ].map((tier, i) => (
              <div key={i} className="tl-card-pad" style={{
                padding: '32px',
                border: tier.featured ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                background: tier.featured ? C.blueGlow2 : C.bg,
                position: 'relative',
              }}>
                {tier.featured && (
                  <div style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    padding: '4px 16px', borderRadius: '4px',
                    background: C.blue,
                    color: '#fff', fontSize: '11px', fontWeight: '700',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>Most Popular</div>
                )}
                <div style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: C.textPrimary, marginBottom: '4px' }}>
                  {tier.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '12px 0 8px' }}>
                  <span style={{ fontFamily: SERIF, fontSize: '36px', fontWeight: '700', color: tier.featured ? C.blue : C.textPrimary }}>
                    {tier.price}
                  </span>
                  <span style={{ fontSize: '12px', color: C.textSecondary }}>{tier.period}</span>
                </div>
                <p style={{ fontSize: '14px', color: C.textSecondary, marginBottom: '24px', lineHeight: '1.7' }}>
                  {tier.desc}
                </p>
                <div style={{ marginBottom: '28px' }}>
                  {tier.features.map((f, j) => (
                    <div key={j} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      fontSize: '14px', color: C.textSecondary,
                      padding: '6px 0',
                      borderBottom: j < tier.features.length - 1 ? `1px solid ${C.border}` : 'none',
                    }}>
                      <span style={{ color: C.blue, fontSize: '12px', fontWeight: '700' }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                {tier.href ? (
                  <Link href={tier.href} style={{
                    display: 'block', width: '100%', padding: '13px',
                    borderRadius: '6px', boxSizing: 'border-box',
                    background: tier.featured ? C.blue : 'transparent',
                    border: tier.featured ? 'none' : `1px solid ${C.border}`,
                    color: tier.featured ? '#fff' : C.textSecondary,
                    fontSize: '14px', fontWeight: '600',
                    letterSpacing: '0.04em',
                    cursor: 'pointer', textDecoration: 'none',
                    textAlign: 'center', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => {
                      if (tier.featured) {
                        e.currentTarget.style.background = C.blueHover
                      } else {
                        e.currentTarget.style.borderColor = C.blue
                        e.currentTarget.style.color = C.textPrimary
                      }
                    }}
                    onMouseLeave={e => {
                      if (tier.featured) {
                        e.currentTarget.style.background = C.blue
                      } else {
                        e.currentTarget.style.borderColor = C.border
                        e.currentTarget.style.color = C.textSecondary
                      }
                    }}
                  >{tier.cta}</Link>
                ) : (
                  <button style={{
                    width: '100%', padding: '13px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: `1px solid ${C.border}`,
                    color: C.textSecondary,
                    fontSize: '14px', fontWeight: '600',
                    letterSpacing: '0.04em',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.textPrimary }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary }}
                  >{tier.cta}</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{
        padding: '32px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: `1px solid ${C.border}`, flexWrap: 'wrap', gap: '16px',
        background: C.bg,
      }}>
        <span style={{ fontFamily: SERIF, fontWeight: '700', fontSize: '18px', color: C.textPrimary, letterSpacing: '-0.02em' }}>
          TrustLayer
        </span>
        <p style={{ fontSize: '12px', color: C.textMuted, margin: 0 }}>
          © 2026 TrustLayer Inc. Not a substitute for qualified legal counsel.
        </p>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy', 'Terms', 'Security', 'Contact'].map(item => (
            <a key={item} href="#" style={{
              fontSize: '12px', color: C.textMuted, textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = C.textSecondary}
              onMouseLeave={e => e.target.style.color = C.textMuted}
            >{item}</a>
          ))}
        </div>
      </footer>

      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}

    </div>
  )
}
