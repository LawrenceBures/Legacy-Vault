'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { createSupabaseClient } from '@/lib/supabase-auth';
import { LoadingState, ErrorState } from '@/lib/useAsyncData';
import { useToast } from '@/components/ToastProvider';

interface Stats {
  totalEntries: number;
  recipients: number;
  deliveryActive: boolean;
  lastActive: string | null;
}

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: string;
}

const quickActions: QuickAction[] = [
  { label: 'New entry', description: 'Record a message', href: '/new-entry', icon: '+' },
  { label: 'My people', description: 'Manage recipients', href: '/my-people', icon: '↗' },
  { label: 'Delivery', description: 'Set trigger rules', href: '/delivery', icon: '◎' },
  { label: 'Vault', description: 'View all entries', href: '/vault', icon: '▦' },
];

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { error: toastError } = useToast();

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const token = await getToken({ template: 'supabase' });
        if (!token) throw new Error('No auth token');

        const sb = createSupabaseClient(token);

        const [entriesRes, recipientsRes, deliveryRes] = await Promise.all([
          sb.from('vault_entries').select('id', { count: 'exact', head: true }),
          sb.from('recipients').select('id', { count: 'exact', head: true }),
          sb.from('delivery_settings').select('inactivity_enabled, updated_at').maybeSingle(),
        ]);

        if (entriesRes.error) throw entriesRes.error;
        if (recipientsRes.error) throw recipientsRes.error;

        setStats({
          totalEntries: entriesRes.count ?? 0,
          recipients: recipientsRes.count ?? 0,
          deliveryActive: deliveryRes.data?.inactivity_enabled ?? false,
          lastActive: deliveryRes.data?.updated_at ?? null,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load dashboard.';
        setError(msg);
        toastError('Could not load stats', msg);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [getToken, toastError]);

  const firstName = user?.firstName ?? 'Welcome';

  if (loading) return (
    <div className="min-h-screen bg-[#1F2E23] flex items-center justify-center">
      <LoadingState message="Loading your vault..." />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#1F2E23] flex items-center justify-center">
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1F2E23] text-[#F5F3EF] font-['DM_Sans']">
      {/* Header */}
      <div className="border-b border-[#F5F3EF]/8 px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-[#B89B5E] text-xs tracking-widest uppercase mb-0.5">Legacy Vault</p>
          <h1 className="font-['Cormorant_Garamond'] text-2xl font-light text-[#F5F3EF]">
            {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge active={stats?.deliveryActive ?? false} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Vault entries" value={stats?.totalEntries ?? 0} />
          <StatCard label="Recipients" value={stats?.recipients ?? 0} />
          <StatCard
            label="Delivery"
            value={stats?.deliveryActive ? 'Active' : 'Off'}
            highlight={stats?.deliveryActive}
          />
        </div>

        {/* Trust layer */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#B89B5E]/15 bg-[#B89B5E]/5">
          <span className="text-[#B89B5E] text-xs">🔒</span>
          <p className="text-[#F5F3EF]/40 text-xs leading-relaxed">
            End-to-end encrypted · Private · Only your recipients can access your messages
          </p>
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-[#F5F3EF]/40 text-xs uppercase tracking-widest mb-3">Quick actions</p>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="group flex items-start gap-3 p-4 rounded-xl border border-[#F5F3EF]/8 hover:border-[#B89B5E]/30 hover:bg-[#B89B5E]/5 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg border border-[#B89B5E]/20 flex items-center justify-center flex-shrink-0 group-hover:border-[#B89B5E]/40 transition-colors">
                  <span className="text-[#B89B5E] text-sm">{action.icon}</span>
                </div>
                <div>
                  <p className="text-[#F5F3EF] text-sm font-medium">{action.label}</p>
                  <p className="text-[#F5F3EF]/40 text-xs mt-0.5">{action.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Getting started checklist */}
        <div>
          <p className="text-[#F5F3EF]/40 text-xs uppercase tracking-widest mb-3">Getting started</p>
          <div className="space-y-2">
            <ChecklistItem
              done={(stats?.totalEntries ?? 0) > 0}
              label="Create your first vault entry"
              href="/new-entry"
            />
            <ChecklistItem
              done={(stats?.recipients ?? 0) > 0}
              label="Add a recipient"
              href="/my-people"
            />
            <ChecklistItem
              done={stats?.deliveryActive ?? false}
              label="Set up delivery trigger"
              href="/delivery"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-[#1a2620] border border-[#F5F3EF]/8 rounded-xl p-4">
      <p className="text-[#F5F3EF]/40 text-xs mb-1">{label}</p>
      <p className={`text-xl font-medium ${highlight ? 'text-[#B89B5E]' : 'text-[#F5F3EF]'}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs ${
      active
        ? 'border-[#B89B5E]/30 bg-[#B89B5E]/10 text-[#B89B5E]'
        : 'border-[#F5F3EF]/10 bg-[#F5F3EF]/5 text-[#F5F3EF]/40'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#B89B5E]' : 'bg-[#F5F3EF]/20'}`} />
      {active ? 'Vault active' : 'Vault inactive'}
    </div>
  );
}

function ChecklistItem({
  done,
  label,
  href,
}: {
  done: boolean;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#F5F3EF]/6 hover:border-[#F5F3EF]/12 transition-colors group"
    >
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
        done
          ? 'border-[#B89B5E] bg-[#B89B5E]/10'
          : 'border-[#F5F3EF]/20 group-hover:border-[#F5F3EF]/40'
      }`}>
        {done && <span className="text-[#B89B5E] text-[10px]">✓</span>}
      </div>
      <p className={`text-sm transition-colors ${done ? 'text-[#F5F3EF]/40 line-through' : 'text-[#F5F3EF]/70 group-hover:text-[#F5F3EF]'}`}>
        {label}
      </p>
      {!done && (
        <span className="ml-auto text-[#F5F3EF]/20 group-hover:text-[#F5F3EF]/40 text-xs transition-colors">→</span>
      )}
    </a>
  );
}
