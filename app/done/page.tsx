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

  useEffect(() => {
    if (!data) {
      router.replace('/start')
    }
  }, [data, router])

  if (!data) return null

  const { recipientName, deliveryRule, deliveryTrigger, inactivityDays } = data

  const deliveryLabelMap = {
    '30_days_inactive': '30 days of inactivity',
    '60_days_inactive': '60 days of inactivity',
    '90_days_inactive': '90 days of inactivity',
    'unlock_code': 'Unlock code activation',
    'custom_trigger': 'Custom trigger',
  }

  const deliveryLabel = deliveryRule && deliveryLabelMap[deliveryRule as keyof typeof deliveryLabelMap]
    ? deliveryLabelMap[deliveryRule as keyof typeof deliveryLabelMap]
    : deliveryTrigger === 'inactivity' && inactivityDays
      ? `${inactivityDays} days of inactivity`
      : deliveryTrigger || '—'

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
    }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>

        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '34px',
          marginBottom: '16px',
        }}>
          Your message is secured.
        </div>

        <div style={{
          fontSize: '16px',
          color: 'rgba(245,243,239,0.7)',
          marginBottom: '32px',
        }}>
          It will be delivered exactly as you intended.
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(184,155,94,0.2)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'left',
        }}>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#B89B5E' }}>To:</strong> {recipientName || '—'}
          </div>

          <div>
            <strong style={{ color: '#B89B5E' }}>Delivery trigger:</strong>{' '}
            {deliveryLabel}
          </div>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '14px 24px',
            background: '#C2A468',
            color: '#1F2E23',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Go to dashboard →
        </button>

      </div>
    </div>
  )
}
