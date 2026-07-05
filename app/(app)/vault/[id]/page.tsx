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

type Recipient = {
  id: string
  name: string
  email: string
  relationship: string
}

export default function EntryDetailPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const entryId = params.id as string

  const [entry, setEntry] = useState<Entry | null>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [assignedIds, setAssignedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)

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
      setRecipients(data.recipients || [])
      setAssignedIds(data.assignedRecipients || [])
      if (data.entry) {
        setEditTitle(data.entry.title)
        setEditContent(data.entry.message_content || '')
      }
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

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/vault/entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, message_content: editContent }),
      })
      if (res.ok) {
        setEntry(prev => prev ? { ...prev, title: editTitle, message_content: editContent } : null)
        setEditing(false)
      }
    } catch (err) {
      console.error('Error saving edit:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/vault/entries/${entryId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/vault')
      }
    } catch (err) {
      console.error('Error deleting entry:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleRecipient = async (recipientId: string) => {
    const newAssigned = assignedIds.includes(recipientId)
      ? assignedIds.filter(id => id !== recipientId)
      : [...assignedIds, recipientId]

    setAssignedIds(newAssigned)
    try {
      await fetch(`/api/vault/entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignRecipientIds: newAssigned }),
      })
    } catch (err) {
      console.error('Error updating recipients:', err)
      setAssignedIds(assignedIds) // revert
    }
  }

  if (!isLoaded || !user) return null

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
  }

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

        <a href="/dashboard" style={{ color: 'rgba(245,243,239,0.35)', textDecoration: 'none', fontSize: '16px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#x229E;</a>
        <a href="/vault" style={{ color: '#B89B5E', textDecoration: 'none', fontSize: '16px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#x1F512;</a>
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
            <a href="/vault" style={{ fontSize: '12px', color: 'rgba(31,46,35,0.4)', textDecoration: 'none', letterSpacing: '.08em' }}>&#8592; My Vault</a>
            <div style={{ width: '1px', height: '14px', background: 'rgba(31,46,35,0.15)' }} />
            <div style={{ fontSize: '9px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#B89B5E' }}>
              {entry ? entry.format : '...'} Entry
            </div>
          </div>
          {entry && !editing && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setEditing(true)}
                onMouseEnter={() => setHoveredBtn('edit')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid rgba(184,155,94,0.3)',
                  borderRadius: '4px',
                  background: hoveredBtn === 'edit' ? '#B89B5E' : '#1F2E23',
                  color: hoveredBtn === 'edit' ? '#1F2E23' : '#B89B5E',
                  fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.18s ease', fontWeight: 500,
                }}
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                onMouseEnter={() => setHoveredBtn('delete')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid rgba(231,76,60,0.3)',
                  borderRadius: '4px',
                  background: hoveredBtn === 'delete' ? 'rgba(231,76,60,0.1)' : 'transparent',
                  color: 'rgba(231,76,60,0.7)',
                  fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.18s ease', fontWeight: 500,
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div style={{
            padding: '16px 28px',
            background: 'rgba(231,76,60,0.04)',
            borderBottom: '1px solid rgba(231,76,60,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          }}>
            <div style={{ fontSize: '13px', color: '#e74c3c' }}>
              Are you sure you want to permanently delete this entry?
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => setShowDeleteConfirm(false)}
                style={{ padding: '6px 14px', border: '1px solid rgba(31,46,35,0.15)', borderRadius: '4px', background: 'transparent', color: 'rgba(31,46,35,0.5)', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ padding: '6px 14px', border: '1px solid rgba(231,76,60,0.4)', borderRadius: '4px', background: 'rgba(231,76,60,0.9)', color: '#fff', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', cursor: deleting ? 'not-allowed' : 'pointer' }}>
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        )}

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

              {editing ? (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '6px' }}>Title</label>
                  <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ ...inputStyle, marginBottom: '14px' }} />

                  {entry.format === 'text' && (
                    <>
                      <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '6px' }}>Message</label>
                      <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={6}
                        style={{ ...inputStyle, resize: 'vertical', minHeight: '120px', fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', lineHeight: 1.8 }} />
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px', justifyContent: 'flex-end' }}>
                    <button onClick={() => { setEditing(false); setEditTitle(entry.title); setEditContent(entry.message_content || '') }}
                      style={{ padding: '8px 16px', border: '1px solid rgba(31,46,35,0.15)', borderRadius: '4px', background: 'transparent', color: 'rgba(31,46,35,0.5)', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button onClick={handleSaveEdit} disabled={saving}
                      onMouseEnter={() => setHoveredBtn('save')}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={{
                        padding: '8px 20px', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '4px',
                        background: hoveredBtn === 'save' ? '#B89B5E' : '#1F2E23',
                        color: hoveredBtn === 'save' ? '#1F2E23' : '#B89B5E',
                        fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase',
                        cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.18s ease', fontWeight: 500,
                      }}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 300, color: '#1F2E23', margin: '0 0 8px' }}>
                    {entry.title}
                  </h1>

                  <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.45)', marginBottom: '8px' }}>
                    {new Date(entry.created_at).toLocaleDateString()} &bull; {entry.format}
                  </div>

                  <div style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '18px', fontStyle: 'italic',
                    color: 'rgba(31,46,35,0.58)',
                    marginBottom: '12px', lineHeight: 1.5
                  }}>
                    One day, this will not feel like a file. It will feel like a moment.
                  </div>

                  <div style={{
                    fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase',
                    color: '#B89B5E', marginBottom: '24px'
                  }}>
                    {entry.delivery_trigger === 'milestone'
                      ? 'Milestone delivery'
                      : entry.delivery_trigger === 'inactivity'
                      ? `Delivered after ${entry.inactivity_days || 30} days inactivity`
                      : 'Saved in vault'}
                  </div>

                  <div style={{
                    fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase',
                    color: 'rgba(31,46,35,0.35)', marginBottom: '14px'
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
                            <div style={{ fontSize: '24px' }}>{entry.format === 'video' ? '\uD83C\uDFA5' : '\uD83C\uDF99\uFE0F'}</div>
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
                </>
              )}

              {/* RECIPIENT ASSIGNMENT */}
              <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid rgba(31,46,35,0.08)' }}>
                <div style={{
                  fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase',
                  color: 'rgba(31,46,35,0.35)', marginBottom: '14px'
                }}>
                  Recipients
                </div>

                {recipients.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recipients.map(r => {
                      const isAssigned = assignedIds.includes(r.id)
                      return (
                        <div key={r.id}
                          onClick={() => handleToggleRecipient(r.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '10px 14px',
                            border: `1px solid ${isAssigned ? 'rgba(184,155,94,0.4)' : 'rgba(31,46,35,0.1)'}`,
                            borderRadius: '6px',
                            background: isAssigned ? 'rgba(184,155,94,0.04)' : '#fff',
                            cursor: 'pointer', transition: 'all 0.18s ease',
                          }}
                        >
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '4px',
                            border: `2px solid ${isAssigned ? '#B89B5E' : 'rgba(31,46,35,0.2)'}`,
                            background: isAssigned ? '#B89B5E' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', color: '#fff', flexShrink: 0, transition: 'all 0.18s ease',
                          }}>
                            {isAssigned && '\u2713'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 500, color: '#1F2E23' }}>{r.name}</div>
                            <div style={{ fontSize: '11px', color: 'rgba(31,46,35,0.4)' }}>{r.email} &bull; {r.relationship}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.4)', fontStyle: 'italic' }}>
                    No recipients added yet. <a href="/my-people" style={{ color: '#B89B5E', textDecoration: 'none' }}>Add recipients</a> to assign them to this entry.
                  </div>
                )}
              </div>

              <div style={{
                marginTop: '22px', fontSize: '12px',
                color: 'rgba(31,46,35,0.38)',
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic', lineHeight: 1.6
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
