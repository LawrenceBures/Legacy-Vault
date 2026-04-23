'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PostAuthPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [error, setError] = useState('')

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
          throw new Error(result?.error || 'Failed to save vault data.')
        }

        sessionStorage.setItem('vaultDataSaved', JSON.stringify(result))
        localStorage.removeItem('vaultData')
        if (!cancelled) router.replace('/done')
      } catch (err) {
        console.error('Vault persistence failed:', err)
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to save your message.')
        }
      }
    }

    persistVaultData()

    return () => {
      cancelled = true
    }
  }, [isLoaded, router, user])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1F2E23',
      fontFamily: 'DM Sans, sans-serif',
      fontSize: '15px',
      color: 'rgba(245,243,239,0.55)',
      letterSpacing: '.04em',
      flexDirection: 'column',
      gap: '18px',
      textAlign: 'center',
      padding: '24px',
    }}>
      {error ? (
        <>
          <div style={{ color: '#F5F3EF', fontSize: '18px', fontFamily: 'Cormorant Garamond, serif' }}>
            We could not save your message.
          </div>
          <div style={{ maxWidth: '420px', lineHeight: 1.6 }}>{error}</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 22px',
              border: 'none',
              borderRadius: '6px',
              background: '#B89B5E',
              color: '#1F2E23',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </>
      ) : (
        'Securing your message...'
      )}
    </div>
  )
}
