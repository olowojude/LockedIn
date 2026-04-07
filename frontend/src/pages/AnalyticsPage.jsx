// src/pages/AnalyticsPage.jsx
import React, { useState, useEffect } from "react";
import {
  BarChart3, Calendar, ChevronLeft, ChevronRight,
  TrendingUp, Target, Award, RefreshCw,
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../../utils/api";
import {
  PAGE, CONTAINER, CARD, TEXT, BTN, STATUS,
} from "../../utils/design";

// ─── Tab ─────────────────────────────────────────────────────────────────────
const Tab = ({ label, icon: Icon, active, onClick }) => (
  <button onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
      active
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
    }`}>
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ value, label, colorKey = "indigo" }) => {
  const s = STATUS[colorKey];
  return (
    <div className={`${s.bg} border ${s.border} rounded-2xl p-4 text-center`}>
      <div className={`text-2xl font-black ${s.text}`}>{value}</div>
      <div className={TEXT.caption + " mt-0.5"}>{label}</div>
    </div>
  );
};

// ─── Nav arrows ──────────────────────────────────────────────────────────────
const NavArrow = ({ onClick, disabled, dir }) => (
  <button onClick={onClick} disabled={disabled}
    className={`${BTN.icon} disabled:opacity-30 disabled:cursor-not-allowed`}>
    {dir === "prev"
      ? <ChevronLeft className="w-4 h-4 text-gray-500" />
      : <ChevronRight className="w-4 h-4 text-gray-500" />}
  </button>
);

// ─── Monthly view ─────────────────────────────────────────────────────────────
const MonthlyView = () => {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayTasks, setDayTasks]     = useState(null);
  const [dayLoading, setDayLoading] = useState(false);

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const m = currentDate.getMonth() + 1;
      const y = currentDate.getFullYear();
      const res = await api.get(`/monthly-overview/?month=${m}&year=${y}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load monthly data");
    } finally { setLoading(false); setRefreshing(false); }
  };

  const fetchDay = async (dateStr) => {
    setDayLoading(true);
    setDayTasks(null);
    try {
      const res = await api.get(`/daily-tasks/?date=${dateStr}`);
      setDayTasks(res.data);
    } catch { setDayTasks({ tasks: [] }); }
    finally { setDayLoading(false); }
  };

  useEffect(() => { load(); }, [currentDate]);

  const nav = (dir) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + (dir === "next" ? 1 : -1));
    setCurrentDate(d);
    setSelectedDay(null);
  };

  const handleDayClick = (day) => {
    if (day.total_tasks === 0) return;
    setSelectedDay(day);
    fetchDay(day.date);
  };

  const cellColor = (day) => {
    if (day.total_tasks === 0)          return "bg-gray-100 text-gray-300";
    if (day.is_locked_in)               return "text-white font-bold";
    if (day.completion_rate >= 75)      return "bg-green-200 text-green-800";
    if (day.completion_rate >= 50)      return "bg-yellow-200 text-yellow-800";
    if (day.completion_rate >= 25)      return "bg-orange-200 text-orange-800";
    return "bg-red-100 text-red-700";
  };

  const isToday = (day) =>
    new Date(day.date).toDateString() === new Date().toDateString();

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-40" />
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 35 }, (_, i) => <div key={i} className="h-8 bg-gray-200 rounded" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="text-center py-10">
      <p className="text-red-400 text-sm mb-3">{error}</p>
      <button onClick={() => load()} className="text-indigo-600 font-semibold text-sm">Try again</button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NavArrow onClick={() => nav("prev")} dir="prev" />
          <span className={TEXT.sectionTitle + " min-w-[140px] text-center"}>
            {data?.month_name} {data?.year}
          </span>
          <NavArrow onClick={() => nav("next")} dir="next" />
        </div>
        <button onClick={() => load(true)} disabled={refreshing} className={BTN.icon}>
          <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard value={data?.statistics?.total_locked_in_days || 0} label="Locked-in days" colorKey="green" />
        <StatCard value={`${data?.statistics?.locked_in_percentage || 0}%`} label="Success rate" colorKey="indigo" />
      </div>

      {/* Calendar */}
      <div className={`${CARD} p-4`}>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <div key={i} className={TEXT.caption + " text-center py-1"}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: new Date(data.year, data.month - 1, 1).getDay() }, (_, i) => (
            <div key={`e-${i}`} />
          ))}
          {data?.daily_data?.map(day => (
            <div key={day.day}
              onClick={() => handleDayClick(day)}
              title={day.total_tasks > 0 ? `${day.completed_tasks}/${day.total_tasks} tasks` : "No tasks"}
              className={`h-8 rounded-lg flex items-center justify-center text-xs transition-all duration-150 ${cellColor(day)} ${
                day.total_tasks > 0 ? "cursor-pointer hover:scale-110 relative" : "cursor-default"
              } ${isToday(day) ? "ring-2 ring-blue-400 ring-offset-1" : ""} ${
                selectedDay?.day === day.day ? "ring-2 ring-indigo-500 ring-offset-1" : ""
              }`}
              style={day.is_locked_in ? { backgroundColor: "#10B981" } : {}}
            >
              {day.day}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {[
            { cls: "bg-gray-100", label: "None" },
            { cls: "bg-red-100",    label: "Started" },
            { cls: "bg-yellow-200", label: "Halfway" },
            { cls: "bg-green-200",  label: "Almost" },
            { cls: "bg-green-500",  label: "Locked in" },
          ].map(({ cls, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${cls}`} />
              <span className={TEXT.caption}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day detail */}
      {selectedDay && (
        <div className={CARD}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <div className={TEXT.cardTitle}>
                {new Date(selectedDay.date).toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric",
                })}
              </div>
              <div className={TEXT.caption + " mt-0.5"}>
                {selectedDay.completed_tasks}/{selectedDay.total_tasks} completed
                {selectedDay.is_locked_in && (
                  <span className="ml-2 text-green-600 font-semibold">Locked in</span>
                )}
              </div>
            </div>
            <button onClick={() => setSelectedDay(null)} className={BTN.icon}>
              <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
            </button>
          </div>
          <div className="p-4">
            {dayLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : dayTasks?.tasks?.length > 0 ? (
              <div className="space-y-2">
                {dayTasks.tasks.map((task, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${
                    task.completed ? "bg-green-50 border border-green-200/60" : "bg-gray-50 border border-gray-200/60"
                  }`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      task.completed ? "bg-green-500" : "border-2 border-gray-300"
                    }`}>
                      {task.completed && <span className="text-white text-xs leading-none">✓</span>}
                    </div>
                    <span className={`text-sm ${task.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={TEXT.caption + " text-center py-4"}>No tasks recorded for this day.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Yearly view ─────────────────────────────────────────────────────────────
const YearlyView = () => {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(null);
  const [year, setYear]             = useState(new Date().getFullYear());
  const [selMonth, setSelMonth]     = useState(null);
  const [monthData, setMonthData]   = useState(null);
  const [monthLoading, setMonthLoading] = useState(false);

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/yearly-overview/?year=${year}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load yearly data");
    } finally { setLoading(false); setRefreshing(false); }
  };

  const loadMonth = async (m) => {
    setMonthLoading(true);
    try {
      const res = await api.get(`/monthly-overview/?month=${m}&year=${year}`);
      setMonthData(res.data);
    } catch { setMonthData(null); }
    finally { setMonthLoading(false); }
  };

  useEffect(() => { load(); }, [year]);
  useEffect(() => {
    if (selMonth) loadMonth(selMonth); else setMonthData(null);
  }, [selMonth, year]);

  const monthColor = (locked, total) => {
    const pct = (locked / total) * 100;
    if (pct >= 80) return "#10B981";
    if (pct >= 60) return "#3B82F6";
    if (pct >= 40) return "#EAB308";
    if (pct >= 20) return "#F97316";
    if (pct > 0)   return "#EF4444";
    return "#E5E7EB";
  };

  const stats = (() => {
    if (!data) return null;
    const s = data.monthly_stats;
    const totalLocked = s.reduce((a, m) => a + m.locked_in_days, 0);
    const totalDays   = s.reduce((a, m) => a + m.days_in_month, 0);
    const best        = s.reduce((b, m) => m.locked_in_percentage > b.locked_in_percentage ? m : b);
    const avg         = Math.round(s.reduce((a, m) => a + m.locked_in_percentage, 0) / 12);
    return { totalLocked, yearPct: Math.round((totalLocked / totalDays) * 100), best, avg };
  })();

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 12 }, (_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="text-center py-10">
      <p className="text-red-400 text-sm mb-3">{error}</p>
      <button onClick={() => load()} className="text-indigo-600 font-semibold text-sm">Try again</button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Year nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NavArrow onClick={() => setYear(y => y - 1)} dir="prev" />
          <span className={TEXT.sectionTitle + " w-12 text-center"}>{year}</span>
          <NavArrow onClick={() => setYear(y => y + 1)} disabled={year >= new Date().getFullYear()} dir="next" />
        </div>
        <button onClick={() => load(true)} disabled={refreshing} className={BTN.icon}>
          <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard value={stats.totalLocked}  label="Locked-in days"  colorKey="green"  />
          <StatCard value={`${stats.yearPct}%`} label="Year success"   colorKey="blue"   />
          <StatCard value={`${stats.avg}%`}    label="Monthly avg"     colorKey="purple" />
          <StatCard value={stats.best.month_name.slice(0,3)} label="Best month" colorKey="orange" />
        </div>
      )}

      {/* Month grid */}
      <div className={`${CARD} p-4`}>
        <p className={TEXT.caption + " mb-3"}>Tap a month for details</p>
        <div className="grid grid-cols-3 gap-2">
          {data?.monthly_stats?.map(month => {
            const bg    = monthColor(month.locked_in_days, month.days_in_month);
            const isGray = bg === "#E5E7EB";
            return (
              <button key={month.month}
                onClick={() => setSelMonth(s => s === month.month ? null : month.month)}
                className={`p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] ${
                  selMonth === month.month ? "ring-2 ring-indigo-400 ring-offset-1" : ""
                }`}
                style={{ backgroundColor: bg + (isGray ? "" : "25"), border: `1.5px solid ${bg}` }}>
                <div className="text-xs font-bold" style={{ color: isGray ? "#9CA3AF" : bg }}>
                  {month.month_name.slice(0,3)}
                </div>
                <div className="text-xl font-black leading-none mt-1"
                  style={{ color: isGray ? "#D1D5DB" : bg }}>
                  {month.locked_in_days}
                </div>
                <div className="text-xs mt-0.5" style={{ color: isGray ? "#9CA3AF" : bg + "CC" }}>
                  {Math.round(month.locked_in_percentage)}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Month drill-down */}
      {selMonth && (
        <div className={CARD}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <div className={TEXT.cardTitle}>
                {data?.monthly_stats.find(m => m.month === selMonth)?.month_name} {year}
              </div>
              <div className={TEXT.caption}>Daily breakdown</div>
            </div>
            <button onClick={() => setSelMonth(null)} className={BTN.icon}>
              <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
            </button>
          </div>

          {monthLoading ? (
            <div className="p-4 animate-pulse space-y-2">
              {[1,2].map(i => <div key={i} className="h-10 bg-gray-100 rounded" />)}
            </div>
          ) : monthData ? (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <StatCard value={monthData.statistics.total_locked_in_days} label="Locked days" colorKey="green" />
                <StatCard value={`${monthData.statistics.locked_in_percentage}%`} label="Success rate" colorKey="indigo" />
              </div>
              <div className="grid grid-cols-7 gap-1">
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <div key={i} className={TEXT.caption + " text-center py-1"}>{d}</div>
                ))}
                {Array.from({ length: new Date(monthData.year, monthData.month - 1, 1).getDay() }, (_, i) => (
                  <div key={`e-${i}`} />
                ))}
                {monthData.daily_data.map(day => {
                  let bg = "#F3F4F6"; let fg = "#D1D5DB";
                  if (day.total_tasks > 0) {
                    if (day.is_locked_in)              { bg = "#10B981"; fg = "#fff"; }
                    else if (day.completion_rate >= 50) { bg = "#FEF08A"; fg = "#854D0E"; }
                    else                               { bg = "#FEE2E2"; fg = "#B91C1C"; }
                  }
                  return (
                    <div key={day.day}
                      className="h-7 rounded-lg flex items-center justify-center text-xs font-medium"
                      style={{ backgroundColor: bg, color: fg }}>
                      {day.day}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className={TEXT.caption + " p-4 text-center"}>Failed to load details.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("monthly");

  return (
    <>
      <Navbar />
      <div className={PAGE}>
        <div className={CONTAINER}>

          <div className="mb-6">
            <h1 className={TEXT.pageTitle}>Analytics</h1>
            <p className={TEXT.caption + " mt-0.5"}>Your performance over time</p>
          </div>

          {/* Tabs */}
          <div className={`${CARD} p-1.5 flex gap-1 mb-6`}>
            <Tab label="Monthly" icon={Calendar}  active={activeTab === "monthly"} onClick={() => setActiveTab("monthly")} />
            <Tab label="Yearly"  icon={BarChart3}  active={activeTab === "yearly"}  onClick={() => setActiveTab("yearly")}  />
          </div>

          {activeTab === "monthly" && <MonthlyView />}
          {activeTab === "yearly"  && <YearlyView />}

        </div>
      </div>
    </>
  );
}