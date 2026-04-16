'use client'

import { useState, useCallback } from 'react'

interface VideoAssistProps {
  entryTitle?: string
  recipientName?: string
  onClose: () => void
}

const TALKING_OUTLINES = [
  { icon: '💛', prompt: 'Start with how much they mean to you' },
  { icon: '🌱', prompt: 'Share a memory you both cherish' },
  { icon: '⭐', prompt: 'Tell them what you admire about who they are' },
  { icon: '🙏', prompt: 'Express what you hope for their future' },
  { icon: '💬', prompt: 'Say the thing you always meant to say' },
  { icon: '🔒', prompt: 'End with what they should always remember' },
]

export function VideoAssist({ entryTitle, recipientName, onClose }: VideoAssistProps) {
  const [generating, setGenerating] = useState(false)
  const [outline, setOutline] = useState<string[]>([])
  const [generated, setGenerated] = useState(false)

  const generateOutline = useCallback(async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Create a short video message talking outline for someone recording a personal legacy message.
${recipientName ? `They are speaking to: ${recipientName}` : ''}
${entryTitle ? `The message is titled: "${entryTitle}"` : ''}

Generate 5-6 short, emotionally resonant talking points. Each should be a single sentence starting with an action verb. Make them feel personal and human, not generic. Format as a JSON array of strings only, no other text:
["point 1", "point 2", ...]`
          }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const match = text.match(/\[[\s\S]*\]/)
      if (match) {
        const points = JSON.parse(match[0])
        setOutline(points)
        setGenerated(true)
      }
    } catch (err) {
      console.error('Video assist error:', err)
      // Fall back to default outline
      setOutline(TALKING_OUTLINES.map(t => t.prompt))
      setGenerated(true)
    } finally {
      setGenerating(false)
    }
  }, [entryTitle, recipientName])

  return (
    <div style={{
      background: '#1F2E23', border: '1px solid rgba(184,155,94,0.2)',
      borderRadius: '10px', padding: '1.5rem', marginBottom: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>🎬</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F3EF' }}>Give me something to say</div>
            <div style={{ fontSize: '11px', color: 'rgba(245,243,239,0.35)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>AI-generated talking points for your video</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(245,243,239,0.3)', cursor: 'pointer', fontSize: '18px' }}>×</button>
      </div>

      {!generated ? (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '11px', color: 'rgba(245,243,239,0.4)', marginBottom: '12px', lineHeight: 1.6 }}>
              Not sure what to say on camera? We'll generate a personalized outline to guide you through your message — so you can focus on being present, not perfect.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
              {TALKING_OUTLINES.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(245,243,239,0.03)', borderRadius: '6px', border: '1px solid rgba(245,243,239,0.06)' }}>
                  <span style={{ fontSize: '14px' }}>{item.icon}</span>
                  <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.5)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>{item.prompt}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={generateOutline} disabled={generating}
            style={{
              width: '100%', padding: '12px', border: 'none', borderRadius: '6px',
              background: generating ? 'rgba(184,155,94,0.2)' : '#B89B5E',
              color: generating ? 'rgba(31,46,35,0.4)' : '#1F2E23',
              fontSize: '12px', letterSpacing: '.12em', textTransform: 'uppercase',
              cursor: generating ? 'not-allowed' : 'pointer', fontWeight: 700, transition: 'all 0.2s',
            }}>
            {generating ? 'Generating your outline...' : '✨ Generate my talking points →'}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(184,155,94,0.6)', marginBottom: '1rem' }}>
            Your talking points
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
            {outline.map((point, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 14px', background: 'rgba(184,155,94,0.06)', borderRadius: '6px', border: '1px solid rgba(184,155,94,0.12)' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(184,155,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#B89B5E', flexShrink: 0, marginTop: '1px', fontWeight: 600 }}>{i + 1}</div>
                <div style={{ fontSize: '13px', color: 'rgba(245,243,239,0.75)', lineHeight: 1.5 }}>{point}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={generateOutline} disabled={generating}
              style={{ flex: 1, padding: '10px', border: '1px solid rgba(245,243,239,0.1)', borderRadius: '6px', background: 'transparent', color: 'rgba(245,243,239,0.4)', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Regenerate
            </button>
            <button onClick={onClose}
              style={{ flex: 2, padding: '10px', border: 'none', borderRadius: '6px', background: '#B89B5E', color: '#1F2E23', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700 }}>
              Got it — start recording →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
