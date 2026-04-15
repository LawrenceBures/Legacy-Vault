import { ToastProvider, ErrorBoundary } from '@/lib/toast-and-error-boundary'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ErrorBoundary>
  )
}
