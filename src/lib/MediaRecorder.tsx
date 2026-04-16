'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

type RecorderType = 'video' | 'audio'
type RecorderState = 'idle' | 'requesting' | 'ready' | 'recording' | 'stopped' | 'error'

interface MediaRecorderProps {
  type: RecorderType
  onRecordingComplete: (blob: Blob, url: string) => void
  onCancel?: () => void
}

export function VaultMediaRecorder({ type, onRecordingComplete, onCancel }: MediaRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle')
  const [error, setError] = useState('')
  const [duration, setDuration] = useState(0)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<globalThis.MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const blobRef = useRef<Blob | null>(null)
  const previewUrlRef = useRef<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    streamRef.current = null
    mediaRecorderRef.current = null
  }, [])

  useEffect(() => () => cleanup(), [cleanup])

  const drawWaveform = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw)
      analyserRef.current!.getByteTimeDomainData(dataArray)
      ctx.fillStyle = 'rgba(31,46,35,0.97)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 2
      ctx.strokeStyle = '#B89B5E'
      ctx.beginPath()
      const sliceWidth = canvas.width / bufferLength
      let x = 0
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
        x += sliceWidth
      }
      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }
    draw()
  }, [])

  const requestPermissions = async () => {
    setState('requesting')
    setError('')
    try {
      const constraints = type === 'video'
        ? { video: { width: 1280, height: 720 }, audio: true }
        : { audio: true }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (type === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        await videoRef.current.play()
      }

      if (type === 'audio') {
        const audioCtx = new AudioContext()
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 2048
        source.connect(analyser)
        analyserRef.current = analyser
        drawWaveform()
      }

      setState('ready')
    } catch (err: any) {
      setError(err.name === 'NotAllowedError'
        ? 'Permission denied. Please allow camera/microphone access and try again.'
        : 'Could not access your camera or microphone. Please check your device settings.')
      setState('error')
    }
  }

  const startRecording = () => {
    if (!streamRef.current) return
    chunksRef.current = []
    setDuration(0)

    const mimeType = type === 'video'
      ? (globalThis.MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm')
      : (globalThis.MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm')

    const recorder = new globalThis.MediaRecorder(streamRef.current, { mimeType })
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType })
      blobRef.current = blob
      const url = URL.createObjectURL(blob)
      previewUrlRef.current = url

      if (type === 'video' && videoRef.current) {
        videoRef.current.srcObject = null
        videoRef.current.src = url
        videoRef.current.muted = false
        videoRef.current.controls = true
      }

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      setState('stopped')
    }

    recorder.start(100)
    setState('recording')

    timerRef.current = setInterval(() => {
      setDuration(d => {
        if (d >= 14) {
          // Auto stop at 15 seconds pre-launch
          stopRecording()
          return 15
        }
        return d + 1
      })
    }, 1000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
  }

  const reRecord = () => {
    blobRef.current = null
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
    if (type === 'video' && videoRef.current) {
      videoRef.current.src = ''
      videoRef.current.controls = false
    }
    setDuration(0)
    setState('idle')
  }

  const useRecording = () => {
    if (blobRef.current && previewUrlRef.current) {
      onRecordingComplete(blobRef.current, previewUrlRef.current)
    }
  }

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const btnStyle = (id: string, variant: 'primary' | 'secondary' | 'danger' = 'secondary') => ({
    padding: '11px 24px',
    border: variant === 'primary' ? 'none' : variant === 'danger' ? '1px solid rgba(231,76,60,0.3)' : '1px solid rgba(184,155,94,0.3)',
    borderRadius: '4px',
    background: hoveredBtn === id
      ? (variant === 'primary' ? '#cdb47a' : variant === 'danger' ? 'rgba(231,76,60,0.1)' : 'rgba(184,155,94,0.15)')
      : (variant === 'primary' ? '#B89B5E' : 'transparent'),
    color: variant === 'primary' ? '#1F2E23' : variant === 'danger' ? '#e74c3c' : '#B89B5E',
    fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase' as const,
    cursor: 'pointer', transition: 'all 0.18s', fontWeight: variant === 'primary' ? 700 : 500,
  })

  return (
    <div style={{ background: '#1F2E23', border: '1px solid rgba(184,155,94,0.2)', borderRadius: '10px', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(184,155,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>{type === 'video' ? '🎥' : '🎙️'}</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F3EF' }}>{type === 'video' ? 'Video Recorder' : 'Audio Recorder'}</div>
            <div style={{ fontSize: '10px', color: 'rgba(245,243,239,0.35)', letterSpacing: '.04em' }}>
              {state === 'recording' ? `Recording ${formatDuration(duration)}` : state === 'stopped' ? `Recorded ${formatDuration(duration)}` : 'Ready to record'}
            </div>
          </div>
        </div>
        {state === 'recording' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e74c3c', animation: 'pulse 1s infinite' }} />
            <span style={{ fontSize: '12px', color: '#e74c3c', fontWeight: 600 }}>REC {formatDuration(duration)}</span>
          </div>
        )}
        {onCancel && (
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'rgba(245,243,239,0.3)', cursor: 'pointer', fontSize: '18px' }}>×</button>
        )}
      </div>

      {/* Preview area */}
      <div style={{ padding: '20px' }}>
        {type === 'video' && (
          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#0a1510', marginBottom: '16px', aspectRatio: '16/9' }}>
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} playsInline />
            {(state === 'idle' || state === 'error') && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '40px' }}>🎥</div>
                <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.3)' }}>Camera preview will appear here</div>
              </div>
            )}
          </div>
        )}

        {type === 'audio' && (
          <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(31,46,35,0.97)', border: '1px solid rgba(184,155,94,0.1)' }}>
            <canvas ref={canvasRef} width={600} height={120} style={{ width: '100%', height: '120px', display: 'block' }} />
            {(state === 'idle' || state === 'error') && (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎙️</div>
                <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.3)' }}>Waveform will appear when recording</div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div style={{ padding: '12px 16px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '6px', fontSize: '13px', color: '#e74c3c', marginBottom: '16px', lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {state === 'idle' && (
            <button onClick={requestPermissions} onMouseEnter={() => setHoveredBtn('start')} onMouseLeave={() => setHoveredBtn(null)} style={btnStyle('start', 'primary')}>
              {type === 'video' ? '🎥 Enable Camera & Record' : '🎙️ Enable Microphone & Record'}
            </button>
          )}

          {state === 'requesting' && (
            <div style={{ fontSize: '13px', color: 'rgba(245,243,239,0.4)', padding: '11px 0' }}>Requesting permissions...</div>
          )}

          {state === 'ready' && (
            <button onClick={startRecording} onMouseEnter={() => setHoveredBtn('rec')} onMouseLeave={() => setHoveredBtn(null)} style={btnStyle('rec', 'primary')}>
              ● Start Recording
            </button>
          )}

          {state === 'recording' && (
            <button onClick={stopRecording} onMouseEnter={() => setHoveredBtn('stop')} onMouseLeave={() => setHoveredBtn(null)} style={btnStyle('stop', 'danger')}>
              ■ Stop Recording
            </button>
          )}

          {state === 'stopped' && (
            <>
              <button onClick={reRecord} onMouseEnter={() => setHoveredBtn('re')} onMouseLeave={() => setHoveredBtn(null)} style={btnStyle('re')}>
                ↺ Re-record
              </button>
              <button onClick={useRecording} onMouseEnter={() => setHoveredBtn('use')} onMouseLeave={() => setHoveredBtn(null)} style={btnStyle('use', 'primary')}>
                ✓ Use This Recording
              </button>
            </>
          )}

          {state === 'error' && (
            <button onClick={() => setState('idle')} onMouseEnter={() => setHoveredBtn('retry')} onMouseLeave={() => setHoveredBtn(null)} style={btnStyle('retry')}>
              Try Again
            </button>
          )}
        </div>

        {state === 'stopped' && (
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: 'rgba(245,243,239,0.25)' }}>
            Recording saved locally · Will upload when you save your entry
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  )
}
