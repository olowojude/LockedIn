// src/utils/design.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for all design decisions in LockedIn.
// Import from here — never hardcode these values in components.
// ─────────────────────────────────────────────────────────────────────────────

// ── Page layout ───────────────────────────────────────────────────────────────
// Every page uses this as its outer wrapper.
// Soft greyish-white instead of a flat near-white — gives cards somewhere to sit.
export const PAGE   = "min-h-screen bg-[#F4F4F7]";
// Every page's content container
export const CONTAINER = "max-w-lg mx-auto px-4 py-6 pb-10";

// ── Cards ─────────────────────────────────────────────────────────────────────
// Standard content card (white, subtle grey border, no shadow weight)
export const CARD         = "bg-white rounded-2xl border border-[#EBEBEE] shadow-sm";
// Card with extra internal padding
export const CARD_PADDED  = `${CARD} p-4`;
// Raised card for hero/featured content (same radius, slightly stronger shadow)
export const CARD_RAISED  = "bg-white rounded-2xl border border-[#EBEBEE] shadow-md";
// Dark hero card (used for the weekly-progress / streak-hero blocks)
export const CARD_HERO    = "rounded-2xl bg-[#4338CA]";

// ── Typography ────────────────────────────────────────────────────────────────
export const TEXT = {
  pageTitle:   "text-2xl font-black text-gray-800",
  sectionTitle:"text-base font-bold text-gray-800",
  cardTitle:   "text-sm font-bold text-gray-800",
  body:        "text-sm text-gray-600",
  caption:     "text-xs text-gray-400",
  label:       "text-xs font-semibold text-gray-400 uppercase tracking-wide",
};

// ── Buttons ───────────────────────────────────────────────────────────────────
export const BTN = {
  primary:   "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors",
  ghost:     "text-gray-500 hover:text-gray-700 font-medium transition-colors",
  danger:    "bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors",
  icon:      "w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors",
};

// ── Inputs ────────────────────────────────────────────────────────────────────
export const INPUT = "w-full px-3 py-2.5 border border-[#EBEBEE] rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white";
export const TEXTAREA = `${INPUT} resize-none`;

// ── Status colors ─────────────────────────────────────────────────────────────
// Used for stat cards, badges, etc.
export const STATUS = {
  green:  { bg: "bg-green-50",   border: "border-green-200/60",  text: "text-green-600"  },
  blue:   { bg: "bg-blue-50",    border: "border-blue-200/60",   text: "text-blue-600"   },
  purple: { bg: "bg-purple-50",  border: "border-purple-200/60", text: "text-purple-600" },
  orange: { bg: "bg-orange-50",  border: "border-orange-200/60", text: "text-orange-500" },
  amber:  { bg: "bg-amber-50",   border: "border-amber-100",     text: "text-amber-700"  },
  red:    { bg: "bg-red-50",     border: "border-red-200",       text: "text-red-500"    },
  indigo: { bg: "bg-indigo-50",  border: "border-indigo-200/60", text: "text-indigo-600" },
  teal:   { bg: "bg-teal-50",    border: "border-teal-200/60",   text: "text-teal-600"   },
};

// ── Section header (title + optional action link) ─────────────────────────────
export const SECTION_HEADER = "flex items-center justify-between mb-3";

// ── Divider ───────────────────────────────────────────────────────────────────
export const DIVIDER = "divide-y divide-[#F0F0F2]";

// ── Notice / advisory banner ──────────────────────────────────────────────────
export const NOTICE = "bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5";
export const NOTICE_TEXT = "text-amber-700 text-xs leading-relaxed";

// Info / neutral banner (used for the forever-lock explainer, etc.)
export const INFO_NOTICE = "bg-green-50 border border-green-100 rounded-xl px-3 py-2.5";
export const INFO_NOTICE_TEXT = "text-green-700 text-xs leading-relaxed";

// ── Empty state ───────────────────────────────────────────────────────────────
export const EMPTY_ICON_WRAP = "w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3";

// ── Streak badge ──────────────────────────────────────────────────────────────
export const STREAK_BADGE = "inline-flex items-center gap-1.5 bg-orange-50 text-orange-500 px-3 py-1.5 rounded-xl text-sm font-bold";

// Small pill used for "Ongoing · no end date" on forever Locks
export const FOREVER_BADGE = "inline-flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-semibold";

// ── Modal overlay ─────────────────────────────────────────────────────────────
export const MODAL_OVERLAY  = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm";
export const MODAL_CARD     = "bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden";
export const MODAL_ACCENT   = "h-1 w-full";  // colored top bar, set backgroundColor inline

// ── Lock card accent bar ──────────────────────────────────────────────────────
export const LOCK_ACCENT_BAR = "h-0.5 w-full";

// ── Progress bar ──────────────────────────────────────────────────────────────
export const PROGRESS_TRACK = "h-1.5 bg-[#EBEBEE] rounded-full overflow-hidden";
export const PROGRESS_FILL  = "h-full rounded-full transition-all duration-500";

// ── Quick-stat pill (small 3-up stat cards — streak / active locks / etc.) ─────
export const QUICK_STAT = "flex-1 bg-white rounded-2xl border border-[#EBEBEE] p-3";
export const QUICK_STAT_ICON_WRAP = "w-7 h-7 rounded-lg flex items-center justify-center mb-2";

// ── Milestone roadmap (used on forever Locks in place of a % progress bar) ────
export const ROADMAP_TRACK = "absolute top-[9px] left-1.5 right-1.5 h-[3px] bg-[#EBEBEE] rounded-full";
export const ROADMAP_FILL  = "absolute top-[9px] left-1.5 h-[3px] bg-indigo-600 rounded-full transition-all duration-500";