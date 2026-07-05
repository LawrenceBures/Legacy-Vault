'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'

type Recipient = {
  id: string
  name: string
  email: string
  phone: string
  relationship: string
}

export default function MyPeoplePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<number | null>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [showForm, setShowForm] = useState(false)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', relationship: '' })
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', relationship: '' })
  const [editError, setEditError] = useState('')

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in')
  }, [isLoaded, user, router])

  const fetchRecipients = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/recipients')
      if (res.ok) {
        const data = await res.json()
        setRecipients(data)
      }
    } catch (err) {
      console.error('Error fetching recipients:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (isLoaded && user) fetchRecipients()
  }, [isLoaded, user, fetchRecipients])

  if (!isLoaded || !user) return null

  const navItems = [
    { icon: '\u229E', label: 'Dashboard', href: '/dashboard' },
    { icon: '\uD83D\uDD12', label: 'My Vault', href: '/vault' },
    { icon: '+', label: 'New Entry', href: '/new-entry' },
    { icon: '\uD83D\uDC65', label: 'My People', href: '/my-people', active: true },
    { icon: '\u23F1', label: 'Delivery', href: '/delivery' },
  ]

  const relationships = ['Spouse', 'Partner', 'Child', 'Parent', 'Sibling', 'Friend', 'Advisor', 'Other']

  const handleAdd = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required.')
      return
    }
    try {
      const res = await fetch('/api/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          relationship: form.relationship || 'Other',
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error || 'Failed to save recipient.')
        return
      }
      const newRecipient = await res.json()
      setRecipients([newRecipient, ...recipients])
      setForm({ name: '', email: '', phone: '', relationship: '' })
      setFormError('')
      setShowForm(false)
    } catch (err) {
      console.error('Error saving recipient:', err)
      setFormError('Something went wrong. Please try again.')
    }
  }

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/recipients?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setRecipients(recipients.filter(r => r.id !== id))
        setConfirmRemoveId(null)
      }
    } catch (err) {
      console.error('Error removing recipient:', err)
    }
  }

  const startEdit = (r: Recipient) => {
    setEditingId(r.id)
    setEditForm({ name: r.name, email: r.email, phone: r.phone || '', relationship: r.relationship })
    setEditError('')
  }

  const handleEdit = async () => {
    if (!editingId) return
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setEditError('Name and email are required.')
      return
    }
    try {
      const res = await fetch('/api/recipients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim(),
          relationship: editForm.relationship || 'Other',
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setEditError(data.error || 'Failed to update recipient.')
        return
      }
      const updated = await res.json()
      setRecipients(recipients.map(r => r.id === editingId ? updated : r))
      setEditingId(null)
      setEditError('')
    } catch (err) {
      console.error('Error updating recipient:', err)
      setEditError('Something went wrong. Please try again.')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid rgba(31,46,35,0.15)',
    borderRadius: '4px',
    background: '#fff',
    fontSize: '13px',
    color: '#1F2E23',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const relationshipColors: Record<string, { bg: string; text: string; border: string }> = {
    Spouse:  { bg: 'rgba(184,155,94,0.1)',  text: '#B89B5E',            border: 'rgba(184,155,94,0.25)' },
    Partner: { bg: 'rgba(184,155,94,0.1)',  text: '#B89B5E',            border: 'rgba(184,155,94,0.25)' },
    Child:   { bg: 'rgba(46,204,113,0.08)', text: '#27ae60',            border: 'rgba(46,204,113,0.2)' },
    Parent:  { bg: 'rgba(52,152,219,0.08)', text: '#2980b9',            border: 'rgba(52,152,219,0.2)' },
    Sibling: { bg: 'rgba(52,152,219,0.08)', text: '#2980b9',            border: 'rgba(52,152,219,0.2)' },
    Friend:  { bg: 'rgba(31,46,35,0.06)',   text: 'rgba(31,46,35,0.5)', border: 'rgba(31,46,35,0.12)' },
    Advisor: { bg: 'rgba(31,46,35,0.06)',   text: 'rgba(31,46,35,0.5)', border: 'rgba(31,46,35,0.12)' },
    Other:   { bg: 'rgba(31,46,35,0.06)',   text: 'rgba(31,46,35,0.5)', border: 'rgba(31,46,35,0.12)' },
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F3EF' }}>

      {/* SIDEBAR — desktop only */}
      <aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        style={{
          display: isMobile ? 'none' : 'flex',
          width: sidebarOpen ? '200px' : '64px',
          background: '#1F2E23',
          flexDirection: 'column',
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
              color: item.active ? '#B89B5E' : hoveredNav === i ? '#F5F3EF' : 'rgba(245,243,239,0.35)',
              background: item.active ? 'rgba(184,155,94,0.15)' : hoveredNav === i ? 'rgba(245,243,239,0.06)' : 'transparent',
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
            {sidebarOpen && (
              <span style={{ fontSize: '12px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '.04em' }}>
                {item.label}
              </span>
            )}
          </a>
        ))}

        <div style={{
          marginTop: 'auto', paddingBottom: '8px',
          paddingLeft: sidebarOpen ? '20px' : '0',
          width: '100%', display: 'flex',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          transition: 'all 0.25s ease',
        }}>
          <UserButton />
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingBottom: isMobile ? '70px' : '0' }}>

        {/* HEADER */}
        <div style={{ padding: isMobile ? '20px 16px 16px' : '28px 28px 24px', background: '#F5F3EF', borderBottom: '1px solid rgba(31,46,35,0.08)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#B89B5E', marginBottom: '8px' }}>My People</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? '28px' : '36px', fontWeight: 300, color: '#1F2E23', lineHeight: 1.1, marginBottom: '6px' }}>
              Who receives <em style={{ color: '#B89B5E', fontStyle: 'italic' }}>your legacy.</em>
            </div>
            {!isMobile && (
              <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.45)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                The people who will receive your vault entries when the time comes.
              </div>
            )}
          </div>
          <button
            onClick={() => { setShowForm(true); setFormError(''); setEditingId(null) }}
            onMouseEnter={() => setHoveredBtn('add')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: isMobile ? '8px 14px' : '10px 20px',
              background: hoveredBtn === 'add' ? '#B89B5E' : '#1F2E23',
              color: hoveredBtn === 'add' ? '#1F2E23' : '#B89B5E',
              border: '1px solid #B89B5E', borderRadius: '4px',
              fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.22s ease',
              flexShrink: 0, marginTop: '6px', fontWeight: 500, whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '14px' }}>+</span> {isMobile ? 'Add' : 'Add Person'}
          </button>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, padding: isMobile ? '20px 16px' : '32px 28px', maxWidth: '720px', width: '100%', margin: '0 auto' }}>

          {/* ADD FORM */}
          {showForm && (
            <div style={{
              background: '#fff', border: '1px solid rgba(184,155,94,0.3)',
              borderRadius: '6px', padding: isMobile ? '16px' : '24px', marginBottom: '24px',
            }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontWeight: 300, color: '#1F2E23', marginBottom: '20px' }}>
                Add a Recipient
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '6px' }}>Full Name *</label>
                  <input type="text" placeholder="Jane Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '6px' }}>Email *</label>
                  <input type="email" placeholder="jane@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '6px' }}>Phone</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '6px' }}>Relationship</label>
                  <select value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Select...</option>
                    {relationships.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              {formError && <div style={{ fontSize: '12px', color: '#e74c3c', marginBottom: '14px' }}>{formError}</div>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setShowForm(false); setForm({ name: '', email: '', phone: '', relationship: '' }); setFormError('') }}
                  style={{ padding: '9px 20px', border: '1px solid rgba(31,46,35,0.15)', borderRadius: '4px', background: 'transparent', color: 'rgba(31,46,35,0.5)', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  onMouseEnter={() => setHoveredBtn('save')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    padding: '9px 24px', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '4px',
                    background: hoveredBtn === 'save' ? '#B89B5E' : '#1F2E23',
                    color: hoveredBtn === 'save' ? '#1F2E23' : '#B89B5E',
                    fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'all 0.18s ease', fontWeight: 500,
                  }}
                >
                  Save Recipient
                </button>
              </div>
            </div>
          )}

          {/* RECIPIENT LIST */}
          {recipients.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.35)', marginBottom: '4px' }}>
                {recipients.length} {recipients.length === 1 ? 'Recipient' : 'Recipients'}
              </div>
              {recipients.map((r) => {
                const color = relationshipColors[r.relationship] || relationshipColors['Other']

                // Inline edit form
                if (editingId === r.id) {
                  return (
                    <div key={r.id} style={{
                      background: '#fff', border: '1px solid rgba(184,155,94,0.4)',
                      borderRadius: '6px', padding: isMobile ? '16px' : '20px',
                    }}>
                      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontWeight: 300, color: '#1F2E23', marginBottom: '16px' }}>
                        Edit Recipient
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '6px' }}>Full Name *</label>
                          <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '6px' }}>Email *</label>
                          <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '6px' }}>Phone</label>
                          <input type="tel" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '6px' }}>Relationship</label>
                          <select value={editForm.relationship} onChange={e => setEditForm({ ...editForm, relationship: e.target.value })} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                            <option value="">Select...</option>
                            {relationships.map(rel => <option key={rel} value={rel}>{rel}</option>)}
                          </select>
                        </div>
                      </div>
                      {editError && <div style={{ fontSize: '12px', color: '#e74c3c', marginBottom: '12px' }}>{editError}</div>}
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => { setEditingId(null); setEditError('') }}
                          style={{ padding: '8px 16px', border: '1px solid rgba(31,46,35,0.15)', borderRadius: '4px', background: 'transparent', color: 'rgba(31,46,35,0.5)', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                          Cancel
                        </button>
                        <button onClick={handleEdit}
                          onMouseEnter={() => setHoveredBtn('edit-save')}
                          onMouseLeave={() => setHoveredBtn(null)}
                          style={{
                            padding: '8px 20px', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '4px',
                            background: hoveredBtn === 'edit-save' ? '#B89B5E' : '#1F2E23',
                            color: hoveredBtn === 'edit-save' ? '#1F2E23' : '#B89B5E',
                            fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase',
                            cursor: 'pointer', transition: 'all 0.18s ease', fontWeight: 500,
                          }}>
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={r.id}>
                    <div
                      onMouseEnter={() => setHoveredCard(r.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        background: '#fff',
                        border: `1px solid ${hoveredCard === r.id ? 'rgba(184,155,94,0.3)' : 'rgba(31,46,35,0.1)'}`,
                        borderRadius: confirmRemoveId === r.id ? '6px 6px 0 0' : '6px',
                        padding: isMobile ? '14px' : '16px 20px',
                        display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '12px' : '16px',
                        transition: 'all 0.2s ease',
                        flexDirection: isMobile ? 'column' : 'row',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px', width: '100%' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          background: '#1F2E23', color: '#B89B5E',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '15px', fontWeight: 600, flexShrink: 0,
                          fontFamily: 'Cormorant Garamond, serif',
                        }}>
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: '#1F2E23' }}>{r.name}</div>
                            <div style={{
                              fontSize: '9px', padding: '2px 8px', borderRadius: '20px',
                              background: color.bg, color: color.text, border: `1px solid ${color.border}`,
                              letterSpacing: '.08em', textTransform: 'uppercase',
                            }}>
                              {r.relationship}
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.45)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <span>{r.email}</span>
                            {r.phone && <span>{r.phone}</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignSelf: isMobile ? 'flex-end' : 'center' }}>
                        <button
                          onClick={() => startEdit(r)}
                          onMouseEnter={() => setHoveredBtn(`edit-${r.id}`)}
                          onMouseLeave={() => setHoveredBtn(null)}
                          style={{
                            padding: '6px 12px', border: '1px solid rgba(184,155,94,0.25)', borderRadius: '4px',
                            background: hoveredBtn === `edit-${r.id}` ? 'rgba(184,155,94,0.08)' : 'transparent',
                            color: '#B89B5E', fontSize: '10px', letterSpacing: '.08em',
                            textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.18s ease',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmRemoveId(confirmRemoveId === r.id ? null : r.id)}
                          onMouseEnter={() => setHoveredBtn(`remove-${r.id}`)}
                          onMouseLeave={() => setHoveredBtn(null)}
                          style={{
                            padding: '6px 12px', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '4px',
                            background: hoveredBtn === `remove-${r.id}` ? 'rgba(231,76,60,0.08)' : 'transparent',
                            color: 'rgba(231,76,60,0.6)', fontSize: '10px', letterSpacing: '.08em',
                            textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.18s ease',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Confirmation bar */}
                    {confirmRemoveId === r.id && (
                      <div style={{
                        background: 'rgba(231,76,60,0.04)', border: '1px solid rgba(231,76,60,0.2)', borderTop: 'none',
                        borderRadius: '0 0 6px 6px', padding: '12px 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                        flexWrap: 'wrap',
                      }}>
                        <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.7)' }}>
                          Remove <strong>{r.name}</strong> as a recipient? This cannot be undone.
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button onClick={() => setConfirmRemoveId(null)}
                            style={{ padding: '6px 14px', border: '1px solid rgba(31,46,35,0.15)', borderRadius: '4px', background: 'transparent', color: 'rgba(31,46,35,0.5)', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                            Cancel
                          </button>
                          <button onClick={() => handleRemove(r.id)}
                            style={{ padding: '6px 14px', border: '1px solid rgba(231,76,60,0.4)', borderRadius: '4px', background: 'rgba(231,76,60,0.1)', color: '#e74c3c', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500 }}>
                            Yes, Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : !showForm ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{
                width: '72px', height: '72px', margin: '0 auto 24px',
                background: 'rgba(184,155,94,0.08)', border: '1px solid rgba(184,155,94,0.2)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
              }}>
                {'\uD83D\uDC65'}
              </div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: 300, color: '#1F2E23', marginBottom: '10px' }}>
                No recipients yet.
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.45)', lineHeight: 1.7, marginBottom: '32px', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', maxWidth: '360px', margin: '0 auto 32px' }}>
                Add the people who will receive your vault entries — family, friends, or trusted advisors.
              </div>
              <button
                onClick={() => setShowForm(true)}
                onMouseEnter={() => setHoveredBtn('empty-add')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '14px 32px',
                  background: hoveredBtn === 'empty-add' ? '#B89B5E' : '#1F2E23',
                  color: hoveredBtn === 'empty-add' ? '#1F2E23' : '#B89B5E',
                  border: '1px solid rgba(184,155,94,0.3)', borderRadius: '4px',
                  fontSize: '11px', letterSpacing: '.15em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.22s ease', fontWeight: 500,
                }}
              >
                <span style={{ fontSize: '16px' }}>+</span> Add Your First Recipient
              </button>
            </div>
          ) : null}
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
              <div style={{ fontSize: item.icon === '+' ? '22px' : '16px', color: item.href === '/my-people' ? '#B89B5E' : 'rgba(245,243,239,0.5)' }}>{item.icon}</div>
              <div style={{ fontSize: '9px', color: item.href === '/my-people' ? '#B89B5E' : 'rgba(245,243,239,0.4)', letterSpacing: '.04em' }}>{item.label}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
