'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth, useUser, UserButton } from '@clerk/nextjs'
import { VaultMediaRecorder } from '@/lib/MediaRecorder'
import { createSupabaseClient } from '@/lib/supabase-auth'

function RecordPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = (searchParams.get('type') || 'video') as 'video' | 'audio'
  const entryId = searchParams.get('entry')
  const { getToken } = useAuth()
  const { user } = useUser()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const navItems = [
    { icon: '\u229E', label: 'Dashboard', href: '/dashboard' },
    { icon: '\uD83D\uDD12', label: 'My Vault', href: '/vault' },
    { icon: '+', label: 'New Entry', href: '/new-entry' },
    { icon: '\uD83D\uDC65', label: 'My People', href: '/my-people' },
    { icon: '\u23F1', label: 'Delivery', href: '/delivery' },
  ]

  const handleRecordingComplete = async (blob: Blob, url: string) => {
    if (!entryId) { setSaved(true); return }
    setSaving(true)
    try {
      const token = await getToken({ template: 'supabase' })
      const supabase = createSupabaseClient(token!)
      const { data: profile } = await supabase.from('profiles').select('id').eq('clerk_id', user!.id).single()
      if (!profile) throw new Error('Profile not found')
      const ext = 'webm'
      const fileName = `${profile.id}/${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vault-media')
        .upload(fileName, blob, { contentType: blob.type, upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('vault-media').getPublicUrl(uploadData.path)
      await supabase.from('vault_entries').update({ media_url: urlData.publicUrl, format: type }).eq('id', entryId)
      setSaved(true)
    } catch (err) {
      console.error(err)
      setError('Failed to save recording. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F3EF' }}>
      {/* SIDEBAR — desktop */}
      <aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        style={{
          display: isMobile ? 'none' : 'flex',
          flexDirection: 'column',
          width: sidebarOpen ? '200px' : '64px',
          background: '#1F2E23',
          alignItems: sidebarOpen ? 'flex-start' : 'center',
          padding: '20px 0',
          gap: '6px',
          borderRight: '1px solid rgba(184,155,94,0.1)',
          flexShrink: 0,
          transition: 'width 0.25s ease',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: sidebarOpen ? '13px' : '10px',
          fontWeight: 600,
          color: '#B89B5E',
          letterSpacing: '.05em',
          textAlign: sidebarOpen ? 'left' : 'center',
          lineHeight: 1.2,
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(184,155,94,0.12)',
          marginBottom: '8px',
          width: '100%',
          paddingLeft: sidebarOpen ? '20px' : '0',
          paddingRight: sidebarOpen ? '20px' : '0',
          transition: 'all 0.25s ease',
          whiteSpace: 'nowrap',
        }}>
          {sidebarOpen ? 'Legacy Vault' : 'LV'}
        </div>

        {navItems.map((item, i) => (
          <a key={item.href} href={item.href}
            onMouseEnter={() => setHoveredNav(i)}
            onMouseLeave={() => setHoveredNav(null)}
            style={{
              width: sidebarOpen ? 'calc(100% - 16px)' : '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '10px',
              borderRadius: '8px',
              color: hoveredNav === i ? '#F5F3EF' : 'rgba(245,243,239,0.35)',
              background: hoveredNav === i ? 'rgba(245,243,239,0.06)' : 'transparent',
              cursor: 'pointer',
              fontSize: '16px',
              textDecoration: 'none',
              transition: 'all .2s',
              paddingLeft: sidebarOpen ? '12px' : '0',
              marginLeft: sidebarOpen ? '8px' : '0',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            {sidebarOpen && <span style={{ fontSize: '12px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '.04em' }}>{item.label}</span>}
          </a>
        ))}

        <div style={{
          marginTop: 'auto',
          paddingBottom: '8px',
          paddingLeft: sidebarOpen ? '20px' : '0',
          width: '100%',
          display: 'flex',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          transition: 'all 0.25s ease',
        }}>
          <UserButton />
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: isMobile ? '70px' : '0' }}>
        <div style={{ padding: isMobile ? '24px 16px' : '40px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#B89B5E', cursor: 'pointer', fontSize: '14px', letterSpacing: '.06em' }}>← Back</button>
              <div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 300, color: '#1F2E23' }}>
                  {type === 'video' ? 'Record a Video Message' : 'Record a Voice Message'}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.45)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
                  Take your time. You can re-record as many times as you need.
                </div>
              </div>
            </div>

            {saved ? (
              <div style={{ background: '#1F2E23', border: '1px solid rgba(184,155,94,0.2)', borderRadius: '10px', padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✅</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 300, color: '#F5F3EF', marginBottom: '.75rem' }}>Recording saved.</div>
                <div style={{ fontSize: '14px', color: 'rgba(245,243,239,0.45)', marginBottom: '2rem', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                  Your {type} message has been added to your vault entry.
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={() => router.push('/vault')} style={{ padding: '12px 28px', background: '#B89B5E', color: '#1F2E23', border: 'none', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700 }}>
                    Go to my vault
                  </button>
                  {entryId && (
                    <button onClick={() => router.push(`/vault/${entryId}`)} style={{ padding: '12px 28px', background: 'transparent', color: '#B89B5E', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                      View entry
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {saving && (
                  <div style={{ padding: '14px', background: 'rgba(184,155,94,0.08)', border: '1px solid rgba(184,155,94,0.2)', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#B89B5E', textAlign: 'center' }}>
                    Uploading your recording...
                  </div>
                )}
                {error && (
                  <div style={{ padding: '14px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#e74c3c', textAlign: 'center' }}>
                    {error}
                  </div>
                )}
                <VaultMediaRecorder
                  type={type}
                  onRecordingComplete={handleRecordingComplete}
                  onCancel={() => router.back()}
                />
                <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(31,46,35,0.04)', border: '1px solid rgba(31,46,35,0.08)', borderRadius: '6px', fontSize: '12px', color: 'rgba(31,46,35,0.45)', lineHeight: 1.6 }}>
                  Tips: Find good lighting, speak clearly, and don't worry about being perfect. The people who receive this will treasure it exactly as it is.
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: '#1F2E23', borderTop: '1px solid rgba(184,155,94,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          padding: '8px 0', height: '60px',
        }}>
          {[
            { icon: '\u229E', label: 'Dashboard', href: '/dashboard' },
            { icon: '\uD83D\uDD12', label: 'Vault', href: '/vault' },
            { icon: '+', label: 'New', href: '/new-entry' },
            { icon: '\uD83D\uDC65', label: 'People', href: '/my-people' },
            { icon: '\u23F1', label: 'Delivery', href: '/delivery' },
          ].map(item => (
            <a key={item.href} href={item.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              textDecoration: 'none', flex: 1,
            }}>
              <div style={{ fontSize: item.icon === '+' ? '22px' : '16px', color: 'rgba(245,243,239,0.5)' }}>{item.icon}</div>
              <div style={{ fontSize: '9px', color: 'rgba(245,243,239,0.4)', letterSpacing: '.04em' }}>{item.label}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RecordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F5F3EF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1F2E23' }}>Loading...</div>}>
      <RecordPageInner />
    </Suspense>
  )
}
