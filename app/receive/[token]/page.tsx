'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

type Entry = {
  id: string
  title: string
  format: string
  message_content: string | null
  media_url: string | null
  created_at: string
  sender_name?: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function LetterContent({ entry, senderName }: { entry: Entry; senderName: string }) {
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

function VideoContent({ entry, senderName }: { entry: Entry; senderName: string }) {
  const [unmuted, setUnmuted] = useState(false)

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#000',
          boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
          position: 'relative',
        }}
      >
        {entry.media_url ? (
          <>
            <video
              autoPlay
              muted={!unmuted}
              controls={unmuted}
              playsInline
              onClick={() => setUnmuted(true)}
              style={{ width: '100%', display: 'block', cursor: unmuted ? 'default' : 'pointer' }}
              src={`/api/vault/media?path=${encodeURIComponent(entry.media_url)}`}
            />
            {!unmuted && (
              <div
                onClick={() => setUnmuted(true)}
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(184,155,94,0.9)',
                  color: '#1F2E23',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '.05em',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Tap to unmute
              </div>
            )}
          </>
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

function AudioContent({ entry, senderName }: { entry: Entry; senderName: string }) {
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

function ReceivePageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const token = params.token as string
  const entryId = searchParams.get('entry')

  const [entry, setEntry] = useState<Entry | null>(null)
  const [senderName, setSenderName] = useState('Someone who loves you')
  const [loading, setLoading] = useState(true)
  const [opened, setOpened] = useState(!entryId)
  const [vaultAnimating, setVaultAnimating] = useState(!!entryId)

  useEffect(() => {
    if (!entryId) return // Skip animation if no entry param
    // Vault opening animation: 3 seconds
    const timer = setTimeout(() => {
      setVaultAnimating(false)
      setTimeout(() => setOpened(true), 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [entryId])

  useEffect(() => {
    if (!entryId) {
      setLoading(false)
      return
    }

    async function fetchEntry() {
      try {
        const res = await fetch(`/api/receive?entry=${entryId}&token=${token}`)
        const data = await res.json()
        if (res.ok && data.entry) {
          setEntry(data.entry)
          setSenderName(data.senderName || 'Someone who loves you')
        }
      } catch (err) {
        console.error('Error loading message:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEntry()
  }, [entryId, token])

  // Vault opening animation
  if (vaultAnimating) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#1F2E23',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            marginBottom: '32px',
          }}
        >
          {/* Vault door */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '16px',
              border: '2px solid #B89B5E',
              background: 'rgba(184,155,94,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'vaultOpen 3s ease-in-out forwards',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid #B89B5E',
                background: 'rgba(184,155,94,0.15)',
                animation: 'vaultGlow 3s ease-in-out forwards',
              }}
            />
          </div>
          {/* Gold light spill */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(184,155,94,0.15) 0%, transparent 70%)',
              animation: 'lightSpill 3s ease-in-out forwards',
              pointerEvents: 'none',
            }}
          />
        </div>
        <div
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '18px',
            color: 'rgba(245,243,239,0.5)',
            fontStyle: 'italic',
            animation: 'fadeIn 1.5s ease-in forwards',
          }}
        >
          Opening your vault...
        </div>
        <style>{`
          @keyframes vaultOpen {
            0% { transform: perspective(600px) rotateY(0deg); box-shadow: 0 0 0 rgba(184,155,94,0); }
            50% { transform: perspective(600px) rotateY(0deg); box-shadow: 0 0 20px rgba(184,155,94,0.2); }
            100% { transform: perspective(600px) rotateY(-45deg); box-shadow: 0 0 60px rgba(184,155,94,0.4); }
          }
          @keyframes vaultGlow {
            0% { background: rgba(184,155,94,0.15); box-shadow: 0 0 0 rgba(184,155,94,0); }
            50% { background: rgba(184,155,94,0.3); box-shadow: 0 0 15px rgba(184,155,94,0.3); }
            100% { background: #B89B5E; box-shadow: 0 0 40px rgba(184,155,94,0.6); }
          }
          @keyframes lightSpill {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            50% { opacity: 0.3; }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1.5); }
          }
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  // Main content after animation
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1F2E23',
        fontFamily: 'DM Sans, sans-serif',
        opacity: opened ? 1 : 0,
        transition: 'opacity 0.8s ease-in',
      }}
    >
      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            color: 'rgba(245,243,239,0.35)',
            fontSize: '14px',
          }}
        >
          Loading your message...
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
          {entry.format === 'text' && <LetterContent entry={entry} senderName={senderName} />}
          {entry.format === 'video' && <VideoContent entry={entry} senderName={senderName} />}
          {entry.format === 'audio' && <AudioContent entry={entry} senderName={senderName} />}

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

          {/* Download Button */}
          {entry.media_url && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <a
                href={`/api/vault/media?path=${encodeURIComponent(entry.media_url)}`}
                download
                style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  border: '1px solid rgba(184,155,94,0.3)',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: '#B89B5E',
                  fontSize: '11px',
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.18s ease',
                }}
              >
                Download Message
              </a>
            </div>
          )}

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
                marginBottom: '28px',
              }}
            >
              Preserved with Legacy Vault
            </div>

            {/* Growth Loop CTA */}
            <a
              href="/"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                background: '#B89B5E',
                color: '#1F2E23',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: '4px',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'all 0.18s ease',
              }}
            >
              Create your own vault
            </a>
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(245,243,239,0.2)',
                marginTop: '12px',
              }}
            >
              Leave messages for the people you love
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            color: 'rgba(245,243,239,0.5)',
            fontSize: '16px',
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            textAlign: 'center',
            padding: '40px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>&#128274;</div>
          <div style={{ fontSize: '22px', marginBottom: '8px', color: '#F5F3EF' }}>
            Message not found
          </div>
          <div style={{ color: 'rgba(245,243,239,0.35)', fontSize: '14px' }}>
            This message may have been removed or the link is invalid.
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReceivePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: '#1F2E23',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(245,243,239,0.35)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          }}
        >
          Loading...
        </div>
      }
    >
      <ReceivePageContent />
    </Suspense>
  )
}
