'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AboutPage() {
  const router = useRouter()
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)

  const values = [
    { icon: '🔒', title: 'Privacy is non-negotiable', desc: 'Your most personal messages deserve the highest protection. End-to-end encryption isn\'t a feature — it\'s a foundation.' },
    { icon: '💛', title: 'Emotion over efficiency', desc: 'We don\'t optimize for speed. We optimize for meaning. Every design decision asks: does this help someone say something that matters?' },
    { icon: '🌱', title: 'Built for everyone', desc: 'Legacy isn\'t reserved for the wealthy or the famous. Everyone has something worth preserving. Everyone has someone worth telling.' },
    { icon: '⏳', title: 'Time is the only resource that runs out', desc: 'We built Legacy Vault because the things we mean to say — we often never say. We\'re here to change that.' },
  ]

  const team = [
    { initials: 'CB', name: 'Cortez Bures', role: 'Founder & CEO', bio: 'Cortez built Legacy Vault after realizing the most important conversations in his life had never been had. A screenwriter and entrepreneur, he believes the stories we leave behind matter as much as the ones we tell while we\'re here.' },
  ]

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F5F3EF', color: '#1F2E23' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(31,46,35,0.97)', borderBottom: '1px solid rgba(184,155,94,0.15)', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.push('/')} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 600, color: '#B89B5E', letterSpacing: '.05em', background: 'none', border: 'none', cursor: 'pointer' }}>Legacy Vault</button>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => router.push('/sign-in')} style={{ padding: '9px 22px', background: 'transparent', color: '#B89B5E', border: '1px solid rgba(184,155,94,0.4)', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500 }}>Sign in</button>
          <button onClick={() => router.push('/sign-up')} style={{ padding: '9px 22px', background: '#B89B5E', color: '#1F2E23', border: 'none', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700 }}>Start free</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '70vh', background: '#1F2E23', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 40px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(184,155,94,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '720px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', padding: '6px 18px', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '20px', fontSize: '11px', letterSpacing: '.18em', color: 'rgba(184,155,94,0.8)', textTransform: 'uppercase', marginBottom: '2rem' }}>Our Mission</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '58px', fontWeight: 300, color: '#F5F3EF', lineHeight: 1.1, margin: '0 0 1.5rem' }}>
            We exist so the most<br/>important things<br/><em style={{ color: '#B89B5E' }}>get said.</em>
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(245,243,239,0.5)', lineHeight: 1.8, margin: '0 auto', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', maxWidth: '540px' }}>
            Legacy Vault was built on a simple belief: the people we love deserve to hear how we feel about them — not just at funerals, not just in passing, but in their own time, in our own words, delivered exactly when it matters most.
          </p>
        </div>
      </section>

      {/* STORY */}
      <section style={{ padding: '100px 40px', background: '#F5F3EF' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '.2em', color: '#B89B5E', textTransform: 'uppercase', marginBottom: '1.5rem' }}>The story</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '42px', fontWeight: 300, color: '#1F2E23', lineHeight: 1.2, margin: '0 0 2rem' }}>
            It started with the things<br/>that never got said.
          </h2>
          <div style={{ fontSize: '17px', color: 'rgba(31,46,35,0.65)', lineHeight: 1.9, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
            <p style={{ margin: '0 0 1.5rem' }}>
              "I kept thinking about the conversations I'd never had with my grandfather. Not because we didn't care — but because we never found the right moment. And then the moment was gone."
            </p>
            <p style={{ margin: '0 0 1.5rem' }}>
              "I started thinking about all the things I wanted to say to the people I love. Not when I'm gone — but on their wedding day. When they turn 18. When life gets hard and they need to hear my voice."
            </p>
            <p style={{ margin: 0 }}>
              "Legacy Vault is the product I wish existed. A place where you can say the things you mean — and trust that they'll be delivered to the right person at the right time."
            </p>
          </div>
          <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(184,155,94,0.15)', border: '1px solid rgba(184,155,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 600, color: '#B89B5E', fontFamily: 'DM Sans, sans-serif' }}>CB</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1F2E23' }}>Cortez Bures</div>
              <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.45)', letterSpacing: '.04em' }}>Founder, Legacy Vault</div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION STATEMENT */}
      <section style={{ padding: '100px 40px', background: '#1F2E23', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '.2em', color: '#B89B5E', textTransform: 'uppercase', marginBottom: '1.5rem' }}>What we believe</div>
          <blockquote style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '38px', fontWeight: 300, color: '#F5F3EF', lineHeight: 1.3, margin: '0 0 2rem', fontStyle: 'italic' }}>
            "Every person carries messages inside them that the people they love will never hear — unless someone builds the bridge."
          </blockquote>
          <p style={{ fontSize: '16px', color: 'rgba(245,243,239,0.45)', lineHeight: 1.8, maxWidth: '580px', margin: '0 auto', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
            Legacy Vault is that bridge. We combine the intimacy of a handwritten letter with the permanence of a digital vault — and the intelligence of AI that helps you find the words when words are hard to find.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section style={{ padding: '100px 40px', background: '#F5F3EF' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '11px', letterSpacing: '.2em', color: '#B89B5E', textTransform: 'uppercase', marginBottom: '1rem' }}>What drives us</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '42px', fontWeight: 300, color: '#1F2E23', margin: 0 }}>Our values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
            {values.map((value, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid rgba(31,46,35,0.08)', borderRadius: '10px', padding: '2rem' }}>
                <div style={{ fontSize: '32px', marginBottom: '1rem' }}>{value.icon}</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 400, color: '#1F2E23', marginBottom: '.75rem' }}>{value.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(31,46,35,0.55)', lineHeight: 1.7, margin: 0 }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section style={{ padding: '100px 40px', background: '#F5F3EF', borderTop: '1px solid rgba(31,46,35,0.06)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '11px', letterSpacing: '.2em', color: '#B89B5E', textTransform: 'uppercase', marginBottom: '1rem' }}>The people behind it</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '42px', fontWeight: 300, color: '#1F2E23', margin: 0 }}>Built with intention.</h2>
          </div>
          {team.map((member, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid rgba(31,46,35,0.08)', borderRadius: '10px', padding: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(184,155,94,0.12)', border: '1px solid rgba(184,155,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600, color: '#B89B5E', flexShrink: 0 }}>{member.initials}</div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#1F2E23', marginBottom: '.25rem' }}>{member.name}</div>
                <div style={{ fontSize: '12px', color: '#B89B5E', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>{member.role}</div>
                <p style={{ fontSize: '15px', color: 'rgba(31,46,35,0.6)', lineHeight: 1.8, margin: 0, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '100px 40px', background: '#1F2E23', textAlign: 'center' }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div style={{ fontSize: '48px', marginBottom: '1.5rem' }}>🔒</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '46px', fontWeight: 300, color: '#F5F3EF', lineHeight: 1.2, margin: '0 0 1.5rem' }}>
            Ready to leave<br/><em style={{ color: '#B89B5E' }}>something behind?</em>
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(245,243,239,0.45)', lineHeight: 1.8, margin: '0 0 3rem', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
            Your vault takes 3 minutes to set up.<br/>What it preserves lasts a lifetime.
          </p>
          <button onClick={() => router.push('/sign-up')}
            onMouseEnter={() => setHoveredBtn('cta')} onMouseLeave={() => setHoveredBtn(null)}
            style={{ padding: '16px 44px', background: '#B89B5E', color: '#1F2E23', border: 'none', borderRadius: '4px', fontSize: '13px', letterSpacing: '.15em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', transform: hoveredBtn === 'cta' ? 'translateY(-2px)' : 'none' }}>
            Begin your legacy
          </button>
          <div style={{ marginTop: '1.5rem', fontSize: '12px', color: 'rgba(245,243,239,0.2)' }}>Free trial · No credit card required</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#1F2E23', borderTop: '1px solid rgba(184,155,94,0.1)', padding: '2rem 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#B89B5E' }}>Legacy Vault</div>
        <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.25)' }}>© 2026 Legacy Vault · joinlegacyvault.com</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Home', 'Privacy', 'Terms', 'Security'].map(item => (
            <a key={item} href={item === 'Home' ? '/' : '#'} style={{ fontSize: '12px', color: 'rgba(245,243,239,0.3)', textDecoration: 'none' }}>{item}</a>
          ))}
        </div>
      </footer>

    </div>
  )
}
