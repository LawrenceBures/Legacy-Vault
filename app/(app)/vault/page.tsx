'use client'

import { useUser, UserButton, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
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
}

export default function VaultPage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<number | null>(null)
  const [hoveredCTA, setHoveredCTA] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in')
  }, [isLoaded, user, router])

  const getSupabase = useCallback(async () => {
    const token = await getToken({ template: 'supabase' })
    return createSupabaseClient(token!)
  }, [getToken])

  const fetchEntries = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const supabase = await getSupabase()
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user.id)
        .single()

      if (!profile) { setLoading(false); return }

      const { data, error } = await supabase
        .from('vault_entries')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (err) {
      console.error('Error fetching entries:', err)
    } finally {
      setLoading(false)
    }
  }, [user, getSupabase])

  useEffect(() => {
    if (isLoaded && user) fetchEntries()
  }, [isLoaded, user, fetchEntries])

  if (!isLoaded || !user) return null

  const navItems = [
    { icon: '⊞', label: 'Dashboard', href: '/dashboard' },
    { icon: '🔒', label: 'My Vault', href: '/vault', active: true },
    { icon: '+', label: 'New Entry', href: '/new-entry' },
    { icon: '👥', label: 'My People', href: '/my-people' },
    { icon: '⏱', label: 'Delivery', href: '/delivery' },
  ]

  const formatIcons: Record<string, string> = {
    video: '🎥',
    audio: '🎙️',
    text: '✍️',
    file: '📁',
  }

  const filteredEntries = activeFilter === 'All'
    ? entries
    : entries.filter(e => e.format === activeFilter.toLowerCase())

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* HEADER */}
        <div style={{ padding: '28px 28px 24px', background: '#F5F3EF', borderBottom: '1px solid rgba(31,46,35,0.08)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#B89B5E', marginBottom: '8px' }}>My Vault</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 300, color: '#1F2E23', lineHeight: 1.1, marginBottom: '6px' }}>
              Your <em style={{ color: '#B89B5E', fontStyle: 'italic' }}>Legacy Entries.</em>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.45)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
              Everything you leave behind, kept safe until the moment it matters.
            </div>
          </div>
          <a href="/new-entry"
            onMouseEnter={() => setHoveredCTA(true)}
            onMouseLeave={() => setHoveredCTA(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              background: hoveredCTA ? '#B89B5E' : '#1F2E23',
              color: hoveredCTA ? '#1F2E23' : '#B89B5E',
              border: '1px solid #B89B5E', borderRadius: '4px',
              fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase',
              textDecoration: 'none', transition: 'all 0.22s ease',
              flexShrink: 0, marginTop: '6px', fontWeight: 500,
            }}
          >
            <span style={{ fontSize: '14px' }}>+</span> New Entry
          </a>
        </div>

        {/* FILTER BAR */}
        <div style={{ padding: '12px 28px', background: '#fff', borderBottom: '1px solid rgba(31,46,35,0.08)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {['All', 'Video', 'Audio', 'Text'].map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)}
              style={{
                padding: '5px 14px', borderRadius: '20px',
                border: `1px solid ${activeFilter === filter ? '#1F2E23' : 'rgba(31,46,35,0.15)'}`,
                background: activeFilter === filter ? '#1F2E23' : 'transparent',
                color: activeFilter === filter ? '#F5F3EF' : 'rgba(31,46,35,0.5)',
                fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.18s ease',
              }}
            >
              {filter}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: '10px', color: 'rgba(31,46,35,0.3)', letterSpacing: '.08em' }}>
            {loading ? '...' : `${filteredEntries.length} ${filteredEntries.length === 1 ? 'ENTRY' : 'ENTRIES'}`}
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(31,46,35,0.35)', fontSize: '13px' }}>
            Loading your vault...
          </div>
        ) : filteredEntries.length > 0 ? (
          <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filteredEntries.map((entry) => (
              <div key={entry.id}
                onMouseEnter={() => setHoveredCard(entry.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => router.push(`/vault/${entry.id}`)}
                style={{
                  background: '#fff',
                  border: `1px solid ${hoveredCard === entry.id ? 'rgba(184,155,94,0.4)' : 'rgba(31,46,35,0.1)'}`,
                  borderRadius: '8px', padding: '20px',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  transform: hoveredCard === entry.id ? 'translateY(-2px)' : 'none',
                  boxShadow: hoveredCard === entry.id ? '0 4px 16px rgba(31,46,35,0.08)' : 'none',
                }}
              >
                {/* Entry header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                    background: 'rgba(184,155,94,0.08)', border: '1px solid rgba(184,155,94,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                  }}>
                    {formatIcons[entry.format] || '📄'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#1F2E23', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.title}
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(31,46,35,0.4)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                      {entry.format} · {formatDate(entry.created_at)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '9px', padding: '3px 8px', borderRadius: '20px',
                    background: 'rgba(46,204,113,0.08)', color: '#27ae60',
                    border: '1px solid rgba(46,204,113,0.2)', letterSpacing: '.08em', textTransform: 'uppercase', flexShrink: 0,
                  }}>
                    {entry.status}
                  </div>
                </div>

                {/* Preview */}
                {entry.message_content && (
                  <div style={{
                    fontSize: '12px', color: 'rgba(31,46,35,0.5)', lineHeight: 1.6,
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                    fontFamily: entry.format === 'text' ? 'Cormorant Garamond, serif' : 'DM Sans, sans-serif',
                    fontStyle: entry.format === 'text' ? 'italic' : 'normal',
                  }}>
                    {entry.message_content}
                  </div>
                )}

                {/* Footer */}
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(31,46,35,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(31,46,35,0.3)' }}>No recipients assigned</div>
                  <div style={{ fontSize: '11px', color: '#B89B5E' }}>Edit →</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 28px' }}>
            <div style={{ textAlign: 'center', maxWidth: '420px' }}>
              <div style={{
                width: '72px', height: '72px', margin: '0 auto 24px',
                background: 'rgba(184,155,94,0.08)', border: '1px solid rgba(184,155,94,0.2)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
              }}>
                🔒
              </div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: 300, color: '#1F2E23', marginBottom: '10px' }}>
                Your vault is empty.
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.45)', lineHeight: 1.7, marginBottom: '32px', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                This is where your voice lives on. Add a video message, a letter, or an audio recording — for the people who matter most.
              </div>
              <a href="/new-entry"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '14px 32px', background: '#1F2E23', color: '#B89B5E',
                  border: '1px solid rgba(184,155,94,0.3)', borderRadius: '4px',
                  fontSize: '11px', letterSpacing: '.15em', textTransform: 'uppercase',
                  textDecoration: 'none', fontWeight: 500, transition: 'all 0.22s ease', marginBottom: '16px',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#B89B5E'; (e.currentTarget as HTMLElement).style.color = '#1F2E23' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1F2E23'; (e.currentTarget as HTMLElement).style.color = '#B89B5E' }}
              >
                <span style={{ fontSize: '16px' }}>+</span> Create Your First Entry
              </a>
              <div style={{ fontSize: '11px', color: 'rgba(31,46,35,0.3)', letterSpacing: '.06em' }}>Video · Audio · Text</div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
