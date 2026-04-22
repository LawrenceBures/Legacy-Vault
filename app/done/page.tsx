export default function DonePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1F2E23',
      fontFamily: 'DM Sans, sans-serif',
      textAlign: 'center',
      padding: '40px 24px',
    }}>
      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '42px',
        fontWeight: 300,
        color: '#F5F3EF',
        lineHeight: 1.2,
        marginBottom: '16px',
      }}>
        Your message is saved.
      </div>
      <div style={{
        fontSize: '16px',
        color: 'rgba(245,243,239,0.45)',
        fontFamily: 'Cormorant Garamond, serif',
        fontStyle: 'italic',
      }}>
        You&apos;ll be reminded to check in.
      </div>
    </div>
  )
}
