import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight as NextIcon,
  Flame, Check, Calendar, Trophy,
  Sparkles, BarChart2, Gift, Plus, Trash2,
  Pencil, X, Clock, TrendingUp, TrendingDown,
  Dumbbell, ThumbsUp, Lock, History,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAspects } from "../../utils/useAspects";
import api from "../../utils/api";

// ─── Performance icon ─────────────────────────────────────────────────────────
const PerformanceIcon = ({ type, className = "w-5 h-5" }) => {
  const map = {
    "fire":        <Flame       className={`${className} text-orange-500`} />,
    "muscle":      <Dumbbell    className={`${className} text-blue-500`} />,
    "thumbs-up":   <ThumbsUp    className={`${className} text-green-500`} />,
    "trending-up": <TrendingUp  className={`${className} text-indigo-500`} />,
  };
  return map[type] || <TrendingUp className={`${className} text-indigo-500`} />;
};

// ─── Saturday wrapped gate modal ──────────────────────────────────────────────
const WrappedNotReadyModal = ({ availableFrom, onClose }) => {
  const date = availableFrom
    ? new Date(availableFrom).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
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
            Wrapped is generated at the end of each week so you get a complete picture of how you did.
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
        <button onClick={onDismiss} className="text-gray-500 hover:text-gray-300 ml-1 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Lock-in celebration ──────────────────────────────────────────────────────
const LockInCelebration = ({ color, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
      <div className="text-center animate-pop">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-3 shadow-2xl"
          style={{ backgroundColor: color }}>
          <Lock className="w-12 h-12 text-white" />
        </div>
        <div className="bg-white rounded-2xl px-6 py-3 shadow-xl">
          <div className="text-2xl font-black text-gray-800">Locked In!</div>
          <div className="text-gray-400 text-sm mt-0.5">All actions done today</div>
        </div>
      </div>
    </div>
  );
};

// ─── Activity item — editable ─────────────────────────────────────────────────
const ActivityItem = ({ activity, color, onToggle, onDelete, onEdit, disabled }) => {
  const [optimistic, setOptimistic] = useState(activity.completed);
  const [editing, setEditing]       = useState(false);
  const [editText, setEditText]     = useState(activity.title);

  useEffect(() => { setOptimistic(activity.completed); }, [activity.completed]);

  const handleToggle = async () => {
    if (disabled || editing) return;
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
    <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 ${
      optimistic ? "border-transparent" : "border-gray-100 hover:border-gray-200"
    }`} style={optimistic ? { backgroundColor: color + "12", borderColor: color + "35" } : {}}>
      <button onClick={handleToggle} disabled={editing}
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={optimistic ? { backgroundColor: color } : { border: `2px solid ${color}50` }}>
        {optimistic && <Check className="w-3.5 h-3.5 text-white" />}
      </button>
      {editing ? (
        <input autoFocus value={editText} onChange={e => setEditText(e.target.value)}
          onKeyDown={handleKeyDown} onBlur={handleSaveEdit}
          className="flex-1 text-sm bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800"
          style={{ color: "#111827" }} maxLength={120} />
      ) : (
        <span onClick={handleToggle}
          className={`flex-1 text-sm cursor-pointer transition-all duration-200 ${
            optimistic ? "text-gray-400 line-through" : "text-gray-700"
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

// ─── Past day activity item (simpler — no edit/delete) ────────────────────────
const PastActivityItem = ({ activity, color, onToggle }) => {
  const [optimistic, setOptimistic] = useState(activity.completed);
  const [loading, setLoading]       = useState(false);

  useEffect(() => { setOptimistic(activity.completed); }, [activity.completed]);

  const handleToggle = async () => {
    if (loading) return;
    setOptimistic(o => !o);
    setLoading(true);
    await onToggle(activity.id, activity.completed);
    setLoading(false);
  };

  // Format the completion timestamp if available
  const completedOn = activity.completed_at
    ? new Date(activity.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  // Was it marked on a different day than the activity date?
  const isRetroactive = activity.completed_at
    ? new Date(activity.completed_at).toDateString() !== new Date(activity.date).toDateString()
    : false;

  return (
    <button onClick={handleToggle} disabled={loading}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
        optimistic
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-200 hover:border-gray-300"
      } ${loading ? "opacity-60" : ""}`}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        optimistic ? "bg-green-500 border-green-500" : "border-gray-300"
      }`}>
        {optimistic && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className={`flex-1 text-sm ${optimistic ? "text-green-700 line-through" : "text-gray-700"}`}>
        {activity.title}
      </span>
      {optimistic && completedOn && (
        <span className={`text-xs flex-shrink-0 flex items-center gap-1 ${
          isRetroactive ? "text-amber-500" : "text-gray-400"
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
  const [loading, setLoading]       = useState(true);

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
      // Refresh calendar heatmap so the colour updates immediately
      onCalendarRefresh();
    } catch { /* silent */ }
  };

  const allDone  = activities.length > 0 && activities.every(a => a.completed);
  const noneDone = activities.every(a => !a.completed);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
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

      {/* Status pill */}
      {!loading && activities.length > 0 && (
        <div className="px-4 pt-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            allDone
              ? "bg-green-100 text-green-700"
              : noneDone
                ? "bg-gray-100 text-gray-500"
                : "bg-amber-50 text-amber-600"
          }`}>
            {allDone ? (
              <><Check className="w-3 h-3" /> Locked in</>
            ) : noneDone ? (
              <><X className="w-3 h-3" /> Not started</>
            ) : (
              <><Clock className="w-3 h-3" /> Partial — {activities.filter(a => a.completed).length}/{activities.length}</>
            )}
          </div>
        </div>
      )}

      {/* Activities */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-gray-400 text-sm">No activities were recorded for this day.</div>
            <div className="text-gray-300 text-xs mt-1">
              Activities are only available for days after your Lock was created.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map(activity => (
              <PastActivityItem
                key={activity.id}
                activity={activity}
                color={color}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}

        {/* Honest note */}
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

// ─── Calendar heat map ────────────────────────────────────────────────────────
const CalendarHeatmap = ({ aspectId, color, fetchCalendar }) => {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [monthDate, setMonthDate]     = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);  // past day clicked
  const [refreshKey, setRefreshKey]   = useState(0);       // forces calendar reload

  const load = useCallback(async (d) => {
    setLoading(true);
    const res = await fetchCalendar(aspectId, d.getMonth() + 1, d.getFullYear());
    if (res.ok) setData(res.data);
    setLoading(false);
  }, [aspectId]);

  useEffect(() => { load(monthDate); }, [monthDate, refreshKey]);

  const nav = (dir) => {
    // Close any open past-day panel when navigating months
    setSelectedDate(null);
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() + (dir === "next" ? 1 : -1));
    setMonthDate(d);
  };

  const handleDayClick = (day) => {
    const clickedDate = new Date(day.date + "T12:00:00");
    const today       = new Date();
    today.setHours(0, 0, 0, 0);
    clickedDate.setHours(0, 0, 0, 0);

    // Only past days are clickable (not today — today is handled by the check-in section)
    if (clickedDate >= today) return;
    // Only days that have activities recorded
    if (day.total === 0) return;

    // Toggle: clicking the same date again closes the panel
    setSelectedDate(prev => prev === day.date ? null : day.date);
  };

  const today = new Date().toDateString();

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-gray-800 text-sm">
              {data ? `${data.month_name} ${data.year}` : "..."}
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
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: new Date(data?.year, data?.month - 1, 1).getDay() }, (_, i) => (
                <div key={`e-${i}`} />
              ))}
              {data?.daily_data?.map(day => {
                const isToday      = new Date(day.date).toDateString() === today;
                const isPast       = new Date(day.date + "T12:00:00") < new Date(new Date().setHours(0,0,0,0));
                const isClickable  = isPast && day.total > 0;
                const isSelected   = selectedDate === day.date;

                let bg = "bg-gray-100";
                if (day.is_locked_in)  bg = "";
                else if (day.is_partial) bg = "bg-yellow-200";
                else if (day.total > 0)  bg = "bg-red-100";

                return (
                  <div key={day.day}
                    onClick={() => handleDayClick(day)}
                    title={
                      day.total > 0
                        ? `${day.completed}/${day.total} done${isClickable ? " — click to update" : ""}`
                        : "No activities"
                    }
                    className={`h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${bg} ${
                      isToday    ? "ring-2 ring-indigo-400 ring-offset-1" : ""
                    } ${isSelected  ? "ring-2 ring-offset-1" : ""} ${
                      isClickable  ? "cursor-pointer hover:opacity-75 hover:scale-110" : ""
                    }`}
                    style={{
                      ...(day.is_locked_in ? { backgroundColor: color + "70" } : {}),
                      ...(isSelected ? { ringColor: color } : {}),
                    }}>
                    <span className={
                      day.is_locked_in ? "text-white font-bold"
                      : day.total > 0   ? "text-gray-600"
                      : "text-gray-300"
                    }>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 flex-wrap">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-100" /> None</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-200" /> Partial</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: color + "70" }} /> Locked in</div>
              <div className="flex items-center gap-1 ml-auto text-gray-300">
                <History className="w-3 h-3" /> Tap past day to update
              </div>
            </div>
          </>
        )}
      </div>

      {/* Past day panel — renders below calendar when a day is selected */}
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
  const { id }   = useParams();
  const navigate = useNavigate();
  const {
    aspectDetail, detailLoading, error,
    fetchAspectDetail, toggleActivity,
    generateWrapped, fetchCalendar,
  } = useAspects();

  const [activities, setActivities]               = useState([]);
  const [toastMilestones, setToastMilestones]     = useState([]);
  const [showCelebration, setShowCelebration]     = useState(false);
  const [showWrappedGate, setShowWrappedGate]     = useState(false);
  const [wrappedGateDate, setWrappedGateDate]     = useState(null);
  const [generatingWrapped, setGeneratingWrapped] = useState(false);
  const [newActivityText, setNewActivityText]     = useState("");
  const [addingActivity, setAddingActivity]       = useState(false);
  const [showAddInput, setShowAddInput]           = useState(false);

  useEffect(() => {
    fetchAspectDetail(id).then(data => {
      if (data?.today_activities) setActivities(data.today_activities);
    });
  }, [id]);

  useEffect(() => {
    if (aspectDetail?.today_activities) setActivities(aspectDetail.today_activities);
  }, [aspectDetail]);

  // ── Toggle ─────────────────────────────────────────────────────────────────
  const handleToggle = async (activity) => {
    const res = await toggleActivity(activity.id, activity.completed);
    if (!res.ok) return;
    const updated = activities.map(a =>
      a.id === activity.id ? { ...a, completed: res.activity.completed } : a
    );
    setActivities(updated);
    if (updated.every(a => a.completed) && updated.length > 0 && !activity.completed) {
      setShowCelebration(true);
    }
    if (res.newMilestones?.length > 0) {
      setToastMilestones(res.newMilestones);
    }
  };

  // ── Edit activity title ────────────────────────────────────────────────────
  const handleEditActivity = async (activityId, newTitle) => {
    try {
      const res = await api.patch(`/activities/${activityId}/`, { title: newTitle });
      setActivities(prev => prev.map(a => a.id === activityId ? { ...a, title: res.data.title } : a));
    } catch { /* silent */ }
  };

  // ── Delete activity ────────────────────────────────────────────────────────
  const handleDeleteActivity = async (activityId) => {
    try {
      await api.delete(`/activities/${activityId}/`);
      setActivities(prev => prev.filter(a => a.id !== activityId));
    } catch { /* silent */ }
  };

  // ── Add new activity for today ─────────────────────────────────────────────
  const handleAddActivity = async () => {
    const title = newActivityText.trim();
    if (!title) return;
    setAddingActivity(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res   = await api.post(`/aspects/${id}/activities/`, { title, date: today });
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
    } else if (res.error === "not_saturday" || res.data?.error === "not_saturday") {
      setWrappedGateDate(res.data?.available_from || null);
      setShowWrappedGate(true);
    } else {
      try {
        const parsed = typeof res.error === "string" ? JSON.parse(res.error) : res.error;
        if (parsed?.error === "not_saturday") {
          setWrappedGateDate(parsed.available_from);
          setShowWrappedGate(true);
          return;
        }
      } catch { /* not JSON */ }
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (detailLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-20" />)}
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
          <button onClick={() => navigate("/aspects")} className="text-indigo-600 font-semibold text-sm">
            Back to Locks
          </button>
        </div>
      </>
    );
  }

  const {
    display_name, color, why_statement,
    days_elapsed, days_remaining, progress_percentage,
    current_week, total_weeks, current_streak,
    milestones = [], recent_wraps = [],
    is_forever,
  } = aspectDetail;

  const totalActivities     = activities.length;
  const completedActivities = activities.filter(a => a.completed).length;
  const isLockedIn          = totalActivities > 0 && completedActivities === totalActivities;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

          {/* ── Header ── */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/aspects")}
              className="w-9 h-9 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-black text-xl text-gray-800 truncate">{display_name}</h1>
              {!is_forever && (
                <div className="text-gray-400 text-xs">Week {current_week} of {total_weeks}</div>
              )}
            </div>
            {current_streak > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-50 text-orange-500 px-3 py-1.5 rounded-xl text-sm font-bold flex-shrink-0">
                <Flame className="w-3.5 h-3.5" />
                {current_streak}d
              </div>
            )}
          </div>

          {/* ── Why statement ── */}
          {why_statement && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Your why</p>
              <p className="text-gray-600 text-sm italic">"{why_statement}"</p>
            </div>
          )}

          {/* ── Sprint progress ── */}
          {!is_forever && progress_percentage !== null && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Sprint progress</span>
                <span className="text-sm font-bold" style={{ color }}>{progress_percentage}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress_percentage}%`, backgroundColor: color }} />
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                <span>Day {days_elapsed}</span>
                <span>{days_remaining} days left</span>
              </div>
            </div>
          )}

          {/* ── Today's check-in ── */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-800">Today's actions</h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
              </div>
              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isLockedIn
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  style={{ color: "#111827" }} maxLength={120} />
                <button onClick={handleAddActivity} disabled={addingActivity}
                  className="px-3 py-2 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  style={{ backgroundColor: color }}>
                  {addingActivity ? "..." : "Add"}
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

          {/* ── Calendar (with retroactive editing built in) ── */}
          <CalendarHeatmap aspectId={id} color={color} fetchCalendar={fetchCalendar} />

          {/* ── Milestones ── */}
          {!is_forever && milestones.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <h2 className="font-bold text-gray-800 text-sm">Milestones</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {milestones.slice(0, 6).map(m => (
                  <div key={m.id} className={`rounded-xl p-3 flex items-center gap-2 ${
                    m.achieved ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50 border border-gray-100"
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

          {/* ── Weekly wrapped ── */}
          {!is_forever && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
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

      {/* ── Overlays ── */}
      {showCelebration && (
        <LockInCelebration color={color} onClose={() => setShowCelebration(false)} />
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