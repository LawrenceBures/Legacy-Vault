'use client'

import { useState, useCallback } from 'react'

type Emotion = 'loved' | 'understood' | 'forgiven' | 'proud' | 'at-peace' | 'inspired'
type Tone = 'gentle' | 'heartfelt' | 'direct'
type AIStage = 'idle' | 'prompts' | 'generating' | 'results' | 'editing'

interface AIAssistantProps {
  onUseMessage: (text: string) => void
  recipientName?: string
  entryTitle?: string
}

const emotions: { id: Emotion; label: string; desc: string }[] = [
  { id: 'loved', label: 'Loved', desc: 'Deeply cared for' },
  { id: 'understood', label: 'Understood', desc: 'Truly seen and known' },
  { id: 'forgiven', label: 'Forgiven', desc: 'Free from guilt or regret' },
  { id: 'proud', label: 'Proud', desc: 'Of who they are or will become' },
  { id: 'at-peace', label: 'At Peace', desc: 'Calm and without worry' },
  { id: 'inspired', label: 'Inspired', desc: 'To live fully and boldly' },
]

const legacyThemes = [
  { icon: '🕊', label: 'If something ever happens to me...', prompt: 'Write a message that begins with what you want them to know if you\'re no longer here.' },
  { icon: '🌱', label: 'For your future...', prompt: 'Write a message about your hopes and wishes for their future.' },
  { icon: '⭐', label: 'What I\'m proud of you for...', prompt: 'Write a message expressing what makes you proud of this person.' },
  { icon: '💬', label: 'Things I never said...', prompt: 'Write a message with the things you\'ve always wanted to say but never found the right moment.' },
  { icon: '🙏', label: 'Thank you for...', prompt: 'Write a message of deep gratitude for what this person has meant to you.' },
  { icon: '💪', label: 'When life gets hard...', prompt: 'Write a message of strength and encouragement for their difficult moments.' },
]

const memoryPrompts = [
  "What's a moment with them you'll never forget?",
  "What's something they taught you, without even knowing it?",
  "What do you admire most about who they are?",
  "What do you hope they never forget about you?",
  "What's something you wish you'd said sooner?",
]

export function AIWritingAssistant({ onUseMessage, recipientName, entryTitle }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [stage, setStage] = useState<AIStage>('idle')
  const [selectedEmotions, setSelectedEmotions] = useState<Emotion[]>([])
  const [neverSaid, setNeverSaid] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [selectedTone, setSelectedTone] = useState<Tone>('heartfelt')
  const [generations, setGenerations] = useState<Record<Tone, string>>({ gentle: '', heartfelt: '', direct: '' })
  const [activeGeneration, setActiveGeneration] = useState<Tone>('heartfelt')
  const [editedText, setEditedText] = useState('')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [currentMemoryPrompt, setCurrentMemoryPrompt] = useState(0)
  const [continueText, setContinueText] = useState('')
  const [isShifting, setIsShifting] = useState(false)

  const toggleEmotion = (emotion: Emotion) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion].slice(-3)
    )
  }

  const generateMessages = useCallback(async () => {
    setStage('generating')
    try {
      const emotionLabels = selectedEmotions.map(e => emotions.find(em => em.id === e)?.label).join(', ')
      const themeContext = selectedTheme ? `Theme: ${selectedTheme}. ` : ''
      const prompt = `${themeContext}Write a deeply personal legacy message${recipientName ? ` to ${recipientName}` : ''}.
      
The person writing this wants them to feel: ${emotionLabels || 'loved and understood'}.
${neverSaid ? `The most important thing they want to say (that they've never said before): "${neverSaid}"` : ''}
${entryTitle ? `The message is titled: "${entryTitle}"` : ''}

Write THREE versions of this message in different tones. Format your response EXACTLY as JSON with no other text:
{
  "gentle": "...",
  "heartfelt": "...", 
  "direct": "..."
}

Each version should:
- Feel deeply personal and human, not like AI
- Be 3-5 paragraphs
- Start with "Dear [name]" if a name was provided
- Gentle: soft, tender, comforting
- Heartfelt: emotional, vulnerable, open
- Direct: clear, strong, no-nonsense but loving
- NEVER sound generic or template-like`

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      console.log('AI raw response:', text.slice(0, 500))
      const clean = text.replace(/```json|```/g, '').trim()
      const jsonMatch = clean.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found')
      const parsed = JSON.parse(jsonMatch[0])

      setGenerations(parsed)
      setEditedText(parsed.heartfelt)
      setActiveGeneration('heartfelt')
      setStage('results')
    } catch (err) {
      console.error('AI generation error:', err)
      setStage('prompts')
    }
  }, [selectedEmotions, neverSaid, selectedTheme, recipientName, entryTitle])

  const shiftTone = useCallback(async (shift: string) => {
    setIsShifting(true)
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Take this legacy message and rewrite it to be ${shift}. Keep the core meaning and personal details exactly the same — only shift the tone and style. Return ONLY the rewritten message, no preamble:\n\n${editedText}`,
          }],
        }),
      })
      const data = await response.json()
      const shifted = data.content?.[0]?.text || editedText
      setEditedText(shifted)
    } catch (err) {
      console.error('Tone shift error:', err)
    } finally {
      setIsShifting(false)
    }
  }, [editedText])

  const continueThought = useCallback(async () => {
    if (!continueText.trim()) return
    setIsShifting(true)
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Complete this thought in a deeply personal, emotional way as if you were the person writing it. Continue from exactly where they left off — don't rewrite what they wrote, just continue it naturally. Return ONLY the continuation (not the original text):\n\n"${continueText}"`,
          }],
        }),
      })
      const data = await response.json()
      const continuation = data.content?.[0]?.text || ''
      setEditedText(continueText + ' ' + continuation)
      setContinueText('')
      setStage('results')
    } catch (err) {
      console.error('Continue thought error:', err)
    } finally {
      setIsShifting(false)
    }
  }, [continueText])

  const reset = () => {
    setStage('idle')
    setSelectedEmotions([])
    setNeverSaid('')
    setSelectedTheme(null)
    setGenerations({ gentle: '', heartfelt: '', direct: '' })
    setEditedText('')
    setContinueText('')
  }

  if (!isOpen) {
    return (
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => { setIsOpen(true); setStage('prompts') }}
          onMouseEnter={() => setHoveredBtn('open')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            width: '100%', padding: '14px 20px',
            border: `1px solid ${hoveredBtn === 'open' ? 'rgba(184,155,94,0.5)' : 'rgba(184,155,94,0.2)'}`,
            borderRadius: '8px', background: hoveredBtn === 'open' ? 'rgba(184,155,94,0.08)' : 'rgba(184,155,94,0.04)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: '20px' }}>✨</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#B89B5E', marginBottom: '2px' }}>Help me say this</div>
            <div style={{ fontSize: '11px', color: 'rgba(31,46,35,0.65)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
              Let AI guide you toward the words that matter most
            </div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgba(184,155,94,0.4)' }}>→</div>
        </button>
      </div>
    )
  }

  return (
    <div style={{
      border: '1px solid rgba(184,155,94,0.25)', borderRadius: '10px',
      background: '#B89B5E', marginBottom: '20px', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid rgba(31,46,35,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>✨</span>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1F2E23' }}>Help me say this</div>
            <div style={{ fontSize: '10px', color: 'rgba(31,46,35,0.65)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
              Guided by Legacy Vault AI
            </div>
          </div>
        </div>
        <button onClick={() => { setIsOpen(false); reset() }}
          style={{ background: 'none', border: 'none', color: 'rgba(31,46,35,0.65)', cursor: 'pointer', fontSize: '18px' }}>×</button>
      </div>

      <div style={{ padding: '20px' }}>

        {/* STAGE: PROMPTS */}
        {stage === 'prompts' && (
          <div>
            {/* Legacy Themes */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.65)', marginBottom: '12px' }}>
                Start with a theme
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {legacyThemes.map(theme => (
                  <div key={theme.label}
                    onClick={() => setSelectedTheme(selectedTheme === theme.label ? null : theme.label)}
                    style={{
                      padding: '10px 12px', borderRadius: '6px', cursor: 'pointer',
                      border: `1px solid ${selectedTheme === theme.label ? 'rgba(184,155,94,0.5)' : 'rgba(245,243,239,0.08)'}`,
                      background: selectedTheme === theme.label ? '#1F2E23' : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{theme.icon}</div>
                    <div style={{ fontSize: '11px', color: '#1F2E23', lineHeight: 1.4 }}>{theme.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotion selector */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.65)', marginBottom: '4px' }}>
                What do you want them to feel?
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(31,46,35,0.55)', marginBottom: '12px', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
                Choose up to 3
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {emotions.map(emotion => (
                  <div key={emotion.id}
                    onClick={() => toggleEmotion(emotion.id)}
                    style={{
                      padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', textAlign: 'center',
                      border: `1px solid ${selectedEmotions.includes(emotion.id) ? 'rgba(184,155,94,0.5)' : 'rgba(245,243,239,0.08)'}`,
                      background: selectedEmotions.includes(emotion.id) ? 'rgba(184,155,94,0.12)' : 'rgba(245,243,239,0.03)',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 500, color: selectedEmotions.includes(emotion.id) ? '#B89B5E' : 'rgba(245,243,239,0.6)', marginBottom: '2px' }}>{emotion.label}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(31,46,35,0.6)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>{emotion.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Memory prompt */}
            <div style={{ marginBottom: '20px', padding: '14px 16px', background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(245,243,239,0.07)', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#1F2E23', marginBottom: '8px', letterSpacing: '.02em', fontWeight: 600 }}>
                💭 {memoryPrompts[currentMemoryPrompt]}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setCurrentMemoryPrompt((currentMemoryPrompt + 1) % memoryPrompts.length)}
                  style={{ background: 'none', border: 'none', color: 'rgba(31,46,35,0.55)', fontSize: '10px', cursor: 'pointer', letterSpacing: '.06em' }}>
                  Another prompt →
                </button>
              </div>
            </div>

            {/* The magic question */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.65)', display: 'block', marginBottom: '6px' }}>
                What's one thing you've never said — or want to make sure they know?
              </label>
              <div style={{ fontSize: '11px', color: 'rgba(31,46,35,0.55)', marginBottom: '10px', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
                This is where the real message lives.
              </div>
              <textarea
                value={neverSaid}
                onChange={e => setNeverSaid(e.target.value)}
                placeholder="Write anything — even a few words is enough..."
                rows={3}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1px solid rgba(31,46,35,0.2)', borderRadius: '6px',
                  background: 'rgba(255,255,255,0.35)', color: '#1F2E23',
                  fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', lineHeight: 1.7,
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const,
                }}
              />
            </div>

            {/* Continue my thought */}
            <div style={{ marginBottom: '24px', padding: '14px 16px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(245,243,239,0.06)', borderRadius: '8px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.6)', marginBottom: '8px' }}>
                Or start a thought and let AI finish it
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={continueText}
                  onChange={e => setContinueText(e.target.value)}
                  placeholder="I just want you to know..."
                  style={{
                    flex: 1, padding: '10px 12px',
                    border: '1px solid rgba(31,46,35,0.2)', borderRadius: '6px',
                    background: 'rgba(255,255,255,0.3)', color: '#1F2E23',
                    fontFamily: 'Cormorant Garamond, serif', fontSize: '14px',
                    outline: 'none', boxSizing: 'border-box' as const,
                  }}
                />
                <button
                  onClick={continueThought}
                  disabled={!continueText.trim() || isShifting}
                  style={{
                    padding: '10px 14px', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '6px',
                    background: 'rgba(184,155,94,0.1)', color: '#B89B5E',
                    fontSize: '11px', cursor: continueText.trim() ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap', transition: 'all 0.18s',
                  }}
                >
                  {isShifting ? '...' : 'Finish →'}
                </button>
              </div>
            </div>

            <button
              onClick={generateMessages}
              onMouseEnter={() => setHoveredBtn('generate')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                width: '100%', padding: '14px',
                border: '1px solid rgba(184,155,94,0.4)', borderRadius: '6px',
                background: hoveredBtn === 'generate' ? '#F5F3EF' : '#1F2E23',
                color: hoveredBtn === 'generate' ? '#1F2E23' : '#F5F3EF',
                fontSize: '12px', letterSpacing: '.12em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.22s ease', fontWeight: 500,
              }}
            >
              Write my message →
            </button>
          </div>
        )}

        {/* STAGE: GENERATING */}
        {stage === 'generating' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px', animation: 'pulse 2s infinite' }}>✨</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#1F2E23', marginBottom: '8px', fontWeight: 300 }}>
              Finding the right words...
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(31,46,35,0.65)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
              This takes a moment. Good things do.
            </div>
          </div>
        )}

        {/* STAGE: RESULTS */}
        {stage === 'results' && (
          <div>
            {/* Tone selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {(['gentle', 'heartfelt', 'direct'] as Tone[]).map(tone => (
                <button key={tone}
                  onClick={() => { setActiveGeneration(tone); setEditedText(generations[tone]) }}
                  style={{
                    flex: 1, padding: '8px', border: `2px solid ${activeGeneration === tone ? '#1F2E23' : 'rgba(31,46,35,0.3)'}`,
                    borderRadius: '6px', background: activeGeneration === tone ? '#1F2E23' : 'rgba(255,255,255,0.4)',
                    color: activeGeneration === tone ? '#B89B5E' : '#1F2E23', fontWeight: 600,
                    fontSize: '11px', letterSpacing: '.08em', textTransform: 'capitalize',
                    cursor: 'pointer', transition: 'all 0.18s',
                  }}
                >
                  {tone}
                </button>
              ))}
            </div>

            {/* Editable message */}
            <textarea
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              rows={10}
              style={{
                width: '100%', padding: '16px',
                border: '1px solid rgba(31,46,35,0.2)', borderRadius: '6px',
                background: 'rgba(255,255,255,0.3)', color: '#1F2E23',
                fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', lineHeight: 1.8,
                outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const,
                marginBottom: '12px',
              }}
            />

            {/* Tone shifter */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(31,46,35,0.6)', marginBottom: '8px' }}>
                Tone Shifter
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['more emotional', 'more simple', 'more poetic', 'more like me'].map(shift => (
                  <button key={shift}
                    onClick={() => shiftTone(shift)}
                    disabled={isShifting}
                    style={{
                      padding: '6px 12px', border: '1px solid rgba(31,46,35,0.2)', borderRadius: '20px',
                      background: 'rgba(255,255,255,0.3)', color: 'rgba(31,46,35,0.75)',
                      fontSize: '10px', letterSpacing: '.06em', cursor: isShifting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.18s', textTransform: 'capitalize',
                    }}
                  >
                    {isShifting ? '...' : shift}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={reset}
                style={{ padding: '10px 16px', border: '1px solid rgba(31,46,35,0.2)', borderRadius: '6px', background: 'transparent', color: 'rgba(31,46,35,0.65)', fontSize: '11px', letterSpacing: '.08em', cursor: 'pointer' }}>
                Start over
              </button>
              <button
                onClick={() => { onUseMessage(editedText); setIsOpen(false); reset() }}
                onMouseEnter={() => setHoveredBtn('use')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  flex: 1, padding: '10px 16px', border: '1px solid rgba(184,155,94,0.4)', borderRadius: '6px',
                  background: hoveredBtn === 'use' ? '#B89B5E' : 'rgba(184,155,94,0.12)',
                  color: hoveredBtn === 'use' ? '#1F2E23' : '#B89B5E',
                  fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500,
                }}
              >
                Use this message →
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}
