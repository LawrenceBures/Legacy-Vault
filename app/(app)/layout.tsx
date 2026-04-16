import { ToastProvider, ErrorBoundary } from '@/lib/toast-and-error-boundary'
import { TrustBanner } from '@/lib/TrustBanner'
import { CountdownBanner } from '@/lib/FoundersSection'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div style={{ paddingTop: '44px' }}>
          <CountdownBanner />
          <TrustBanner />
          {children}
        </div>
      </ToastProvider>
    </ErrorBoundary>
  )
}
