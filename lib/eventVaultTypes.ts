export type EventType =
  | "wedding"
  | "engagement"
  | "baby_shower"
  | "birthday"
  | "graduation"
  | "retirement"
  | "anniversary"
  | "other";

export type EventStatus = "active" | "closed" | "delivered";
export type MessageType = "text" | "audio" | "video";
export type ReviewStatus = "approved" | "flagged" | "removed";
export type GiftStatus = "pending" | "completed" | "refunded" | "failed";

export type EventVault = {
  id: string;
  host_user_id: string;
  event_type: EventType;
  event_name: string;
  event_date: string | null;
  guest_message: string | null;
  short_code: string;
  qr_code_url: string | null;
  status: EventStatus;
  allow_gifts: boolean;
  submission_deadline: string | null;
  auto_close_on_event_date: boolean;
  delivery_date: string | null;
  thank_you_message: string | null;
  stripe_account_id: string | null;
  platform_fee_percent: number;
  created_at: string;
  updated_at: string;
};

export type EventSubmission = {
  id: string;
  event_vault_id: string;
  guest_name: string;
  guest_email: string | null;
  message_type: MessageType;
  text_content: string | null;
  media_url: string | null;
  media_duration_seconds: number | null;
  media_mime_type: string | null;
  media_size_bytes: number | null;
  review_status: ReviewStatus;
  submitted_at: string;
  created_at: string;
  updated_at: string;
};

export type EventGift = {
  id: string;
  event_vault_id: string;
  submission_id: string | null;
  amount: number;
  currency: string;
  platform_fee: number;
  net_amount: number;
  stripe_payment_intent_id: string | null;
  stripe_transfer_id: string | null;
  status: GiftStatus;
  created_at: string;
  updated_at: string;
};

export type EventVaultWithStats = EventVault & {
  submission_count: number;
  total_gifts: number;
};
