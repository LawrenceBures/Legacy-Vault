'use client'

import { useState, useEffect } from 'react'

const LAUNCH_DATE = new Date('2026-05-15T00:00:00')

const TIERS = [
  { id: 'starter', name: 'Starter Vault', price: '$1.99', desc: 'One vault, one recipient, text only', availability: 'available' },
  { id: 'basic', name: 'Basic', price: '$4.99', desc: 'Audio, 3 recipients, milestone delivery', availability: 'available' },
  { id: 'legacy', name: 'Legacy', price: '$9.99', desc: 'Unlimited entries, video, full AI assistant', availability: 'hot' },
  { id: 'family', name: 'Family', price: '$19.99', desc: 'Up to 5 vaults, family dashboard', availability: 'limited' },
  { id: 'estate', name: 'Estate', price: '$49.99', desc: 'Attorney-verified, dedicated manager', availability: 'scarce' },
]

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const diff = LAUNCH_DATE.getTime() - now.getTime()
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])
  return timeLeft
}

export function FoundersSection() {
  const timeLeft = useCountdown()
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  const [vaultCount, setVaultCount] = useState(847)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [hoveredTier, setHoveredTier] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setVaultCount(prev => prev + Math.floor(Math.random() * 2))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async () => {
    if (!form.name || !form.email || !selectedTier) { setError('Please fill in your name, email and select a tier.'); return }
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, tier: selectedTier }) })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true); setVaultCount(prev => prev + 1)
    } catch { setError('Something went wrong. Please try again.') }
    finally { setSubmitting(false) }
  }

  const availabilityStyle = (availability: string) => {
    if (availability === 'hot') return { color: '#e74c3c', label: '🔥 High demand' }
    if (availability === 'limited') return { color: '#e67e22', label: '⚠️ Limited spots' }
    if (availability === 'scarce') return { color: '#e74c3c', label: '🚨 4 spots left' }
    return { color: '#27ae60', label: '✓ Available' }
  }

  const inputStyle = { width: '100%', padding: '14px 16px', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '6px', background: 'rgba(245,243,239,0.06)', color: '#F5F3EF', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <section id="founders" style={{ padding: isMobile ? '60px 20px' : '100px 40px', background: '#1F2E23', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(184,155,94,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-block', padding: '6px 18px', border: '1px solid rgba(184,155,94,0.4)', borderRadius: '20px', fontSize: '11px', letterSpacing: '.18em', color: '#B89B5E', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Founders Pricing — Limited Time</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? '36px' : '52px', fontWeight: 300, color: '#F5F3EF', lineHeight: 1.1, margin: '0 0 1rem' }}>Lock in your vault<br/><em style={{ color: '#B89B5E' }}>before we launch.</em></h2>
          <p style={{ fontSize: '17px', color: 'rgba(245,243,239,0.5)', lineHeight: 1.8, maxWidth: '560px', margin: '0 auto', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>Sign up today at founders pricing and you are grandfathered in forever — no matter what our prices become after launch.</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[{ value: timeLeft.days, label: 'Days' }, { value: timeLeft.hours, label: 'Hours' }, { value: timeLeft.minutes, label: 'Minutes' }, { value: timeLeft.seconds, label: 'Seconds' }].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center', minWidth: '80px' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? '40px' : '56px', fontWeight: 300, color: '#B89B5E', lineHeight: 1, marginBottom: '.25rem' }}>{String(value).padStart(2, '0')}</div>
              <div style={{ fontSize: '10px', letterSpacing: '.2em', color: 'rgba(245,243,239,0.3)', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.3)', letterSpacing: '.1em' }}>Founders pricing ends at launch · <span style={{ color: '#B89B5E' }}>May 15, 2026</span></div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 20px', background: 'rgba(184,155,94,0.08)', border: '1px solid rgba(184,155,94,0.2)', borderRadius: '30px' }}>
            <div style={{ display: 'flex', gap: '3px' }}>{[...Array(5)].map((_, i) => (<div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#B89B5E', opacity: 1 - i * 0.15 }} />))}</div>
            <div style={{ fontSize: '13px', color: '#B89B5E', fontWeight: 600 }}>{vaultCount.toLocaleString()} vaults already claimed</div>
          </div>
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '11px', letterSpacing: '.2em', color: 'rgba(245,243,239,0.4)', textTransform: 'uppercase', marginBottom: '1rem', textAlign: 'center' }}>Select your founders tier</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: '10px' }}>
            {TIERS.map(tier => {
              const avail = availabilityStyle(tier.availability)
              const isSelected = selectedTier === tier.id
              return (
                <div key={tier.id} onClick={() => setSelectedTier(tier.id)} onMouseEnter={() => setHoveredTier(tier.id)} onMouseLeave={() => setHoveredTier(null)}
                  style={{ padding: '1.25rem 1rem', borderRadius: '8px', cursor: 'pointer', border: `${isSelected ? '2px' : '1px'} solid ${isSelected ? '#B89B5E' : hoveredTier === tier.id ? 'rgba(184,155,94,0.4)' : 'rgba(184,155,94,0.15)'}`, background: isSelected ? 'rgba(184,155,94,0.12)' : 'rgba(245,243,239,0.03)', transition: 'all 0.18s ease', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? '#B89B5E' : '#F5F3EF', marginBottom: '.35rem' }}>{tier.name}</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: 300, color: '#B89B5E', marginBottom: '.35rem' }}>{tier.price}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(245,243,239,0.4)', lineHeight: 1.4, marginBottom: '.5rem' }}>{tier.desc}</div>
                  <div style={{ fontSize: '10px', color: avail.color, fontWeight: 600 }}>{avail.label}</div>
                  {isSelected && <div style={{ marginTop: '.5rem', fontSize: '10px', color: '#B89B5E', letterSpacing: '.08em' }}>✓ Selected</div>}
                </div>
              )
            })}
          </div>
        </div>
        {!submitted ? (
          <div style={{ background: 'rgba(245,243,239,0.04)', border: '1px solid rgba(184,155,94,0.15)', borderRadius: '10px', padding: '2rem' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F3EF', marginBottom: '1.5rem', textAlign: 'center' }}>No credit card required — lock in your spot now</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,243,239,0.4)', display: 'block', marginBottom: '6px' }}>Full name *</label>
                <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,243,239,0.4)', display: 'block', marginBottom: '6px' }}>Email *</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,243,239,0.4)', display: 'block', marginBottom: '6px' }}>Phone (for launch SMS)</label>
                <input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
              </div>
            </div>
            {error && <div style={{ fontSize: '12px', color: '#e74c3c', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            {!selectedTier && <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.3)', marginBottom: '1rem', textAlign: 'center', fontStyle: 'italic' }}>Select a tier above to continue</div>}
            <button onClick={handleSubmit} disabled={submitting || !selectedTier} style={{ width: '100%', padding: '16px', background: selectedTier ? '#B89B5E' : 'rgba(184,155,94,0.2)', color: selectedTier ? '#1F2E23' : 'rgba(245,243,239,0.3)', border: 'none', borderRadius: '6px', fontSize: '13px', letterSpacing: '.15em', textTransform: 'uppercase', cursor: selectedTier ? 'pointer' : 'not-allowed', fontWeight: 700, transition: 'all 0.2s' }}>
              {submitting ? 'Locking in your vault...' : selectedTier ? `Lock in ${TIERS.find(t => t.id === selectedTier)?.name} at ${TIERS.find(t => t.id === selectedTier)?.price}/mo →` : 'Lock in your founders price →'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '11px', color: 'rgba(245,243,239,0.2)', lineHeight: 1.6 }}>No credit card · No commitment · Grandfathered pricing forever<br/>We will email and text you when Legacy Vault launches on May 15, 2026</div>
          </div>
        ) : (
          <div style={{ background: 'rgba(184,155,94,0.08)', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '10px', padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔒</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: 300, color: '#F5F3EF', marginBottom: '.75rem' }}>Your vault is locked in.</div>
            <div style={{ fontSize: '15px', color: 'rgba(245,243,239,0.5)', lineHeight: 1.8, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', marginBottom: '1.5rem' }}>You are in at founders pricing — forever.<br/>We will reach out on May 15, 2026 when Legacy Vault goes live.</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              {['🔐 Grandfathered pricing', '📧 Launch email confirmed', '📱 SMS notification set'].map(item => (
                <div key={item} style={{ fontSize: '12px', color: 'rgba(184,155,94,0.7)' }}>{item}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export function CountdownBanner() {
  const timeLeft = useCountdown()
  return (
    <div style={{ background: '#B89B5E', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', minHeight: '44px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#1F2E23', letterSpacing: '.06em' }}>🔒 FOUNDERS PRICING ENDS AT LAUNCH</div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {[{ value: timeLeft.days, label: 'days' }, { value: timeLeft.hours, label: 'hrs' }, { value: timeLeft.minutes, label: 'min' }, { value: timeLeft.seconds, label: 'sec' }].map(({ value, label }, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
            {i > 0 && <span style={{ color: 'rgba(31,46,35,0.4)', fontSize: '14px' }}>:</span>}
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontWeight: 600, color: '#1F2E23' }}>{String(value).padStart(2, '0')}</span>
            <span style={{ fontSize: '9px', color: 'rgba(31,46,35,0.5)', letterSpacing: '.08em' }}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '10px', color: 'rgba(31,46,35,0.6)', letterSpacing: '.04em' }}>May 15, 2026 · Lock in your price →</div>
    </div>
  )
}
