'use client'

import { useUser } from '@clerk/nextjs'
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

type Profile = {
  full_name: string | null
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function LetterDisplay({ entry, senderName }: { entry: Entry; senderName: string }) {
  const content = entry.message_content || ''
  const firstLetter = content.charAt(0)
  const rest = content.slice(1)

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #F5F3EF 0%, #EDE9E0 100%)',
        border: '1px solid rgba(184,155,94,0.2)',
        borderRadius: '16px',
        padding: '48px 40px',
        maxWidth: '640px',
        margin: '0 auto',
        boxShadow: '0 24px 48px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <div
        style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '18px',
          lineHeight: 2,
          color: '#1F2E23',
          whiteSpace: 'pre-wrap',
        }}
      >
        {firstLetter && (
          <span
            style={{
              float: 'left',
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '64px',
              lineHeight: 0.8,
              fontWeight: 600,
              color: '#B89B5E',
              marginRight: '8px',
              marginTop: '4px',
            }}
          >
            {firstLetter}
          </span>
        )}
        {rest}
      </div>
      <div
        style={{
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(184,155,94,0.2)',
          textAlign: 'right',
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontStyle: 'italic',
          fontSize: '16px',
          color: 'rgba(31,46,35,0.55)',
        }}
      >
        With love, {senderName}
      </div>
    </div>
  )
}

function VideoDisplay({ entry, senderName }: { entry: Entry; senderName: string }) {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#000',
          boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
        }}
      >
        {entry.media_url ? (
          <video
            controls
            style={{ width: '100%', display: 'block' }}
            src={`/api/vault/media?path=${encodeURIComponent(entry.media_url)}`}
          />
        ) : (
          <div
            style={{
              padding: '80px 40px',
              textAlign: 'center',
              color: 'rgba(245,243,239,0.4)',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            }}
          >
            Video not available
          </div>
        )}
      </div>
      <div
        style={{
          textAlign: 'center',
          marginTop: '16px',
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '15px',
          color: 'rgba(245,243,239,0.45)',
          fontStyle: 'italic',
        }}
      >
        A video message from {senderName}
      </div>
    </div>
  )
}

function AudioDisplay({ entry, senderName }: { entry: Entry; senderName: string }) {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div
        style={{
          background: 'rgba(184,155,94,0.06)',
          border: '1px solid rgba(184,155,94,0.15)',
          borderRadius: '16px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.7 }}>&#127897;</div>
        {entry.media_url ? (
          <audio
            controls
            style={{ width: '100%', maxWidth: '400px' }}
            src={`/api/vault/media?path=${encodeURIComponent(entry.media_url)}`}
          />
        ) : (
          <div
            style={{
              color: 'rgba(245,243,239,0.4)',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            }}
          >
            Audio not available
          </div>
        )}
      </div>
      <div
        style={{
          textAlign: 'center',
          marginTop: '16px',
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '15px',
          color: 'rgba(245,243,239,0.45)',
          fontStyle: 'italic',
        }}
      >
        A voice message from {senderName}
      </div>
    </div>
  )
}

export default function DeliveryPreviewPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const entryId = params.id as string

  const [entry, setEntry] = useState<Entry | null>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [assignedIds, setAssignedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [senderName, setSenderName] = useState('Someone who loves you')

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
      if (!res.ok) throw new Error(data?.error || 'Failed to load')
      setEntry(data.entry || null)
      setRecipients(data.recipients || [])
      setAssignedIds(data.assignedRecipients || [])

      // Get sender name from profile
      if (user.fullName) {
        setSenderName(user.fullName)
      } else if (user.firstName) {
        setSenderName(user.firstName)
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

  if (!isLoaded || !user) return null

  const assignedRecipients = recipients.filter((r) => assignedIds.includes(r.id))
  const recipientName =
    assignedRecipients.length > 0 ? assignedRecipients[0].name : 'Your Recipient'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1F2E23',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {/* Preview Banner */}
      <div
        style={{
          background: 'rgba(184,155,94,0.08)',
          borderBottom: '1px solid rgba(184,155,94,0.15)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#B89B5E',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: '#B89B5E',
            }}
          >
            Preview: What {recipientName} will see
          </span>
        </div>
        <a
          href={`/vault/${entryId}`}
          style={{
            fontSize: '11px',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: 'rgba(245,243,239,0.45)',
            textDecoration: 'none',
            padding: '6px 14px',
            border: '1px solid rgba(245,243,239,0.12)',
            borderRadius: '4px',
            transition: 'all 0.18s ease',
          }}
        >
          &#8592; Back to Entry
        </a>
      </div>

      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            color: 'rgba(245,243,239,0.35)',
            fontSize: '14px',
          }}
        >
          Loading preview...
        </div>
      ) : entry ? (
        <div style={{ padding: '60px 24px 80px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: '14px',
                letterSpacing: '.25em',
                textTransform: 'uppercase',
                color: 'rgba(184,155,94,0.6)',
                marginBottom: '20px',
              }}
            >
              A message left for you
            </div>
            <h1
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: '42px',
                fontWeight: 300,
                color: '#F5F3EF',
                margin: '0 0 12px',
                lineHeight: 1.2,
              }}
            >
              You have a message from {senderName}
            </h1>
            <div
              style={{
                width: '40px',
                height: '1px',
                background: '#B89B5E',
                margin: '24px auto',
              }}
            />
          </div>

          {/* Message Content */}
          {entry.format === 'text' && <LetterDisplay entry={entry} senderName={senderName} />}
          {entry.format === 'video' && <VideoDisplay entry={entry} senderName={senderName} />}
          {entry.format === 'audio' && <AudioDisplay entry={entry} senderName={senderName} />}

          {/* Metadata */}
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <div
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: '15px',
                color: 'rgba(245,243,239,0.35)',
                fontStyle: 'italic',
                marginBottom: '8px',
              }}
            >
              This message was left for you by {senderName}
            </div>
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '.1em',
                color: 'rgba(245,243,239,0.2)',
              }}
            >
              Created {formatDate(entry.created_at)}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '80px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(184,155,94,0.08)',
            }}
          >
            <div
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: '13px',
                letterSpacing: '.15em',
                textTransform: 'uppercase',
                color: 'rgba(184,155,94,0.35)',
              }}
            >
              Preserved with Legacy Vault
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            color: 'rgba(245,243,239,0.35)',
            fontSize: '14px',
          }}
        >
          Entry not found.
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
