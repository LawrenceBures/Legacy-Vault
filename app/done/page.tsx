'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type SavedVaultData = {
  recipientName?: string
  deliveryRule?: string
  deliveryTrigger?: string
  inactivityDays?: number | null
}

export default function DonePage() {
  const router = useRouter()
  const [data] = useState<SavedVaultData | null>(() => {
    if (typeof window === 'undefined') return null

    try {
      const raw = sessionStorage.getItem('vaultDataSaved')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [sealed, setSealed] = useState(false)
  const [showButtons, setShowButtons] = useState(false)

  useEffect(() => {
    // Trigger seal animation after mount
    const sealTimer = setTimeout(() => setSealed(true), 400)
    const buttonTimer = setTimeout(() => setShowButtons(true), 3500)
    return () => {
      clearTimeout(sealTimer)
      clearTimeout(buttonTimer)
    }
  }, [])

  const recipientName = data?.recipientName || 'your recipient'

  const deliveryLabelMap = {
    '30_days_inactive': '30 days of inactivity',
    '60_days_inactive': '60 days of inactivity',
    '90_days_inactive': '90 days of inactivity',
    'unlock_code': 'Unlock code activation',
    'custom_trigger': 'Custom trigger',
  }

  const deliveryLabel = data?.deliveryRule && deliveryLabelMap[data.deliveryRule as keyof typeof deliveryLabelMap]
    ? deliveryLabelMap[data.deliveryRule as keyof typeof deliveryLabelMap]
    : data?.deliveryTrigger === 'inactivity' && data?.inactivityDays
      ? `${data.inactivityDays} days of inactivity`
      : data?.deliveryTrigger || 'when the time comes'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1F2E23',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: '#F5F3EF',
      fontFamily: 'DM Sans, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(184,155,94,0.12) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Shimmer particles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            background: '#B89B5E',
            borderRadius: '50%',
            left: `${10 + (i * 7.5)}%`,
            top: `${20 + (i % 3) * 25}%`,
            opacity: 0,
            animation: `shimmer ${2 + (i % 3)}s ease-in-out ${0.5 + i * 0.3}s infinite`,
          }} />
        ))}
      </div>

      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Vault door animation */}
        <div style={{
          width: '100px',
          height: '100px',
          margin: '0 auto 2rem',
          perspective: '600px',
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transform: sealed ? 'rotateY(0deg) scale(1)' : 'rotateY(-40deg) scale(1.1)',
            transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformStyle: 'preserve-3d',
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: sealed
                ? 'linear-gradient(145deg, #B89B5E 0%, #8B7542 50%, #B89B5E 100%)'
                : 'linear-gradient(145deg, rgba(184,155,94,0.3) 0%, rgba(139,117,66,0.3) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '42px',
              transition: 'all 1.2s ease',
              boxShadow: sealed
                ? '0 0 40px rgba(184,155,94,0.35), inset 0 2px 8px rgba(255,255,255,0.2)'
                : '0 0 10px rgba(184,155,94,0.1)',
              border: `2px solid ${sealed ? 'rgba(184,155,94,0.6)' : 'rgba(184,155,94,0.15)'}`,
            }}>
              {sealed ? '\uD83D\uDD12' : '\uD83D\uDD13'}
            </div>
          </div>
        </div>

        {/* Main heading */}
        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '42px',
          fontWeight: 300,
          color: '#F5F3EF',
          lineHeight: 1.2,
          marginBottom: '12px',
          opacity: sealed ? 1 : 0.4,
          transform: sealed ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 1s ease 0.6s',
        }}>
          Your message is <em style={{ color: '#B89B5E', fontStyle: 'italic' }}>sealed.</em>
        </div>

        {/* Recipient info */}
        <div style={{
          fontSize: '17px',
          color: 'rgba(245,243,239,0.55)',
          lineHeight: 1.8,
          marginBottom: '2.5rem',
          fontFamily: 'Cormorant Garamond, serif',
          fontStyle: 'italic',
          opacity: sealed ? 1 : 0,
          transform: sealed ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 1s ease 1s',
        }}>
          This is now preserved. When the time comes,
          <br />
          <span style={{ color: '#B89B5E', fontWeight: 500 }}>{recipientName}</span> will receive this.
        </div>

        {/* Delivery details */}
        <div style={{
          padding: '20px 28px',
          background: 'rgba(184,155,94,0.06)',
          border: '1px solid rgba(184,155,94,0.18)',
          borderRadius: '10px',
          marginBottom: '2.5rem',
          opacity: sealed ? 1 : 0,
          transition: 'opacity 1s ease 1.4s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(184,155,94,0.6)', marginBottom: '4px' }}>Recipient</div>
              <div style={{ fontSize: '15px', color: '#F5F3EF' }}>{recipientName}</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: 'rgba(184,155,94,0.15)' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(184,155,94,0.6)', marginBottom: '4px' }}>Delivery trigger</div>
              <div style={{ fontSize: '15px', color: '#F5F3EF' }}>{deliveryLabel}</div>
            </div>
          </div>
        </div>

        {/* Action buttons — appear after 3 seconds */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          opacity: showButtons ? 1 : 0,
          transform: showButtons ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.8s ease',
        }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '14px 32px',
              background: '#C2A468',
              color: '#1F2E23',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '12px',
              letterSpacing: '.12em',
              textTransform: 'uppercase',
            }}
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push('/new-entry')}
            style={{
              padding: '14px 32px',
              background: 'transparent',
              color: 'rgba(245,243,239,0.6)',
              border: '1px solid rgba(245,243,239,0.15)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              letterSpacing: '.12em',
              textTransform: 'uppercase',
            }}
          >
            Create Another Entry
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0; transform: translateY(0); }
          50% { opacity: 0.6; transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}
