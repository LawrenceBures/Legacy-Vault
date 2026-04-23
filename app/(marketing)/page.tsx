'use client'

import { useEffect, useState } from 'react'
import LiveVaultDemo from '@/components/LiveVaultDemo'

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const steps = [
    {
      num: '01',
      title: 'Start the guided setup',
      desc: 'Begin with a simple flow that helps you create the first vault entry without needing everything planned upfront.',
      icon: '🧭',
    },
    {
      num: '02',
      title: 'Choose who receives it',
      desc: 'Select the recipient and write the message you want them to receive when the time is right.',
      icon: '👥',
    },
    {
      num: '03',
      title: 'Set the delivery trigger',
      desc: 'Choose the condition that should release the message, then preview how the delivery will feel.',
      icon: '⏱',
    },
  ]

  const faqs = [
    {
      q: 'What happens if I forget to check in?',
      a: 'Legacy Vault is designed to send reminders and warning steps before any release action occurs. The goal is control, not surprise.',
    },
    {
      q: 'Can I decide who receives each message?',
      a: 'Yes. Entries can be structured around individual recipients so the right people receive the right information.',
    },
    {
      q: 'Can I update my vault later?',
      a: 'Yes. Your vault should evolve with your life. Messages, recipients, and instructions can be adjusted over time.',
    },
    {
      q: 'Is this only for end-of-life planning?',
      a: 'No. Legacy Vault can also be used for milestone messages, family guidance, and preserving important context before it is needed.',
    },
    {
      q: 'How do I get started?',
      a: 'Begin with the guided setup. You can choose a recipient, create a message, set a delivery trigger, and preview the experience before saving your vault.',
    },
  ]

  const navLinkStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'rgba(245,243,239,0.62)',
    textDecoration: 'none',
    letterSpacing: '.04em',
  }

  const eyebrowStyle: React.CSSProperties = {
    fontSize: '11px',
    letterSpacing: '.2em',
    color: '#B89B5E',
    textTransform: 'uppercase',
    marginBottom: '1rem',
  }

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F5F3EF', color: '#1F2E23' }}>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(20,30,24,0.96)',
          borderBottom: '1px solid rgba(184,155,94,0.10)',
          padding: isMobile ? '0 18px' : '0 40px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '21px',
            fontWeight: 600,
            color: '#B89B5E',
            letterSpacing: '.05em',
          }}
        >
          Legacy Vault
        </div>

        <div style={{ display: 'flex', gap: isMobile ? '10px' : '24px', alignItems: 'center' }}>
          {!isMobile && (
            <>
              <a href="#demo" style={navLinkStyle}>Demo</a>
              <a href="#why-now" style={navLinkStyle}>Why now</a>
              <a href="#start" style={navLinkStyle}>Start</a>
              <a href="#faq" style={navLinkStyle}>FAQ</a>
            </>
          )}

          <a
            href="/sign-in"
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: '#B89B5E',
              border: '1px solid rgba(184,155,94,0.35)',
              borderRadius: '4px',
              fontSize: '12px',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Sign in
          </a>

          <a
            href="/start"
            style={{
              padding: '10px 20px',
              background: '#C2A468',
              color: '#1F2E23',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Begin your vault
          </a>
        </div>
      </nav>

      <section
        style={{
          minHeight: '100vh',
          background: '#1F2E23',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: isMobile ? '150px 24px 90px' : '165px 40px 115px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 35%, rgba(184,155,94,0.12) 0%, transparent 62%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '860px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-block',
              padding: '7px 18px',
              border: '1px solid rgba(184,155,94,0.28)',
              borderRadius: '999px',
              fontSize: '11px',
              letterSpacing: '.18em',
              color: 'rgba(184,155,94,0.74)',
              textTransform: 'uppercase',
              marginBottom: '2rem',
            }}
          >
            A more intentional legacy
          </div>

          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: isMobile ? '44px' : '82px',
              fontWeight: 300,
              color: '#F5F3EF',
              lineHeight: 1.02,
              margin: '0 0 1.5rem',
            }}
          >
            What matters most
            <br />
            shouldn&apos;t be left
            <br />
            <em style={{ color: '#B89B5E', fontStyle: 'italic' }}>unspoken.</em>
          </h1>

          <p
            style={{
              fontSize: isMobile ? '18px' : '22px',
              color: 'rgba(245,243,239,0.74)',
              lineHeight: 1.6,
              margin: '0 auto 1.2rem',
              maxWidth: '640px',
              fontFamily: 'Cormorant Garamond, serif',
            }}
          >
            Most people leave behind assets.
            <br />
            Very few leave behind clarity.
          </p>

          <p
            style={{
              fontSize: isMobile ? '15px' : '17px',
              color: 'rgba(245,243,239,0.62)',
              lineHeight: 1.8,
              margin: '0 auto 1.25rem',
              maxWidth: '620px',
            }}
          >
            Legacy Vault preserves your voice, your intent, and the context your family will actually need — delivered on your terms.
          </p>

          <div
            style={{
              fontSize: '12px',
              color: 'rgba(194,164,104,0.74)',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              marginBottom: '2rem',
            }}
          >
            Designed for legacy with more structure, more meaning, and more control.
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <a
              href="/start"
              style={{
                padding: '16px 40px',
                background: '#C2A468',
                color: '#1F2E23',
                borderRadius: '4px',
                fontSize: '13px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Begin your vault
            </a>

            <a
              href="#demo"
              style={{
                padding: '16px 34px',
                background: 'transparent',
                color: 'rgba(245,243,239,0.72)',
                border: '1px solid rgba(245,243,239,0.16)',
                borderRadius: '4px',
                fontSize: '13px',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              See how it works
            </a>
          </div>

          <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.25)', letterSpacing: '.06em' }}>
            Built to begin simply and grow with the people it serves.
          </div>
        </div>
      </section>

      <section
        id="demo"
        style={{
          padding: isMobile ? '60px 20px' : '90px 40px',
          background: '#FCFAF6',
          borderTop: '1px solid rgba(31,46,35,0.05)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', marginBottom: '2.75rem' }}>
          <div style={eyebrowStyle}>Live preview</div>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: isMobile ? '36px' : '48px',
              fontWeight: 300,
              color: '#1F2E23',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Preview the delivery before it is real.
          </h2>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', transform: isMobile ? 'scale(1)' : 'scale(1.045)', transformOrigin: 'top center' }}>
          <LiveVaultDemo />
        </div>
      </section>

      <section
        id="why-now"
        style={{
          padding: isMobile ? '60px 20px' : '80px 40px',
          background: '#FCFAF6',
          borderTop: '1px solid rgba(31,46,35,0.05)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={eyebrowStyle}>Why now</div>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: isMobile ? '34px' : '44px',
              fontWeight: 300,
              color: '#1F2E23',
              lineHeight: 1.2,
              marginBottom: '1.5rem',
            }}
          >
            Digital assets have grown.
            <br />
            <em style={{ color: '#B89B5E' }}>Communication has not.</em>
          </h2>

          <p style={{ fontSize: '16px', color: 'rgba(31,46,35,0.62)', lineHeight: 1.8, margin: 0 }}>
            Families have more files, more accounts, and more complexity than ever before — but almost no structured way to pass down meaning, context, or intent.
          </p>
        </div>
      </section>

      <section
        style={{
          padding: isMobile ? '70px 20px' : '100px 40px',
          background: '#F5F3EF',
          borderTop: '1px solid rgba(31,46,35,0.05)',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '2rem' : '3rem',
            alignItems: 'start',
          }}
        >
          <div>
            <div style={eyebrowStyle}>Why this matters now</div>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: isMobile ? '38px' : '52px',
                fontWeight: 300,
                color: '#1F2E23',
                lineHeight: 1.14,
                margin: '0 0 1.25rem',
              }}
            >
              Most families inherit
              <br />
              assets.
              <br />
              <em style={{ color: '#B89B5E' }}>Not clarity.</em>
            </h2>
          </div>

          <div>
            <p style={{ fontSize: '17px', color: 'rgba(31,46,35,0.66)', lineHeight: 1.9, margin: '0 0 1.25rem' }}>
              When something happens, people don’t just need money or paperwork. They need guidance, context, and the voice of the person who understood what mattered.
            </p>
            <p style={{ fontSize: '17px', color: 'rgba(31,46,35,0.66)', lineHeight: 1.9, margin: 0 }}>
              Legacy Vault turns legacy into something structured, personal, and usable the moment it’s needed.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: isMobile ? '72px 20px' : '112px 40px',
          background: '#FCFAF6',
          borderTop: '1px solid rgba(31,46,35,0.05)',
          borderBottom: '1px solid rgba(31,46,35,0.05)',
        }}
      >
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={eyebrowStyle}>How it works</div>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: isMobile ? '38px' : '54px',
                fontWeight: 300,
                color: '#1F2E23',
                margin: '0 auto 1rem',
                maxWidth: '700px',
                lineHeight: 1.12,
              }}
            >
              A structured way to leave what matters.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '1.5rem',
            }}
          >
            {steps.map((step, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  border: '1px solid rgba(31,46,35,0.05)',
                  borderRadius: '14px',
                  padding: '2rem',
                  boxShadow: '0 14px 32px rgba(31,46,35,0.035)',
                }}
              >
                <div style={{ fontSize: '11px', letterSpacing: '.2em', color: '#B89B5E', marginBottom: '1.5rem' }}>
                  {step.num}
                </div>
                <div style={{ fontSize: '32px', marginBottom: '1rem' }}>{step.icon}</div>
                <h3
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '22px',
                    fontWeight: 400,
                    color: '#1F2E23',
                    marginBottom: '.75rem',
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(31,46,35,0.55)', lineHeight: 1.7, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: isMobile ? '72px 20px' : '112px 40px',
          background: '#F5F3EF',
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '2rem' : '3rem',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              border: '1px solid rgba(31,46,35,0.05)',
              borderRadius: '14px',
              padding: '2rem',
              boxShadow: '0 14px 32px rgba(31,46,35,0.035)',
            }}
          >
            <div style={eyebrowStyle}>Delivery trigger setup</div>
            {[
              { icon: '🎂', label: 'When my daughter turns 18', date: 'June 14, 2031' },
              { icon: '💍', label: 'On our 25th anniversary', date: 'September 3, 2028' },
              { icon: '🎓', label: 'When my son graduates', date: 'May 2029' },
              { icon: '👶', label: 'When our first grandchild is born', date: 'Upon birth' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 0',
                  borderBottom: i < 3 ? '1px solid rgba(31,46,35,0.06)' : 'none',
                }}
              >
                <div style={{ fontSize: '22px' }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#1F2E23' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#B89B5E', marginTop: '2px' }}>{item.date}</div>
                </div>
                <div
                  style={{
                    fontSize: '9px',
                    padding: '3px 8px',
                    background: 'rgba(46,204,113,0.08)',
                    color: '#27ae60',
                    border: '1px solid rgba(46,204,113,0.2)',
                    borderRadius: '20px',
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Scheduled
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={eyebrowStyle}>Timed with intention</div>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '42px',
                fontWeight: 300,
                color: '#1F2E23',
                lineHeight: 1.2,
                margin: '0 0 1.5rem',
              }}
            >
              Delivered when the moment
              <br />
              <em style={{ color: '#B89B5E' }}>actually arrives.</em>
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(31,46,35,0.55)', lineHeight: 1.8, margin: '0 0 1.5rem' }}>
              Set the trigger for when a message should be released. The current flow keeps setup focused: choose the recipient, create the message, pick the trigger, and preview the delivery.
            </p>
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(31,46,35,0.4)',
                lineHeight: 1.7,
                fontStyle: 'italic',
                fontFamily: 'Cormorant Garamond, serif',
                margin: 0,
              }}
            >
              "I recorded a message for my daughter's wedding day — five years before she met her husband."
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: isMobile ? '72px 20px' : '112px 40px',
          background: '#1F2E23',
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '2rem' : '3rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={eyebrowStyle}>AI guidance</div>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '42px',
                fontWeight: 300,
                color: '#F5F3EF',
                lineHeight: 1.2,
                margin: '0 0 1.5rem',
              }}
            >
              Help saying what
              <br />
              actually matters.
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(245,243,239,0.62)',
                lineHeight: 1.8,
                margin: '0 0 2rem',
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
              }}
            >
              Legacy Vault includes guided prompts that help users express difficult thoughts, organize instructions, and leave something more meaningful than a blank page.
            </p>
            {[
              'Prompts that help uncover what you really want to say',
              'Guidance around tone, feeling, and clarity',
              'A better starting point for difficult messages',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C2A468', flexShrink: 0, marginTop: '7px' }} />
                <div style={{ fontSize: '14px', color: 'rgba(245,243,239,0.65)' }}>{item}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#B89B5E', border: '1px solid rgba(31,46,35,0.2)', borderRadius: '10px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(31,46,35,0.15)' }}>
              <span style={{ fontSize: '18px' }}>✨</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2E23' }}>Help me say this</div>
                <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.6)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}>
                  Guided by Legacy Vault AI
                </div>
              </div>
            </div>

            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1F2E23', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '.75rem' }}>
              What do you want them to feel?
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '1rem' }}>
              {['Loved', 'Understood', 'Forgiven', 'Proud', 'At Peace', 'Inspired'].map((e, i) => (
                <div
                  key={e}
                  style={{
                    padding: '8px',
                    background: i === 0 ? '#1F2E23' : 'rgba(255,255,255,0.4)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: i === 0 ? '#B89B5E' : '#1F2E23',
                  }}
                >
                  {e}
                </div>
              ))}
            </div>

            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1F2E23', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '.5rem' }}>
              What is one thing you have never said?
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '13px',
                color: 'rgba(31,46,35,0.5)',
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                marginBottom: '1rem',
              }}
            >
              "I just want you to know how proud I am..."
            </div>

            <div
              style={{
                background: '#1F2E23',
                borderRadius: '6px',
                padding: '10px',
                textAlign: 'center',
                fontSize: '12px',
                color: '#B89B5E',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Write my message
            </div>
          </div>
        </div>
      </section>

      <section
        id="start"
        style={{
          padding: isMobile ? '72px 20px' : '112px 40px',
          background: '#F5F3EF',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={eyebrowStyle}>Start your vault</div>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '46px',
              fontWeight: 300,
              color: '#1F2E23',
              margin: '0 0 1rem',
            }}
          >
            Begin with the guided
            <br />
            MVP flow.
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(31,46,35,0.58)', lineHeight: 1.8, margin: '0 auto 2rem', maxWidth: '640px' }}>
            Pricing is not shown here yet. For now, the public site should send people into the guided setup where they can choose a recipient, create a message, set a delivery trigger, and preview the delivery experience.
          </p>

          <a
            href="/start"
            style={{
              display: 'inline-block',
              padding: '16px 44px',
              background: '#B89B5E',
              color: '#1F2E23',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              letterSpacing: '.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Begin your vault
          </a>
        </div>
      </section>

      <section
        id="faq"
        style={{
          padding: isMobile ? '64px 20px' : '96px 40px',
          background: '#F5F3EF',
          borderTop: '1px solid rgba(31,46,35,0.06)',
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '36px',
              fontWeight: 300,
              color: '#1F2E23',
              marginBottom: '2.5rem',
              textAlign: 'center',
            }}
          >
            Common questions
          </h2>

          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{ borderBottom: '1px solid rgba(31,46,35,0.08)', padding: '1.25rem 0', cursor: 'pointer' }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#1F2E23' }}>{faq.q}</div>
                <div style={{ fontSize: '20px', color: '#B89B5E', flexShrink: 0, marginLeft: '1rem' }}>
                  {openFaq === i ? '−' : '+'}
                </div>
              </div>
              {openFaq === i && (
                <div style={{ fontSize: '14px', color: 'rgba(31,46,35,0.6)', lineHeight: 1.7, marginTop: '1rem' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: isMobile ? '96px 24px' : '132px 40px',
          background: '#1F2E23',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: isMobile ? '40px' : '58px',
              fontWeight: 300,
              color: '#F5F3EF',
              lineHeight: 1.2,
              margin: '0 0 1.5rem',
            }}
          >
            A better legacy is not
            <br />
            just remembered.
            <br />
            <em style={{ color: '#B89B5E' }}>It is prepared.</em>
          </h2>
          <p
            style={{
              fontSize: '17px',
              color: 'rgba(245,243,239,0.45)',
              lineHeight: 1.8,
              margin: '0 0 3rem',
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
            }}
          >
            Legacy Vault gives families something more useful than storage: clarity, timing, and the human meaning behind what gets left behind.
          </p>
          <a
            href="/start"
            style={{
              display: 'inline-block',
              padding: '18px 52px',
              background: '#C2A468',
              color: '#1F2E23',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Begin your vault
          </a>
          <div style={{ marginTop: '1.5rem', fontSize: '12px', color: 'rgba(245,243,239,0.2)', letterSpacing: '.06em' }}>
            Built to begin simply and grow with the people it serves.
          </div>
        </div>
      </section>

      <footer
        style={{
          background: '#1F2E23',
          borderTop: '1px solid rgba(184,155,94,0.1)',
          padding: '2rem 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '16px',
            color: '#B89B5E',
            letterSpacing: '.05em',
          }}
        >
          Legacy Vault
        </div>

        <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.25)' }}>
          © 2026 Legacy Vault · joinlegacyvault.com
        </div>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy', 'Terms', 'About'].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                fontSize: '12px',
                color: 'rgba(245,243,239,0.34)',
                textDecoration: 'none',
              }}
            >
              {item}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
