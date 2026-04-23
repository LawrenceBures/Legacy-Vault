export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1F2E23',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Brand */}
        <div
          style={{
            textAlign: 'center',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '28px',
            fontWeight: 300,
            color: '#B89B5E',
            marginBottom: '28px',
            letterSpacing: '.08em',
          }}
        >
          Legacy Vault
        </div>

        {/* Clean frame (not heavy card) */}
        <div
          style={{
            borderRadius: '12px',
            border: '1px solid rgba(184,155,94,0.25)',
            padding: '6px',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          {children}
        </div>

      </div>
    </div>
  )
}
