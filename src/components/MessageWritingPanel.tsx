'use client';

import { useState, useRef } from 'react';

interface MessageWritingPanelProps {
  value: string;
  onChange: (value: string) => void;
  recipientName?: string;
  maxLength?: number;
}

const PROMPT_CHIPS = [
  { label: 'A memory I want you to keep', text: "There's a moment I want you to always remember — " },
  { label: 'What I love about you', text: 'What I love most about you is ' },
  { label: 'What I hope for you', text: 'More than anything, I hope you ' },
];

export default function MessageWritingPanel({
  value,
  onChange,
  recipientName,
  maxLength = 2000,
}: MessageWritingPanelProps) {
  const [focused, setFocused] = useState(false);
  const [activeChip, setActiveChip] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = maxLength - value.length;
  const isNearLimit = remaining <= 200;
  const isAtLimit = remaining <= 0;

  const guidanceText = recipientName
    ? `If this were the last thing ${recipientName} heard from you, what would you want them to know?`
    : 'If this were the last thing they heard from you, what would you want them to know?';

  function injectPrompt(index: number, text: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const separator = before.length > 0 && !before.endsWith('\n') ? '\n\n' : '';
    const injected = before + separator + text + after;

    if (injected.length > maxLength) return;

    onChange(injected);
    setActiveChip(index);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = (before + separator + text).length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <div style={styles.wrapper}>

      {/* Emotional guidance prompt */}
      <div style={styles.helperRow}>
        <span style={styles.helperIcon}>✦</span>
        <p style={styles.helperText}>{guidanceText}</p>
      </div>

      {/* Prompt chips */}
      <div style={styles.chipsRow}>
        {PROMPT_CHIPS.map((chip, i) => (
          <button
            key={i}
            type="button"
            onClick={() => injectPrompt(i, chip.text)}
            style={{
              ...styles.chip,
              ...(activeChip === i ? styles.chipActive : {}),
            }}
            onMouseEnter={e => {
              if (activeChip !== i) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#B89B5E';
                (e.currentTarget as HTMLButtonElement).style.color = '#B89B5E';
              }
            }}
            onMouseLeave={e => {
              if (activeChip !== i) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(184,155,94,0.3)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(245,243,239,0.6)';
              }
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div
        style={{
          ...styles.textareaWrapper,
          boxShadow: focused
            ? '0 0 0 1.5px #B89B5E, 0 4px 14px rgba(31,46,35,0.06)'
            : '0 1px 6px rgba(31,46,35,0.04)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => {
            if (e.target.value.length <= maxLength) {
              onChange(e.target.value);
            }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Start with a memory, a truth, or something you never want left unsaid."
          rows={10}
          style={styles.textarea}
          aria-label="Message content"
        />
      </div>

      {/* Character count */}
      <div style={styles.footer}>
        <span
          style={{
            ...styles.charCount,
            color: isAtLimit
              ? '#e57373'
              : isNearLimit
              ? '#C2A468'
              : 'rgba(31,46,35,0.35)',
          }}
        >
          {remaining.toLocaleString()} character{remaining !== 1 ? 's' : ''} remaining
        </span>
      </div>

    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    fontFamily: '"DM Sans", sans-serif',
  },

  helperRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },

  helperIcon: {
    color: '#B89B5E',
    fontSize: '13px',
    lineHeight: '1.6',
    flexShrink: 0,
    marginTop: '2px',
  },

  helperText: {
    margin: 0,
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: '17px',
    fontWeight: 400,
    fontStyle: 'italic',
    marginBottom: '2px',
    color: '#1F2E23',
    letterSpacing: '0.01em',
    lineHeight: 1.5,
    opacity: 0.92,
  },

  chipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },

  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: '999px',
    border: '1px solid rgba(184,155,94,0.3)',
    background: 'transparent',
    color: 'rgba(245,243,239,0.6)',
    fontSize: '12px',
    fontFamily: '"DM Sans", sans-serif',
    letterSpacing: '0.02em',
    cursor: 'pointer',
    transition: 'border-color 0.2s, color 0.2s, background 0.2s',
    userSelect: 'none',
  },

  chipActive: {
    borderColor: '#B89B5E',
    color: '#B89B5E',
    background: 'rgba(184,155,94,0.08)',
  },

  textareaWrapper: {
    borderRadius: '12px',
    border: '1px solid rgba(184,155,94,0.2)',
    background: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s',
  },

  textarea: {
    width: '100%',
    minHeight: '220px',
    padding: '20px 24px',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    resize: 'vertical',
    color: '#1F2E23',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '15px',
    lineHeight: '1.75',
    letterSpacing: '0.01em',
    caretColor: '#B89B5E',
    minHeight: '260px',
    boxSizing: 'border-box',
  },

  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },

  charCount: {
    fontSize: '12px',
    fontFamily: '"DM Sans", sans-serif',
    letterSpacing: '0.02em',
    transition: 'color 0.3s',
  },
};
