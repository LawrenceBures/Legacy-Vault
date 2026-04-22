'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PostAuthPage() {
  const router = useRouter()

  useEffect(() => {
    const raw = localStorage.getItem('vaultData')
    if (!raw) {
      router.replace('/')
      return
    }
    const data = JSON.parse(raw)
    console.log('vaultData:', data)
    router.replace('/done')
  }, [router])

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
    }}>
      Securing your message...
    </div>
  )
}
