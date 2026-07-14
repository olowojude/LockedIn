// src/utils/design.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for all design decisions in LockedIn.
// Import from here — never hardcode these values in components.
//
// Palette pass: cream background, near-black text/primary, one orange accent —
// replacing the old indigo/white system. Structure (rounded-2xl cards, shadows,
// spacing) is untouched; this is a color-only rework, not a layout rebuild.
// ─────────────────────────────────────────────────────────────────────────────

// ── Page layout ───────────────────────────────────────────────────────────────
export const PAGE   = "min-h-screen bg-[#F1EFE9] font-sans";
export const CONTAINER = "max-w-lg mx-auto px-4 py-6 pb-10";

// ── Cards ─────────────────────────────────────────────────────────────────────
export const CARD         = "bg-white rounded-2xl border border-[#E5E1D6] shadow-sm";
export const CARD_PADDED  = `${CARD} p-4`;
export const CARD_RAISED  = "bg-white rounded-2xl border border-[#E5E1D6] shadow-md";
// Dark hero card (weekly-progress / streak-hero blocks) — was indigo, now near-black
export const CARD_HERO    = "rounded-2xl bg-[#141414]";

// ── Typography ────────────────────────────────────────────────────────────────
export const TEXT = {
  pageTitle:   "text-2xl font-bold text-[#1A1A1A] font-display tracking-tight",
  sectionTitle:"text-base font-bold text-[#1A1A1A] font-display",
  cardTitle:   "text-sm font-bold text-[#1A1A1A] font-display",
  body:        "text-sm text-[#3A3830]",
  caption:     "text-xs text-[#8C8A80]",
  label:       "text-xs font-semibold text-[#8C8A80] uppercase tracking-wide",
};

// ── Buttons ───────────────────────────────────────────────────────────────────
export const BTN = {
  primary:   "bg-[#141414] hover:bg-black text-white font-semibold rounded-xl transition-colors",
  secondary: "bg-[#EFECE3] hover:bg-[#E5E1D6] text-[#3A3830] font-medium rounded-xl transition-colors",
  ghost:     "text-[#8C8A80] hover:text-[#1A1A1A] font-medium transition-colors",
  danger:    "bg-[#FF5A1F] hover:opacity-90 text-white font-semibold rounded-xl transition-colors",
  icon:      "w-8 h-8 flex items-center justify-center rounded-xl bg-[#EFECE3] hover:bg-[#E5E1D6] text-[#8C8A80] transition-colors",
};

// ── Inputs ────────────────────────────────────────────────────────────────────
export const INPUT = "w-full px-3 py-2.5 border border-[#E5E1D6] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/40 bg-white";
export const TEXTAREA = `${INPUT} resize-none`;

// ── Status colors ─────────────────────────────────────────────────────────────
// Kept as the same keys (so nothing importing STATUS[key] breaks), retinted
// warmer and with orange standing in for what was previously "indigo".
export const STATUS = {
  green:  { bg: "bg-[#EEF3EA]",  border: "border-[#CFE0C6]",  text: "text-[#3F6B2E]" },
  blue:   { bg: "bg-[#EAF0F3]",  border: "border-[#C6D9E0]",  text: "text-[#2E5A6B]" },
  purple: { bg: "bg-[#F0EAF3]",  border: "border-[#D9C6E0]",  text: "text-[#6B2E5A]" },
  orange: { bg: "bg-[#FFE7DA]",  border: "border-[#FFC4A3]",  text: "text-[#FF5A1F]" },
  amber:  { bg: "bg-[#FBF2DE]",  border: "border-[#EAD9A8]",  text: "text-[#8A6D1F]" },
  red:    { bg: "bg-[#FBEAE7]",  border: "border-[#EEC5BC]",  text: "text-[#B4392A]" },
  indigo: { bg: "bg-[#EFECE3]",  border: "border-[#DCD6C6]",  text: "text-[#1A1A1A]" }, // was indigo, now ink
  teal:   { bg: "bg-[#E9F3F1]",  border: "border-[#C2DFD9]",  text: "text-[#2E6B5D]" },
};

// ── Section header (title + optional action link) ─────────────────────────────
export const SECTION_HEADER = "flex items-center justify-between mb-3";

// ── Divider ───────────────────────────────────────────────────────────────────
export const DIVIDER = "divide-y divide-[#EFECE3]";

// ── Notice / advisory banner ──────────────────────────────────────────────────
export const NOTICE = "bg-[#FBF2DE] border border-[#EAD9A8] rounded-xl px-3 py-2.5";
export const NOTICE_TEXT = "text-[#6B551A] text-xs leading-relaxed";

export const INFO_NOTICE = "bg-[#FFE7DA] border border-[#FFC4A3] rounded-xl px-3 py-2.5";
export const INFO_NOTICE_TEXT = "text-[#B23E10] text-xs leading-relaxed";

// ── Empty state ───────────────────────────────────────────────────────────────
export const EMPTY_ICON_WRAP = "w-14 h-14 bg-[#EFECE3] rounded-full flex items-center justify-center mx-auto mb-3";

// ── Streak badge ──────────────────────────────────────────────────────────────
export const STREAK_BADGE = "inline-flex items-center gap-1.5 bg-[#FFE7DA] text-[#FF5A1F] px-3 py-1.5 rounded-xl text-sm font-bold";

// Small pill used for "Ongoing · no end date" on forever Locks
export const FOREVER_BADGE = "inline-flex items-center gap-1.5 bg-[#EFECE3] text-[#3A3830] px-3 py-1 rounded-full text-xs font-semibold";

// ── Modal overlay ─────────────────────────────────────────────────────────────
export const MODAL_OVERLAY  = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm";
export const MODAL_CARD     = "bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden";
export const MODAL_ACCENT   = "h-1 w-full"; // colored top bar, set backgroundColor inline

// ── Lock card accent bar ──────────────────────────────────────────────────────
export const LOCK_ACCENT_BAR = "h-0.5 w-full";

// ── Progress bar ──────────────────────────────────────────────────────────────
export const PROGRESS_TRACK = "h-1.5 bg-[#EFECE3] rounded-full overflow-hidden";
export const PROGRESS_FILL  = "h-full rounded-full transition-all duration-500";

// ── Quick-stat pill (small 3-up stat cards — streak / active locks / etc.) ─────
export const QUICK_STAT = "flex-1 bg-white rounded-2xl border border-[#E5E1D6] p-3";
export const QUICK_STAT_ICON_WRAP = "w-7 h-7 rounded-lg flex items-center justify-center mb-2";

// ── Milestone roadmap (used on forever Locks in place of a % progress bar) ────
export const ROADMAP_TRACK = "absolute top-[9px] left-1.5 right-1.5 h-[3px] bg-[#EFECE3] rounded-full";
export const ROADMAP_FILL  = "absolute top-[9px] left-1.5 h-[3px] bg-[#FF5A1F] rounded-full transition-all duration-500";