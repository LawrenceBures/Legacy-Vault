'use client'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F5F3EF', minHeight: '100vh' }}>
      <nav style={{ background: '#1F2E23', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.push('/')} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#B89B5E', background: 'none', border: 'none', cursor: 'pointer' }}>Legacy Vault</button>
      </nav>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 40px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '48px', fontWeight: 300, color: '#1F2E23', marginBottom: '8px' }}>Terms of Service</h1>
        <p style={{ fontSize: '13px', color: 'rgba(31,46,35,0.4)', marginBottom: '3rem' }}>Last updated: April 16, 2026</p>

        {[
          { title: 'Acceptance of Terms', body: 'By creating an account and using Legacy Vault, you agree to these Terms of Service. If you do not agree, please do not use the platform. These terms apply to all users of Legacy Vault.' },
          { title: 'Description of Service', body: 'Legacy Vault is a digital legacy platform that allows users to create, store, and automatically deliver personal messages — including video, audio, and written content — to designated recipients. The service includes AI-assisted writing, milestone delivery scheduling, and inactivity-triggered delivery.' },
          { title: 'User Accounts', body: 'You are responsible for maintaining the security of your account and password. You must provide accurate information when creating your account. You are responsible for all activity that occurs under your account.' },
          { title: 'Content Ownership', body: 'You retain full ownership of all content you create in your vault. By using Legacy Vault, you grant us a limited license to store, process, and deliver your content solely for the purpose of providing the service. We do not claim ownership of your vault content.' },
          { title: 'Acceptable Use', body: 'You agree not to use Legacy Vault for any unlawful purpose, to harass or harm others, to distribute malware or harmful content, or to violate any applicable laws. We reserve the right to terminate accounts that violate these terms.' },
          { title: 'Delivery of Content', body: 'Legacy Vault will make reasonable efforts to deliver your vault content to designated recipients according to your settings. However, we cannot guarantee delivery in all circumstances, including cases where recipient email addresses become invalid or technical failures occur.' },
          { title: 'Subscription and Billing', body: 'Legacy Vault offers paid subscription plans. Founders pricing is grandfathered for users who sign up before May 15, 2026. Subscriptions are billed monthly or annually. You may cancel at any time. Refunds are handled on a case-by-case basis.' },
          { title: 'Limitation of Liability', body: 'Legacy Vault is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability is limited to the amount you paid in the 12 months prior to the claim.' },
          { title: 'Changes to Terms', body: 'We may update these Terms of Service at any time. Material changes will be communicated via email or in-app notification. Continued use of the service after changes constitutes acceptance.' },
          { title: 'Contact', body: 'For questions about these terms, contact us at legal@joinlegacyvault.com.' },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: 400, color: '#1F2E23', marginBottom: '1rem' }}>{section.title}</h2>
            <p style={{ fontSize: '15px', color: 'rgba(31,46,35,0.65)', lineHeight: 1.8 }}>{section.body}</p>
          </div>
        ))}
      </div>
      <footer style={{ background: '#1F2E23', padding: '2rem 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#B89B5E' }}>Legacy Vault</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="/privacy" style={{ fontSize: '12px', color: 'rgba(245,243,239,0.5)', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ fontSize: '12px', color: 'rgba(245,243,239,0.5)', textDecoration: 'none' }}>Terms</a>
          <a href="/" style={{ fontSize: '12px', color: 'rgba(245,243,239,0.5)', textDecoration: 'none' }}>Home</a>
        </div>
      </footer>
    </div>
  )
}
