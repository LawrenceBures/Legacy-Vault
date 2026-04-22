export const EVENT_TYPES = [
  "wedding",
  "engagement",
  "baby_shower",
  "birthday",
  "graduation",
  "retirement",
  "anniversary",
  "other",
] as const;

export const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: "Wedding",
  engagement: "Engagement",
  baby_shower: "Baby Shower",
  birthday: "Birthday",
  graduation: "Graduation",
  retirement: "Retirement",
  anniversary: "Anniversary",
  other: "Any Occasion",
};

export const EVENT_TYPE_EMOJIS: Record<string, string> = {
  wedding: "💍",
  engagement: "💎",
  baby_shower: "👶",
  birthday: "🎂",
  graduation: "🎓",
  retirement: "🌿",
  anniversary: "🥂",
  other: "✦",
};

export const EVENT_STATUSES = ["active", "closed", "delivered"] as const;
export const MESSAGE_TYPES = ["text", "audio", "video"] as const;
export const REVIEW_STATUSES = ["approved", "flagged", "removed"] as const;
export const GIFT_STATUSES = ["pending", "completed", "refunded", "failed"] as const;

export const MEDIA_LIMITS = {
  text: { maxChars: 5000 },
  audio: { maxDurationSeconds: 600, maxSizeBytes: 52428800 },
  video: { maxDurationSeconds: 300, maxSizeBytes: 157286400 },
  allowedAudioMimes: ["audio/webm", "audio/mpeg", "audio/mp4"],
  allowedVideoMimes: ["video/mp4", "video/webm", "video/quicktime"],
};

export const SHORT_CODE_LENGTH = 9;
export const PLATFORM_FEE_PERCENT = 5;
