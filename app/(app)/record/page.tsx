'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { VaultMediaRecorder } from '@/lib/MediaRecorder'
import { createSupabaseClient } from '@/lib/supabase-auth'

export default function RecordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = (searchParams.get('type') || 'video') as 'video' | 'audio'
  const entryId = searchParams.get('entry')
  const { getToken } = useAuth()
  const { user } = useUser()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

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
    <div style={{ minHeight: '100vh', background: '#F5F3EF', padding: '40px 20px' }}>
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
              💡 <strong>Tips:</strong> Find good lighting, speak clearly, and don't worry about being perfect. The people who receive this will treasure it exactly as it is.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
