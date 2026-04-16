'use client'

export function TrustBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '20px', padding: '8px 28px',
      background: 'rgba(31,46,35,0.97)',
      borderBottom: '1px solid rgba(184,155,94,0.1)',
      flexWrap: 'wrap',
    }}>
      {[
        { icon: '🔐', text: 'End-to-end encrypted' },
        { icon: '👁', text: 'Private by default' },
        { icon: '🛡', text: 'Only your recipients can access' },
        { icon: '🔒', text: 'Secured by Legacy Vault' },
      ].map(item => (
        <div key={item.text} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '10px', color: 'rgba(184,155,94,0.6)',
          letterSpacing: '.08em',
        }}>
          <span style={{ fontSize: '12px' }}>{item.icon}</span>
          {item.text}
        </div>
      ))}
    </div>
  )
}
