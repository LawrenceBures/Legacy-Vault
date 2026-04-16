export type Tier = 'starter_founder' | 'basic_founder' | 'legacy_founder' | 'family_founder' | 'estate_founder' | 'starter' | 'basic' | 'legacy' | 'family' | 'estate' | 'pro' | ''

export function canUseVideo(plan: Tier): boolean {
  return ['legacy_founder', 'family_founder', 'estate_founder', 'legacy', 'family', 'estate'].includes(plan)
}

export function canUseAudio(plan: Tier): boolean {
  return ['basic_founder', 'legacy_founder', 'family_founder', 'estate_founder', 'basic', 'legacy', 'family', 'estate'].includes(plan)
}

export function canUseAI(plan: Tier): boolean {
  return ['legacy_founder', 'family_founder', 'estate_founder', 'legacy', 'family', 'estate'].includes(plan)
}

export function canUseMilestoneDelivery(plan: Tier): boolean {
  return ['basic_founder', 'legacy_founder', 'family_founder', 'estate_founder', 'basic', 'legacy', 'family', 'estate'].includes(plan)
}

export function canUseUnlimitedEntries(plan: Tier): boolean {
  return ['legacy_founder', 'family_founder', 'estate_founder', 'legacy', 'family', 'estate'].includes(plan)
}

export function getPlanLabel(plan: Tier): string {
  const labels: Record<string, string> = {
    starter_founder: 'Starter Founder',
    basic_founder: 'Basic Founder',
    legacy_founder: 'Legacy Founder',
    family_founder: 'Family Founder',
    estate_founder: 'Estate Founder',
    starter: 'Starter',
    basic: 'Basic',
    legacy: 'Legacy',
    family: 'Family',
    estate: 'Estate',
  }
  return labels[plan] || '—'
}

export function getUpgradeMessage(feature: string): string {
  const messages: Record<string, string> = {
    video: 'Video messages are available on the Legacy plan and above.',
    audio: 'Audio messages are available on the Basic plan and above.',
    ai: 'AI writing assistance is available on the Legacy plan and above.',
    milestone: 'Milestone Delivery is available on the Basic plan and above.',
    unlimited: 'Unlimited entries are available on the Legacy plan and above.',
  }
  return messages[feature] || 'Upgrade your plan to access this feature.'
}
