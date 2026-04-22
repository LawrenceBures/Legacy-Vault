'use client'

import { useUser, UserButton, useAuth, SignOutButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase-auth'
import { AIWritingAssistant } from '@/lib/AIWritingAssistant'
import MessageWritingPanel from '@/components/MessageWritingPanel'
import { VaultMediaRecorder } from '@/lib/MediaRecorder'
import { VideoAssist } from '@/lib/VideoAssist'
import { canUseVideo, canUseAudio, canUseAI, getUpgradeMessage } from '@/lib/featureGating'

type EntryFormat = 'video' | 'audio' | 'text' | null
type Step = 1 | 2 | 3 | 4

export default function NewEntryPage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (user) {
      fetch(`/api/dashboard?clerk_id=${user.id}&email=${user.emailAddresses[0].emailAddress}&full_name=${user.fullName || ''}`)
        .then(r => r.json())
        .then(d => setUserPlan(d.plan || ''))
        .catch(console.error)
    }
  }, [user])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<number | null>(null)
  const [step, setStep] = useState<Step>(1)
  const [entryFormat, setEntryFormat] = useState<EntryFormat>(null)
  const [title, setName] = useState('')
  const [message, setMessage] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [recording, setRecording] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const [hoveredFormat, setHoveredFormat] = useState<string | null>(null)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [showRecorder, setShowRecorder] = useState(false)
  const [showVideoAssist, setShowVideoAssist] = useState(false)
  const [userPlan, setUserPlan] = useState('')
  const [saveError, setSaveError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in')
  }, [isLoaded, user, router])

  const getSupabase = useCallback(async () => {
    const token = await getToken({ template: 'supabase' })
    return createSupabaseClient(token!)
  }, [getToken])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaveError('')

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('message', message)
      formData.append('entryFormat', entryFormat || 'text')
      formData.append('email', user.emailAddresses[0].emailAddress)
      formData.append('full_name', user.fullName || user.firstName || '')

      if (entryFormat === 'video' || entryFormat === 'audio') {
        if (uploadedFile) {
          formData.append('file', uploadedFile)
        } else if (recordedBlob) {
          const ext = entryFormat === 'audio' ? 'webm' : 'webm'
          const mime = recordedBlob.type || (entryFormat === 'audio' ? 'audio/webm' : 'video/webm')
          const recordedFile = new File(
            [recordedBlob],
            `recording-${Date.now()}.${ext}`,
            { type: mime }
          )
          formData.append('file', recordedFile)
        }
      }

      const res = await fetch('/api/vault/save-entry', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      router.push('/vault')

    } catch (err) {
      console.error(err)
      setSaveError('Something went wrong saving your entry.')
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

  const entryFormats = [
    { id: 'video', icon: '🎥', label: 'Video Message', desc: 'Let them see you. Speak directly to the people who matter most.' },
    { id: 'audio', icon: '🎙️', label: 'Voice Recording', desc: 'Sometimes your voice says more than anything written ever could.' },
    { id: 'text', icon: '✍️', label: 'Written Letter', desc: 'Write something they can return to, again and again.' },
  ]

  const steps = [
    { num: 1, label: 'Format' },
    { num: 2, label: 'Name' },
    { num: 3, label: 'Message' },
    { num: 4, label: 'Review' },
  ]

  const canProceed = () => {
    if (step === 1) return entryFormat !== null
    if (step === 2) return title.trim().length > 0
    if (step === 3) {
      if (entryFormat === 'text') return message.trim().length > 0
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

      {/* SIDEBAR — desktop only */}
      <aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        style={{
          display: isMobile ? 'none' : 'flex',
          flexDirection: 'column',
          width: sidebarOpen ? '200px' : '64px',
          background: '#1F2E23',
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
          {sidebarOpen ? 'Legacy Vault' : 'LV'}
        </div>

        {navItems.map((item, i) => (
          <a key={item.href} href={item.href}
            onMouseEnter={() => setHoveredNav(i)}
            onMouseLeave={() => setHoveredNav(null)}
            style={{
              width: sidebarOpen ? 'calc(100% - 16px)' : '40px', height: '40px',
              display: 'flex', alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '10px', borderRadius: '12px',
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
          <UserButton />
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingBottom: isMobile ? '70px' : '0' }}>

        {/* HEADER */}
        <div style={{ padding: isMobile ? '20px 16px 16px' : '28px 28px 24px', background: '#F5F3EF', borderBottom: '1px solid rgba(31,46,35,0.08)' }}>
          <div style={{ fontSize: '9px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#B89B5E', marginBottom: '8px' }}>Create Message</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? '28px' : '36px', fontWeight: 300, color: '#1F2E23', lineHeight: 1.1, marginBottom: '6px' }}>
            What do you want to <em style={{ color: '#B89B5E', fontStyle: 'italic' }}>leave behind?</em>
          </div>
          {!isMobile && (
            <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.45)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
              Choose the format that feels most natural. You can refine the rest as you go.
            </div>
          )}

          
        </div>

        {/* STEP INDICATOR */}
        <div style={{
          padding: isMobile ? '12px 16px' : '20px 28px',
          background: '#fff', borderBottom: '1px solid rgba(31,46,35,0.08)',
          display: 'flex', gap: '0', alignItems: 'center',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {steps.map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px', flexShrink: 0 }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: step === s.num ? '#1F2E23' : step > s.num ? '#C2A468' : 'rgba(31,46,35,0.08)',
                  color: step === s.num ? '#C2A468' : step > s.num ? '#1F2E23' : 'rgba(31,46,35,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 600, flexShrink: 0, transition: 'all 0.22s ease',
                }}>
                  {step > s.num ? '✓' : s.num}
                </div>
                {!isMobile && (
                  <span style={{
                    fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase',
                    color: step === s.num ? '#1F2E23' : step > s.num ? '#B89B5E' : 'rgba(31,46,35,0.3)',
                    fontWeight: step === s.num ? 600 : 400, transition: 'all 0.22s ease',
                  }}>
                    {s.label}
                  </span>
                )}
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: '1px', background: step > s.num ? '#B89B5E' : 'rgba(31,46,35,0.1)', margin: '0 8px', transition: 'background 0.22s ease' }} />
              )}
            </div>
          ))}
        </div>

        {/* STEP CONTENT */}
        <div style={{ flex: 1, padding: isMobile ? '24px 16px' : '40px 28px', maxWidth: '680px', width: '100%', margin: '0 auto', boxSizing: 'border-box' as const }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? '20px' : '22px', fontWeight: 300, color: '#1F2E23', marginBottom: '6px' }}>
                What type of entry are you creating?
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.4)', marginBottom: '24px' }}>
                Choose the format that best captures what you want to leave behind.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {entryFormats.map((type) => (
                  <div key={type.id} onClick={() => setEntryFormat(type.id as EntryFormat)}
                    onMouseEnter={() => setHoveredFormat(type.id)} onMouseLeave={() => setHoveredFormat(null)}
                    style={{
                      padding: isMobile ? '16px' : '20px 24px',
                      border: `1px solid ${entryFormat === type.id ? '#B89B5E' : hoveredFormat === type.id ? 'rgba(184,155,94,0.4)' : 'rgba(31,46,35,0.12)'}`,
                      borderRadius: '6px', background: entryFormat === type.id ? 'rgba(184,155,94,0.06)' : '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '24px', flexShrink: 0 }}>{type.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#1F2E23', marginBottom: '2px' }}>{type.label}</div>
                      {!isMobile && <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.45)' }}>{type.desc}</div>}
                    </div>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      border: `2px solid ${entryFormat === type.id ? '#B89B5E' : 'rgba(31,46,35,0.2)'}`,
                      background: entryFormat === type.id ? '#B89B5E' : 'transparent',
                      flexShrink: 0, transition: 'all 0.18s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {entryFormat === type.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? '20px' : '22px', fontWeight: 300, color: '#1F2E23', marginBottom: '6px' }}>Name your entry.</div>
              <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.4)', marginBottom: '24px' }}>Give this entry a title so you and your recipients can identify it.</div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.5)', display: 'block', marginBottom: '8px' }}>Entry Name *</label>
                <input type="text"
                  placeholder={entryFormat === 'video' ? 'e.g. A message for my daughter' : entryFormat === 'audio' ? 'e.g. Words from Dad' : 'e.g. Letter to my family'}
                  value={title} onChange={e => setName(e.target.value)} style={inputStyle} />
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
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? '20px' : '22px', fontWeight: 300, color: '#1F2E23', marginBottom: '6px' }}>
                {entryFormat === 'text' ? 'Write what matters most.' : entryFormat === 'video' ? 'Record what they should see and hear.' : 'Record what they should hear.'}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.4)', marginBottom: '24px' }}>
                {entryFormat === 'text' ? 'Start simply. You can shape the message as it comes.' : 'Upload a file or record directly in your browser.'}
              </div>

              {entryFormat === 'text' && (
                <div style={{
                  background: '#F8F6F1',
                  borderRadius: '12px',
                  padding: isMobile ? '20px 16px' : '28px 28px',
                  border: '1px solid rgba(31,46,35,0.06)',
                }}>
                  <MessageWritingPanel
                    value={message}
                    onChange={setMessage}
                    maxLength={2000}
                  />
                  <div style={{ marginTop: '18px', borderTop: '1px solid rgba(184,155,94,0.10)', paddingTop: '18px' }}>
                    <AIWritingAssistant
                      onUseMessage={(text) => setMessage(text)}
                      recipientName={undefined}
                      entryTitle={title}
                    />
                  </div>
                </div>
              )}

              {(entryFormat === 'video' || entryFormat === 'audio') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div onClick={() => fileInputRef.current?.click()}
                    onMouseEnter={() => setHoveredBtn('upload')} onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      border: `2px dashed ${uploadedFile ? '#B89B5E' : hoveredBtn === 'upload' ? 'rgba(184,155,94,0.5)' : 'rgba(31,46,35,0.15)'}`,
                      borderRadius: '6px', padding: isMobile ? '24px 16px' : '32px', textAlign: 'center', cursor: 'pointer',
                      background: uploadedFile ? 'rgba(184,155,94,0.04)' : '#fff', transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>{uploadedFile ? '✅' : '📁'}</div>
                    <div style={{ fontSize: '13px', color: '#1F2E23', fontWeight: 500, marginBottom: '4px' }}>
                      {uploadedFile ? uploadedFile.name : `Upload a ${entryFormat} file`}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(31,46,35,0.4)' }}>
                      {uploadedFile ? 'Click to replace' : `${entryFormat === 'video' ? 'MP4, MOV, WebM' : 'MP3, WAV, M4A'}`}
                    </div>
                    <input ref={fileInputRef} type="file" accept={entryFormat === 'video' ? 'video/*' : 'audio/*'}
                      style={{ display: 'none' }}
                      onChange={e => { if (e.target.files?.[0]) { setUploadedFile(e.target.files[0]); setRecorded(false) } }} />
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(31,46,35,0.3)', letterSpacing: '.08em' }}>— OR —</div>

                  {entryFormat === 'video' && showVideoAssist && (
                    <VideoAssist
                      entryTitle={title}
                      recipientName={undefined}
                      onClose={() => setShowVideoAssist(false)}
                    />
                  )}

                  {!showRecorder && !recordedBlob && (
                    <div onClick={() => { setShowRecorder(true); setUploadedFile(null) }}
                      onMouseEnter={() => setHoveredBtn('record')} onMouseLeave={() => setHoveredBtn(null)}
                      style={{ border: `1px solid ${hoveredBtn === 'record' ? 'rgba(184,155,94,0.4)' : 'rgba(31,46,35,0.12)'}`, borderRadius: '6px', padding: '24px 16px', textAlign: 'center', cursor: 'pointer', background: '#fff', transition: 'all 0.2s ease' }}>
                      <div style={{ fontSize: '28px', marginBottom: '10px' }}>{entryFormat === 'video' ? '🎥' : '🎙️'}</div>
                      <div style={{ fontSize: '13px', color: '#1F2E23', fontWeight: 500, marginBottom: '4px' }}>Record {entryFormat} now</div>
                      {entryFormat === 'video' && !showVideoAssist && (
                        <div onClick={(e) => { e.stopPropagation(); setShowVideoAssist(true) }}
                          style={{ fontSize: '11px', color: '#B89B5E', marginTop: '6px', cursor: 'pointer', letterSpacing: '.06em' }}>
                          ✨ Give me something to say
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: 'rgba(31,46,35,0.4)', marginTop: '4px' }}>
                        Uses your {entryFormat === 'video' ? 'camera & microphone' : 'microphone'} · 15 sec limit pre-launch
                      </div>
                    </div>
                  )}

                  {showRecorder && !recordedBlob && entryFormat && (
                    <VaultMediaRecorder
                      type={entryFormat as 'video' | 'audio'}
                      onRecordingComplete={(blob, url) => { setRecordedBlob(blob); setRecordedUrl(url); setRecorded(true); setShowRecorder(false); setUploadedFile(null) }}
                      onCancel={() => setShowRecorder(false)}
                    />
                  )}

                  {recordedBlob && (
                    <div style={{ border: '1px solid rgba(184,155,94,0.4)', borderRadius: '6px', padding: '16px', background: 'rgba(184,155,94,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '24px' }}>✅</div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#1F2E23' }}>Recording saved</div>
                          <div style={{ fontSize: '11px', color: 'rgba(31,46,35,0.4)' }}>Will upload when you save</div>
                        </div>
                        <button onClick={() => { setRecordedBlob(null); setRecordedUrl(null); setRecorded(false) }}
                          style={{ marginLeft: 'auto', padding: '6px 12px', border: '1px solid rgba(31,46,35,0.15)', borderRadius: '4px', background: 'transparent', color: 'rgba(31,46,35,0.5)', fontSize: '10px', cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                          Re-record
                        </button>
                      </div>
                      {entryFormat === 'video' && recordedUrl && (
                        <video src={recordedUrl} controls style={{ width: '100%', borderRadius: '4px', maxHeight: '200px' }} />
                      )}
                      {entryFormat === 'audio' && recordedUrl && (
                        <audio src={recordedUrl} controls style={{ width: '100%' }} />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? '20px' : '22px', fontWeight: 300, color: '#1F2E23', marginBottom: '6px' }}>
                This is what they will receive.
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.4)', marginBottom: '24px' }}>
                Everything look right? Save it to your vault.
              </div>

              <div style={{ background: '#fff', border: '1px solid rgba(31,46,35,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                {[
                  { label: 'Format', value: entryFormats.find(t => t.id === entryFormat)?.label },
                  { label: 'Name', value: title },
                  { label: 'Message', value: entryFormat === 'text' ? (message.length > 80 ? message.slice(0, 80) + '...' : message) : uploadedFile ? uploadedFile.name : recorded ? 'Browser recording' : '—' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', padding: '14px 16px', borderBottom: i < 2 ? '1px solid rgba(31,46,35,0.07)' : 'none', gap: '12px' }}>
                    <div style={{ width: '70px', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.4)', flexShrink: 0, paddingTop: '1px' }}>{row.label}</div>
                    <div style={{ fontSize: '13px', color: '#1F2E23', flex: 1 }}>{row.value}</div>
                  </div>
                ))}
              </div>

              {saveError && (
                <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '4px', fontSize: '12px', color: '#e74c3c' }}>
                  {saveError}
                </div>
              )}

              <div style={{ marginTop: '16px', padding: '14px 16px', background: 'rgba(184,155,94,0.06)', border: '1px solid rgba(184,155,94,0.2)', borderRadius: '6px', fontSize: '12px', color: 'rgba(31,46,35,0.6)', lineHeight: 1.6 }}>
                📌 Recipients and delivery timing can be assigned from your vault after saving.
              </div>
            </div>
          )}

          {/* NAV BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(31,46,35,0.08)', gap: '12px' }}>
            {step > 1 ? (
              <button onClick={() => setStep((step - 1) as Step)}
                style={{
                  padding: '12px 20px', border: '1px solid rgba(31,46,35,0.2)', borderRadius: '4px',
                  background: 'transparent', color: 'rgba(31,46,35,0.6)',
                  fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.18s ease', flexShrink: 0,
                }}
              >
                ← Back
              </button>
            ) : (
              <a href="/vault" style={{ padding: '12px 20px', border: '1px solid rgba(31,46,35,0.2)', borderRadius: '4px', background: 'transparent', color: 'rgba(31,46,35,0.6)', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none', flexShrink: 0 }}>
                Cancel
              </a>
            )}

            <button
              onClick={() => { if (step < 4) setStep((step + 1) as Step); else handleSave() }}
              disabled={!canProceed() || saving}
              style={{
                padding: '12px 28px', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '4px',
                background: !canProceed() || saving ? 'rgba(31,46,35,0.08)' : '#1F2E23',
                color: !canProceed() || saving ? 'rgba(31,46,35,0.3)' : '#B89B5E',
                fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase',
                cursor: canProceed() && !saving ? 'pointer' : 'not-allowed',
                transition: 'all 0.18s ease', fontWeight: 500, flex: 1,
              }}
            >
              {step === 4 ? (saving ? 'Saving...' : 'Save to Vault →') : 'Continue →'}
            </button>
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
            { icon: '⊞', label: 'Dashboard', href: '/dashboard' },
            { icon: '🔒', label: 'Vault', href: '/vault' },
            { icon: '+', label: 'New', href: '/new-entry' },
            { icon: '👥', label: 'People', href: '/my-people' },
            { icon: '⏱', label: 'Delivery', href: '/delivery' },
          ].map(item => (
            <a key={item.href} href={item.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              textDecoration: 'none', flex: 1,
            }}>
              <div style={{ fontSize: item.icon === '+' ? '22px' : '16px', color: item.href === '/new-entry' ? '#B89B5E' : 'rgba(245,243,239,0.5)' }}>{item.icon}</div>
              <div style={{ fontSize: '9px', color: item.href === '/new-entry' ? '#B89B5E' : 'rgba(245,243,239,0.4)', letterSpacing: '.04em' }}>{item.label}</div>
            </a>
          ))}
        </div>
      )}

    </div>
  )
}
