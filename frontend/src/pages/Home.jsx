import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronRight, Flame, Plus, Check, Lock, Trophy,
  Star, ShieldCheck, Gem, Rocket, Crown, Sparkles,
} from "lucide-react";
import Navbar from "../components/Navbar";
import StreakCelebrationModal from "../components/StreakCelebrationModal";
import api from "../../utils/api";
import { useAspects } from "../../utils/useAspects";
import {
  PAGE, CONTAINER, CARD, CARD_HERO, TEXT, BTN,
  PROGRESS_TRACK, PROGRESS_FILL, LOCK_ACCENT_BAR, DIVIDER,
  QUICK_STAT, QUICK_STAT_ICON_WRAP,
} from "../../utils/design";

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

  const streak    = streakData.current_streak;
  const level     = getLevel(streak);
  const LevelIcon = level.icon;
  const unlocked  = LEVELS.filter(l => streak >= l.requirement).length;

  return (
    <div onClick={() => navigate("/profile")}
      className={`${CARD} p-3 mb-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: level.color + "20" }}>
        <LevelIcon className="w-5 h-5" style={{ color: level.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <span className={TEXT.cardTitle}>{level.name}</span>
        <span className="text-gray-300 mx-1.5 text-xs">·</span>
        <span className={TEXT.caption}>{unlocked} of {LEVELS.length} badges</span>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-base font-black" style={{ color: level.color }}>{streak}</div>
        <div className={TEXT.caption + " leading-none"}>day streak</div>
      </div>
    </div>
  );
};

// ─── Quick analytics — weekly progress ring + quick-stat pills ───────────────
// Replaces the old daily-quote card. The ring's percentage is computed from the
// last 7 calendar days of the current month's overview (clipped to month start
// if we're less than 7 days in). Streak + lifetime numbers come from /user-streak/.
const QuickAnalyticsCard = ({ streakData, streakLoading }) => {
  const [weekPct, setWeekPct]       = useState(0);
  const [weekLocked, setWeekLocked] = useState(0);
  const [weekTotal, setWeekTotal]   = useState(7);
  const [weekLoading, setWeekLoading] = useState(true);
  const [activeLocks, setActiveLocks] = useState(null);

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      try {
        const res = await api.get(
          `/monthly-overview/?month=${now.getMonth() + 1}&year=${now.getFullYear()}`
        );
        const daily   = res.data?.daily_data || [];
        const todayNum = now.getDate();
        const start    = Math.max(1, todayNum - 6);
        const window   = daily.filter(d => d.day >= start && d.day <= todayNum);
        const locked   = window.filter(d => d.is_locked_in).length;
        setWeekLocked(locked);
        setWeekTotal(window.length || 7);
        setWeekPct(window.length ? Math.round((locked / window.length) * 100) : 0);
      } catch {
        setWeekPct(0);
      } finally {
        setWeekLoading(false);
      }

      try {
        const res = await api.get("/dashboard/");
        setActiveLocks(Array.isArray(res.data) ? res.data.length : 0);
      } catch {
        setActiveLocks(null);
      }
    };
    load();
  }, []);

  if (streakLoading) {
    return <div className={`${CARD} p-4 mb-4 animate-pulse h-24`} />;
  }

  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - (weekLoading ? 0 : weekPct / 100));

  const statusLabel = weekLoading
    ? "Loading…"
    : weekPct >= 70 ? "On track"
    : weekPct >= 40 ? "Keep going"
    : "Let's pick it up";

  return (
    <div className="mb-4">
      <div className={`${CARD_HERO} p-4 flex items-center gap-4 mb-3`}>
        <svg width="64" height="64" viewBox="0 0 64 64" className="flex-shrink-0">
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="7" />
          <circle cx="32" cy="32" r={r} fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={weekLoading ? circ : offset}
            style={{
              transition: "stroke-dashoffset 0.6s ease",
              transform: "rotate(-90deg)",
              transformOrigin: "32px 32px",
            }} />
          <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="600" fill="#fff">
            {weekLoading ? "…" : `${weekPct}%`}
          </text>
        </svg>
        <div className="min-w-0">
          <div className="text-[11px] text-indigo-200 uppercase tracking-wide font-semibold mb-0.5">
            This week
          </div>
          <div className="text-white text-sm font-semibold">{statusLabel}</div>
          <div className="text-indigo-200 text-xs">
            {weekLoading ? "\u00A0" : `${weekLocked} of ${weekTotal} days locked in`}
          </div>
        </div>
      </div>

      <div className="flex gap-2.5">
        <div className={QUICK_STAT}>
          <div className={`${QUICK_STAT_ICON_WRAP} bg-orange-50`}>
            <Flame className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div className="text-base font-bold text-gray-800">{streakData?.current_streak ?? 0}</div>
          <div className={TEXT.caption}>day streak</div>
        </div>
        <div className={QUICK_STAT}>
          <div className={`${QUICK_STAT_ICON_WRAP} bg-indigo-50`}>
            <Lock className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-base font-bold text-gray-800">{activeLocks ?? "—"}</div>
          <div className={TEXT.caption}>active locks</div>
        </div>
        <div className={QUICK_STAT}>
          <div className={`${QUICK_STAT_ICON_WRAP} bg-green-50`}>
            <Trophy className="w-3.5 h-3.5 text-green-600" />
          </div>
          <div className="text-base font-bold text-gray-800">{streakData?.total_locked_in_days ?? 0}</div>
          <div className={TEXT.caption}>total locked-in</div>
        </div>
      </div>
    </div>
  );
};

// ─── Activity row ─────────────────────────────────────────────────────────────
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
    <div onClick={handle}
      className="flex items-center gap-3 py-2.5 cursor-pointer group select-none">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${optimistic ? "" : "border-2"}`}
        style={optimistic ? { backgroundColor: color } : { borderColor: color + "60" }}>
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
const LockGroup = ({ aspect, onCelebrate, onStreakRefresh }) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState(aspect.today_activities || []);
  const [lockedIn, setLockedIn]     = useState(aspect.today_locked_in || false);

  useEffect(() => {
    setActivities(aspect.today_activities || []);
    setLockedIn(aspect.today_locked_in || false);
  }, [aspect.id, aspect.today_locked_in]);

  const total     = activities.length;
  const completed = activities.filter(a => a.completed).length;
  const allDone   = (total > 0 && completed === total) || lockedIn;

  const handleToggle = async (activity, newValue) => {
    const updatedActivities = activities.map(a =>
      a.id === activity.id ? { ...a, completed: newValue } : a
    );
    setActivities(updatedActivities);

    try {
      await api.patch(`/activities/${activity.id}/`, { completed: newValue });

      const nowAllDone = updatedActivities.every(a => a.completed) && updatedActivities.length > 0;

      if (nowAllDone && newValue) {
        setLockedIn(true);

        try {
          const streakRes = await api.get("/user-streak/");
          if (streakRes.data.today_locked_in) {
            onCelebrate(aspect.display_name, streakRes.data.current_streak, true);
          } else {
            onCelebrate(aspect.display_name, 0, false);
          }
        } catch {
          onCelebrate(aspect.display_name, 0, false);
        }

        onStreakRefresh();
      } else if (!newValue && lockedIn) {
        setLockedIn(false);
        onStreakRefresh();
      }

      return true;
    } catch {
      setActivities(activities);
      return false;
    }
  };

  return (
    <div className={`${CARD} overflow-hidden mb-3`}>
      <div className={LOCK_ACCENT_BAR} style={{ backgroundColor: aspect.color }} />

      <div className="flex items-center gap-3 px-4 pt-3 pb-1">
        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: aspect.color + "20" }}>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: aspect.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={TEXT.cardTitle}>{aspect.display_name}</span>
            {allDone && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: aspect.color }}>
                Locked in
              </span>
            )}
          </div>
          <div className={TEXT.caption + " mt-0.5"}>
            {total > 0 ? `${completed}/${total} done today` : "No actions set"}
            {aspect.current_streak > 0 && (
              <span className="ml-2 text-orange-400 font-medium">
                {aspect.current_streak}d streak
              </span>
            )}
          </div>
        </div>
        <button onClick={() => navigate(`/aspects/${aspect.id}`)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {total > 0 && (
        <div className="px-4 py-1.5">
          <div className={PROGRESS_TRACK}>
            <div className={PROGRESS_FILL}
              style={{ width: `${(completed / total) * 100}%`, backgroundColor: aspect.color }} />
          </div>
        </div>
      )}

      <div className={`px-4 pb-3 ${DIVIDER}`}>
        {activities.length === 0 ? (
          <div className="py-3 text-center">
            <p className={TEXT.caption + " mb-2"}>No daily actions set up for today.</p>
            <button onClick={() => navigate(`/aspects/${aspect.id}`)}
              className="text-xs font-semibold" style={{ color: aspect.color }}>
              Set up daily actions →
            </button>
          </div>
        ) : (
          activities.map(activity => (
            <ActivityRow key={activity.id} activity={activity}
              color={aspect.color} onToggle={handleToggle} />
          ))
        )}
      </div>
    </div>
  );
};

// ─── Locks section ────────────────────────────────────────────────────────────
const LocksSection = ({ onCelebrate, onStreakRefresh }) => {
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
      <div className={`${CARD} p-8 mb-4 text-center`}>
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-indigo-300" />
        </div>
        <h3 className={TEXT.sectionTitle + " mb-2"}>No Locks yet</h3>
        <p className={TEXT.caption + " mb-6 max-w-xs mx-auto leading-relaxed"}>
          Create your first Lock to start tracking your daily consistency.
        </p>
        <button onClick={() => navigate("/onboarding")}
          className={`${BTN.primary} inline-flex items-center gap-2 px-5 py-3 text-sm`}>
          <Plus className="w-4 h-4" />
          Create your first Lock
        </button>
      </div>
    );
  }

  const lockedInCount = dashboard.filter(a => a.today_locked_in).length;
  const allLockedIn   = lockedInCount === dashboard.length;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className={TEXT.sectionTitle}>Today's Locks</h2>
          <p className={TEXT.caption + " mt-0.5"}>
            {allLockedIn
              ? "You're locked in across everything today"
              : `${lockedInCount} of ${dashboard.length} locked in`}
          </p>
        </div>
        <Link to="/aspects"
          className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
          See all
        </Link>
      </div>

      {dashboard.map(aspect => (
        <LockGroup
          key={aspect.id}
          aspect={aspect}
          onCelebrate={onCelebrate}
          onStreakRefresh={onStreakRefresh}
        />
      ))}

      <button onClick={() => navigate("/onboarding")}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50/50 transition-all text-sm font-medium mt-1">
        <Plus className="w-4 h-4" />
        Add a Lock
      </button>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [streakData, setStreakData]         = useState(null);
  const [streakLoading, setStreakLoading]   = useState(true);
  const [celebration, setCelebration]       = useState(null);
  const [lastCelebration, setLastCelebration] = useState(null);

  const fetchStreak = useCallback(async () => {
    try {
      const res = await api.get("/user-streak/");
      setStreakData(res.data);
    } catch { /* silent */ }
    finally { setStreakLoading(false); }
  }, []);

  useEffect(() => {
    fetchStreak();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchStreak, 60000);
    return () => clearInterval(interval);
  }, [fetchStreak]);

  // lockName: string, streak: number (only relevant when isAllDone), isAllDone: bool
  const handleCelebrate = useCallback((lockName, streak, isAllDone) => {
    if (isAllDone) {
      const key = `all-${new Date().toDateString()}`;
      if (lastCelebration === key) return;
      setLastCelebration(key);
      // Refresh streak data so the modal shows the fresh number
      fetchStreak();
    }
    setCelebration({ lockName, streak, isAllDone });
  }, [lastCelebration, fetchStreak]);

  const handleStreakRefresh = useCallback(() => {
    fetchStreak();
  }, [fetchStreak]);

  const handleShare = () => {
    const text = `Just locked in on ${celebration?.lockName}! Day ${streakData?.current_streak} on LockedIn.`;
    if (navigator.share) navigator.share({ title: "LockedIn", text, url: window.location.origin });
    else navigator.clipboard.writeText(text);
  };

  return (
    <>
      <div className={PAGE}>
        <Navbar />
        <div className={CONTAINER}>
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
          <QuickAnalyticsCard streakData={streakData} streakLoading={streakLoading} />
          <LocksSection
            onCelebrate={handleCelebrate}
            onStreakRefresh={handleStreakRefresh}
          />
        </div>
      </div>

      <StreakCelebrationModal
        isOpen={!!celebration}
        onClose={() => setCelebration(null)}
        streakData={streakData}
        lockName={celebration?.lockName}
        isAllDone={celebration?.isAllDone}
        onShare={handleShare}
      />
    </>
  );
}