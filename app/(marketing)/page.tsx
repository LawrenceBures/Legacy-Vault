'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FoundersSection, CountdownBanner } from '@/lib/FoundersSection'
import { useEffect, useRef } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const features = [
    { icon: '🎥', label: 'Video Messages', desc: 'Record personal video messages. Your face, your voice, your presence — preserved forever.', live: true },
    { icon: '🎙️', label: 'Voice Recordings', desc: 'Leave audio messages that capture your voice exactly as it sounds.', live: true },
    { icon: '✍️', label: 'Written Letters', desc: 'Write letters and documents that will outlast everything. Edit anytime.', live: true },
    { icon: '✨', label: 'AI Writing Guide', desc: 'Our AI guides you toward what you really want to say — emotion prompts, tone options, magic questions.', live: true },
    { icon: '🎯', label: 'Milestone Delivery', desc: 'Schedule messages for life moments — a child turning 18, a wedding anniversary, a graduation.', live: true },
    { icon: '⏱', label: 'Inactivity Trigger', desc: 'If you stop checking in, your vault delivers automatically. The most powerful delivery option.', live: true },
    { icon: '🔑', label: 'Family Unlock Code', desc: 'Share a secret code with a trusted person who unlocks your vault when the time is right.', live: true },
    { icon: '👥', label: 'Multiple Recipients', desc: 'Add your spouse, children, parents, friends. Each person receives exactly what you intended.', live: true },
    { icon: '🛡', label: 'Trusted Contact Verification', desc: 'Assign a trusted contact who confirms your identity before delivery. Available on every tier.', live: true },
    { icon: '📋', label: 'Wills & Legal Docs', desc: 'Upload and store your will, trust documents, and legal instructions.', live: false },
    { icon: '🏦', label: 'Insurance Information', desc: 'Store policy numbers and instructions so your family can access what they need.', live: false },
    { icon: '👨‍👩‍👧', label: 'Family Admin Dashboard', desc: 'One family member manages the health of all vaults from one place.', live: false },
    { icon: '⚖️', label: 'Legal Integrations', desc: 'Connect with estate planning attorneys directly through Legacy Vault.', live: false },
    { icon: '📱', label: 'Mobile App', desc: 'Record a video message from anywhere. Your vault in your pocket.', live: false },
  ]

  const steps = [
    { num: '01', title: 'Create your message', desc: 'Record a video, write a letter, or leave a voice message. Our AI guide helps you find the right words.', icon: '🎥' },
    { num: '02', title: 'Choose who receives it', desc: 'Add the people who matter most. Each person can receive different messages tailored just for them.', icon: '👥' },
    { num: '03', title: 'Set your delivery', desc: 'Automatic delivery if you stop checking in, a milestone date, or a secret unlock code. Your rules.', icon: '⏱' },
  ]

  const trustPoints = [
    { icon: '🔐', title: 'End-to-end encrypted', desc: 'Your messages are encrypted before they leave your device. Not even we can read them.' },
    { icon: '👁', title: 'Private by default', desc: 'Your vault is completely private. Only the recipients you choose can ever access your content.' },
    { icon: '🛡', title: 'Bank-level security', desc: 'We use the same security standards as financial institutions to protect what matters most.' },
    { icon: '☁️', title: 'Redundant cloud storage', desc: 'Your content is stored across multiple secure locations. It will never be lost.' },
    { icon: '🔒', title: 'Zero-knowledge architecture', desc: 'We store encrypted data only. Your encryption keys stay with you.' },
    { icon: '✅', title: 'SOC 2 compliant', desc: 'Legacy Vault meets the highest standards for security, availability, and confidentiality.' },
  ]

  const plans = [
    { name: 'Starter Vault', price: '$1.99', period: 'per month', dark: false, popular: false, features: ['1 vault entry', '1 recipient', 'Text messages only', '1GB storage', 'Annual check-in reminder', 'Trusted contact verification', 'Basic inactivity trigger'], note: 'AI writing available in higher plans', cta: 'Lock in founders price', ctaAction: '#founders' },
    { name: 'Basic', price: '$4.99', period: 'per month', dark: false, popular: false, features: ['1 vault entry', 'Up to 3 recipients', 'Audio messages (10 min max)', '1 AI-assisted Legacy Letter', 'Milestone Delivery (1 event)', 'Trusted contact verification', 'Annual check-in reminder', '7-day delivery warning', '2GB storage'], note: 'Full AI writing in higher plans', cta: 'Lock in founders price', ctaAction: '#founders' },
    { name: 'Legacy', price: '$9.99', period: 'per month', dark: true, popular: true, features: ['Unlimited vault entries', 'Unlimited recipients', 'Audio & video (30 min max)', 'Full AI writing assistant', 'Unlimited Milestone Delivery', 'Custom inactivity window', 'Family unlock code', '3 warning notifications', 'Legal document storage', 'Custom recipient message', 'Trusted contact verification', '25GB storage', 'Priority support'], note: null, cta: 'Lock in founders price', ctaAction: '#founders' },
    { name: 'Family', price: '$19.99', period: 'per month', dark: false, popular: false, features: ['Up to 5 individual vaults', 'Everything in Legacy per vault', 'Family Admin Dashboard', 'Family Executor role', 'Shared document storage', 'Multiple unlock codes', 'Legacy Timeline', 'Annual family check-in & review', 'Annual reminder emails (all)', '100GB shared storage'], note: null, cta: 'Lock in founders price', ctaAction: '#founders' },
    { name: 'Estate', price: '$49.99', period: 'per month · or $399/yr', dark: true, popular: false, features: ['Everything in Family', 'Attorney-verified documents', 'Notarized delivery confirmation', 'Estate attorney integration', 'Dedicated account manager', 'Insurance policy management', 'Legal instruction builder', 'White-glove onboarding', 'Unlimited storage', 'Annual estate review session'], note: null, cta: 'Contact us', ctaAction: '#founders' },
  ]

  const faqs = [
    { q: 'What happens if I forget to check in?', a: 'We send you reminder emails before anything happens. You will get multiple warnings before your vault is ever delivered. You are always in control.' },
    { q: 'How does Milestone Delivery work?', a: 'You set a specific date or life event — a birthday, anniversary, graduation. We deliver your message automatically on that date, no matter what.' },
    { q: 'What is Trusted Contact Verification?', a: 'You assign a trusted person who receives a notification before your vault is delivered. They can confirm or flag any concerns — an extra human layer of protection.' },
    { q: 'What does founders pricing mean?', a: 'You lock in your monthly price today and keep it forever — even after we raise prices at launch. No credit card needed now. We notify you at launch.' },
    { q: 'Is my content really private?', a: 'Absolutely. End-to-end encryption means your messages are encrypted before leaving your device. We cannot read them, and neither can anyone else.' },
  ]

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F5F3EF', color: '#1F2E23' }}>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(31,46,35,0.97)', borderBottom: '1px solid rgba(184,155,94,0.15)', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 600, color: '#B89B5E', letterSpacing: '.05em' }}>Legacy Vault</div>
        <div style={{ display: 'flex', gap: isMobile ? '8px' : '28px', alignItems: 'center' }}>
          {!isMobile && ['Features', 'Security', 'Pricing', 'About'].map(item => (
            <a key={item} href={item === 'About' ? '/about' : `#${item.toLowerCase()}`} style={{ fontSize: '13px', color: 'rgba(245,243,239,0.5)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#B89B5E')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,243,239,0.5)')}
            >{item}</a>
          ))}
          <button onClick={() => router.push('/sign-in')} style={{ padding: '9px 22px', background: 'transparent', color: '#B89B5E', border: '1px solid rgba(184,155,94,0.4)', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500 }}>Sign in</button>
          <button onClick={() => router.push('/sign-up')} style={{ padding: '9px 22px', background: '#B89B5E', color: '#1F2E23', border: 'none', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700 }}>Lock in price</button>
        </div>
      </nav>

      <CountdownBanner />

      <section style={{ minHeight: '100vh', background: '#1F2E23', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '140px 40px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(184,155,94,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', padding: '6px 18px', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '20px', fontSize: '11px', letterSpacing: '.18em', color: 'rgba(184,155,94,0.8)', textTransform: 'uppercase', marginBottom: '2rem' }}>Your Voice. Your Legacy.</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? '38px' : '68px', fontWeight: 300, color: '#F5F3EF', lineHeight: 1.1, margin: '0 0 1.5rem' }}>The people you love<br/>deserve to hear it<br/><em style={{ color: '#B89B5E' }}>from you.</em></h1>
          <p style={{ fontSize: isMobile ? '15px' : '18px', color: 'rgba(245,243,239,0.5)', lineHeight: 1.8, margin: '0 auto 3rem', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', maxWidth: '560px' }}>Record video messages. Write letters. Leave voice recordings.<br/>Delivered to the people who matter most — exactly when it matters.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <a href="#founders" style={{ padding: '16px 44px', background: '#B89B5E', color: '#1F2E23', border: 'none', borderRadius: '4px', fontSize: '13px', letterSpacing: '.15em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>Lock in founders price</a>
            <button style={{ padding: '16px 36px', background: 'transparent', color: 'rgba(245,243,239,0.6)', border: '1px solid rgba(245,243,239,0.2)', borderRadius: '4px', fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>▶ Watch demo</button>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.25)', letterSpacing: '.06em' }}>No credit card required to lock in your price</div>
          <div style={{ marginTop: '4rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🔐 End-to-end encrypted', '👁 Private by default', '🛡 Bank-level security'].map(item => (
              <div key={item} style={{ fontSize: '12px', color: 'rgba(184,155,94,0.55)', letterSpacing: '.06em' }}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <FoundersSection />

      <section style={{ padding: isMobile ? '60px 20px' : '100px 40px', background: '#F5F3EF' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '11px', letterSpacing: '.2em', color: '#B89B5E', textTransform: 'uppercase', marginBottom: '1rem' }}>Simple by design</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '46px', fontWeight: 300, color: '#1F2E23', margin: '0 0 1rem' }}>Three steps.<br/>A lifetime of impact.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid rgba(31,46,35,0.08)', borderRadius: '10px', padding: '2rem' }}>
                <div style={{ fontSize: '11px', letterSpacing: '.2em', color: '#B89B5E', marginBottom: '1.5rem' }}>{step.num}</div>
                <div style={{ fontSize: '32px', marginBottom: '1rem' }}>{step.icon}</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 400, color: '#1F2E23', marginBottom: '.75rem' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(31,46,35,0.55)', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 40px', background: '#F5F3EF', borderTop: '1px solid rgba(31,46,35,0.06)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '2rem' : '4rem', alignItems: 'center' }}>
          <div style={{ background: '#fff', border: '1px solid rgba(31,46,35,0.08)', borderRadius: '10px', padding: '2rem' }}>
            <div style={{ fontSize: '11px', letterSpacing: '.2em', color: '#B89B5E', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Milestone Delivery</div>
            {[{ icon: '🎂', label: 'When my daughter turns 18', date: 'June 14, 2031' }, { icon: '💍', label: 'On our 25th anniversary', date: 'September 3, 2028' }, { icon: '🎓', label: 'When my son graduates', date: 'May 2029' }, { icon: '👶', label: 'When our first grandchild is born', date: 'Upon birth' }].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: i < 3 ? '1px solid rgba(31,46,35,0.06)' : 'none' }}>
                <div style={{ fontSize: '22px' }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#1F2E23' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#B89B5E', marginTop: '2px' }}>{item.date}</div>
                </div>
                <div style={{ fontSize: '9px', padding: '3px 8px', background: 'rgba(46,204,113,0.08)', color: '#27ae60', border: '1px solid rgba(46,204,113,0.2)', borderRadius: '20px', letterSpacing: '.08em', textTransform: 'uppercase' }}>Scheduled</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '.2em', color: '#B89B5E', textTransform: 'uppercase', marginBottom: '1rem' }}>A first of its kind</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '42px', fontWeight: 300, color: '#1F2E23', lineHeight: 1.2, margin: '0 0 1.5rem' }}>Your words, delivered<br/><em style={{ color: '#B89B5E' }}>on life's biggest days.</em></h2>
            <p style={{ fontSize: '16px', color: 'rgba(31,46,35,0.55)', lineHeight: 1.8, marginBottom: '1.5rem', margin: '0 0 1.5rem' }}>Schedule messages for the moments that define a life — birthdays, anniversaries, graduations. You decide when. We make sure it arrives.</p>
            <p style={{ fontSize: '14px', color: 'rgba(31,46,35,0.4)', lineHeight: 1.7, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif', margin: 0 }}>"I recorded a message for my daughter's wedding day — five years before she met her husband."</p>
          </div>
        </div>
      </section>

      <section style={{ padding: isMobile ? '60px 20px' : '100px 40px', background: '#1F2E23' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '2rem' : '4rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '.2em', color: '#B89B5E', textTransform: 'uppercase', marginBottom: '1rem' }}>Powered by AI</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '42px', fontWeight: 300, color: '#F5F3EF', lineHeight: 1.2, margin: '0 0 1.5rem' }}>We help you say<br/>what you really mean.</h2>
            <p style={{ fontSize: '16px', color: 'rgba(245,243,239,0.5)', lineHeight: 1.8, margin: '0 0 2rem', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>Our AI guide is not a writing tool. It is an emotional guide that asks the questions that unlock the message you have been carrying.</p>
            {['Legacy themes to start from', 'Emotion guide — what do you want them to feel?', 'The magic question: what you have never said', 'Gentle, heartfelt, or direct tone options', 'Tone Shifter — make it sound more like you'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#B89B5E', flexShrink: 0, marginTop: '7px' }} />
                <div style={{ fontSize: '14px', color: 'rgba(245,243,239,0.65)' }}>{item}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#B89B5E', border: '1px solid rgba(31,46,35,0.2)', borderRadius: '10px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(31,46,35,0.15)' }}>
              <span style={{ fontSize: '18px' }}>✨</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2E23' }}>Help me say this</div>
                <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.6)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}>Guided by Legacy Vault AI</div>
              </div>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1F2E23', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '.75rem' }}>What do you want them to feel?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '1rem' }}>
              {['Loved', 'Understood', 'Forgiven', 'Proud', 'At Peace', 'Inspired'].map((e, i) => (
                <div key={e} style={{ padding: '8px', background: i === 0 ? '#1F2E23' : 'rgba(255,255,255,0.4)', borderRadius: '6px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: i === 0 ? '#B89B5E' : '#1F2E23' }}>{e}</div>
              ))}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1F2E23', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '.5rem' }}>What is one thing you have never said?</div>
            <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '6px', padding: '10px 12px', fontSize: '13px', color: 'rgba(31,46,35,0.5)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', marginBottom: '1rem' }}>"I just want you to know how proud I am..."</div>
            <div style={{ background: '#1F2E23', borderRadius: '6px', padding: '10px', textAlign: 'center', fontSize: '12px', color: '#B89B5E', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>Write my message →</div>
          </div>
        </div>
      </section>

      <section id="features" style={{ padding: isMobile ? '60px 20px' : '100px 40px', background: '#F5F3EF' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '11px', letterSpacing: '.2em', color: '#B89B5E', textTransform: 'uppercase', marginBottom: '1rem' }}>Everything you need</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '46px', fontWeight: 300, color: '#1F2E23', margin: '0 0 1rem' }}>Built for the moments<br/>that matter most.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {features.map((feature, i) => (
              <div key={i} onMouseEnter={() => setHoveredFeature(i)} onMouseLeave={() => setHoveredFeature(null)}
                style={{ background: '#fff', border: `1px solid ${hoveredFeature === i ? 'rgba(184,155,94,0.4)' : 'rgba(31,46,35,0.08)'}`, borderRadius: '10px', padding: '1.5rem', transition: 'all 0.2s ease', transform: hoveredFeature === i ? 'translateY(-3px)' : 'none', position: 'relative' }}>
                {!feature.live && <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '9px', padding: '3px 8px', background: 'rgba(184,155,94,0.1)', color: '#B89B5E', border: '1px solid rgba(184,155,94,0.2)', borderRadius: '20px', letterSpacing: '.08em', textTransform: 'uppercase' }}>Coming soon</div>}
                <div style={{ fontSize: '28px', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2E23', marginBottom: '.5rem' }}>{feature.label}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(31,46,35,0.55)', lineHeight: 1.7, margin: 0 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" style={{ padding: isMobile ? '60px 20px' : '100px 40px', background: '#1F2E23' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '11px', letterSpacing: '.2em', color: '#B89B5E', textTransform: 'uppercase', marginBottom: '1rem' }}>Your privacy is everything</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '46px', fontWeight: 300, color: '#F5F3EF', margin: '0 0 1rem' }}>Built like a vault.<br/><em style={{ color: '#B89B5E' }}>Because it is one.</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {trustPoints.map((point, i) => (
              <div key={i} style={{ background: 'rgba(245,243,239,0.04)', border: '1px solid rgba(184,155,94,0.12)', borderRadius: '10px', padding: '1.5rem' }}>
                <div style={{ fontSize: '28px', marginBottom: '1rem' }}>{point.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#F5F3EF', marginBottom: '.5rem' }}>{point.title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(245,243,239,0.45)', lineHeight: 1.7, margin: 0 }}>{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding: isMobile ? '60px 20px' : '100px 40px', background: '#F5F3EF' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', letterSpacing: '.2em', color: '#B89B5E', textTransform: 'uppercase', marginBottom: '1rem' }}>Founders Pricing</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '46px', fontWeight: 300, color: '#1F2E23', margin: '0 0 1rem' }}>Lock in your price today.<br/>Keep it forever.</h2>
          <p style={{ fontSize: '14px', color: 'rgba(31,46,35,0.5)', marginBottom: '3rem' }}>Grandfathered pricing for everyone who signs up before May 15, 2026. No credit card required.</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)', gap: '1rem', alignItems: 'start' }}>
            {plans.map((plan, i) => (
              <div key={i} style={{ background: plan.dark ? '#1F2E23' : '#fff', border: plan.popular ? '2px solid #B89B5E' : `1px solid ${plan.dark ? 'rgba(184,155,94,0.2)' : 'rgba(31,46,35,0.1)'}`, borderRadius: '10px', padding: '1.5rem', textAlign: 'left', position: 'relative' }}>
                {plan.popular && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#B89B5E', color: '#1F2E23', fontSize: '9px', letterSpacing: '.12em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, whiteSpace: 'nowrap' }}>Most popular</div>}
                <div style={{ fontSize: '9px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#B89B5E', background: 'rgba(184,155,94,0.1)', border: '1px solid rgba(184,155,94,0.2)', borderRadius: '20px', padding: '3px 8px', display: 'inline-block', marginBottom: '.75rem' }}>Founders price</div>
                <div style={{ fontSize: '11px', letterSpacing: '.15em', textTransform: 'uppercase', color: plan.dark ? '#B89B5E' : 'rgba(31,46,35,0.4)', marginBottom: '.5rem' }}>{plan.name}</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: 300, color: plan.dark ? '#F5F3EF' : '#1F2E23', marginBottom: '.25rem' }}>{plan.price}</div>
                <div style={{ fontSize: '11px', color: plan.dark ? 'rgba(245,243,239,0.35)' : 'rgba(31,46,35,0.4)', marginBottom: '1.25rem' }}>{plan.period}</div>
                {plan.features.map((item, j) => (
                  <div key={j} style={{ display: 'flex', gap: '7px', alignItems: 'flex-start', marginBottom: '.55rem' }}>
                    <div style={{ width: '13px', height: '13px', borderRadius: '50%', background: plan.dark ? 'rgba(184,155,94,0.2)' : 'rgba(184,155,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#B89B5E', flexShrink: 0, marginTop: '2px' }}>✓</div>
                    <div style={{ fontSize: '11px', color: plan.dark ? 'rgba(245,243,239,0.7)' : 'rgba(31,46,35,0.65)', lineHeight: 1.4 }}>{item}</div>
                  </div>
                ))}
                {plan.note && <div style={{ fontSize: '10px', color: plan.dark ? 'rgba(245,243,239,0.25)' : 'rgba(31,46,35,0.3)', fontStyle: 'italic', marginTop: '.5rem' }}>{plan.note}</div>}
                <a href="#founders" style={{ display: 'block', width: '100%', padding: '10px', border: plan.popular ? 'none' : `1px solid ${plan.dark ? 'rgba(184,155,94,0.3)' : 'rgba(31,46,35,0.2)'}`, borderRadius: '4px', background: plan.popular ? '#B89B5E' : 'transparent', color: plan.popular ? '#1F2E23' : plan.dark ? '#B89B5E' : '#1F2E23', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', marginTop: '1rem', fontWeight: plan.popular ? 700 : 500, textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' as const }}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FoundersSection />

      <section style={{ padding: '80px 40px', background: '#F5F3EF', borderTop: '1px solid rgba(31,46,35,0.08)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 300, color: '#1F2E23', marginBottom: '2.5rem', textAlign: 'center' }}>Common questions</h2>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid rgba(31,46,35,0.08)', padding: '1.25rem 0', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#1F2E23' }}>{faq.q}</div>
                <div style={{ fontSize: '20px', color: '#B89B5E', flexShrink: 0, marginLeft: '1rem' }}>{openFaq === i ? '−' : '+'}</div>
              </div>
              {openFaq === i && <div style={{ fontSize: '14px', color: 'rgba(31,46,35,0.6)', lineHeight: 1.7, marginTop: '1rem' }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '120px 40px', background: '#1F2E23', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ fontSize: '48px', marginBottom: '1.5rem' }}>🔒</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? '36px' : '52px', fontWeight: 300, color: '#F5F3EF', lineHeight: 1.2, margin: '0 0 1.5rem' }}>Do not leave the most<br/>important things<br/><em style={{ color: '#B89B5E' }}>unsaid.</em></h2>
          <p style={{ fontSize: '17px', color: 'rgba(245,243,239,0.45)', lineHeight: 1.8, margin: '0 0 3rem', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>Your vault takes 3 minutes to set up.<br/>What it preserves lasts a lifetime.</p>
          <a href="#founders" style={{ display: 'inline-block', padding: '18px 52px', background: '#B89B5E', color: '#1F2E23', border: 'none', borderRadius: '4px', fontSize: '14px', letterSpacing: '.18em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700, textDecoration: 'none' }}>Lock in your price</a>
          <div style={{ marginTop: '1.5rem', fontSize: '12px', color: 'rgba(245,243,239,0.2)', letterSpacing: '.06em' }}>No credit card · Grandfathered pricing forever</div>
        </div>
      </section>

      <footer style={{ background: '#1F2E23', borderTop: '1px solid rgba(184,155,94,0.1)', padding: '2rem 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#B89B5E', letterSpacing: '.05em' }}>Legacy Vault</div>
        <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.25)' }}>© 2026 Legacy Vault · joinlegacyvault.com</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy', 'Terms', 'Security', 'About'].map(item => (
            <a key={item} href="#" style={{ fontSize: '12px', color: 'rgba(245,243,239,0.3)', textDecoration: 'none' }}>{item}</a>
          ))}
        </div>
      </footer>

    </div>
  )
}
