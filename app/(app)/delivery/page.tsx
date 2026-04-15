'use client'

import { useUser, UserButton, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase-auth'

export default function DeliveryPage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<number | null>(null)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'inactivity' | 'unlock'>('inactivity')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState('')

  const [inactivityEnabled, setInactivityEnabled] = useState(false)
  const [timeWindow, setTimeWindow] = useState('60')
  const [checkInFreq, setCheckInFreq] = useState('monthly')
  const [warningDays, setWarningDays] = useState('7')
  const [warningEmail, setWarningEmail] = useState(true)
  const [warningSMS, setWarningSMS] = useState(false)
  const [unlockEnabled, setUnlockEnabled] = useState(false)
  const [unlockCode, setUnlockCode] = useState('')
  const [unlockCodeVisible, setUnlockCodeVisible] = useState(false)
  const [confirmCode, setConfirmCode] = useState('')
  const [codeError, setCodeError] = useState('')

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in')
  }, [isLoaded, user, router])

  const getSupabase = useCallback(async () => {
    const token = await getToken({ template: 'supabase' })
    return createSupabaseClient(token!)
  }, [getToken])

  const fetchSettings = useCallback(async () => {
    if (!user) return
    try {
      const supabase = await getSupabase()
      const { data: profile } = await supabase.from('profiles').select('id').eq('clerk_id', user.id).single()
      if (!profile) return
      const { data } = await supabase.from('delivery_settings').select('*').eq('user_id', profile.id).single()
      if (data) {
        setInactivityEnabled(data.inactivity_enabled ?? false)
        setTimeWindow(String(data.time_window_days ?? 60))
        setCheckInFreq(data.checkin_frequency ?? 'monthly')
        setWarningDays(String(data.warning_days ?? 7))
        setWarningEmail(data.warning_email ?? true)
        setWarningSMS(data.warning_sms ?? false)
        setUnlockEnabled(data.unlock_enabled ?? false)
      }
    } catch (err) {
      console.error('Error fetching delivery settings:', err)
    } finally {
      setLoading(false)
    }
  }, [user, getSupabase])

  useEffect(() => {
    if (isLoaded && user) fetchSettings()
  }, [isLoaded, user, fetchSettings])

  if (!isLoaded || !user) return null

  const navItems = [
    { icon: '⊞', label: 'Dashboard', href: '/dashboard' },
    { icon: '🔒', label: 'My Vault', href: '/vault' },
    { icon: '+', label: 'New Entry', href: '/new-entry' },
    { icon: '👥', label: 'My People', href: '/my-people' },
    { icon: '⏱', label: 'Delivery', href: '/delivery', active: true },
  ]

  const handleSave = async () => {
    if (unlockEnabled) {
      if (unlockCode.length < 6) { setCodeError('Code must be at least 6 characters.'); return }
      if (unlockCode !== confirmCode) { setCodeError('Codes do not match.'); return }
    }
    setCodeError('')
    setSaving(true)
    setSaveError('')
    try {
      const supabase = await getSupabase()
      const { data: profile } = await supabase.from('profiles').select('id').eq('clerk_id', user.id).single()
      if (!profile) throw new Error('Profile not found')

      await supabase.from('delivery_settings').upsert({
        user_id: profile.id,
        inactivity_enabled: inactivityEnabled,
        time_window_days: parseInt(timeWindow),
        checkin_frequency: checkInFreq,
        warning_days: parseInt(warningDays),
        warning_email: warningEmail,
        warning_sms: warningSMS,
        unlock_enabled: unlockEnabled,
        unlock_code_hash: unlockEnabled ? unlockCode : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Save error:', err)
      setSaveError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setUnlockCode(code)
    setConfirmCode(code)
  }

  const inputStyle = {
    padding: '10px 14px', border: '1px solid rgba(31,46,35,0.15)', borderRadius: '4px',
    background: '#fff', fontSize: '13px', color: '#1F2E23',
    fontFamily: 'DM Sans, sans-serif', outline: 'none',
    boxSizing: 'border-box' as const, width: '100%',
  }

  const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'none' as const }

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <div onClick={onChange} style={{ width: '44px', height: '24px', borderRadius: '12px', background: enabled ? '#1F2E23' : 'rgba(31,46,35,0.15)', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.22s ease', border: enabled ? '1px solid rgba(184,155,94,0.3)' : '1px solid transparent' }}>
      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: enabled ? '#B89B5E' : '#fff', position: 'absolute', top: '2px', left: enabled ? '22px' : '2px', transition: 'all 0.22s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
    </div>
  )

  const CheckBox = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <div onClick={onChange} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
      <div style={{ width: '18px', height: '18px', borderRadius: '3px', flexShrink: 0, border: `1px solid ${checked ? '#B89B5E' : 'rgba(31,46,35,0.2)'}`, background: checked ? '#1F2E23' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s ease' }}>
        {checked && <span style={{ color: '#B89B5E', fontSize: '11px', lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ fontSize: '13px', color: '#1F2E23' }}>{label}</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F3EF' }}>
      <aside onMouseEnter={() => setSidebarOpen(true)} onMouseLeave={() => setSidebarOpen(false)} style={{ width: sidebarOpen ? '200px' : '64px', background: '#1F2E23', display: 'flex', flexDirection: 'column', alignItems: sidebarOpen ? 'flex-start' : 'center', padding: '20px 0', gap: '6px', borderRight: '1px solid rgba(184,155,94,0.1)', flexShrink: 0, transition: 'width 0.25s ease', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: sidebarOpen ? '13px' : '10px', fontWeight: 600, color: '#B89B5E', letterSpacing: '.05em', textAlign: sidebarOpen ? 'left' : 'center', lineHeight: 1.2, paddingBottom: '16px', borderBottom: '1px solid rgba(184,155,94,0.12)', marginBottom: '8px', width: '100%', paddingLeft: sidebarOpen ? '20px' : '0', paddingRight: sidebarOpen ? '20px' : '0', transition: 'all 0.25s ease', whiteSpace: 'nowrap' }}>
          {sidebarOpen ? 'Legacy Vault' : 'L\nV'}
        </div>
        {navItems.map((item, i) => (
          <a key={item.href} href={item.href} onMouseEnter={() => setHoveredNav(i)} onMouseLeave={() => setHoveredNav(null)} style={{ width: sidebarOpen ? 'calc(100% - 16px)' : '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', gap: '10px', borderRadius: '8px', color: item.active ? '#B89B5E' : hoveredNav === i ? '#F5F3EF' : 'rgba(245,243,239,0.35)', background: item.active ? 'rgba(184,155,94,0.15)' : hoveredNav === i ? 'rgba(245,243,239,0.06)' : 'transparent', cursor: 'pointer', fontSize: '16px', textDecoration: 'none', transition: 'all .2s', paddingLeft: sidebarOpen ? '12px' : '0', marginLeft: sidebarOpen ? '8px' : '0', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            {sidebarOpen && <span style={{ fontSize: '12px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '.04em' }}>{item.label}</span>}
          </a>
        ))}
        <div style={{ marginTop: 'auto', paddingBottom: '8px', paddingLeft: sidebarOpen ? '20px' : '0', width: '100%', display: 'flex', justifyContent: sidebarOpen ? 'flex-start' : 'center', transition: 'all 0.25s ease' }}>
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '28px 28px 24px', background: '#F5F3EF', borderBottom: '1px solid rgba(31,46,35,0.08)' }}>
          <div style={{ fontSize: '9px', letterSpacing: '.25em', textTransform: 'uppercase', color: '#B89B5E', marginBottom: '8px' }}>Delivery Settings</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 300, color: '#1F2E23', lineHeight: 1.1, marginBottom: '6px' }}>
            How your vault <em style={{ color: '#B89B5E', fontStyle: 'italic' }}>gets delivered.</em>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.45)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
            Configure when and how your recipients receive access to your legacy.
          </div>
        </div>

        <div style={{ padding: '0 28px', background: '#fff', borderBottom: '1px solid rgba(31,46,35,0.08)', display: 'flex' }}>
          {[{ id: 'inactivity', label: '⏱ Inactivity Trigger', desc: 'Auto-deliver after inactivity' }, { id: 'unlock', label: '🔑 Family Unlock Code', desc: 'Manual delivery via code' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as 'inactivity' | 'unlock')} style={{ padding: '16px 24px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: `2px solid ${activeTab === tab.id ? '#B89B5E' : 'transparent'}`, transition: 'all 0.18s ease', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: activeTab === tab.id ? '#1F2E23' : 'rgba(31,46,35,0.4)', marginBottom: '2px' }}>{tab.label}</div>
              <div style={{ fontSize: '10px', color: activeTab === tab.id ? 'rgba(31,46,35,0.45)' : 'rgba(31,46,35,0.25)' }}>{tab.desc}</div>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(31,46,35,0.35)', fontSize: '13px' }}>Loading settings...</div>
        ) : (
          <div style={{ flex: 1, padding: '32px 28px', maxWidth: '680px', width: '100%', margin: '0 auto' }}>

            {activeTab === 'inactivity' && (
              <div>
                <div style={{ background: '#fff', border: '1px solid rgba(31,46,35,0.1)', borderRadius: '6px', padding: '20px 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#1F2E23', marginBottom: '3px' }}>Enable Inactivity Trigger</div>
                    <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.45)' }}>Automatically deliver your vault if you stop checking in.</div>
                  </div>
                  <Toggle enabled={inactivityEnabled} onChange={() => setInactivityEnabled(!inactivityEnabled)} />
                </div>
                <div style={{ background: '#fff', border: `1px solid ${inactivityEnabled ? 'rgba(184,155,94,0.25)' : 'rgba(31,46,35,0.08)'}`, borderRadius: '6px', padding: '24px', opacity: inactivityEnabled ? 1 : 0.45, pointerEvents: inactivityEnabled ? 'auto' : 'none', transition: 'all 0.22s ease', marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.35)', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(31,46,35,0.07)' }}>Trigger Configuration</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '8px' }}>Inactivity Window</label>
                      <select value={timeWindow} onChange={e => setTimeWindow(e.target.value)} style={selectStyle}>
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                        <option value="180">6 months</option>
                        <option value="365">1 year</option>
                      </select>
                      <div style={{ fontSize: '10px', color: 'rgba(31,46,35,0.35)', marginTop: '6px' }}>Deliver after this many days without check-in.</div>
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '8px' }}>Check-in Frequency</label>
                      <select value={checkInFreq} onChange={e => setCheckInFreq(e.target.value)} style={selectStyle}>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Every 2 weeks</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                      <div style={{ fontSize: '10px', color: 'rgba(31,46,35,0.35)', marginTop: '6px' }}>How often you'll be reminded to confirm activity.</div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(31,46,35,0.07)', paddingTop: '20px' }}>
                    <div style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.35)', marginBottom: '16px' }}>Warning Notifications</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '8px' }}>Warn me before delivery</label>
                        <select value={warningDays} onChange={e => setWarningDays(e.target.value)} style={selectStyle}>
                          <option value="3">3 days before</option>
                          <option value="7">7 days before</option>
                          <option value="14">14 days before</option>
                          <option value="30">30 days before</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '8px' }}>Notify me via</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
                          <CheckBox checked={warningEmail} onChange={() => setWarningEmail(!warningEmail)} label="Email" />
                          <CheckBox checked={warningSMS} onChange={() => setWarningSMS(!warningSMS)} label="SMS (coming soon)" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '14px 18px', background: 'rgba(184,155,94,0.06)', border: '1px solid rgba(184,155,94,0.18)', borderRadius: '6px', fontSize: '12px', color: 'rgba(31,46,35,0.6)', lineHeight: 1.7 }}>
                  💡 <strong>How it works:</strong> We'll send you a check-in reminder based on your chosen frequency. If you don't respond within your inactivity window, your vault will be delivered to your recipients automatically.
                </div>
              </div>
            )}

            {activeTab === 'unlock' && (
              <div>
                <div style={{ background: '#fff', border: '1px solid rgba(31,46,35,0.1)', borderRadius: '6px', padding: '20px 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#1F2E23', marginBottom: '3px' }}>Enable Family Unlock Code</div>
                    <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.45)' }}>Allow a trusted person to unlock your vault using a secret code.</div>
                  </div>
                  <Toggle enabled={unlockEnabled} onChange={() => setUnlockEnabled(!unlockEnabled)} />
                </div>
                <div style={{ background: '#fff', border: `1px solid ${unlockEnabled ? 'rgba(184,155,94,0.25)' : 'rgba(31,46,35,0.08)'}`, borderRadius: '6px', padding: '24px', opacity: unlockEnabled ? 1 : 0.45, pointerEvents: unlockEnabled ? 'auto' : 'none', transition: 'all 0.22s ease', marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.35)', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(31,46,35,0.07)' }}>Unlock Code</div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '8px' }}>Secret Code *</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input type={unlockCodeVisible ? 'text' : 'password'} placeholder="Enter a secret code..." value={unlockCode} onChange={e => setUnlockCode(e.target.value)} style={{ ...inputStyle, fontFamily: unlockCodeVisible ? 'DM Sans, sans-serif' : 'monospace', letterSpacing: unlockCodeVisible ? 'normal' : '.2em' }} />
                        <button onClick={() => setUnlockCodeVisible(!unlockCodeVisible)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'rgba(31,46,35,0.4)' }}>{unlockCodeVisible ? '🙈' : '👁️'}</button>
                      </div>
                      <button onClick={generateCode} onMouseEnter={() => setHoveredBtn('gen')} onMouseLeave={() => setHoveredBtn(null)} style={{ padding: '10px 16px', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '4px', background: hoveredBtn === 'gen' ? 'rgba(184,155,94,0.1)' : 'transparent', color: '#B89B5E', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.18s ease', flexShrink: 0, whiteSpace: 'nowrap' }}>Generate</button>
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(31,46,35,0.35)', marginTop: '6px' }}>Minimum 6 characters. Share this only with your most trusted person.</div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.45)', display: 'block', marginBottom: '8px' }}>Confirm Code *</label>
                    <input type={unlockCodeVisible ? 'text' : 'password'} placeholder="Re-enter your code..." value={confirmCode} onChange={e => setConfirmCode(e.target.value)} style={{ ...inputStyle, fontFamily: unlockCodeVisible ? 'DM Sans, sans-serif' : 'monospace', letterSpacing: unlockCodeVisible ? 'normal' : '.2em' }} />
                  </div>
                  {codeError && <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '8px' }}>{codeError}</div>}
                </div>
                <div style={{ padding: '14px 18px', background: 'rgba(184,155,94,0.06)', border: '1px solid rgba(184,155,94,0.18)', borderRadius: '6px', fontSize: '12px', color: 'rgba(31,46,35,0.6)', lineHeight: 1.7 }}>
                  💡 <strong>How it works:</strong> Share this code with a trusted family member or friend. When the time comes, they enter the code on the Legacy Vault access page to unlock and receive your vault entries.
                </div>
              </div>
            )}

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(31,46,35,0.08)', display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end' }}>
              {saved && <div style={{ fontSize: '12px', color: '#27ae60', display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Settings saved</div>}
              {saveError && <div style={{ fontSize: '12px', color: '#e74c3c' }}>{saveError}</div>}
              <button onClick={handleSave} disabled={saving} onMouseEnter={() => setHoveredBtn('save')} onMouseLeave={() => setHoveredBtn(null)} style={{ padding: '12px 32px', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '4px', background: saving ? 'rgba(31,46,35,0.4)' : hoveredBtn === 'save' ? '#B89B5E' : '#1F2E23', color: hoveredBtn === 'save' ? '#1F2E23' : '#B89B5E', fontSize: '11px', letterSpacing: '.15em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.22s ease', fontWeight: 500 }}>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
