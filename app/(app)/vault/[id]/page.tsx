'use client'

import { useUser, UserButton, SignOutButton } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'

type Entry = {
  id: string
  title: string
  format: string
  message_content: string | null
  media_url: string | null
  status: string
  created_at: string
  delivery_trigger: string
  inactivity_days: number
}

export default function EntryDetailPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const entryId = params.id as string

  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in')
  }, [isLoaded, user, router])

  const fetchData = useCallback(async () => {
    if (!user || !entryId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/vault/entries/${entryId}`, {
        method: 'GET',
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load entry')
      }

      setEntry(data.entry || null)
    } catch (err) {
      console.error('Error fetching entry:', err)
      setEntry(null)
    } finally {
      setLoading(false)
    }
  }, [user, entryId])

  useEffect(() => {
    if (isLoaded && user) fetchData()
  }, [isLoaded, user, fetchData])

  if (!isLoaded || !user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F3EF' }}>
      <aside
        style={{
          width: '64px',
          background: '#1F2E23',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 0',
          gap: '6px',
          borderRight: '1px solid rgba(184,155,94,0.1)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '10px',
            fontWeight: 600,
            color: '#B89B5E',
            letterSpacing: '.05em',
            textAlign: 'center',
            lineHeight: 1.2,
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(184,155,94,0.12)',
            marginBottom: '8px',
            width: '100%',
          }}
        >
          LV
        </div>

        <a href="/dashboard" style={{ color: 'rgba(245,243,239,0.35)', textDecoration: 'none', fontSize: '16px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⊞</a>
        <a href="/vault" style={{ color: '#B89B5E', textDecoration: 'none', fontSize: '16px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔒</a>
        <a href="/new-entry" style={{ color: 'rgba(245,243,239,0.35)', textDecoration: 'none', fontSize: '16px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</a>

        <div style={{ marginTop: 'auto', paddingBottom: '8px' }}>
          <UserButton />
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            padding: '28px 28px 24px',
            background: '#F5F3EF',
            borderBottom: '1px solid rgba(31,46,35,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="/vault" style={{ fontSize: '12px', color: 'rgba(31,46,35,0.4)', textDecoration: 'none', letterSpacing: '.08em' }}>← My Vault</a>
            <div style={{ width: '1px', height: '14px', background: 'rgba(31,46,35,0.15)' }} />
            <div style={{ fontSize: '9px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#B89B5E' }}>
              {entry ? entry.format : '...'} Entry
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(31,46,35,0.35)', padding: '60px' }}>
            Loading entry...
          </div>
        ) : entry ? (
          <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 28px 48px' }}>
            <div style={{ background: '#fff', border: '1px solid rgba(31,46,35,0.06)', borderRadius: '14px', padding: '32px', boxShadow: '0 18px 38px rgba(31,46,35,0.05)' }}>
              <div style={{ fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.35)', marginBottom: '12px' }}>
                Legacy Entry
              </div>

              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 300, color: '#1F2E23', margin: '0 0 8px' }}>
                {entry.title}
              </h1>

              <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.45)', marginBottom: '8px' }}>
                {new Date(entry.created_at).toLocaleDateString()} • {entry.format}
              </div>

              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '18px',
                fontStyle: 'italic',
                color: 'rgba(31,46,35,0.58)',
                marginBottom: '12px',
                lineHeight: 1.5
              }}>
                One day, this will not feel like a file. It will feel like a moment.
              </div>

              <div style={{
                fontSize: '11px',
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: '#B89B5E',
                marginBottom: '24px'
              }}>
                {entry.delivery_trigger === 'milestone'
                  ? 'Milestone delivery'
                  : entry.delivery_trigger === 'inactivity'
                  ? `Delivered after ${entry.inactivity_days || 30} days inactivity`
                  : 'Saved in vault'}
              </div>

              <div style={{
                fontSize: '11px',
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: 'rgba(31,46,35,0.35)',
                marginBottom: '14px'
              }}>
                What they will receive
              </div>

              {entry.format === 'text' && (
                <div style={{ background: '#F8F6F1', border: '1px solid rgba(31,46,35,0.06)', borderRadius: '12px', padding: '28px' }}>
                  <div style={{ fontSize: '16px', lineHeight: 1.9, fontFamily: 'Cormorant Garamond, serif', color: '#1F2E23', whiteSpace: 'pre-wrap' }}>
                    {entry.message_content || 'No content'}
                  </div>
                </div>
              )}

              {(entry.format === 'audio' || entry.format === 'video') && (
                <div style={{ background: '#F8F6F1', border: '1px solid rgba(31,46,35,0.06)', borderRadius: '12px', padding: '28px' }}>
                  {entry.media_url ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                        <div style={{ fontSize: '24px' }}>{entry.format === 'video' ? '🎥' : '🎙️'}</div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 500, color: '#1F2E23', fontFamily: 'Cormorant Garamond, serif' }}>
                            {entry.format === 'video' ? 'Video message' : 'Audio message'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'rgba(31,46,35,0.4)', marginTop: '4px' }}>
                            {entry.media_url.split('/').pop()}
                          </div>
                        </div>
                      </div>

                      {entry.format === 'audio' ? (
                        <audio
                          controls
                          style={{ width: '100%', marginTop: '6px' }}
                          src={`/api/vault/media?path=${encodeURIComponent(entry.media_url)}`}
                        />
                      ) : (
                        <video
                          controls
                          style={{ width: '100%', borderRadius: '10px', background: '#000', marginTop: '6px' }}
                          src={`/api/vault/media?path=${encodeURIComponent(entry.media_url)}`}
                        />
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.4)', fontStyle: 'italic' }}>
                      No media available
                    </div>
                  )}
                </div>
              )}
              <div style={{
                marginTop: '22px',
                fontSize: '12px',
                color: 'rgba(31,46,35,0.38)',
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                lineHeight: 1.6
              }}>
                Preserved inside your vault until the moment it is needed.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(31,46,35,0.35)', padding: '60px' }}>
            Entry not found.
          </div>
        )}
      </main>
    </div>
  )
}
