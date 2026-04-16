import { ToastProvider, ErrorBoundary } from '@/lib/toast-and-error-boundary'
import { TrustBanner } from '@/lib/TrustBanner'
import { CountdownBanner } from '@/lib/FoundersSection'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <CountdownBanner />
        <TrustBanner />
        {children}
      </ToastProvider>
    </ErrorBoundary>
  )
}
