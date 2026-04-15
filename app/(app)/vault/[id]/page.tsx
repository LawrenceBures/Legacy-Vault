'use client'

import { useUser, UserButton, useAuth } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase-auth'

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
  const { getToken } = useAuth()
  const router = useRouter()
  const params = useParams()
  const entryId = params.id as string

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<number | null>(null)
  const [entry, setEntry] = useState<Entry | null>(null)
  const [allRecipients, setAllRecipients] = useState<Recipient[]>([])
  const [assignedRecipients, setAssignedRecipients] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in')
  }, [isLoaded, user, router])

  const getSupabase = useCallback(async () => {
    const token = await getToken({ template: 'supabase' })
    return createSupabaseClient(token!)
  }, [getToken])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const supabase = await getSupabase()

      // Get profile
      const { data: profile } = await supabase
        .from('profiles').select('id').eq('clerk_id', user.id).single()
      if (!profile) return
      setProfileId(profile.id)

      // Get entry
      const { data: entryData } = await supabase
        .from('vault_entries').select('*').eq('id', entryId).single()
      if (entryData) {
        setEntry(entryData)
        setEditTitle(entryData.title)
        setEditContent(entryData.message_content || '')
      }

      // Get all recipients
      const { data: recipientsData } = await supabase
        .from('recipients').select('*').eq('user_id', profile.id)
      setAllRecipients(recipientsData || [])

      // Get assigned recipients
      const { data: assigned } = await supabase
        .from('vault_entry_recipients')
        .select('recipient_id')
        .eq('vault_entry_id', entryId)
      setAssignedRecipients((assigned || []).map((a: any) => a.recipient_id))

    } catch (err) {
      console.error('Error fetching entry:', err)
    } finally {
      setLoading(false)
    }
  }, [user, entryId, getSupabase])

  useEffect(() => {
    if (isLoaded && user) fetchData()
  }, [isLoaded, user, fetchData])

  const handleSave = async () => {
    if (!entry) return
    setSaving(true)
    try {
      const supabase = await getSupabase()
      await supabase.from('vault_entries').update({
        title: editTitle,
        message_content: editContent || null,
        updated_at: new Date().toISOString(),
      }).eq('id', entryId)
      setEntry({ ...entry, title: editTitle, message_content: editContent })
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const toggleRecipient = async (recipientId: string) => {
    const supabase = await getSupabase()
    const isAssigned = assignedRecipients.includes(recipientId)
    if (isAssigned) {
      await supabase.from('vault_entry_recipients')
        .delete().eq('vault_entry_id', entryId).eq('recipient_id', recipientId)
      setAssignedRecipients(assignedRecipients.filter(id => id !== recipientId))
    } else {
      await supabase.from('vault_entry_recipients')
        .insert({ vault_entry_id: entryId, recipient_id: recipientId })
      setAssignedRecipients([...assignedRecipients, recipientId])
    }
  }

  const handleDelete = async () => {
    const supabase = await getSupabase()
    await supabase.from('vault_entries').delete().eq('id', entryId)
    router.push('/vault')
  }

  if (!isLoaded || !user) return null

  const navItems = [
    { icon: '⊞', label: 'Dashboard', href: '/dashboard' },
    { icon: '🔒', label: 'My Vault', href: '/vault', active: true },
    { icon: '+', label: 'New Entry', href: '/new-entry' },
    { icon: '👥', label: 'My People', href: '/my-people' },
    { icon: '⏱', label: 'Delivery', href: '/delivery' },
  ]

  const formatIcons: Record<string, string> = { video: '🎥', audio: '🎙️', text: '✍️', file: '📁' }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    border: '1px solid rgba(31,46,35,0.15)', borderRadius: '4px',
    background: '#fff', fontSize: '14px', color: '#1F2E23',
    fontFamily: 'DM Sans, sans-serif', outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const relationshipColors: Record<string, string> = {
    Spouse: '#B89B5E', Partner: '#B89B5E', Child: '#27ae60',
    Parent: '#2980b9', Sibling: '#2980b9', Friend: 'rgba(31,46,35,0.4)',
    Advisor: 'rgba(31,46,35,0.4)', Other: 'rgba(31,46,35,0.4)',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F3EF' }}>

      {/* SIDEBAR */}
      <aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        style={{
          width: sidebarOpen ? '200px' : '64px', background: '#1F2E23',
          display: 'flex', flexDirection: 'column',
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
            onMouseEnter={() => setHoveredNav(i)} onMouseLeave={() => setHoveredNav(null)}
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
        <div style={{ marginTop: 'auto', paddingBottom: '8px', paddingLeft: sidebarOpen ? '20px' : '0', width: '100%', display: 'flex', justifyContent: sidebarOpen ? 'flex-start' : 'center', transition: 'all 0.25s ease' }}>
          <UserButton  />
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* HEADER */}
        <div style={{ padding: '28px 28px 24px', background: '#F5F3EF', borderBottom: '1px solid rgba(31,46,35,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="/vault" style={{ fontSize: '12px', color: 'rgba(31,46,35,0.4)', textDecoration: 'none', letterSpacing: '.08em' }}>← My Vault</a>
            <div style={{ width: '1px', height: '14px', background: 'rgba(31,46,35,0.15)' }} />
            <div style={{ fontSize: '9px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#B89B5E' }}>
              {entry ? entry.format : '...'} Entry
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {saved && <span style={{ fontSize: '12px', color: '#27ae60' }}>✓ Saved</span>}
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                onMouseEnter={() => setHoveredBtn('edit')} onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  padding: '9px 20px', border: '1px solid rgba(31,46,35,0.2)', borderRadius: '4px',
                  background: hoveredBtn === 'edit' ? 'rgba(31,46,35,0.05)' : 'transparent',
                  color: 'rgba(31,46,35,0.6)', fontSize: '11px', letterSpacing: '.1em',
                  textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.18s',
                }}
              >
                Edit
              </button>
            ) : (
              <>
                <button onClick={() => { setEditing(false); setEditTitle(entry?.title || ''); setEditContent(entry?.message_content || '') }}
                  style={{ padding: '9px 20px', border: '1px solid rgba(31,46,35,0.15)', borderRadius: '4px', background: 'transparent', color: 'rgba(31,46,35,0.5)', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  onMouseEnter={() => setHoveredBtn('save')} onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    padding: '9px 20px', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '4px',
                    background: hoveredBtn === 'save' ? '#B89B5E' : '#1F2E23',
                    color: hoveredBtn === 'save' ? '#1F2E23' : '#B89B5E',
                    fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.18s',
                  }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              onMouseEnter={() => setHoveredBtn('del')} onMouseLeave={() => setHoveredBtn(null)}
              style={{
                padding: '9px 16px', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '4px',
                background: hoveredBtn === 'del' ? 'rgba(231,76,60,0.08)' : 'transparent',
                color: 'rgba(231,76,60,0.6)', fontSize: '11px', letterSpacing: '.1em',
                textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.18s',
              }}>
              Delete
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(31,46,35,0.35)', fontSize: '13px' }}>
            Loading entry...
          </div>
        ) : entry ? (
          <div style={{ flex: 1, padding: '32px 28px', maxWidth: '800px', width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>

            {/* LEFT — Entry content */}
            <div>
              {/* Title */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.4)', display: 'block', marginBottom: '8px' }}>Title</label>
                {editing ? (
                  <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={inputStyle} />
                ) : (
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 300, color: '#1F2E23' }}>{entry.title}</div>
                )}
              </div>

              {/* Format badge */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', alignItems: 'center' }}>
                <div style={{ fontSize: '22px' }}>{formatIcons[entry.format]}</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#1F2E23', textTransform: 'capitalize' }}>{entry.format} Message</div>
                  <div style={{ fontSize: '11px', color: 'rgba(31,46,35,0.4)' }}>
                    Created {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '9px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(46,204,113,0.08)', color: '#27ae60', border: '1px solid rgba(46,204,113,0.2)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  {entry.status}
                </div>
              </div>

              {/* Content */}
              {entry.format === 'text' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.4)', display: 'block', marginBottom: '8px' }}>Message</label>
                  {editing ? (
                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={12}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: '280px', fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', lineHeight: 1.8 }} />
                  ) : (
                    <div style={{ background: '#fff', border: '1px solid rgba(31,46,35,0.08)', borderRadius: '6px', padding: '24px', fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', lineHeight: 1.9, color: '#1F2E23', whiteSpace: 'pre-wrap' }}>
                      {entry.message_content || <span style={{ color: 'rgba(31,46,35,0.3)', fontStyle: 'italic' }}>No content</span>}
                    </div>
                  )}
                </div>
              )}

              {(entry.format === 'video' || entry.format === 'audio') && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.4)', display: 'block', marginBottom: '8px' }}>Media</label>
                  <div style={{ background: '#fff', border: '1px solid rgba(31,46,35,0.08)', borderRadius: '6px', padding: '24px', textAlign: 'center' }}>
                    {entry.media_url ? (
                      <div style={{ fontSize: '13px', color: '#1F2E23' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>{formatIcons[entry.format]}</div>
                        File uploaded
                        <div style={{ fontSize: '11px', color: 'rgba(31,46,35,0.4)', marginTop: '4px' }}>{entry.media_url.split('/').pop()}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.4)', fontStyle: 'italic' }}>Browser recording (playback coming soon)</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Recipients */}
            <div>
              <div style={{ background: '#fff', border: '1px solid rgba(31,46,35,0.1)', borderRadius: '8px', padding: '20px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.35)', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(31,46,35,0.07)' }}>
                  Recipients
                </div>
                {allRecipients.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.4)', fontStyle: 'italic', marginBottom: '12px' }}>
                    No recipients yet.{' '}
                    <a href="/my-people" style={{ color: '#B89B5E', textDecoration: 'none' }}>Add people →</a>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {allRecipients.map(r => {
                      const isAssigned = assignedRecipients.includes(r.id)
                      return (
                        <div key={r.id} onClick={() => toggleRecipient(r.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 12px', borderRadius: '6px', cursor: 'pointer',
                            border: `1px solid ${isAssigned ? 'rgba(184,155,94,0.3)' : 'rgba(31,46,35,0.08)'}`,
                            background: isAssigned ? 'rgba(184,155,94,0.05)' : 'transparent',
                            transition: 'all 0.18s ease',
                          }}
                        >
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '3px', flexShrink: 0,
                            border: `1px solid ${isAssigned ? '#B89B5E' : 'rgba(31,46,35,0.2)'}`,
                            background: isAssigned ? '#1F2E23' : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.18s',
                          }}>
                            {isAssigned && <span style={{ color: '#B89B5E', fontSize: '11px' }}>✓</span>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 500, color: '#1F2E23', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                            <div style={{ fontSize: '10px', color: relationshipColors[r.relationship] || 'rgba(31,46,35,0.4)' }}>{r.relationship}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                {assignedRecipients.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(31,46,35,0.07)', fontSize: '11px', color: '#27ae60' }}>
                    ✓ {assignedRecipients.length} recipient{assignedRecipients.length > 1 ? 's' : ''} assigned
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(31,46,35,0.35)' }}>Entry not found.</div>
        )}

        {/* DELETE CONFIRM MODAL */}
        {showDeleteConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ background: '#F5F3EF', borderRadius: '8px', padding: '32px', maxWidth: '400px', width: '90%', border: '1px solid rgba(184,155,94,0.2)' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 300, color: '#1F2E23', marginBottom: '10px' }}>Delete this entry?</div>
              <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.5)', marginBottom: '24px', lineHeight: 1.6 }}>This cannot be undone. Your entry and all associated data will be permanently removed.</div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowDeleteConfirm(false)}
                  style={{ padding: '10px 20px', border: '1px solid rgba(31,46,35,0.15)', borderRadius: '4px', background: 'transparent', color: 'rgba(31,46,35,0.6)', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleDelete}
                  style={{ padding: '10px 20px', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '4px', background: '#e74c3c', color: '#fff', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Delete Entry
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
