// src/pages/Home.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Quote, TrendingUp, ChevronRight, Flame,
  Plus, Check, Layers, Star, ShieldCheck,
  Gem, Rocket, Crown, Sparkles, Lock,
  Info, AlertCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import StreakCelebrationModal from "../components/StreakCelebrationModal";
import api from "../../utils/api";
import { useAspects } from "../../utils/useAspects";
import {
  PAGE, CONTAINER, CARD, CARD_PADDED, TEXT,
  BTN, STREAK_BADGE, NOTICE, NOTICE_TEXT,
  PROGRESS_TRACK, PROGRESS_FILL,
  LOCK_ACCENT_BAR, DIVIDER,
} from "../../utils/design";

// ─── Level definitions ────────────────────────────────────────────────────────
const LEVELS = [
  { id: 1, name: "Beginner",   icon: Star,        requirement: 1,   color: "#9CA3AF" },
  { id: 2, name: "Committed",  icon: Flame,       requirement: 7,   color: "#F97316" },
  { id: 3, name: "Dedicated",  icon: ShieldCheck, requirement: 14,  color: "#3B82F6" },
  { id: 4, name: "Champion",   icon: Gem,         requirement: 30,  color: "#14B8A6" },
  { id: 5, name: "Invincible", icon: Rocket,      requirement: 60,  color: "#8B5CF6" },
  { id: 6, name: "Legend",     icon: Crown,       requirement: 90,  color: "#EAB308" },
  { id: 7, name: "Golden",     icon: Sparkles,    requirement: 180, color: "#10B981" },
];

const getLevel = (streak) => {
  let level = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (streak >= LEVELS[i].requirement) { level = LEVELS[i]; break; }
  }
  return level;
};

// ─── Level strip ──────────────────────────────────────────────────────────────
const LevelStrip = ({ streakData, loading }) => {
  const navigate = useNavigate();
  if (loading || !streakData) return null;

  const streak   = streakData.current_streak;
  const level    = getLevel(streak);
  const LevelIcon = level.icon;
  const badgeCount = LEVELS.filter(l => streak >= l.requirement).length;

  return (
    <div
      onClick={() => navigate("/profile")}
      className={`${CARD} p-3 mb-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]`}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: level.color + "20" }}
      >
        <LevelIcon className="w-5 h-5" style={{ color: level.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <span className={TEXT.cardTitle}>{level.name}</span>
        <span className="text-gray-300 mx-1.5 text-xs">·</span>
        <span className={TEXT.caption}>{badgeCount} of {LEVELS.length} badges</span>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-base font-black" style={{ color: level.color }}>{streak}</div>
        <div className={TEXT.caption + " leading-none"}>day streak</div>
      </div>
    </div>
  );
};

// ─── Quote card ───────────────────────────────────────────────────────────────
const QuoteCard = ({ quote, loading, error }) => (
  <div className={`${CARD} p-4 mb-4 relative overflow-hidden`}>
    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400" />
    <div className="flex items-center gap-2 mb-3">
      <Quote className="w-4 h-4 text-indigo-400" />
      <span className={TEXT.label}>Daily wisdom</span>
    </div>
    {loading && (
      <div className="animate-pulse space-y-2">
        <div className="h-3.5 bg-gray-200 rounded w-full" />
        <div className="h-3.5 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-1/3 mt-1" />
      </div>
    )}
    {error && <p className={TEXT.caption}>{error}</p>}
    {quote && (
      <blockquote className="border-l-2 border-indigo-200 pl-3">
        <p className="text-gray-600 text-sm leading-relaxed italic mb-1.5">"{quote.text}"</p>
        <footer className={TEXT.caption}>— {quote.author || "Unknown"}</footer>
      </blockquote>
    )}
  </div>
);

// ─── Activity notice ──────────────────────────────────────────────────────────
// Shows inside the Daily Tasks Lock when it has no activities set
const ActivityNotice = () => (
  <div className={`${NOTICE} flex items-start gap-2.5 mb-3`}>
    <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
    <p className={NOTICE_TEXT}>
      For maximum focus, we recommend adding{" "}
      <span className="font-semibold">no more than 3 daily activities</span> — enough
      to make real progress without spreading yourself too thin. Quality over quantity.
    </p>
  </div>
);

// ─── Single activity row ──────────────────────────────────────────────────────
const ActivityRow = ({ activity, color, onToggle }) => {
  const [optimistic, setOptimistic] = useState(activity.completed);
  useEffect(() => { setOptimistic(activity.completed); }, [activity.completed]);

  const handle = async () => {
    const prev = optimistic;
    setOptimistic(o => !o);
    const ok = await onToggle(activity, !prev);
    if (!ok) setOptimistic(prev);
  };

  return (
    <div
      onClick={handle}
      className="flex items-center gap-3 py-2.5 cursor-pointer group select-none"
    >
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          optimistic ? "" : "border-2"
        }`}
        style={optimistic ? { backgroundColor: color } : { borderColor: color + "60" }}
      >
        {optimistic && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className={`text-sm flex-1 transition-all duration-200 ${
        optimistic ? "text-gray-400 line-through" : "text-gray-700 group-hover:text-gray-900"
      }`}>
        {activity.title}
      </span>
    </div>
  );
};

// ─── Lock group card ──────────────────────────────────────────────────────────
const LockGroup = ({ aspect, onCelebrate }) => {
  const navigate     = useNavigate();
  const [activities, setActivities] = useState(aspect.today_activities || []);

  const total     = activities.length;
  const completed = activities.filter(a => a.completed).length;
  const allDone   = total > 0 && completed === total;
  const isDailyTasksLock = aspect.custom_name === "Daily Tasks" && aspect.is_forever;

  const handleToggle = async (activity, newValue) => {
    setActivities(prev =>
      prev.map(a => a.id === activity.id ? { ...a, completed: newValue } : a)
    );
    try {
      await api.patch(`/activities/${activity.id}/`, { completed: newValue });
      const updated = activities.map(a =>
        a.id === activity.id ? { ...a, completed: newValue } : a
      );
      if (updated.every(a => a.completed) && updated.length > 0 && newValue) {
        onCelebrate(aspect.display_name);
      }
      return true;
    } catch {
      setActivities(prev =>
        prev.map(a => a.id === activity.id ? { ...a, completed: !newValue } : a)
      );
      return false;
    }
  };

  return (
    <div className={`${CARD} overflow-hidden mb-3`}>
      {/* Color accent bar */}
      <div className={LOCK_ACCENT_BAR} style={{ backgroundColor: aspect.color }} />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-1">
        <div
          className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: aspect.color + "20" }}
        >
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: aspect.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={TEXT.cardTitle}>{aspect.display_name}</span>
            {allDone && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: aspect.color }}
              >
                Locked in
              </span>
            )}
            {isDailyTasksLock && (
              <span className="text-xs text-indigo-400 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                Daily
              </span>
            )}
          </div>
          <div className={TEXT.caption + " mt-0.5"}>
            {total > 0
              ? `${completed}/${total} done today`
              : isDailyTasksLock
                ? "Add your tasks for today"
                : "No actions set"}
            {aspect.current_streak > 0 && (
              <span className="ml-2 text-orange-400 font-medium">
                {aspect.current_streak}d streak
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate(`/aspects/${aspect.id}`)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {/* Progress bar (only when there are activities) */}
      {total > 0 && (
        <div className="px-4 py-1.5">
          <div className={PROGRESS_TRACK}>
            <div
              className={PROGRESS_FILL}
              style={{ width: `${(completed / total) * 100}%`, backgroundColor: aspect.color }}
            />
          </div>
        </div>
      )}

      {/* Activities */}
      <div className={`px-4 pb-3 ${DIVIDER}`}>
        {activities.length === 0 ? (
          <div className="py-3">
            {isDailyTasksLock && <ActivityNotice />}
            <button
              onClick={() => navigate(`/aspects/${aspect.id}`)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50/50 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              {isDailyTasksLock ? "Add today's tasks" : "Set up daily actions"}
            </button>
          </div>
        ) : (
          activities.map(activity => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              color={aspect.color}
              onToggle={handleToggle}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ─── Locks section ────────────────────────────────────────────────────────────
const LocksSection = ({ onCelebrate }) => {
  const navigate = useNavigate();
  const { dashboard, loading, fetchDashboard } = useAspects();

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) {
    return (
      <div className="space-y-3 mb-4">
        {[1, 2].map(i => (
          <div key={i} className={`${CARD} p-4 animate-pulse`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-200 rounded w-28" />
                <div className="h-2.5 bg-gray-200 rounded w-16" />
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map(j => <div key={j} className="h-8 bg-gray-100 rounded" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!dashboard || dashboard.length === 0) {
    return (
      <div className={`${CARD} p-6 mb-4 text-center`}>
        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <Layers className="w-7 h-7 text-indigo-300" />
        </div>
        <h3 className={TEXT.sectionTitle + " mb-1"}>No Locks yet</h3>
        <p className={TEXT.caption + " mb-4 max-w-xs mx-auto"}>
          Your Daily Tasks Lock is being set up. Refresh in a moment, or create your first sprint Lock now.
        </p>
        <button
          onClick={() => navigate("/onboarding")}
          className={`${BTN.primary} inline-flex items-center gap-2 px-5 py-2.5 text-sm`}
        >
          <Plus className="w-4 h-4" />
          Create a Lock
        </button>
      </div>
    );
  }

  // Sort: Daily Tasks Lock always first, then others by creation order
  const sorted = [...dashboard].sort((a, b) => {
    if (a.custom_name === "Daily Tasks" && a.is_forever) return -1;
    if (b.custom_name === "Daily Tasks" && b.is_forever) return 1;
    return 0;
  });

  const lockedInCount = sorted.filter(a => a.today_locked_in).length;
  const allLockedIn   = lockedInCount === sorted.length;

  return (
    <div className="mb-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className={TEXT.sectionTitle}>Today's Locks</h2>
          <p className={TEXT.caption + " mt-0.5"}>
            {allLockedIn
              ? "You're locked in across everything today"
              : `${lockedInCount} of ${sorted.length} locked in`}
          </p>
        </div>
        <Link to="/aspects" className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
          See all
        </Link>
      </div>

      {sorted.map(aspect => (
        <LockGroup key={aspect.id} aspect={aspect} onCelebrate={onCelebrate} />
      ))}

      <button
        onClick={() => navigate("/onboarding")}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50/50 transition-all text-sm font-medium mt-1"
      >
        <Plus className="w-4 h-4" />
        Add a Lock
      </button>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [quote, setQuote]               = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError]     = useState(null);

  const [streakData, setStreakData]       = useState(null);
  const [streakLoading, setStreakLoading] = useState(true);

  const [monthlyKey, setMonthlyKey]           = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationLock, setCelebrationLock] = useState("");
  const [lastCelebration, setLastCelebration] = useState(null);

  const fetchStreak = useCallback(async () => {
    setStreakLoading(true);
    try {
      const res = await api.get("/user-streak/");
      setStreakData(res.data);
    } catch { /* silent */ }
    finally { setStreakLoading(false); }
  }, []);

  const fetchQuote = useCallback(async () => {
    try {
      const res = await fetch(
        "https://quotes-inspirational-quotes-motivational-quotes.p.rapidapi.com/quote?token=ipworld.info",
        {
          headers: {
            "x-rapidapi-host": "quotes-inspirational-quotes-motivational-quotes.p.rapidapi.com",
            "x-rapidapi-key":  "202528eea6mshd16b1fc39a258c1p18395djsn945f38947b99",
          },
        }
      );
      setQuote(await res.json());
    } catch { setQuoteError("Failed to load quote"); }
    finally { setQuoteLoading(false); }
  }, []);

  useEffect(() => { fetchQuote(); fetchStreak(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStreak();
      setMonthlyKey(k => k + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCelebrate = (lockName) => {
    const key = `${lockName}-${new Date().toDateString()}`;
    if (lastCelebration === key) return;
    setCelebrationLock(lockName);
    setShowCelebration(true);
    setLastCelebration(key);
    fetchStreak();
  };

  const handleShare = () => {
    const text = `Just locked in on ${celebrationLock}! Day ${streakData?.current_streak} on LockedIn.`;
    if (navigator.share) navigator.share({ title: "LockedIn", text, url: window.location.origin });
    else navigator.clipboard.writeText(text);
  };

  return (
    <>
      <div className={PAGE}>
        <Navbar />
        <div className={CONTAINER}>

          {/* Date heading */}
          <div className="mb-4">
            <h1 className={TEXT.pageTitle}>
              {new Date().toLocaleDateString("en-US", { weekday: "long" })}
            </h1>
            <p className={TEXT.caption}>
              {new Date().toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          </div>

          <LevelStrip streakData={streakData} loading={streakLoading} />

          <QuoteCard quote={quote} loading={quoteLoading} error={quoteError} />

          <LocksSection onCelebrate={handleCelebrate} />

          {/* Analytics accordion */}
          <details className={`${CARD} group`}>
            <summary className="flex items-center gap-3 p-4 cursor-pointer list-none hover:bg-gray-50 rounded-2xl transition-colors">
              <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <div className={TEXT.cardTitle}>Quick Analytics</div>
                <div className={TEXT.caption}>This month at a glance</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 ml-auto transition-transform duration-300 group-open:rotate-90" />
            </summary>
            <div className="px-4 pb-4 border-t border-gray-50 pt-3">
              <Link
                to="/analytics"
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                View full analytics
              </Link>
            </div>
          </details>

        </div>
      </div>

      <StreakCelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        streakData={streakData}
        onShare={handleShare}
      />

      <style>{`
        details[open] summary .group-open\\:rotate-90 { transform: rotate(90deg); }
      `}</style>
    </>
  );
}