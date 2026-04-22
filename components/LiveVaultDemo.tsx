'use client'

import { useEffect, useState } from 'react'

const scenes = [
  {
    recipient: 'Daughter',
    type: 'Video message',
    rule: 'On 18th birthday · June 14, 2031',
    note: 'There are a few things I wanted you to hear from me when this day finally came.',
    file: 'Family Letter.pdf',
    status: 'Scheduled',
  },
  {
    recipient: 'Spouse',
    type: 'Voice recording',
    rule: 'After 60 days inactivity',
    note: 'If you are hearing this, I want you to know what mattered most to me, and where everything is.',
    file: 'Household Instructions.pdf',
    status: 'Monitoring',
  },
  {
    recipient: 'Son',
    type: 'Written letter',
    rule: 'Graduation day · May 2029',
    note: 'I wrote this for the version of you that finally made it to this day.',
    file: 'Graduation Note.pdf',
    status: 'Locked',
  },
]

export default function LiveVaultDemo() {
  const [scene, setScene] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setScene((prev) => (prev + 1) % scenes.length)
    }, 2600)

    return () => window.clearInterval(id)
  }, [])

  const current = scenes[scene]

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 24px 60px rgba(31,46,35,0.08)',
        border: '1px solid rgba(31,46,35,0.06)',
        overflow: 'hidden',
        transform: scene % 2 === 0 ? 'translateY(0px)' : 'translateY(-2px)',
        transition: 'all 0.45s ease',
      }}
    >
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid rgba(31,46,35,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FFFDF9',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.4)', marginBottom: '4px' }}>
            Legacy Vault Preview
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1F2E23' }}>
            Message Delivery
          </div>
        </div>

        <div
          style={{
            fontSize: '10px',
            padding: '5px 10px',
            background: 'rgba(184,155,94,0.1)',
            color: '#8D7341',
            borderRadius: '999px',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            transform: scene % 2 === 0 ? 'scale(1)' : 'scale(1.06)',
            transition: 'all 0.35s ease',
          }}
        >
          {current.status}
        </div>
      </div>

      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
          {scenes.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === scene ? '24px' : '8px',
                height: '8px',
                borderRadius: '999px',
                background: i === scene ? '#C2A468' : 'rgba(31,46,35,0.14)',
                transition: 'all 0.35s ease',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
          <div style={{ background: '#F8F6F1', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.42)', marginBottom: '4px' }}>Recipient</div>
            <div style={{ fontSize: '17px', fontWeight: 600, color: '#1F2E23', transition: 'all 0.35s ease' }}>
              {current.recipient}
            </div>
          </div>

          <div style={{ background: '#F8F6F1', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.42)', marginBottom: '4px' }}>Entry type</div>
            <div style={{ fontSize: '17px', fontWeight: 600, color: '#1F2E23', transition: 'all 0.35s ease' }}>
              {current.type}
            </div>
          </div>
        </div>

        <div style={{ background: '#F8F6F1', borderRadius: '12px', padding: '14px', marginBottom: '1rem' }}>
          <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.42)', marginBottom: '4px' }}>Release rule</div>
          <div style={{ fontSize: '16px', color: '#1F2E23', transition: 'all 0.35s ease' }}>
            {current.rule}
          </div>
        </div>

        <div
          style={{
            background: '#1F2E23',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '1rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: scene % 2 === 0 ? '0 10px 26px rgba(0,0,0,0.10)' : '0 16px 34px rgba(194,164,104,0.10)',
            transition: 'all 0.4s ease',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 65% 20%, rgba(194,164,104,0.14) 0%, transparent 60%)',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: 'rgba(194,164,104,0.82)',
                marginBottom: '8px',
              }}
            >
              Private message preview
            </div>

            <div
              style={{
                fontSize: '20px',
                color: '#F5F3EF',
                fontFamily: 'Cormorant Garamond, serif',
                lineHeight: 1.35,
                marginBottom: '12px',
                transition: 'all 0.35s ease',
              }}
            >
              “{current.note}”
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: scene % 2 === 0 ? 'rgba(194,164,104,0.18)' : 'rgba(194,164,104,0.30)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#C2A468',
                  fontSize: scene % 2 === 0 ? '14px' : '16px',
                  transform: scene % 2 === 0 ? 'scale(1)' : 'scale(1.12)',
                  boxShadow: scene % 2 === 0 ? '0 0 0 rgba(194,164,104,0)' : '0 0 18px rgba(194,164,104,0.22)',
                  transition: 'all 0.35s ease',
                }}
              >
                ▶
              </div>

              <div style={{ fontSize: '13px', color: 'rgba(245,243,239,0.62)' }}>
                Preview attached
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ border: '1px solid rgba(31,46,35,0.08)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.42)', marginBottom: '4px' }}>Attached document</div>
            <div style={{ fontSize: '15px', color: '#1F2E23', transition: 'all 0.35s ease' }}>
              {current.file}
            </div>
          </div>

          <div style={{ border: '1px solid rgba(31,46,35,0.08)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.42)', marginBottom: '4px' }}>State</div>
            <div style={{ fontSize: '15px', color: '#1F2E23', transition: 'all 0.35s ease' }}>
              {current.status}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
