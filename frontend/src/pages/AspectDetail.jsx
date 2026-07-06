import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight as NextIcon,
  Flame, Check, Calendar, Trophy,
  BarChart2, Gift, Plus, Trash2,
  Pencil, X, Clock, TrendingUp,
  Dumbbell, ThumbsUp, Lock, History,
  Infinity as InfinityIcon,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAspects } from "../../utils/useAspects";
import api from "../../utils/api";

// ─── Performance icon ─────────────────────────────────────────────────────────
const PerformanceIcon = ({ type, className = "w-5 h-5" }) => {
  const map = {
    "fire": <Flame className={`${className} text-orange-500`} />,
    "muscle": <Dumbbell className={`${className} text-blue-500`} />,
    "thumbs-up": <ThumbsUp className={`${className} text-green-500`} />,
    "trending-up": <TrendingUp className={`${className} text-indigo-500`} />,
  };
  return map[type] || <TrendingUp className={`${className} text-indigo-500`} />;
};

// ─── Forever-lock hero ────────────────────────────────────────────────────────
// Used instead of the sprint-progress bar when a Lock has no target_date.
// There's no denominator for a completion %, so instead of a ring we lead with
// the streak itself as a hero number, then show a milestone roadmap in place
// of a fill-based progress visual.
const FOREVER_THRESHOLDS = [7, 14, 30, 60, 90, 180];

const ForeverHero = ({ currentStreak, daysElapsed, milestonesAchieved }) => {
  const next = FOREVER_THRESHOLDS.find(t => t > currentStreak);
  const lastPassedIndex = FOREVER_THRESHOLDS.filter(t => t <= currentStreak).length - 1;
  const fillPct = FOREVER_THRESHOLDS.length > 1
    ? (Math.max(lastPassedIndex, 0) / (FOREVER_THRESHOLDS.length - 1)) * 100
    : 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#EBEBEE] shadow-sm">
      <div className="text-center mb-5">
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
          <InfinityIcon className="w-3 h-3" />
          Ongoing &middot; no end date
        </span>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Flame className="w-8 h-8 text-orange-500" />
          <span className="text-5xl font-black text-gray-800">{currentStreak}</span>
        </div>
        <p className="text-gray-400 text-sm mt-1">days locked in, back to back</p>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Your journey</span>
        {next && <span className="text-xs text-gray-400">next: {next} days</span>}
      </div>

      <div className="relative px-1 pt-1 pb-1">
        <div className="absolute top-[9px] left-1.5 right-1.5 h-[3px] bg-[#EBEBEE] rounded-full" />
        <div className="absolute top-[9px] left-1.5 h-[3px] bg-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${fillPct}%` }} />
        <div className="relative flex justify-between">
          {FOREVER_THRESHOLDS.map(t => {
            const isPassed = t <= currentStreak;
            return (
              <div key={t} className="flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  isPassed ? "bg-indigo-600" : "bg-gray-200"
                }`}>
                  {isPassed && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-[9px] mt-1.5 ${isPassed ? "text-indigo-600 font-semibold" : "text-gray-400"}`}>
                  {t}d
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-5">
        <div className="bg-[#F4F4F7] rounded-xl p-3 text-center">
          <div className="text-base font-bold text-gray-800">{daysElapsed}</div>
          <div className="text-xs text-gray-400">days tracked</div>
        </div>
        <div className="bg-[#F4F4F7] rounded-xl p-3 text-center">
          <div className="text-base font-bold text-gray-800">{milestonesAchieved}</div>
          <div className="text-xs text-gray-400">milestones earned</div>
        </div>
      </div>
    </div>
  );
};

// ─── Wrapped gate modal ───────────────────────────────────────────────────────
const WrappedNotReadyModal = ({ availableFrom, onClose }) => {
  const date = availableFrom
    ? new Date(availableFrom).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    })
    : "this Saturday";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-indigo-400 to-purple-500" />
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">Not quite yet</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            Your weekly wrapped isn't ready. Come back on
          </p>
          <p className="font-bold text-indigo-600 text-base mb-4">{date}</p>
          <p className="text-gray-400 text-xs mb-6">
            Wrapped is generated at the end of each week so you get a complete picture.
          </p>
          <button onClick={onClose}
            className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl transition-colors text-sm">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Milestone toast ──────────────────────────────────────────────────────────
const MilestoneToast = ({ milestones, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, []);

  if (!milestones?.length) return null;
  const m = milestones[0];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-80">
      <div className="bg-gray-900 text-white rounded-2xl px-4 py-3.5 shadow-2xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: m.badge_color }}>
          <Trophy className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">{m.title}</div>
          <div className="text-gray-400 text-xs truncate">{m.description}</div>
        </div>
        <button onClick={onDismiss} className="text-gray-500 hover:text-gray-300 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Minor celebration (single lock complete) ─────────────────────────────────
const LockCelebration = ({ color, lockName, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
      <div className="text-center animate-pop">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 shadow-xl"
          style={{ backgroundColor: color }}>
          <Check className="w-8 h-8 text-white" />
        </div>
        <div className="bg-white rounded-2xl px-5 py-2.5 shadow-lg">
          <div className="text-base font-black text-gray-800">{lockName} locked in!</div>
          <div className="text-gray-400 text-xs mt-0.5">Keep going 🔥</div>
        </div>
      </div>
    </div>
  );
};

// ─── Major celebration (all locks complete) ───────────────────────────────────
const AllLockedInCelebration = ({ color, streak, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
      <div className="text-center animate-pop">
        <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-3 shadow-2xl"
          style={{ backgroundColor: color }}>
          <Lock className="w-14 h-14 text-white" />
        </div>
        <div className="bg-white rounded-2xl px-8 py-4 shadow-2xl">
          <div className="text-3xl font-black text-gray-800">All Locked In!</div>
          <div className="text-gray-500 text-sm mt-1">Every lock complete today</div>
          {streak > 0 && (
            <div className="flex items-center justify-center gap-1.5 mt-2 bg-orange-50 rounded-xl px-4 py-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-black text-orange-500">{streak} day streak</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Activity item (today — editable) ────────────────────────────────────────
const ActivityItem = ({ activity, color, onToggle, onDelete, onEdit }) => {
  const [optimistic, setOptimistic] = useState(activity.completed);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(activity.title);

  useEffect(() => { setOptimistic(activity.completed); }, [activity.completed]);

  const handleToggle = async () => {
    if (editing) return;
    setOptimistic(o => !o);
    await onToggle(activity);
  };

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setEditing(false);
    await onEdit(activity.id, trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSaveEdit();
    if (e.key === "Escape") { setEditing(false); setEditText(activity.title); }
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 ${optimistic ? "border-transparent" : "border-gray-100 hover:border-gray-200"
      }`} style={optimistic ? { backgroundColor: color + "12", borderColor: color + "35" } : {}}>

      <button onClick={handleToggle} disabled={editing}
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={optimistic ? { backgroundColor: color } : { border: `2px solid ${color}50` }}>
        {optimistic && <Check className="w-3.5 h-3.5 text-white" />}
      </button>

      {editing ? (
        <input autoFocus value={editText}
          onChange={e => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSaveEdit}
          className="flex-1 text-sm bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          style={{ color: "#111827" }}
          maxLength={120}
        />
      ) : (
        <span onClick={handleToggle}
          className={`flex-1 text-sm cursor-pointer transition-all duration-200 ${optimistic ? "text-gray-400 line-through" : "text-gray-700"
            }`}>
          {activity.title}
        </span>
      )}

      {!optimistic && !editing && (
        <button onClick={() => setEditing(true)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-indigo-400 hover:bg-indigo-50 transition-colors flex-shrink-0">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
      {!optimistic && (
        <button onClick={() => onDelete(activity.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

// ─── Past day activity item ───────────────────────────────────────────────────
const PastActivityItem = ({ activity, color, onToggle }) => {
  const [optimistic, setOptimistic] = useState(activity.completed);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setOptimistic(activity.completed); }, [activity.completed]);

  const handleToggle = async () => {
    if (loading) return;
    setOptimistic(o => !o);
    setLoading(true);
    await onToggle(activity.id, activity.completed);
    setLoading(false);
  };

  const completedOn = activity.completed_at
    ? new Date(activity.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  const isRetroactive = activity.completed_at
    ? new Date(activity.completed_at).toDateString() !== new Date(activity.date + "T12:00:00").toDateString()
    : false;

  return (
    <button onClick={handleToggle} disabled={loading}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${optimistic ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:border-gray-300"
        } ${loading ? "opacity-60" : ""}`}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${optimistic ? "bg-green-500 border-green-500" : "border-gray-300"
        }`}>
        {optimistic && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className={`flex-1 text-sm ${optimistic ? "text-green-700 line-through" : "text-gray-700"}`}>
        {activity.title}
      </span>
      {optimistic && completedOn && (
        <span className={`text-xs flex-shrink-0 flex items-center gap-1 ${isRetroactive ? "text-amber-500" : "text-gray-400"
          }`}>
          {isRetroactive && <History className="w-3 h-3" />}
          {completedOn}
        </span>
      )}
    </button>
  );
};

// ─── Past day panel ───────────────────────────────────────────────────────────
const PastDayPanel = ({ dateStr, aspectId, color, onClose, onCalendarRefresh }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const formattedDate = new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  useEffect(() => {
    setLoading(true);
    api.get(`/aspects/${aspectId}/activities/?date=${dateStr}`)
      .then(res => setActivities(res.data.activities || []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [dateStr, aspectId]);

  const handleToggle = async (activityId, currentCompleted) => {
    try {
      const res = await api.patch(`/activities/${activityId}/`, {
        completed: !currentCompleted,
      });
      setActivities(prev =>
        prev.map(a => a.id === activityId
          ? { ...a, completed: res.data.completed, completed_at: res.data.completed_at }
          : a
        )
      );
      onCalendarRefresh();
    } catch { /* silent */ }
  };

  const allDone = activities.length > 0 && activities.every(a => a.completed);
  const noneDone = activities.every(a => !a.completed);

  return (
    <div className="bg-white rounded-2xl border border-[#EBEBEE] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#EBEBEE]">
        <div>
          <div className="font-bold text-gray-800 text-sm">{formattedDate}</div>
          <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <History className="w-3 h-3" />
            Retroactive check-in
          </div>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {!loading && activities.length > 0 && (
        <div className="px-4 pt-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${allDone ? "bg-green-100 text-green-700" :
              noneDone ? "bg-gray-100 text-gray-500" :
                "bg-amber-50 text-amber-600"
            }`}>
            {allDone ? <><Check className="w-3 h-3" /> Locked in</> :
              noneDone ? <><X className="w-3 h-3" /> Not started</> :
                <><Clock className="w-3 h-3" /> Partial — {activities.filter(a => a.completed).length}/{activities.length}</>}
          </div>
        </div>
      )}

      <div className="p-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-gray-400 text-sm">No activities recorded for this day.</div>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map(activity => (
              <PastActivityItem key={activity.id} activity={activity}
                color={color} onToggle={handleToggle} />
            ))}
          </div>
        )}
        {!loading && activities.length > 0 && (
          <p className="text-xs text-gray-400 mt-3 text-center flex items-center justify-center gap-1">
            <History className="w-3 h-3 text-amber-400" />
            Retroactive completions are tracked with the date they were ticked
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Calendar heatmap ─────────────────────────────────────────────────────────
const CalendarHeatmap = ({ aspectId, color, fetchCalendar }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async (d) => {
    setLoading(true);
    const res = await fetchCalendar(aspectId, d.getMonth() + 1, d.getFullYear());
    if (res.ok) setData(res.data);
    setLoading(false);
  }, [aspectId]);

  useEffect(() => { load(monthDate); }, [monthDate, refreshKey]);

  const nav = (dir) => {
    setSelectedDate(null);
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() + (dir === "next" ? 1 : -1));
    setMonthDate(d);
  };

  const handleDayClick = (day) => {
    const clicked = new Date(day.date + "T12:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    clicked.setHours(0, 0, 0, 0);
    if (clicked >= today) return;
    if (day.total === 0) return;
    setSelectedDate(prev => prev === day.date ? null : day.date);
  };

  const todayStr = new Date().toDateString();

  const getDayStyle = (day) => {
    if (day.is_locked_in) return { bg: color + "80", text: "text-white font-bold" };
    if (day.is_partial) return { bg: "#f97316", text: "text-white font-semibold" };
    if (day.total > 0) return { bg: "#fee2e2", text: "text-red-500" };
    return { bg: "#EBEBEE", text: "text-gray-300" };
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-4 border border-[#EBEBEE] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-gray-800 text-sm">
              {data ? `${data.month_name} ${data.year}` : "…"}
            </span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => nav("prev")}
              className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => nav("next")}
              className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
              <NextIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="h-7 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: new Date(data?.year, data?.month - 1, 1).getDay() }, (_, i) => (
                <div key={`e-${i}`} />
              ))}
              {data?.daily_data?.map(day => {
                const isToday = new Date(day.date + "T12:00:00").toDateString() === todayStr;
                const isPast = new Date(day.date + "T12:00:00") < new Date(new Date().setHours(0, 0, 0, 0));
                const isClickable = isPast && day.total > 0;
                const isSelected = selectedDate === day.date;
                const style = getDayStyle(day);

                return (
                  <div key={day.day}
                    onClick={() => handleDayClick(day)}
                    title={day.total > 0 ? `${day.completed}/${day.total} done` : "No activities"}
                    className={`h-7 rounded-lg flex items-center justify-center text-xs transition-all ${style.text} ${isClickable ? "cursor-pointer hover:opacity-80 hover:scale-110" : ""
                      } ${isToday ? "ring-2 ring-indigo-400 ring-offset-1" : ""} ${isSelected ? "ring-2 ring-offset-1" : ""
                      }`}
                    style={{
                      backgroundColor: style.bg,
                      ...(isSelected ? { outlineOffset: "2px" } : {}),
                    }}>
                    {day.day}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#EBEBEE] border border-gray-200" /> None
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#f97316" }} /> Partial
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: color + "80" }} /> Locked in
              </div>
              <div className="flex items-center gap-1 ml-auto text-gray-300">
                <History className="w-3 h-3" /> Tap past day to edit
              </div>
            </div>
          </>
        )}
      </div>

      {selectedDate && (
        <PastDayPanel
          dateStr={selectedDate}
          aspectId={aspectId}
          color={color}
          onClose={() => setSelectedDate(null)}
          onCalendarRefresh={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AspectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    aspectDetail, detailLoading, error,
    fetchAspectDetail, toggleActivity,
    generateWrapped, fetchCalendar,
  } = useAspects();

  const [activities, setActivities] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [toastMilestones, setToastMilestones] = useState([]);
  const [showLockCelebration, setShowLockCelebration] = useState(false);
  const [showAllCelebration, setShowAllCelebration] = useState(false);
  const [freshStreak, setFreshStreak] = useState(0);
  const [showWrappedGate, setShowWrappedGate] = useState(false);
  const [wrappedGateDate, setWrappedGateDate] = useState(null);
  const [generatingWrapped, setGeneratingWrapped] = useState(false);
  const [newActivityText, setNewActivityText] = useState("");
  const [addingActivity, setAddingActivity] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);

  useEffect(() => {
    fetchAspectDetail(id).then(data => {
      if (data?.today_activities) setActivities(data.today_activities);
      if (data?.current_streak !== undefined) setCurrentStreak(data.current_streak);
    });
  }, [id]);

  useEffect(() => {
    if (aspectDetail?.today_activities) setActivities(aspectDetail.today_activities);
    if (aspectDetail?.current_streak !== undefined) setCurrentStreak(aspectDetail.current_streak);
  }, [aspectDetail]);

  // ── THE ONLY handleToggle ──────────────────────────────────────────────────
  const handleToggle = async (activity) => {
    const res = await toggleActivity(activity.id, activity.completed);
    if (!res.ok) return;

    const updated = activities.map(a =>
      a.id === activity.id ? { ...a, completed: res.activity.completed } : a
    );
    setActivities(updated);

    const nowAllDone = updated.every(a => a.completed) && updated.length > 0;

    if (nowAllDone && !activity.completed) {
      // Step 1 — minor celebration immediately (this lock is done)
      setShowLockCelebration(true);

      // Step 2 — fetch fresh per-aspect streak from server
      fetchAspectDetail(id).then(data => {
        if (data?.current_streak !== undefined) setCurrentStreak(data.current_streak);
      });

      // Step 3 — check if ALL locks across the app are now done
      try {
        const streakRes = await api.get("/user-streak/");
        if (streakRes.data.today_locked_in) {
          // All locks are done — upgrade to major celebration after minor fades
          setTimeout(() => {
            setShowLockCelebration(false);
            setFreshStreak(streakRes.data.current_streak);
            setShowAllCelebration(true);
          }, 1800);
        }
      } catch { /* silent — minor celebration stays */ }
    }

    if (res.newMilestones?.length > 0) {
      setToastMilestones(res.newMilestones);
    }
  };

  // ── Edit title ─────────────────────────────────────────────────────────────
  const handleEditActivity = async (activityId, newTitle) => {
    try {
      const res = await api.patch(`/activities/${activityId}/`, { title: newTitle });
      setActivities(prev =>
        prev.map(a => a.id === activityId ? { ...a, title: res.data.title } : a)
      );
    } catch { /* silent */ }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteActivity = async (activityId) => {
    try {
      await api.delete(`/activities/${activityId}/`);
      setActivities(prev => prev.filter(a => a.id !== activityId));
    } catch { /* silent */ }
  };

  // ── Add today ──────────────────────────────────────────────────────────────
  const handleAddActivity = async () => {
    const title = newActivityText.trim();
    if (!title) return;
    setAddingActivity(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await api.post(`/aspects/${id}/activities/`, { title, date: today });
      setActivities(prev => [...prev, res.data]);
      setNewActivityText("");
      setShowAddInput(false);
    } catch { /* silent */ }
    finally { setAddingActivity(false); }
  };

  // ── Generate wrapped ───────────────────────────────────────────────────────
  const handleGenerateWrapped = async () => {
    setGeneratingWrapped(true);
    const res = await generateWrapped(id);
    setGeneratingWrapped(false);

    if (res.ok) {
      navigate(`/wrapped/${res.data.id}`);
      return;
    }
    if (res.isSaturdayGate || res.error === "not_saturday" || res.data?.error === "not_saturday") {
      setWrappedGateDate(res.data?.available_from || null);
      setShowWrappedGate(true);
    }
  };

  // ── Loading / error ────────────────────────────────────────────────────────
  if (detailLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-20" />
          ))}
        </div>
      </>
    );
  }

  if (error || !aspectDetail) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-10 text-center">
          <p className="text-red-400 mb-4 text-sm">{error || "Aspect not found"}</p>
          <button onClick={() => navigate("/aspects")}
            className="text-indigo-600 font-semibold text-sm">
            Back to Locks
          </button>
        </div>
      </>
    );
  }

  const {
    display_name, color, why_statement,
    days_elapsed, days_remaining, progress_percentage,
    current_week, total_weeks,
    milestones = [], recent_wraps = [],
    is_forever,
  } = aspectDetail;

  const totalActivities = activities.length;
  const completedActivities = activities.filter(a => a.completed).length;
  const isLockedIn = totalActivities > 0 && completedActivities === totalActivities;
  const milestonesAchieved = milestones.filter(m => m.achieved).length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F4F4F7]">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

          {/* Header */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/aspects")}
              className="w-9 h-9 bg-white rounded-xl shadow-sm border border-[#EBEBEE] flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-black text-xl text-gray-800 truncate">{display_name}</h1>
              {!is_forever && (
                <div className="text-gray-400 text-xs">Week {current_week} of {total_weeks}</div>
              )}
            </div>
            {currentStreak > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-50 text-orange-500 px-3 py-1.5 rounded-xl text-sm font-bold flex-shrink-0">
                <Flame className="w-3.5 h-3.5" />
                {currentStreak}d
              </div>
            )}
          </div>

          {/* Why statement */}
          {why_statement && (
            <div className="bg-white rounded-2xl p-4 border border-[#EBEBEE] shadow-sm">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Your why</p>
              <p className="text-gray-600 text-sm italic">"{why_statement}"</p>
            </div>
          )}

          {/* Sprint progress (fixed-duration Locks) OR forever-lock hero */}
          {!is_forever && progress_percentage !== null && (
            <div className="bg-white rounded-2xl p-4 border border-[#EBEBEE] shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Sprint progress</span>
                <span className="text-sm font-bold" style={{ color }}>{progress_percentage}%</span>
              </div>
              <div className="h-2 bg-[#EBEBEE] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress_percentage}%`, backgroundColor: color }} />
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                <span>Day {days_elapsed}</span>
                <span>{days_remaining} days left</span>
              </div>
            </div>
          )}

          {is_forever && (
            <ForeverHero
              currentStreak={currentStreak}
              daysElapsed={days_elapsed}
              milestonesAchieved={milestonesAchieved}
            />
          )}

          {/* Today's check-in */}
          <div className="bg-white rounded-2xl p-4 border border-[#EBEBEE] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-800">Today's actions</h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long", month: "short", day: "numeric",
                  })}
                </p>
              </div>
              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isLockedIn
                  ? "text-white"
                  : totalActivities === 0
                    ? "bg-gray-100 text-gray-400"
                    : "bg-gray-100 text-gray-600"
                }`} style={isLockedIn ? { backgroundColor: color } : {}}>
                {isLockedIn ? "Locked in!" : `${completedActivities}/${totalActivities}`}
              </div>
            </div>

            <div className="space-y-2">
              {activities.map(activity => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  color={color}
                  onToggle={handleToggle}
                  onDelete={handleDeleteActivity}
                  onEdit={handleEditActivity}
                />
              ))}
            </div>

            {showAddInput ? (
              <div className="flex items-center gap-2 mt-3">
                <input autoFocus type="text" placeholder="New action…"
                  value={newActivityText}
                  onChange={e => setNewActivityText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleAddActivity();
                    if (e.key === "Escape") { setShowAddInput(false); setNewActivityText(""); }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  style={{ color: "#111827" }}
                  maxLength={120}
                />
                <button onClick={handleAddActivity} disabled={addingActivity}
                  className="px-3 py-2 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ backgroundColor: color }}>
                  {addingActivity ? "…" : "Add"}
                </button>
                <button onClick={() => { setShowAddInput(false); setNewActivityText(""); }}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAddInput(true)}
                className="w-full flex items-center justify-center gap-2 mt-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50/50 transition-all text-sm font-medium">
                <Plus className="w-4 h-4" />
                Add an action for today
              </button>
            )}
          </div>

          {/* Calendar */}
          <CalendarHeatmap aspectId={id} color={color} fetchCalendar={fetchCalendar} />

          {/* Milestones — shown for both fixed-duration and forever Locks now,
              since streak-based milestones (7/14/30 day) apply either way. */}
          {milestones.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-[#EBEBEE] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <h2 className="font-bold text-gray-800 text-sm">Milestones</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {milestones.slice(0, 6).map(m => (
                  <div key={m.id} className={`rounded-xl p-3 flex items-center gap-2 ${m.achieved
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-gray-50 border border-gray-100"
                    }`}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: m.achieved ? m.badge_color : "#E5E7EB" }}>
                      <Trophy className={`w-3.5 h-3.5 ${m.achieved ? "text-white" : "text-gray-400"}`} />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold truncate ${m.achieved ? "text-gray-800" : "text-gray-400"}`}>
                        {m.title}
                      </div>
                      {m.achieved && <div className="text-xs text-yellow-600">Unlocked</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly wrapped */}
          {!is_forever && (
            <div className="bg-white rounded-2xl p-4 border border-[#EBEBEE] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-4 h-4 text-indigo-500" />
                <h2 className="font-bold text-gray-800 text-sm">Weekly Wrapped</h2>
                <span className="text-xs text-gray-400 ml-auto">Available Saturdays</span>
              </div>
              {recent_wraps.length > 0 && (
                <div className="space-y-2 mb-4">
                  {recent_wraps.slice(0, 3).map(wrap => (
                    <button key={wrap.id} onClick={() => navigate(`/wrapped/${wrap.id}`)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors text-left">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Week {wrap.week_number}</div>
                        <div className="text-xs text-gray-400">{wrap.completion_rate}% completion</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PerformanceIcon type={wrap.performance_emoji} />
                        <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={handleGenerateWrapped} disabled={generatingWrapped}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all text-sm font-semibold disabled:opacity-50">
                <BarChart2 className="w-4 h-4" />
                {generatingWrapped ? "Generating…" : "Generate this week's wrapped"}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Overlays */}
      {showLockCelebration && !showAllCelebration && (
        <LockCelebration
          color={color}
          lockName={display_name}
          onClose={() => setShowLockCelebration(false)}
        />
      )}
      {showAllCelebration && (
        <AllLockedInCelebration
          color={color}
          streak={freshStreak}
          onClose={() => setShowAllCelebration(false)}
        />
      )}
      {toastMilestones.length > 0 && (
        <MilestoneToast milestones={toastMilestones} onDismiss={() => setToastMilestones([])} />
      )}
      {showWrappedGate && (
        <WrappedNotReadyModal
          availableFrom={wrappedGateDate}
          onClose={() => setShowWrappedGate(false)}
        />
      )}

      <style>{`
        @keyframes pop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        .animate-pop { animation: pop 0.4s ease-out forwards; }
      `}</style>
    </>
  );
}