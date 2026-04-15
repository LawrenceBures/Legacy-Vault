'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createSupabaseClient } from '@/lib/supabase-auth';
import { useToast } from '@/components/ToastProvider';
import { LoadingState } from '@/lib/useAsyncData';
import { withRetry } from '@/lib/safeguards';

type Tab = 'inactivity' | 'unlock';

interface DeliverySettings {
  inactivity_enabled: boolean;
  time_window_days: number;
  checkin_frequency: number;
  warning_days: number;
  warning_email: boolean;
  warning_sms: boolean;
  unlock_enabled: boolean;
  unlock_code: string; // plaintext — hashed before save
}

const defaults: DeliverySettings = {
  inactivity_enabled: false,
  time_window_days: 30,
  checkin_frequency: 7,
  warning_days: 7,
  warning_email: true,
  warning_sms: false,
  unlock_enabled: false,
  unlock_code: '',
};

export default function DeliveryPage() {
  const { getToken } = useAuth();
  const { success, error: toastError } = useToast();

  const [tab, setTab] = useState<Tab>('inactivity');
  const [settings, setSettings] = useState<DeliverySettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  // Load existing settings
  useEffect(() => {
    async function load() {
      try {
        const token = await getToken({ template: 'supabase' });
        if (!token) return;
        const sb = createSupabaseClient(token);

        const { data, error } = await sb
          .from('delivery_settings')
          .select('*')
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettingsId(data.id);
          setSettings({
            inactivity_enabled: data.inactivity_enabled ?? false,
            time_window_days: data.time_window_days ?? 30,
            checkin_frequency: data.checkin_frequency ?? 7,
            warning_days: data.warning_days ?? 7,
            warning_email: data.warning_email ?? true,
            warning_sms: data.warning_sms ?? false,
            unlock_enabled: data.unlock_enabled ?? false,
            unlock_code: '', // never load hash back into input
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Could not load delivery settings.';
        toastError('Load failed', msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken, toastError]);

  const set = <K extends keyof DeliverySettings>(key: K, value: DeliverySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('No auth token');
      const sb = createSupabaseClient(token);

      // Hash unlock code if provided (simple sha256 via Web Crypto)
      let unlock_code_hash: string | undefined;
      if (settings.unlock_code) {
        const encoder = new TextEncoder();
        const data = encoder.encode(settings.unlock_code);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        unlock_code_hash = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      }

      const payload = {
        inactivity_enabled: settings.inactivity_enabled,
        time_window_days: settings.time_window_days,
        checkin_frequency: settings.checkin_frequency,
        warning_days: settings.warning_days,
        warning_email: settings.warning_email,
        warning_sms: settings.warning_sms,
        unlock_enabled: settings.unlock_enabled,
        ...(unlock_code_hash ? { unlock_code_hash } : {}),
        updated_at: new Date().toISOString(),
      };

      await withRetry(async () => {
        let res;
        if (settingsId) {
          res = await sb
            .from('delivery_settings')
            .update(payload)
            .eq('id', settingsId);
        } else {
          res = await sb
            .from('delivery_settings')
            .insert(payload)
            .select()
            .single();
          if (res.data?.id) setSettingsId(res.data.id);
        }
        if (res.error) throw res.error;
        return res;
      });

      success('Delivery settings saved');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed.';
      toastError('Could not save settings', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1F2E23] flex items-center justify-center">
      <LoadingState message="Loading delivery settings..." />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1F2E23] text-[#F5F3EF] font-['DM_Sans']">
      {/* Header */}
      <div className="border-b border-[#F5F3EF]/8 px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-[#B89B5E] text-xs tracking-widest uppercase mb-0.5">Legacy Vault</p>
          <h1 className="font-['Cormorant_Garamond'] text-2xl font-light">Delivery</h1>
        </div>
        <a href="/dashboard" className="text-[#F5F3EF]/40 hover:text-[#F5F3EF]/70 text-sm transition-colors">
          ← Dashboard
        </a>
      </div>

      <div className="max-w-xl mx-auto px-6 py-8 space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#1a2620] rounded-xl border border-[#F5F3EF]/8">
          {(['inactivity', 'unlock'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm transition-all ${
                tab === t
                  ? 'bg-[#B89B5E]/15 text-[#B89B5E] border border-[#B89B5E]/20'
                  : 'text-[#F5F3EF]/40 hover:text-[#F5F3EF]/60'
              }`}
            >
              {t === 'inactivity' ? 'Inactivity trigger' : 'Family unlock code'}
            </button>
          ))}
        </div>

        {/* Inactivity tab */}
        {tab === 'inactivity' && (
          <div className="space-y-4">
            <ToggleRow
              label="Enable inactivity trigger"
              description="Deliver messages if you stop checking in"
              checked={settings.inactivity_enabled}
              onChange={(v) => set('inactivity_enabled', v)}
            />

            {settings.inactivity_enabled && (
              <>
                <SliderRow
                  label="Inactivity window"
                  value={settings.time_window_days}
                  min={7}
                  max={365}
                  step={1}
                  unit="days"
                  description="Deliver after this many days of no check-in"
                  onChange={(v) => set('time_window_days', v)}
                />
                <SliderRow
                  label="Check-in frequency"
                  value={settings.checkin_frequency}
                  min={1}
                  max={30}
                  step={1}
                  unit="days"
                  description="How often we'll ask you to check in"
                  onChange={(v) => set('checkin_frequency', v)}
                />
                <SliderRow
                  label="Warning period"
                  value={settings.warning_days}
                  min={1}
                  max={30}
                  step={1}
                  unit="days"
                  description="Warn you this many days before delivery triggers"
                  onChange={(v) => set('warning_days', v)}
                />

                <div className="bg-[#1a2620] border border-[#F5F3EF]/8 rounded-xl p-4 space-y-3">
                  <p className="text-[#F5F3EF]/50 text-xs uppercase tracking-widest">Warning notifications</p>
                  <ToggleRow
                    label="Email warning"
                    description="Send warning email before delivery"
                    checked={settings.warning_email}
                    onChange={(v) => set('warning_email', v)}
                    compact
                  />
                  <ToggleRow
                    label="SMS warning"
                    description="Send warning text before delivery"
                    checked={settings.warning_sms}
                    onChange={(v) => set('warning_sms', v)}
                    compact
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Unlock tab */}
        {tab === 'unlock' && (
          <div className="space-y-4">
            <ToggleRow
              label="Enable family unlock code"
              description="Allow recipients to unlock your vault with a code"
              checked={settings.unlock_enabled}
              onChange={(v) => set('unlock_enabled', v)}
            />

            {settings.unlock_enabled && (
              <div className="bg-[#1a2620] border border-[#F5F3EF]/8 rounded-xl p-4 space-y-3">
                <div>
                  <label className="text-[#F5F3EF]/60 text-xs block mb-2">
                    Unlock code
                  </label>
                  <input
                    type="password"
                    value={settings.unlock_code}
                    onChange={(e) => set('unlock_code', e.target.value)}
                    placeholder="Enter a code your family will use"
                    className="w-full bg-[#1F2E23] border border-[#F5F3EF]/10 rounded-lg px-4 py-2.5 text-[#F5F3EF] text-sm placeholder:text-[#F5F3EF]/20 focus:outline-none focus:border-[#B89B5E]/40 transition-colors"
                  />
                  <p className="text-[#F5F3EF]/30 text-xs mt-1.5">
                    Stored securely — we never save your code in plain text.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-[#B89B5E]/15 border border-[#B89B5E]/30 text-[#B89B5E] text-sm rounded-xl hover:bg-[#B89B5E]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save delivery settings'}
        </button>

        {/* Trust note */}
        <p className="text-center text-[#F5F3EF]/25 text-xs">
          Your delivery preferences are private and encrypted.
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  compact = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${!compact ? 'bg-[#1a2620] border border-[#F5F3EF]/8 rounded-xl p-4' : ''}`}>
      <div>
        <p className="text-[#F5F3EF] text-sm">{label}</p>
        <p className="text-[#F5F3EF]/40 text-xs mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full border transition-all flex-shrink-0 ${
          checked
            ? 'bg-[#B89B5E]/20 border-[#B89B5E]/40'
            : 'bg-[#F5F3EF]/5 border-[#F5F3EF]/15'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
            checked ? 'left-[18px] bg-[#B89B5E]' : 'left-0.5 bg-[#F5F3EF]/30'
          }`}
        />
      </button>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  description,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="bg-[#1a2620] border border-[#F5F3EF]/8 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[#F5F3EF] text-sm">{label}</p>
        <span className="text-[#B89B5E] text-sm font-medium">{value} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#B89B5E]"
      />
      <p className="text-[#F5F3EF]/30 text-xs">{description}</p>
    </div>
  );
}
