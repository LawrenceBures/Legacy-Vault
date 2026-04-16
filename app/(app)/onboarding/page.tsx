'use client'

import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase-auth'

type Step = 0 | 1 | 2 | 3 | 4 | 5 // 0=welcome, 1=tier, 2=message, 3=recipient, 4=delivery, 5=complete

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>(0)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [entryType, setEntryType] = useState<'video' | 'audio' | 'text' | null>(null)
  const [messageTitle, setMessageTitle] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientRelationship, setRecipientRelationship] = useState('')
  const [deliveryType, setDeliveryType] = useState<'inactivity' | 'unlock' | null>(null)
  const [inactivityDays, setInactivityDays] = useState('60')
  const [saving, setSaving] = useState(false)
  const [hoveredType, setHoveredType] = useState<string | null>(null)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in')
  }, [isLoaded, user, router])

  const getSupabase = useCallback(async () => {
    const token = await getToken({ template: 'supabase' })
    return createSupabaseClient(token!)
  }, [getToken])

  const handleComplete = async () => {
    if (!user) return
    setSaving(true)
    try {
      const supabase = await getSupabase()

      // Upsert profile
      await supabase.from('profiles').upsert({
        id: crypto.randomUUID(),
        clerk_id: user.id,
        email: user.emailAddresses[0].emailAddress,
        full_name: user.fullName || user.firstName || '',
        plan: selectedTier || 'starter_founder',
        has_completed_onboarding: true,
      }, { onConflict: 'clerk_id' })

      const { data: profile } = await supabase
        .from('profiles').select('id').eq('clerk_id', user.id).single()

      if (profile) {
        // Save vault entry
        if (messageTitle && entryType) {
          await supabase.from('vault_entries').insert({
            user_id: profile.id,
            title: messageTitle,
            message_content: messageContent || null,
            format: entryType,
            status: 'active',
            delivery_trigger: 'inactivity',
            inactivity_days: parseInt(inactivityDays),
          })
        }

        // Save recipient
        if (recipientName && recipientEmail) {
          await supabase.from('recipients').insert({
            user_id: profile.id,
            name: recipientName,
            email: recipientEmail,
            relationship: recipientRelationship || 'Other',
          })
        }

        // Save delivery settings
        if (deliveryType) {
          await supabase.from('delivery_settings').upsert({
            user_id: profile.id,
            inactivity_enabled: deliveryType === 'inactivity',
            time_window_days: parseInt(inactivityDays),
            unlock_enabled: deliveryType === 'unlock',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
        }
      }

      setStep(4)
    } catch (err) {
      console.error('Onboarding error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded || !user) return null

  const firstName = user.firstName || user.emailAddresses[0].emailAddress.split('@')[0]

  const entryTypes = [
    { id: 'video', icon: '🎥', label: 'Video Message', desc: 'The most powerful gift — your face, your voice, your presence.', notice: '15 sec limit until launch' },
    { id: 'audio', icon: '🎙️', label: 'Voice Recording', desc: 'Let them hear you, exactly as you are.', notice: '15 sec limit until launch' },
    { id: 'text', icon: '✍️', label: 'Written Letter', desc: 'Words that will outlast everything.', notice: null },
  ]

  const relationships = ['Spouse', 'Partner', 'Child', 'Parent', 'Sibling', 'Friend', 'Advisor', 'Other']

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    border: '1px solid rgba(31,46,35,0.15)', borderRadius: '6px',
    background: 'rgba(255,255,255,0.8)', fontSize: '14px', color: '#1F2E23',
    fontFamily: 'DM Sans, sans-serif', outline: 'none',
    boxSizing: 'border-box' as const, transition: 'border-color 0.18s ease',
  }

  const canProceed = () => {
    if (step === 1) return selectedTier !== null
    if (step === 2) return entryType !== null && (messageTitle.trim().length > 0)
    if (step === 3) return recipientName.trim().length > 0 && recipientEmail.trim().length > 0
    if (step === 4) return deliveryType !== null
    return true
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1F2E23',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background texture */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 30% 20%, rgba(184,155,94,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(184,155,94,0.05) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '13px', fontWeight: 600, color: '#B89B5E',
        letterSpacing: '.2em', textTransform: 'uppercase',
        marginBottom: '48px', opacity: 0.8,
      }}>
        Legacy Vault
      </div>

      {/* Progress dots — only show during steps 1-3 */}
      {step >= 1 && step <= 4 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
          {[2, 3, 4].map(s => (
            <div key={s} style={{
              width: s === step ? '24px' : '8px',
              height: '8px', borderRadius: '4px',
              background: s <= step ? '#B89B5E' : 'rgba(184,155,94,0.2)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      )}

      {/* STEP 0 — WELCOME */}
      {step === 0 && (
        <div style={{ textAlign: 'center', maxWidth: '520px', animation: 'fadeIn 0.8s ease' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>🔒</div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '42px', fontWeight: 300,
            color: '#F5F3EF', lineHeight: 1.2, marginBottom: '16px',
          }}>
            Welcome, <em style={{ color: '#B89B5E' }}>{firstName}.</em>
          </div>
          <div style={{
            fontSize: '17px', color: 'rgba(245,243,239,0.55)',
            lineHeight: 1.8, marginBottom: '12px',
            fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
          }}>
            The people you love most don't always get to hear everything you wanted to say.
          </div>
          <div style={{
            fontSize: '15px', color: 'rgba(245,243,239,0.4)',
            lineHeight: 1.8, marginBottom: '48px',
            fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
          }}>
            Legacy Vault changes that. In the next few minutes, you'll create your first message, choose who receives it, and decide when it gets delivered. Your legacy, preserved — exactly the way you want.
          </div>
          <button
            onClick={() => setStep(1)}
            onMouseEnter={() => setHoveredBtn('start')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: '16px 48px',
              background: hoveredBtn === 'start' ? '#B89B5E' : 'transparent',
              color: hoveredBtn === 'start' ? '#1F2E23' : '#B89B5E',
              border: '1px solid rgba(184,155,94,0.5)',
              borderRadius: '4px', fontSize: '12px',
              letterSpacing: '.2em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.25s ease', fontWeight: 500,
            }}
          >
            Begin
          </button>
          <div style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(245,243,239,0.2)', letterSpacing: '.06em' }}>
            Takes about 3 minutes
          </div>
        </div>
      )}

      {/* STEP 1 — TIER SELECTION */}
      {step === 1 && (
        <div style={{ width: '100%', maxWidth: '560px' }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(184,155,94,0.6)', marginBottom: '12px' }}>Step 1 of 4</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '34px', fontWeight: 300, color: '#F5F3EF', lineHeight: 1.2, marginBottom: '10px' }}>Choose your vault plan.</div>
            <div style={{ fontSize: '14px', color: 'rgba(245,243,239,0.4)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '8px' }}>
              You're locking in at founders pricing — grandfathered forever.
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.25)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
              🚀 Pre-launch: audio and video limited to 15 seconds until May 15, 2026
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 'starter_founder', name: 'Starter Vault', price: '$1.99/mo', badge: '✓ Available', features: ['1 vault entry', '1 recipient', 'Text messages only', '1GB storage', 'Annual check-in reminder', 'Trusted contact verification', 'Basic inactivity trigger'] },
              { id: 'basic_founder', name: 'Basic', price: '$4.99/mo', badge: '✓ Available', features: ['1 vault entry', 'Up to 3 recipients', 'Audio messages (15 sec pre-launch)', '1 AI-assisted Legacy Letter', 'Milestone Delivery (1 event)', 'Trusted contact verification', 'Annual check-in reminder', '7-day delivery warning', '2GB storage'] },
              { id: 'legacy_founder', name: 'Legacy', price: '$9.99/mo', badge: '🔥 Most popular', features: ['Unlimited vault entries', 'Unlimited recipients', 'Audio & video (15 sec pre-launch)', 'Full AI writing assistant', 'Unlimited Milestone Delivery', 'Custom inactivity window', 'Family unlock code', '3 warning notifications', 'Legal document storage', 'Custom recipient message', '25GB storage', 'Priority support'] },
              { id: 'family_founder', name: 'Family', price: '$19.99/mo', badge: '⚠️ Limited', features: ['Up to 5 individual vaults', 'Everything in Legacy per vault', 'Family Admin Dashboard', 'Family Executor role', 'Shared document storage', 'Multiple unlock codes', 'Legacy Timeline', 'Annual family check-in', '100GB shared storage'] },
              { id: 'estate_founder', name: 'Estate', price: '$49.99/mo', badge: '🚨 4 spots left', features: ['Everything in Family', 'Attorney-verified documents', 'Notarized delivery confirmation', 'Estate attorney integration', 'Dedicated account manager', 'Insurance policy management', 'Legal instruction builder', 'White-glove onboarding', 'Unlimited storage'] },
            ].map(tier => (
              <div key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                onMouseEnter={() => setHoveredType(tier.id)}
                onMouseLeave={() => setHoveredType(null)}
                style={{
                  padding: '16px 20px', border: `1px solid ${selectedTier === tier.id ? 'rgba(184,155,94,0.6)' : hoveredType === tier.id ? 'rgba(184,155,94,0.3)' : 'rgba(245,243,239,0.08)'}`,
                  borderRadius: '8px', background: selectedTier === tier.id ? 'rgba(184,155,94,0.08)' : hoveredType === tier.id ? 'rgba(184,155,94,0.04)' : 'rgba(245,243,239,0.03)',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#F5F3EF' }}>{tier.name}</div>
                      <div style={{ fontSize: '9px', padding: '2px 8px', background: 'rgba(184,155,94,0.1)', color: '#B89B5E', border: '1px solid rgba(184,155,94,0.2)', borderRadius: '20px' }}>{tier.badge}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#B89B5E', flexShrink: 0 }}>{tier.price}</div>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${selectedTier === tier.id ? '#B89B5E' : 'rgba(245,243,239,0.2)'}`, background: selectedTier === tier.id ? '#B89B5E' : 'transparent', transition: 'all 0.18s ease' }} />
                </div>
                <div style={{ maxHeight: (hoveredType === tier.id || selectedTier === tier.id) ? '300px' : '0px', overflow: 'hidden', transition: 'max-height 0.65s cubic-bezier(0.4, 0, 0.2, 1)', marginTop: (hoveredType === tier.id || selectedTier === tier.id) ? '12px' : '0px' }}>
                  <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(245,243,239,0.08)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                      {tier.features.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(184,155,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', color: '#B89B5E', flexShrink: 0, marginTop: '2px' }}>✓</div>
                          <div style={{ fontSize: '11px', color: 'rgba(245,243,239,0.55)', lineHeight: 1.4 }}>{f}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(184,155,94,0.06)', border: '1px solid rgba(184,155,94,0.15)', borderRadius: '6px', fontSize: '12px', color: 'rgba(245,243,239,0.4)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
            No credit card required now. You'll be notified at launch on May 15, 2026.
          </div>
        </div>
      )}

      {/* STEP 2 — CREATE MESSAGE */}
      {step === 5 && (
        <div style={{ width: '100%', maxWidth: '560px' }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(184,155,94,0.6)', marginBottom: '12px' }}>
              Step 2 of 4
            </div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '34px', fontWeight: 300, color: '#F5F3EF', lineHeight: 1.2, marginBottom: '10px' }}>
              What do you want to leave behind?
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(245,243,239,0.4)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.7 }}>
              Choose how you want to speak. There's no wrong answer.
            </div>
          </div>

          {/* Entry type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {entryTypes.map(type => (
              <div key={type.id}
                onClick={() => setEntryType(type.id as any)}
                onMouseEnter={() => setHoveredType(type.id)}
                onMouseLeave={() => setHoveredType(null)}
                style={{
                  padding: '18px 20px',
                  border: `1px solid ${entryType === type.id ? 'rgba(184,155,94,0.6)' : hoveredType === type.id ? 'rgba(184,155,94,0.25)' : 'rgba(245,243,239,0.08)'}`,
                  borderRadius: '8px',
                  background: entryType === type.id ? 'rgba(184,155,94,0.08)' : 'rgba(245,243,239,0.03)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '24px', flexShrink: 0 }}>{type.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#F5F3EF', marginBottom: '3px' }}>{type.label}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.35)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>{type.desc}</div>
                </div>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${entryType === type.id ? '#B89B5E' : 'rgba(245,243,239,0.2)'}`,
                  background: entryType === type.id ? '#B89B5E' : 'transparent',
                  transition: 'all 0.18s ease',
                }} />
              </div>
            ))}
          </div>

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(245,243,239,0.35)', display: 'block', marginBottom: '8px' }}>
              Give it a name
            </label>
            <input
              type="text"
              placeholder={entryType === 'video' ? 'e.g. A message for my daughter on her wedding day' : entryType === 'audio' ? 'e.g. Things I never got to say' : 'e.g. A letter to my family'}
              value={messageTitle}
              onChange={e => setMessageTitle(e.target.value)}
              style={{ ...inputStyle, background: 'rgba(245,243,239,0.05)', color: '#F5F3EF', borderColor: 'rgba(245,243,239,0.1)' }}
            />
          </div>

          {entryType === 'text' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(245,243,239,0.35)', display: 'block', marginBottom: '8px' }}>
                Your message <span style={{ color: 'rgba(245,243,239,0.2)', textTransform: 'none', letterSpacing: 0 }}>(you can add more later)</span>
              </label>
              <textarea
                placeholder="Dear..."
                value={messageContent}
                onChange={e => setMessageContent(e.target.value)}
                rows={5}
                style={{ ...inputStyle, background: 'rgba(245,243,239,0.05)', color: '#F5F3EF', borderColor: 'rgba(245,243,239,0.1)', resize: 'vertical', fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', lineHeight: 1.8 }}
              />
            </div>
          )}

          {(entryType === 'video' || entryType === 'audio') && entryType && (
            <div style={{ padding: '16px 20px', border: '1px dashed rgba(184,155,94,0.2)', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.3)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
                You'll record or upload your {entryType} from your vault after setup.
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2 — RECIPIENT */}
      {step === 2 && (
        <div style={{ width: '100%', maxWidth: '560px' }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(184,155,94,0.6)', marginBottom: '12px' }}>
              Step 3 of 4
            </div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '34px', fontWeight: 300, color: '#F5F3EF', lineHeight: 1.2, marginBottom: '10px' }}>
              Who is this for?
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(245,243,239,0.4)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.7 }}>
              Add the first person who will receive your vault. You can add more people later.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(245,243,239,0.35)', display: 'block', marginBottom: '8px' }}>Their name *</label>
              <input type="text" placeholder="e.g. Sarah" value={recipientName} onChange={e => setRecipientName(e.target.value)}
                style={{ ...inputStyle, background: 'rgba(245,243,239,0.05)', color: '#F5F3EF', borderColor: 'rgba(245,243,239,0.1)' }} />
            </div>
            <div>
              <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(245,243,239,0.35)', display: 'block', marginBottom: '8px' }}>Their email *</label>
              <input type="email" placeholder="e.g. sarah@example.com" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
                style={{ ...inputStyle, background: 'rgba(245,243,239,0.05)', color: '#F5F3EF', borderColor: 'rgba(245,243,239,0.1)' }} />
            </div>
            <div>
              <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(245,243,239,0.35)', display: 'block', marginBottom: '8px' }}>Relationship</label>
              <select value={recipientRelationship} onChange={e => setRecipientRelationship(e.target.value)}
                style={{ ...inputStyle, background: 'rgba(245,243,239,0.05)', color: recipientRelationship ? '#F5F3EF' : 'rgba(245,243,239,0.3)', borderColor: 'rgba(245,243,239,0.1)', cursor: 'pointer', appearance: 'none' as const }}>
                <option value="">Select...</option>
                {relationships.map(r => <option key={r} value={r} style={{ background: '#1F2E23', color: '#F5F3EF' }}>{r}</option>)}
              </select>
            </div>
          </div>

          {recipientName && (
            <div style={{ marginTop: '20px', padding: '14px 18px', background: 'rgba(184,155,94,0.06)', border: '1px solid rgba(184,155,94,0.15)', borderRadius: '6px', fontSize: '13px', color: 'rgba(245,243,239,0.5)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.6 }}>
              "{messageTitle || 'Your message'}" will be delivered to <span style={{ color: '#B89B5E' }}>{recipientName}</span>.
            </div>
          )}
        </div>
      )}

      {/* STEP 3 — DELIVERY */}
      {step === 3 && (
        <div style={{ width: '100%', maxWidth: '560px' }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(184,155,94,0.6)', marginBottom: '12px' }}>
              Step 4 of 4
            </div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '34px', fontWeight: 300, color: '#F5F3EF', lineHeight: 1.2, marginBottom: '10px' }}>
              When should it be opened?
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(245,243,239,0.4)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.7 }}>
              This is what makes Legacy Vault different. Choose how your vault gets delivered.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {[
              { id: 'inactivity', icon: '⏱', label: 'If I stop checking in', desc: 'Your vault delivers automatically if you go quiet for a set period of time. The most powerful option.' },
              { id: 'unlock', icon: '🔑', label: 'When someone uses a code', desc: 'A trusted person unlocks your vault manually using a secret code you share with them.' },
            ].map(option => (
              <div key={option.id}
                onClick={() => setDeliveryType(option.id as any)}
                onMouseEnter={() => setHoveredType(option.id)}
                onMouseLeave={() => setHoveredType(null)}
                style={{
                  padding: '20px',
                  border: `1px solid ${deliveryType === option.id ? 'rgba(184,155,94,0.6)' : hoveredType === option.id ? 'rgba(184,155,94,0.25)' : 'rgba(245,243,239,0.08)'}`,
                  borderRadius: '8px',
                  background: deliveryType === option.id ? 'rgba(184,155,94,0.08)' : 'rgba(245,243,239,0.03)',
                  cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '16px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>{option.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#F5F3EF', marginBottom: '5px' }}>{option.label}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.35)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif', lineHeight: 1.6 }}>{option.desc}</div>
                </div>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                  border: `2px solid ${deliveryType === option.id ? '#B89B5E' : 'rgba(245,243,239,0.2)'}`,
                  background: deliveryType === option.id ? '#B89B5E' : 'transparent',
                  transition: 'all 0.18s ease',
                }} />
              </div>
            ))}
          </div>

          {deliveryType === 'inactivity' && (
            <div style={{ padding: '16px 20px', background: 'rgba(184,155,94,0.04)', border: '1px solid rgba(184,155,94,0.15)', borderRadius: '6px' }}>
              <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(245,243,239,0.35)', display: 'block', marginBottom: '10px' }}>
                Deliver after
              </label>
              <select value={inactivityDays} onChange={e => setInactivityDays(e.target.value)}
                style={{ ...inputStyle, background: 'rgba(245,243,239,0.05)', color: '#F5F3EF', borderColor: 'rgba(245,243,239,0.1)', cursor: 'pointer', appearance: 'none' as const }}>
                <option value="30" style={{ background: '#1F2E23' }}>30 days without check-in</option>
                <option value="60" style={{ background: '#1F2E23' }}>60 days without check-in</option>
                <option value="90" style={{ background: '#1F2E23' }}>90 days without check-in</option>
                <option value="180" style={{ background: '#1F2E23' }}>6 months without check-in</option>
                <option value="365" style={{ background: '#1F2E23' }}>1 year without check-in</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* STEP 4 — COMPLETION */}
      {step === 4 && (
        <div style={{ textAlign: 'center', maxWidth: '520px' }}>
          <div style={{ fontSize: '56px', marginBottom: '28px' }}>🔒</div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '42px', fontWeight: 300,
            color: '#F5F3EF', lineHeight: 1.2, marginBottom: '16px',
          }}>
            Your vault is active.
          </div>
          <div style={{
            fontSize: '16px', color: 'rgba(245,243,239,0.45)',
            lineHeight: 1.9, marginBottom: '12px',
            fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
          }}>
            {recipientName ? `${recipientName} will receive your message` : 'Your message is safe'} — exactly when it's meant to arrive.
          </div>
          <div style={{
            fontSize: '14px', color: 'rgba(245,243,239,0.3)',
            lineHeight: 1.8, marginBottom: '48px',
            fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
          }}>
            You can add more messages, more recipients, and update your delivery settings anytime from your vault.
          </div>

          {/* Trust signals */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {['🔐 End-to-end encrypted', '👁 Private by default', '🛡 Only your recipients can access'].map(item => (
              <div key={item} style={{ fontSize: '11px', color: 'rgba(184,155,94,0.6)', letterSpacing: '.06em' }}>{item}</div>
            ))}
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            onMouseEnter={() => setHoveredBtn('dashboard')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: '16px 48px',
              background: hoveredBtn === 'dashboard' ? '#B89B5E' : 'transparent',
              color: hoveredBtn === 'dashboard' ? '#1F2E23' : '#B89B5E',
              border: '1px solid rgba(184,155,94,0.5)',
              borderRadius: '4px', fontSize: '12px',
              letterSpacing: '.2em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.25s ease', fontWeight: 500,
            }}
          >
            Enter Your Vault →
          </button>
        </div>
      )}

      {/* NAV BUTTONS — steps 1-4 */}
      {step >= 1 && step <= 4 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '560px', marginTop: '40px' }}>
          <button
            onClick={() => setStep((step - 1) as Step)}
            style={{
              padding: '12px 24px', border: '1px solid rgba(245,243,239,0.1)', borderRadius: '4px',
              background: 'transparent', color: 'rgba(245,243,239,0.3)',
              fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.18s ease',
            }}
          >
            ← Back
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <button
              onClick={() => step === 4 ? handleComplete() : setStep((step + 1) as Step)}
              disabled={!canProceed() || saving}
              onMouseEnter={() => setHoveredBtn('next')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                padding: '12px 32px',
                border: '1px solid rgba(184,155,94,0.4)', borderRadius: '4px',
                background: !canProceed() || saving ? 'rgba(184,155,94,0.1)' : hoveredBtn === 'next' ? '#B89B5E' : 'rgba(184,155,94,0.15)',
                color: !canProceed() || saving ? 'rgba(184,155,94,0.3)' : hoveredBtn === 'next' ? '#1F2E23' : '#B89B5E',
                fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase',
                cursor: canProceed() && !saving ? 'pointer' : 'not-allowed',
                transition: 'all 0.22s ease', fontWeight: 500,
              }}
            >
              {saving ? 'Saving...' : step === 4 ? 'Complete Setup →' : step === 1 ? 'Secure My Vault →' : 'Continue →'}
            </button>
            {step > 1 && step < 4 && (
              <button
                onClick={() => setStep((step + 1) as Step)}
                style={{ background: 'none', border: 'none', color: 'rgba(245,243,239,0.2)', fontSize: '11px', cursor: 'pointer', letterSpacing: '.06em' }}
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
