export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#1F2E23',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '24px',
        fontWeight: 300,
        color: '#B89B5E',
        marginBottom: '32px',
        letterSpacing: '.05em',
      }}>
        Legacy Vault
      </div>
      {children}
    </div>
  )
}
