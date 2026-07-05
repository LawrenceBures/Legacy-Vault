'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function PostAuthPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [error, setError] = useState('')
  const [timedOut, setTimedOut] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // 15-second timeout
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true)
    }, 15000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.replace('/sign-up')
      return
    }

    let cancelled = false

    async function persistVaultData() {
      try {
        const raw = localStorage.getItem('vaultData')
        if (!raw) {
          router.replace('/start')
          return
        }

        const data = JSON.parse(raw)
        const res = await fetch('/api/onboarding/start-vault', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...data,
            email: user!.emailAddresses[0]?.emailAddress || null,
            fullName: user!.fullName || user!.firstName || '',
          }),
        })

        const result = await res.json()
        if (!res.ok) {
          throw new Error(result?.error || 'Something went wrong while saving.')
        }

        sessionStorage.setItem('vaultDataSaved', JSON.stringify(result))
        localStorage.removeItem('vaultData')
        if (!cancelled) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          router.replace('/done')
        }
      } catch (err) {
        console.error('Vault persistence failed:', err)
        if (!cancelled) {
          setError(
            err instanceof Error && err.message !== 'Something went wrong while saving.'
              ? 'We had trouble saving your message. Please try again.'
              : 'We had trouble saving your message. Please try again.'
          )
        }
      }
    }

    persistVaultData()

    return () => {
      cancelled = true
    }
  }, [isLoaded, router, user])

  const showError = error || timedOut

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1F2E23',
      fontFamily: 'DM Sans, sans-serif',
      flexDirection: 'column',
      gap: '24px',
      textAlign: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(184,155,94,0.1) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {showError ? (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: 'rgba(184,155,94,0.1)',
            border: '1px solid rgba(184,155,94,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}>
            {'\uD83D\uDD12'}
          </div>
          <div style={{
            color: '#F5F3EF',
            fontSize: '22px',
            fontFamily: 'Cormorant Garamond, serif',
            marginBottom: '12px',
          }}>
            {timedOut && !error ? 'This is taking longer than expected.' : 'We could not save your message.'}
          </div>
          <div style={{
            maxWidth: '420px',
            lineHeight: 1.7,
            color: 'rgba(245,243,239,0.5)',
            fontSize: '14px',
            marginBottom: '24px',
          }}>
            {timedOut && !error
              ? 'Your connection may be slow. Please try again and your message will be saved securely.'
              : 'Something went wrong on our end. Your message is still saved locally and will be secured when you retry.'}
          </div>
          <button
            onClick={() => {
              setError('')
              setTimedOut(false)
              if (timeoutRef.current) clearTimeout(timeoutRef.current)
              timeoutRef.current = setTimeout(() => setTimedOut(true), 15000)
              window.location.reload()
            }}
            style={{
              padding: '14px 32px',
              border: 'none',
              borderRadius: '4px',
              background: '#B89B5E',
              color: '#1F2E23',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '12px',
              letterSpacing: '.12em',
              textTransform: 'uppercase',
            }}
          >
            Try again
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Pulsing vault icon */}
          <div style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 24px',
            borderRadius: '50%',
            background: 'rgba(184,155,94,0.1)',
            border: '1px solid rgba(184,155,94,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            {'\uD83D\uDD10'}
          </div>

          <div style={{
            color: '#F5F3EF',
            fontSize: '22px',
            fontFamily: 'Cormorant Garamond, serif',
            marginBottom: '10px',
          }}>
            Securing your message...
          </div>

          {/* Progress bar */}
          <div style={{
            width: '200px',
            height: '2px',
            background: 'rgba(184,155,94,0.15)',
            borderRadius: '2px',
            margin: '0 auto',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: '#B89B5E',
              borderRadius: '2px',
              animation: 'progress 2.5s ease-in-out infinite',
            }} />
          </div>

          <div style={{
            marginTop: '16px',
            fontSize: '12px',
            color: 'rgba(245,243,239,0.3)',
            letterSpacing: '.06em',
          }}>
            Encrypting and storing safely
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }
        @keyframes progress {
          0% { width: 0%; margin-left: 0; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  )
}
