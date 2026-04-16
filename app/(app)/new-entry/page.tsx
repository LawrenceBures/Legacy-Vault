'use client'

import { useUser, UserButton, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase-auth'
import { AIWritingAssistant } from '@/lib/AIWritingAssistant'

type EntryType = 'video' | 'audio' | 'text' | null
type Step = 1 | 2 | 3 | 4

export default function NewEntryPage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<number | null>(null)
  const [step, setStep] = useState<Step>(1)
  const [entryType, setEntryType] = useState<EntryType>(null)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [recording, setRecording] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const [hoveredType, setHoveredType] = useState<string | null>(null)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in')
  }, [isLoaded, user, router])

  const getSupabase = useCallback(async () => {
    const token = await getToken({ template: 'supabase' })
    return createSupabaseClient(token!)
  }, [getToken])

  const ensureProfile = useCallback(async () => {
    if (!user) return
    const supabase = await getSupabase()
    const { data } = await supabase.from('profiles').select('id').eq('clerk_id', user.id).single()
    if (!data) {
      await supabase.from('profiles').insert({
        id: crypto.randomUUID(),
        clerk_id: user.id,
        email: user.emailAddresses[0].emailAddress,
        full_name: user.fullName || user.firstName || '',
        plan: 'pro',
      })
    }
  }, [user, getSupabase])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaveError('')
    try {
      const supabase = await getSupabase()
      // Upsert profile and get id
      const profileId = crypto.randomUUID()
      const upsertResult = await supabase.from('profiles').upsert({
        id: profileId,
        clerk_id: user.id,
        email: user.emailAddresses[0].emailAddress,
        full_name: user.fullName || user.firstName || '',
        plan: 'pro',
      }, { onConflict: 'clerk_id' })
      console.log('upsert result:', JSON.stringify(upsertResult))

      const profileResult = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user.id)
        .single()
      console.log('profile result:', JSON.stringify(profileResult))
      const profile = profileResult.data

      if (!profile) throw new Error('Profile not found')

      let mediaUrl = null

      // Upload file if present
      if (uploadedFile && (entryType === 'video' || entryType === 'audio')) {
        const ext = uploadedFile.name.split('.').pop()
        const filePath = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('vault-media')
          .upload(filePath, uploadedFile)
        if (uploadError) throw uploadError
        mediaUrl = filePath
      }

      // Save entry
      const { error } = await supabase.from('vault_entries').insert({
        user_id: profile.id,
        title: title.trim(),
        message_content: entryType === 'text' ? message.trim() : message.trim() || null,
        format: entryType,
        media_url: mediaUrl,
        status: 'active',
        delivery_trigger: 'inactivity',
        inactivity_days: 60,
      })

      if (error) throw error
      router.push('/vault')
    } catch (err: any) {
      console.error('Save error:', err)
      setSaveError('Something went wrong saving your entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded || !user) return null

  const navItems = [
    { icon: '⊞', label: 'Dashboard', href: '/dashboard' },
    { icon: '🔒', label: 'My Vault', href: '/vault' },
    { icon: '+', label: 'New Entry', href: '/new-entry', active: true },
    { icon: '👥', label: 'My People', href: '/my-people' },
    { icon: '⏱', label: 'Delivery', href: '/delivery' },
  ]

  const entryTypes = [
    { id: 'video', icon: '🎥', label: 'Video Message', desc: 'Record or upload a personal video for your loved ones.' },
    { id: 'audio', icon: '🎙️', label: 'Audio Message', desc: 'Record your voice or upload an audio file.' },
    { id: 'text', icon: '✍️', label: 'Written Letter', desc: 'Write a letter, note, or document to be delivered.' },
  ]

  const steps = [
    { num: 1, label: 'Choose Type' },
    { num: 2, label: 'Details' },
    { num: 3, label: 'Content' },
    { num: 4, label: 'Review' },
  ]

  const canProceed = () => {
    if (step === 1) return entryType !== null
    if (step === 2) return title.trim().length > 0
    if (step === 3) {
      if (entryType === 'text') return message.trim().length > 0
      return uploadedFile !== null || recorded
    }
    return true
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid rgba(31,46,35,0.15)',
    borderRadius: '4px',
    background: '#fff',
    fontSize: '14px',
    color: '#1F2E23',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.18s ease',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F3EF' }}>

      {/* SIDEBAR */}
      <aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        style={{
          width: sidebarOpen ? '200px' : '64px',
          background: '#1F2E23', display: 'flex', flexDirection: 'column',
          alignItems: sidebarOpen ? 'flex-start' : 'center',
          padding: '20px 0', gap: '6px',
          borderRight: '1px solid rgba(184,155,94,0.1)',
          flexShrink: 0, transition: 'width 0.25s ease',
          overflow: 'hidden', position: 'relative', zIndex: 10,
        }}
      >
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: sidebarOpen ? '13px' : '10px', fontWeight: 600, color: '#B89B5E',
          letterSpacing: '.05em', textAlign: sidebarOpen ? 'left' : 'center',
          lineHeight: 1.2, paddingBottom: '16px',
          borderBottom: '1px solid rgba(184,155,94,0.12)', marginBottom: '8px',
          width: '100%', paddingLeft: sidebarOpen ? '20px' : '0',
          paddingRight: sidebarOpen ? '20px' : '0',
          transition: 'all 0.25s ease', whiteSpace: 'nowrap',
        }}>
          {sidebarOpen ? 'Legacy Vault' : 'L\nV'}
        </div>

        {navItems.map((item, i) => (
          <a key={item.href} href={item.href}
            onMouseEnter={() => setHoveredNav(i)}
            onMouseLeave={() => setHoveredNav(null)}
            style={{
              width: sidebarOpen ? 'calc(100% - 16px)' : '40px', height: '40px',
              display: 'flex', alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '10px', borderRadius: '8px',
              color: item.active ? '#B89B5E' : hoveredNav === i ? '#F5F3EF' : 'rgba(245,243,239,0.35)',
              background: item.active ? 'rgba(184,155,94,0.15)' : hoveredNav === i ? 'rgba(245,243,239,0.06)' : 'transparent',
              cursor: 'pointer', fontSize: '16px', textDecoration: 'none',
              transition: 'all .2s', paddingLeft: sidebarOpen ? '12px' : '0',
              marginLeft: sidebarOpen ? '8px' : '0', flexShrink: 0,
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            {sidebarOpen && <span style={{ fontSize: '12px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '.04em' }}>{item.label}</span>}
          </a>
        ))}

        <div style={{
          marginTop: 'auto', paddingBottom: '8px',
          paddingLeft: sidebarOpen ? '20px' : '0', width: '100%',
          display: 'flex', justifyContent: sidebarOpen ? 'flex-start' : 'center',
          transition: 'all 0.25s ease',
        }}>
          <UserButton  />
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* HEADER */}
        <div style={{ padding: '28px 28px 24px', background: '#F5F3EF', borderBottom: '1px solid rgba(31,46,35,0.08)' }}>
          <div style={{ fontSize: '9px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#B89B5E', marginBottom: '8px' }}>New Entry</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 300, color: '#1F2E23', lineHeight: 1.1, marginBottom: '6px' }}>
            Create a <em style={{ color: '#B89B5E', fontStyle: 'italic' }}>Legacy Entry.</em>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.45)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
            Your words, preserved for the people who matter most.
          </div>
        </div>

        {/* STEP INDICATOR */}
        <div style={{ padding: '20px 28px', background: '#fff', borderBottom: '1px solid rgba(31,46,35,0.08)', display: 'flex', gap: '0', alignItems: 'center' }}>
          {steps.map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: step === s.num ? '#1F2E23' : step > s.num ? '#B89B5E' : 'rgba(31,46,35,0.08)',
                  color: step === s.num ? '#B89B5E' : step > s.num ? '#1F2E23' : 'rgba(31,46,35,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 600, flexShrink: 0, transition: 'all 0.22s ease',
                }}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <span style={{
                  fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase',
                  color: step === s.num ? '#1F2E23' : step > s.num ? '#B89B5E' : 'rgba(31,46,35,0.3)',
                  fontWeight: step === s.num ? 600 : 400, transition: 'all 0.22s ease',
                }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: '1px', background: step > s.num ? '#B89B5E' : 'rgba(31,46,35,0.1)', margin: '0 12px', transition: 'background 0.22s ease' }} />
              )}
            </div>
          ))}
        </div>

        {/* STEP CONTENT */}
        <div style={{ flex: 1, padding: '40px 28px', maxWidth: '680px', width: '100%', margin: '0 auto' }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 300, color: '#1F2E23', marginBottom: '6px' }}>
                What type of entry are you creating?
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.4)', marginBottom: '28px' }}>
                Choose the format that best captures what you want to leave behind.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {entryTypes.map((type) => (
                  <div key={type.id} onClick={() => setEntryType(type.id as EntryType)}
                    onMouseEnter={() => setHoveredType(type.id)} onMouseLeave={() => setHoveredType(null)}
                    style={{
                      padding: '20px 24px',
                      border: `1px solid ${entryType === type.id ? '#B89B5E' : hoveredType === type.id ? 'rgba(184,155,94,0.4)' : 'rgba(31,46,35,0.12)'}`,
                      borderRadius: '6px', background: entryType === type.id ? 'rgba(184,155,94,0.06)' : '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '18px', transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '28px', flexShrink: 0 }}>{type.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#1F2E23', marginBottom: '3px' }}>{type.label}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.45)' }}>{type.desc}</div>
                    </div>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      border: `2px solid ${entryType === type.id ? '#B89B5E' : 'rgba(31,46,35,0.2)'}`,
                      background: entryType === type.id ? '#B89B5E' : 'transparent',
                      flexShrink: 0, transition: 'all 0.18s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {entryType === type.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 300, color: '#1F2E23', marginBottom: '6px' }}>Name your entry.</div>
              <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.4)', marginBottom: '28px' }}>Give this entry a title so you and your recipients can identify it.</div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.5)', display: 'block', marginBottom: '8px' }}>Entry Title *</label>
                <input type="text"
                  placeholder={entryType === 'video' ? 'e.g. A message for my daughter' : entryType === 'audio' ? 'e.g. Words from Dad' : 'e.g. Letter to my family'}
                  value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.5)', display: 'block', marginBottom: '8px' }}>
                  Description <span style={{ color: 'rgba(31,46,35,0.3)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <textarea placeholder="Add a brief note about this entry..." value={message}
                  onChange={e => setMessage(e.target.value)} rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 300, color: '#1F2E23', marginBottom: '6px' }}>
                {entryType === 'text' ? 'Write your message.' : entryType === 'video' ? 'Add your video.' : 'Add your audio.'}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.4)', marginBottom: '28px' }}>
                {entryType === 'text' ? 'Write what you want your loved ones to receive.' : 'Upload a file or record directly in your browser.'}
              </div>

              {entryType === 'text' && (
                <div>
                  <AIWritingAssistant
                    onUseMessage={(text) => setMessage(text)}
                    recipientName={undefined}
                    entryTitle={title}
                  />
                  <textarea placeholder="Dear..."  value={message} onChange={e => setMessage(e.target.value)} rows={12}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '280px', fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', lineHeight: 1.8 }} />
                </div>
              )}

              {(entryType === 'video' || entryType === 'audio') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Upload */}
                  <div onClick={() => fileInputRef.current?.click()}
                    onMouseEnter={() => setHoveredBtn('upload')} onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      border: `2px dashed ${uploadedFile ? '#B89B5E' : hoveredBtn === 'upload' ? 'rgba(184,155,94,0.5)' : 'rgba(31,46,35,0.15)'}`,
                      borderRadius: '6px', padding: '32px', textAlign: 'center', cursor: 'pointer',
                      background: uploadedFile ? 'rgba(184,155,94,0.04)' : '#fff', transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>{uploadedFile ? '✅' : '📁'}</div>
                    <div style={{ fontSize: '13px', color: '#1F2E23', fontWeight: 500, marginBottom: '4px' }}>
                      {uploadedFile ? uploadedFile.name : `Upload a ${entryType} file`}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(31,46,35,0.4)' }}>
                      {uploadedFile ? 'Click to replace' : `Click to browse · ${entryType === 'video' ? 'MP4, MOV, WebM' : 'MP3, WAV, M4A'}`}
                    </div>
                    <input ref={fileInputRef} type="file" accept={entryType === 'video' ? 'video/*' : 'audio/*'}
                      style={{ display: 'none' }}
                      onChange={e => { if (e.target.files?.[0]) { setUploadedFile(e.target.files[0]); setRecorded(false) } }} />
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(31,46,35,0.3)', letterSpacing: '.08em' }}>— OR —</div>

                  {/* Record — fixed re-record */}
                  <div
                    onClick={() => {
                      if (recorded) {
                        // Re-record: reset state
                        setRecorded(false)
                        setRecording(false)
                        setUploadedFile(null)
                      } else if (recording) {
                        // Stop recording
                        setRecording(false)
                        setRecorded(true)
                      } else {
                        // Start recording
                        setRecording(true)
                        setUploadedFile(null)
                      }
                    }}
                    onMouseEnter={() => setHoveredBtn('record')} onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      border: `1px solid ${recorded ? '#B89B5E' : recording ? '#e74c3c' : hoveredBtn === 'record' ? 'rgba(184,155,94,0.4)' : 'rgba(31,46,35,0.12)'}`,
                      borderRadius: '6px', padding: '24px', textAlign: 'center', cursor: 'pointer',
                      background: recorded ? 'rgba(184,155,94,0.04)' : recording ? 'rgba(231,76,60,0.04)' : '#fff',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>
                      {recorded ? '✅' : recording ? '⏹️' : '🎙️'}
                    </div>
                    <div style={{ fontSize: '13px', color: recording ? '#e74c3c' : '#1F2E23', fontWeight: 500, marginBottom: '4px' }}>
                      {recorded ? 'Recording saved' : recording ? 'Recording... Click to stop' : `Record ${entryType} now`}
                    </div>
                    <div style={{ fontSize: '11px', color: recorded ? '#B89B5E' : 'rgba(31,46,35,0.4)' }}>
                      {recorded ? 'Click to re-record' : recording ? 'Click when finished' : 'Uses your browser microphone' + (entryType === 'video' ? ' & camera' : '')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 300, color: '#1F2E23', marginBottom: '6px' }}>
                Review your entry.
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.4)', marginBottom: '28px' }}>
                Everything look right? Save it to your vault.
              </div>

              <div style={{ background: '#fff', border: '1px solid rgba(31,46,35,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                {[
                  { label: 'Type', value: entryTypes.find(t => t.id === entryType)?.label },
                  { label: 'Title', value: title },
                  { label: 'Content', value: entryType === 'text' ? (message.length > 80 ? message.slice(0, 80) + '...' : message) : uploadedFile ? uploadedFile.name : recorded ? 'Browser recording' : '—' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', padding: '14px 20px', borderBottom: i < 2 ? '1px solid rgba(31,46,35,0.07)' : 'none' }}>
                    <div style={{ width: '100px', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.4)', flexShrink: 0, paddingTop: '1px' }}>{row.label}</div>
                    <div style={{ fontSize: '13px', color: '#1F2E23' }}>{row.value}</div>
                  </div>
                ))}
              </div>

              {saveError && (
                <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '4px', fontSize: '12px', color: '#e74c3c' }}>
                  {saveError}
                </div>
              )}

              <div style={{ marginTop: '16px', padding: '14px 20px', background: 'rgba(184,155,94,0.06)', border: '1px solid rgba(184,155,94,0.2)', borderRadius: '6px', fontSize: '12px', color: 'rgba(31,46,35,0.6)', lineHeight: 1.6 }}>
                📌 Recipients and delivery timing can be assigned from your vault after saving.
              </div>
            </div>
          )}

          {/* NAV BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(31,46,35,0.08)' }}>
            {step > 1 ? (
              <button onClick={() => setStep((step - 1) as Step)}
                onMouseEnter={() => setHoveredBtn('back')} onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  padding: '11px 24px', border: '1px solid rgba(31,46,35,0.2)', borderRadius: '4px',
                  background: hoveredBtn === 'back' ? 'rgba(31,46,35,0.05)' : 'transparent',
                  color: 'rgba(31,46,35,0.6)', fontSize: '11px', letterSpacing: '.1em',
                  textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.18s ease',
                }}
              >
                ← Back
              </button>
            ) : (
              <a href="/vault" style={{ padding: '11px 24px', border: '1px solid rgba(31,46,35,0.2)', borderRadius: '4px', background: 'transparent', color: 'rgba(31,46,35,0.6)', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none' }}>
                Cancel
              </a>
            )}

            <button
              onClick={() => { if (step < 4) setStep((step + 1) as Step); else handleSave() }}
              disabled={!canProceed() || saving}
              onMouseEnter={() => setHoveredBtn('next')} onMouseLeave={() => setHoveredBtn(null)}
              style={{
                padding: '11px 32px', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '4px',
                background: !canProceed() || saving ? 'rgba(31,46,35,0.08)' : hoveredBtn === 'next' ? '#B89B5E' : '#1F2E23',
                color: !canProceed() || saving ? 'rgba(31,46,35,0.3)' : hoveredBtn === 'next' ? '#1F2E23' : '#B89B5E',
                fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase',
                cursor: canProceed() && !saving ? 'pointer' : 'not-allowed',
                transition: 'all 0.18s ease', fontWeight: 500,
              }}
            >
              {step === 4 ? (saving ? 'Saving...' : 'Save to Vault →') : 'Continue →'}
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
