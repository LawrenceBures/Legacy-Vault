'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<number | null>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [showForm, setShowForm] = useState(false)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', relationship: '' })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in')
  }, [isLoaded, user, router])

  if (!isLoaded || !user) return null

  const navItems = [
    { icon: '⊞', label: 'Dashboard', href: '/dashboard' },
    { icon: '🔒', label: 'My Vault', href: '/vault' },
    { icon: '+', label: 'New Entry', href: '/new-entry' },
    { icon: '👥', label: 'My People', href: '/my-people', active: true },
    { icon: '⏱', label: 'Delivery', href: '/delivery' },
  ]

  const relationships = ['Spouse', 'Partner', 'Child', 'Parent', 'Sibling', 'Friend', 'Advisor', 'Other']

  const handleAdd = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required.')
      return
    }
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      relationship: form.relationship || 'Other',
    }
    setRecipients([...recipients, newRecipient])
    setForm({ name: '', email: '', phone: '', relationship: '' })
    setFormError('')
    setShowForm(false)
  }

  const handleRemove = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id))
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

      {/* SIDEBAR */}
      <aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        style={{
          width: sidebarOpen ? '200px' : '64px',
          background: '#1F2E23',
          display: 'flex',
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
          {sidebarOpen ? 'Legacy Vault' : 'L\nV'}
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
          <UserButton  />
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* HEADER */}
        <div style={{ padding: '28px 28px 24px', background: '#F5F3EF', borderBottom: '1px solid rgba(31,46,35,0.08)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#B89B5E', marginBottom: '8px' }}>My People</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 300, color: '#1F2E23', lineHeight: 1.1, marginBottom: '6px' }}>
              Who receives <em style={{ color: '#B89B5E', fontStyle: 'italic' }}>your legacy.</em>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.45)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
              The people who will receive your vault entries when the time comes.
            </div>
          </div>
          <button
            onClick={() => { setShowForm(true); setFormError('') }}
            onMouseEnter={() => setHoveredBtn('add')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              background: hoveredBtn === 'add' ? '#B89B5E' : '#1F2E23',
              color: hoveredBtn === 'add' ? '#1F2E23' : '#B89B5E',
              border: '1px solid #B89B5E', borderRadius: '4px',
              fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.22s ease',
              flexShrink: 0, marginTop: '6px', fontWeight: 500,
            }}
          >
            <span style={{ fontSize: '14px' }}>+</span> Add Person
          </button>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, padding: '32px 28px', maxWidth: '720px', width: '100%', margin: '0 auto' }}>

          {/* ADD FORM */}
          {showForm && (
            <div style={{
              background: '#fff', border: '1px solid rgba(184,155,94,0.3)',
              borderRadius: '6px', padding: '24px', marginBottom: '24px',
            }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontWeight: 300, color: '#1F2E23', marginBottom: '20px' }}>
                Add a Recipient
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
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
                return (
                  <div
                    key={r.id}
                    onMouseEnter={() => setHoveredCard(r.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      background: '#fff',
                      border: `1px solid ${hoveredCard === r.id ? 'rgba(184,155,94,0.3)' : 'rgba(31,46,35,0.1)'}`,
                      borderRadius: '6px', padding: '16px 20px',
                      display: 'flex', alignItems: 'center', gap: '16px',
                      transition: 'all 0.2s ease',
                    }}
                  >
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
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
                    <button
                      onClick={() => handleRemove(r.id)}
                      onMouseEnter={() => setHoveredBtn(`remove-${r.id}`)}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={{
                        padding: '6px 12px', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '4px',
                        background: hoveredBtn === `remove-${r.id}` ? 'rgba(231,76,60,0.08)' : 'transparent',
                        color: 'rgba(231,76,60,0.6)', fontSize: '10px', letterSpacing: '.08em',
                        textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.18s ease', flexShrink: 0,
                      }}
                    >
                      Remove
                    </button>
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
                👥
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
    </div>
  )
}
