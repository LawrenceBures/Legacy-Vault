import { ToastProvider, ErrorBoundary } from '@/lib/toast-and-error-boundary'
import { TrustBanner } from '@/lib/TrustBanner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <TrustBanner />
        {children}
      </ToastProvider>
    </ErrorBoundary>
  )
}
