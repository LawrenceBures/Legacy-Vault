'use client'

import { useUser, UserButton, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase-auth'

type Stats = {
  vaultEntries: number
  recipients: number
  delivered: number
  deliveryConfigured: boolean
  plan: string
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [hoveredStat, setHoveredStat] = useState<number | null>(null)
  const [hoveredAction, setHoveredAction] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<number | null>(null)
  const [stats, setStats] = useState<Stats>({
    vaultEntries: 0, recipients: 0, delivered: 0,
    deliveryConfigured: false, plan: 'Pro',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in')
  }, [isLoaded, user, router])

  const getSupabase = useCallback(async () => {
    const token = await getToken({ template: 'supabase' })
    return createSupabaseClient(token!)
  }, [getToken])

  const fetchStats = useCallback(async () => {
    if (!user) return
    try {
      const supabase = await getSupabase()

      await supabase.from('profiles').upsert({
        id: crypto.randomUUID(),
        clerk_id: user.id,
        email: user.emailAddresses[0].emailAddress,
        full_name: user.fullName || user.firstName || '',
        plan: 'pro',
        last_active: new Date().toISOString(),
      }, { onConflict: 'clerk_id' })

      const { data: profile } = await supabase
        .from('profiles').select('id, plan').eq('clerk_id', user.id).single()
      if (!profile) return

      const [entriesRes, recipientsRes, deliveredRes, deliveryRes] = await Promise.all([
        supabase.from('vault_entries').select('id', { count: 'exact' }).eq('user_id', profile.id),
        supabase.from('recipients').select('id', { count: 'exact' }).eq('user_id', profile.id),
        supabase.from('delivery_events').select('id', { count: 'exact' }).eq('status', 'delivered'),
        supabase.from('delivery_settings').select('inactivity_enabled, unlock_enabled').eq('user_id', profile.id).single(),
      ])

      setStats({
        vaultEntries: entriesRes.count ?? 0,
        recipients: recipientsRes.count ?? 0,
        delivered: deliveredRes.count ?? 0,
        deliveryConfigured: deliveryRes.data?.inactivity_enabled || deliveryRes.data?.unlock_enabled || false,
        plan: profile.plan || 'Pro',
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }, [user, getSupabase])

  useEffect(() => {
    if (isLoaded && user) fetchStats()
  }, [isLoaded, user, fetchStats])

  if (!isLoaded || !user) return null

  const firstName = user.firstName || user.emailAddresses[0].emailAddress.split('@')[0]

  const progressSteps = [stats.vaultEntries > 0, stats.recipients > 0, stats.deliveryConfigured]
  const progressPct = Math.round((progressSteps.filter(Boolean).length / progressSteps.length) * 100)

  const statItems = [
    { num: loading ? '...' : String(stats.vaultEntries), label: 'Vault Entries', href: '/vault', gold: true },
    { num: loading ? '...' : String(stats.recipients), label: 'Recipients', href: '/my-people' },
    { num: stats.deliveryConfigured ? '✓' : '—', label: 'Delivery Trigger', href: '/delivery' },
    { num: '✓', label: 'Vault Status', href: '/dashboard', green: true },
    { num: loading ? '...' : String(stats.delivered), label: 'Delivered', href: '/delivery' },
    { num: stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1), label: 'Plan', href: '/account' },
  ]

  const actions = [
    { icon: '🔒', title: 'View My Vault', desc: 'All entries & messages', href: '/vault' },
    { icon: '+', title: 'Create New Entry', desc: 'Video, audio or text', href: '/new-entry' },
    { icon: '👥', title: 'My People', desc: 'Manage recipients', href: '/my-people' },
    { icon: '⏱', title: 'Delivery Settings', desc: 'Configure timing rules', href: '/delivery' },
  ]

  const statuses = [
    { dot: '#2ecc71', name: 'Vault Active', sub: 'Monitoring enabled', badge: 'Active', href: '/dashboard', badgeColor: 'rgba(46,204,113,0.1)', badgeText: '#2ecc71', badgeBorder: 'rgba(46,204,113,0.25)' },
    { dot: stats.deliveryConfigured ? '#2ecc71' : '#B89B5E', name: 'Delivery Trigger', sub: stats.deliveryConfigured ? 'Configured' : 'Not configured yet', badge: stats.deliveryConfigured ? 'Active' : 'Set Up', href: '/delivery', badgeColor: stats.deliveryConfigured ? 'rgba(46,204,113,0.1)' : 'rgba(184,155,94,0.1)', badgeText: stats.deliveryConfigured ? '#2ecc71' : '#B89B5E', badgeBorder: stats.deliveryConfigured ? 'rgba(46,204,113,0.25)' : 'rgba(184,155,94,0.25)' },
    { dot: stats.recipients > 0 ? '#2ecc71' : 'rgba(31,46,35,0.18)', name: 'Recipients', sub: stats.recipients > 0 ? `${stats.recipients} added` : 'No recipients added', badge: stats.recipients > 0 ? String(stats.recipients) : 'Add', href: '/my-people', badgeColor: stats.recipients > 0 ? 'rgba(46,204,113,0.1)' : 'rgba(31,46,35,0.05)', badgeText: stats.recipients > 0 ? '#2ecc71' : 'rgba(31,46,35,0.4)', badgeBorder: stats.recipients > 0 ? 'rgba(46,204,113,0.25)' : 'rgba(31,46,35,0.1)' },
    { dot: stats.vaultEntries > 0 ? '#2ecc71' : 'rgba(31,46,35,0.18)', name: 'Vault Entries', sub: stats.vaultEntries > 0 ? `${stats.vaultEntries} saved` : 'None recorded yet', badge: stats.vaultEntries > 0 ? String(stats.vaultEntries) : 'Add', href: '/new-entry', badgeColor: stats.vaultEntries > 0 ? 'rgba(46,204,113,0.1)' : 'rgba(31,46,35,0.05)', badgeText: stats.vaultEntries > 0 ? '#2ecc71' : 'rgba(31,46,35,0.4)', badgeBorder: stats.vaultEntries > 0 ? 'rgba(46,204,113,0.25)' : 'rgba(31,46,35,0.1)' },
  ]

  const navItems = [
    { icon: '⊞', label: 'Dashboard', href: '/dashboard', active: true },
    { icon: '🔒', label: 'My Vault', href: '/vault' },
    { icon: '+', label: 'New Entry', href: '/new-entry' },
    { icon: '👥', label: 'My People', href: '/my-people' },
    { icon: '⏱', label: 'Delivery', href: '/delivery' },
  ]

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
            {sidebarOpen && (
              <span style={{ fontSize: '12px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '.04em' }}>
                {item.label}
              </span>
            )}
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
          <div style={{ fontSize: '9px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#B89B5E', marginBottom: '8px' }}>
            Dashboard · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 300, color: '#1F2E23', lineHeight: 1.1, marginBottom: '6px' }}>
            Welcome back, <em style={{ color: '#B89B5E', fontStyle: 'italic' }}>{firstName}.</em>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.45)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
            Your legacy is safe. Here's where things stand.
          </div>
        </div>

        {/* STAT STRIP */}
        <div style={{ display: 'flex', overflowX: 'auto', background: '#fff', borderBottom: '1px solid rgba(31,46,35,0.08)', scrollbarWidth: 'none' }}>
          {statItems.map((stat, i) => (
            <a key={i} href={stat.href}
              onMouseEnter={() => setHoveredStat(i)} onMouseLeave={() => setHoveredStat(null)}
              style={{
                flex: '0 0 auto', padding: '18px 28px',
                borderRight: '1px solid rgba(31,46,35,0.07)', minWidth: '130px',
                cursor: 'pointer', textDecoration: 'none', display: 'block',
                background: hoveredStat === i ? '#1F2E23' : '#fff',
                transition: 'all .22s ease', position: 'relative',
              }}>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: '34px', fontWeight: 300,
                color: hoveredStat === i ? '#B89B5E' : stat.gold ? '#B89B5E' : stat.green ? '#2ecc71' : '#1F2E23',
                lineHeight: 1, marginBottom: '3px', transition: 'color .22s',
              }}>
                {stat.num}
              </div>
              <div style={{
                fontSize: '9px', letterSpacing: '.16em', textTransform: 'uppercase',
                color: hoveredStat === i ? 'rgba(245,243,239,0.4)' : 'rgba(31,46,35,0.35)',
                transition: 'color .22s',
              }}>
                {stat.label}
              </div>
              {hoveredStat === i && (
                <div style={{ position: 'absolute', bottom: '10px', right: '12px', fontSize: '11px', color: 'rgba(184,155,94,0.5)' }}>→</div>
              )}
            </a>
          ))}
        </div>

        {/* BODY */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1 }}>

          {/* ACTIONS */}
          <div style={{ padding: '20px', borderRight: '1px solid rgba(31,46,35,0.08)' }}>
            <div style={{ fontSize: '9px', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.35)', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(31,46,35,0.07)' }}>
              Quick Actions
            </div>
            {actions.map((action, i) => (
              <a key={i} href={action.href}
                onMouseEnter={() => setHoveredAction(i)} onMouseLeave={() => setHoveredAction(null)}
                style={{
                  border: '1px solid rgba(31,46,35,0.1)', padding: '16px', marginBottom: '8px',
                  cursor: 'pointer', transition: 'all .22s ease',
                  background: hoveredAction === i ? '#1F2E23' : '#fff',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  textDecoration: 'none',
                  transform: hoveredAction === i ? 'translateX(3px)' : 'translateX(0)',
                }}>
                <div style={{
                  width: '32px', height: '32px',
                  background: hoveredAction === i ? 'rgba(184,155,94,0.15)' : 'rgba(184,155,94,0.08)',
                  border: `1px solid ${hoveredAction === i ? 'rgba(184,155,94,0.3)' : 'rgba(184,155,94,0.18)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '16px', transition: 'all .22s',
                }}>
                  {action.icon}
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: hoveredAction === i ? '#F5F3EF' : '#1F2E23', marginBottom: '2px', fontWeight: 500, transition: 'color .22s' }}>{action.title}</div>
                  <div style={{ fontSize: '10px', color: hoveredAction === i ? 'rgba(245,243,239,0.4)' : 'rgba(31,46,35,0.4)', transition: 'color .22s' }}>{action.desc}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '16px', color: hoveredAction === i ? '#B89B5E' : 'rgba(31,46,35,0.15)', transition: 'color .22s' }}>›</div>
              </a>
            ))}
          </div>

          {/* STATUS */}
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.35)', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(31,46,35,0.07)' }}>
              System Status
            </div>
            {statuses.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(31,46,35,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#1F2E23' }}>{item.name}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(31,46,35,0.4)' }}>{item.sub}</div>
                  </div>
                </div>
                <a href={item.href} style={{
                  fontSize: '9px', padding: '3px 9px', borderRadius: '20px',
                  background: item.badgeColor, color: item.badgeText,
                  border: `1px solid ${item.badgeBorder}`,
                  letterSpacing: '.08em', textTransform: 'uppercase' as const,
                  textDecoration: 'none', cursor: 'pointer',
                  transition: 'all 0.18s ease', display: 'inline-block',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.opacity = '1' }}
                >
                  {item.badge}
                </a>
              </div>
            ))}

            {/* PROGRESS */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(31,46,35,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.35)' }}>Setup Progress</div>
                <div style={{ fontSize: '11px', color: '#B89B5E' }}>{progressPct}%</div>
              </div>
              <div style={{ height: '3px', background: 'rgba(31,46,35,0.08)' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #B89B5E, #cdb47a)', width: `${progressPct}%`, transition: 'width 0.6s ease' }} />
              </div>
              {progressPct < 100 && (
                <div style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(31,46,35,0.4)' }}>
                  {!progressSteps[0] && '→ Add your first vault entry'}
                  {progressSteps[0] && !progressSteps[1] && '→ Add a recipient'}
                  {progressSteps[0] && progressSteps[1] && !progressSteps[2] && '→ Configure delivery settings'}
                </div>
              )}
              {progressPct === 100 && (
                <div style={{ marginTop: '10px', fontSize: '11px', color: '#2ecc71' }}>✓ Your vault is fully configured</div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
