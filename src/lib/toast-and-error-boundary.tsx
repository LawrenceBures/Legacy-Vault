'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string; color: string }> = {
  success: { bg: 'rgba(31,46,35,0.97)', border: 'rgba(46,204,113,0.3)',  icon: '✓', color: '#2ecc71' },
  error:   { bg: 'rgba(31,46,35,0.97)', border: 'rgba(231,76,60,0.3)',   icon: '✕', color: '#e74c3c' },
  info:    { bg: 'rgba(31,46,35,0.97)', border: 'rgba(184,155,94,0.3)',  icon: 'i', color: '#B89B5E' },
  warning: { bg: 'rgba(31,46,35,0.97)', border: 'rgba(241,196,15,0.3)', icon: '!', color: '#f1c40f' },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const style = toastStyles[toast.type];

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);
    const hideTimer = setTimeout(() => setVisible(false), (toast.duration ?? 4000) - 300);
    const removeTimer = setTimeout(() => onRemove(toast.id), toast.duration ?? 4000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); clearTimeout(removeTimer); };
  }, [toast, onRemove]);

  return (
    <div onClick={() => onRemove(toast.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: style.bg, border: `1px solid ${style.border}`, borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.25)', minWidth: '280px', maxWidth: '380px', transform: visible ? 'translateX(0)' : 'translateX(120%)', opacity: visible ? 1 : 0, transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'pointer' }}>
      <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, border: `1px solid ${style.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: style.color }}>{style.icon}</div>
      <div style={{ flex: 1, fontSize: '13px', color: '#F5F3EF', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.4 }}>{toast.message}</div>
      <div style={{ fontSize: '12px', color: 'rgba(245,243,239,0.3)', flexShrink: 0 }}>✕</div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const remove = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  const toast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message, duration }]);
  }, []);
  const success = useCallback((message: string) => toast(message, 'success'), [toast]);
  const error   = useCallback((message: string) => toast(message, 'error', 5000), [toast]);
  const info    = useCallback((message: string) => toast(message, 'info'), [toast]);
  const warning = useCallback((message: string) => toast(message, 'warning'), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 9999, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallback?: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error('[ErrorBoundary]', error, info); }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{ minHeight: '100vh', background: '#F5F3EF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ textAlign: 'center', maxWidth: '420px' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 24px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>⚠️</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: 300, color: '#1F2E23', marginBottom: '10px' }}>Something went wrong.</div>
            <div style={{ fontSize: '13px', color: 'rgba(31,46,35,0.45)', lineHeight: 1.7, marginBottom: '28px', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>We encountered an unexpected error. Your vault data is safe.</div>
            <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }} style={{ padding: '12px 28px', background: '#1F2E23', color: '#B89B5E', border: '1px solid rgba(184,155,94,0.3)', borderRadius: '4px', fontSize: '11px', letterSpacing: '.15em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500 }}>Reload Page</button>
            {this.state.error && <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(231,76,60,0.04)', border: '1px solid rgba(231,76,60,0.12)', borderRadius: '4px', fontSize: '11px', color: 'rgba(231,76,60,0.6)', fontFamily: 'monospace', textAlign: 'left' }}>{this.state.error.message}</div>}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
