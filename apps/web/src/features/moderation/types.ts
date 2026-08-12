/**
 * Moderation types
 */

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'auto_hidden';

export type ModerationCategory =
  | 'hate'
  | 'hate_threatening'
  | 'harassment'
  | 'harassment_threatening'
  | 'self_harm'
  | 'self_harm_intent'
  | 'self_harm_instructions'
  | 'sexual'
  | 'sexual_minors'
  | 'violence'
  | 'violence_graphic'
  | 'profanity'
  | 'spam'
  | 'nsfw';

export type ContentType = 'review' | 'locket' | 'comment' | 'chat_message';

export const CATEGORY_LABELS: Record<ModerationCategory, string> = {
  hate: 'Thù ghét',
  hate_threatening: 'Đe dọa thù ghét',
  harassment: 'Quấy rối',
  harassment_threatening: 'Đe dọa quấy rối',
  self_harm: 'Tự hại',
  self_harm_intent: 'Ý định tự hại',
  self_harm_instructions: 'Hướng dẫn tự hại',
  sexual: 'Tình dục',
  sexual_minors: 'Xâm hại trẻ em',
  violence: 'Bạo lực',
  violence_graphic: 'Bạo lực đồ họa',
  profanity: 'Ngôn từ thô tục',
  spam: 'Spam',
  nsfw: 'NSFW',
};

export const STATUS_LABELS: Record<ModerationStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Đã từ chối',
  auto_hidden: 'Đã ẩn tự động',
};

export const STATUS_COLORS: Record<ModerationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  auto_hidden: 'bg-slate-100 text-slate-800 border-slate-200',
};