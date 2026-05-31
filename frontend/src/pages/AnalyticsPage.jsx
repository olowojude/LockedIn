import React, { useState, useEffect } from "react";
import {
  BarChart3, Calendar, ChevronLeft, ChevronRight,
  TrendingUp, Target, Award, RefreshCw, Check, X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../../utils/api";
import { PAGE, CONTAINER, CARD, TEXT, BTN, STATUS } from "../../utils/design";

// ─── Unified day colour system ────────────────────────────────────────────────
// green = locked in, orange = partial, grey = nothing
const DAY_COLORS = {
  locked:  { bg: '#22c55e', text: '#fff',     ring: '#16a34a' },
  partial: { bg: '#f97316', text: '#fff',     ring: '#ea6f10' },
  none:    { bg: '#f3f4f6', text: '#9ca3af',  ring: 'transparent' },
};

function getDayStyle(day) {
  if (day.is_locked_in) return DAY_COLORS.locked;
  if (day.is_partial)   return DAY_COLORS.partial;
  return DAY_COLORS.none;
}

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
    <div className={`${s?.bg || 'bg-gray-50'} border ${s?.border || 'border-gray-200'} rounded-2xl p-4 text-center`}>
      <div className={`text-2xl font-black ${s?.text || 'text-gray-800'}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  );
};

// ─── Nav arrows ──────────────────────────────────────────────────────────────
const NavArrow = ({ onClick, disabled, dir }) => (
  <button onClick={onClick} disabled={disabled}
    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
    {dir === "prev"
      ? <ChevronLeft  className="w-4 h-4 text-gray-500" />
      : <ChevronRight className="w-4 h-4 text-gray-500" />}
  </button>
);

// ─── Calendar grid (shared between monthly + drill-down) ──────────────────────
const CalendarGrid = ({ year, month, dailyData, selectedDay, onDayClick }) => {
  const today       = new Date().toDateString();
  const firstDayCol = new Date(year, month - 1, 1).getDay();

  return (
    <>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayCol }, (_, i) => <div key={`e-${i}`} />)}
        {dailyData?.map(day => {
          const style    = getDayStyle(day);
          const isToday  = new Date(day.date + 'T12:00:00').toDateString() === today;
          const isSelected = selectedDay?.day === day.day;
          const clickable  = day.is_locked_in || day.is_partial || day.has_activity;

          return (
            <div key={day.day}
              onClick={() => clickable && onDayClick && onDayClick(day)}
              title={
                day.is_locked_in ? 'Locked in' :
                day.is_partial   ? 'Partial' :
                day.has_activity ? 'No activities' : ''
              }
              className={`h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-150 ${
                clickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              } ${isToday   ? 'ring-2 ring-blue-400 ring-offset-1' : ''} ${
                isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
              }`}
              style={{ backgroundColor: style.bg, color: style.text }}>
              {day.day}
            </div>
          );
        })}
      </div>
      {/* Unified legend */}
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {[
          { color: DAY_COLORS.locked.bg,  label: 'Locked in' },
          { color: DAY_COLORS.partial.bg, label: 'Partial'   },
          { color: DAY_COLORS.none.bg,    label: 'None', border: true },
        ].map(({ color, label, border }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded"
              style={{ backgroundColor: color, border: border ? '1px solid #e5e7eb' : 'none' }} />
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </>
  );
};

// ─── Day detail panel ─────────────────────────────────────────────────────────
const DayDetail = ({ day, onClose }) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/daily-tasks/?date=${day.date}`)
      .then(res => setData(res.data))
      .catch(() => setData({ by_aspect: [], total_tasks: 0, completed_tasks: 0 }))
      .finally(() => setLoading(false));
  }, [day.date]);

  const label = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <div className="font-bold text-gray-800 text-sm">{label}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getDayStyle(day).bg }} />
            <span className="text-xs text-gray-400">
              {day.is_locked_in ? 'Locked in' : day.is_partial ? 'Partial' : 'No activity'}
            </span>
          </div>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : !data?.by_aspect?.length ? (
          <p className="text-center text-sm text-gray-400 py-3">No activities recorded.</p>
        ) : (
          <div className="space-y-4">
            {data.by_aspect.map(group => {
              const allDone = group.activities.every(a => a.completed);
              return (
                <div key={group.aspect_id}>
                  {/* Lock header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: group.color }} />
                    <span className="text-xs font-semibold text-gray-600">{group.aspect_name}</span>
                    {allDone && (
                      <span className="ml-auto text-xs text-green-600 font-semibold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Locked in
                      </span>
                    )}
                  </div>
                  {/* Activities */}
                  <div className="space-y-1.5 pl-4">
                    {group.activities.map(act => (
                      <div key={act.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl text-sm ${
                          act.completed
                            ? 'bg-green-50 border border-green-100'
                            : 'bg-gray-50 border border-gray-100'
                        }`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                          act.completed ? 'bg-green-500' : 'border-2 border-gray-300'
                        }`}>
                          {act.completed && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className={act.completed ? 'text-gray-400 line-through' : 'text-gray-700'}>
                          {act.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Summary */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>{data.completed_tasks}/{data.total_tasks} activities completed</span>
              {data.is_locked_in && (
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Fully locked in
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Monthly view ─────────────────────────────────────────────────────────────
const MonthlyView = () => {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const m   = currentDate.getMonth() + 1;
      const y   = currentDate.getFullYear();
      const res = await api.get(`/monthly-overview/?month=${m}&year=${y}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load monthly data");
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, [currentDate]);

  const nav = (dir) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + (dir === "next" ? 1 : -1));
    setCurrentDate(d);
    setSelectedDay(null);
  };

  const handleDayClick = (day) => {
    setSelectedDay(prev => prev?.day === day.day ? null : day);
  };

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
          <span className="font-bold text-gray-800 text-sm min-w-[140px] text-center">
            {data?.month_name} {data?.year}
          </span>
          <NavArrow onClick={() => nav("next")} dir="next" />
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-green-600">
            {data?.statistics?.total_locked_in_days || 0}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Locked-in days</div>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-indigo-600">
            {data?.statistics?.locked_in_percentage || 0}%
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Success rate</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <CalendarGrid
          year={data?.year}
          month={data?.month}
          dailyData={data?.daily_data}
          selectedDay={selectedDay}
          onDayClick={handleDayClick}
        />
      </div>

      {/* Day detail */}
      {selectedDay && (
        <DayDetail day={selectedDay} onClose={() => setSelectedDay(null)} />
      )}
    </div>
  );
};

// ─── Yearly view ─────────────────────────────────────────────────────────────
const YearlyView = () => {
  const [data, setData]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState(null);
  const [year, setYear]                 = useState(new Date().getFullYear());
  const [selMonth, setSelMonth]         = useState(null);
  const [monthData, setMonthData]       = useState(null);
  const [monthLoading, setMonthLoading] = useState(false);
  const [selectedDay, setSelectedDay]   = useState(null);

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
    setSelectedDay(null);
    try {
      const res = await api.get(`/monthly-overview/?month=${m}&year=${year}`);
      setMonthData(res.data);
    } catch { setMonthData(null); }
    finally { setMonthLoading(false); }
  };

  useEffect(() => { load(); }, [year]);
  useEffect(() => {
    if (selMonth) loadMonth(selMonth);
    else { setMonthData(null); setSelectedDay(null); }
  }, [selMonth, year]);

  // Month tile colour based on locked-in percentage
  const monthTileColor = (pct) => {
    if (pct >= 80) return { bg: '#22c55e22', border: '#22c55e', text: '#16a34a' };
    if (pct >= 60) return { bg: '#f9731622', border: '#f97316', text: '#ea580c' };
    if (pct >= 30) return { bg: '#eab30822', border: '#eab308', text: '#ca8a04' };
    if (pct >  0)  return { bg: '#ef444422', border: '#ef4444', text: '#dc2626' };
    return           { bg: '#f3f4f6',     border: '#e5e7eb', text: '#9ca3af' };
  };

  const stats = (() => {
    if (!data) return null;
    const s           = data.monthly_stats;
    const totalLocked = s.reduce((a, m) => a + m.locked_in_days, 0);
    const totalDays   = s.reduce((a, m) => a + m.days_in_month, 0);
    const best        = s.reduce((b, m) => m.locked_in_percentage > b.locked_in_percentage ? m : b, s[0]);
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
          <NavArrow onClick={() => { setYear(y => y - 1); setSelMonth(null); }} dir="prev" />
          <span className="font-bold text-gray-800 text-sm w-12 text-center">{year}</span>
          <NavArrow
            onClick={() => { setYear(y => y + 1); setSelMonth(null); }}
            disabled={year >= new Date().getFullYear()}
            dir="next"
          />
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Year stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-green-600">{stats.totalLocked}</div>
            <div className="text-xs text-gray-400 mt-0.5">Locked-in days</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-indigo-600">{stats.yearPct}%</div>
            <div className="text-xs text-gray-400 mt-0.5">Year success</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-purple-600">{stats.avg}%</div>
            <div className="text-xs text-gray-400 mt-0.5">Monthly avg</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-amber-600">
              {stats.best?.month_name?.slice(0, 3) || '—'}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">Best month</div>
          </div>
        </div>
      )}

      {/* Month grid */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p className="text-xs text-gray-400 mb-3">Tap a month for details</p>
        <div className="grid grid-cols-3 gap-2">
          {data?.monthly_stats?.map(month => {
            const c = monthTileColor(month.locked_in_percentage);
            return (
              <button key={month.month}
                onClick={() => setSelMonth(s => s === month.month ? null : month.month)}
                className={`p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] ${
                  selMonth === month.month ? 'ring-2 ring-indigo-400 ring-offset-1' : ''
                }`}
                style={{ backgroundColor: c.bg, border: `1.5px solid ${c.border}` }}>
                <div className="text-xs font-bold" style={{ color: c.text }}>
                  {month.month_name.slice(0, 3)}
                </div>
                <div className="text-xl font-black leading-none mt-1" style={{ color: c.text }}>
                  {month.locked_in_days}
                </div>
                <div className="text-xs mt-0.5" style={{ color: c.text + 'CC' }}>
                  {Math.round(month.locked_in_percentage)}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Month drill-down */}
      {selMonth && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <div className="font-bold text-gray-800 text-sm">
                {data?.monthly_stats.find(m => m.month === selMonth)?.month_name} {year}
              </div>
              <div className="text-xs text-gray-400">Daily breakdown — tap a day</div>
            </div>
            <button onClick={() => { setSelMonth(null); setSelectedDay(null); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {monthLoading ? (
            <div className="p-4 animate-pulse space-y-2">
              {[1,2].map(i => <div key={i} className="h-10 bg-gray-100 rounded" />)}
            </div>
          ) : monthData ? (
            <div className="p-4 space-y-4">
              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-green-600">
                    {monthData.statistics.total_locked_in_days}
                  </div>
                  <div className="text-xs text-gray-400">Locked days</div>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-indigo-600">
                    {monthData.statistics.locked_in_percentage}%
                  </div>
                  <div className="text-xs text-gray-400">Success rate</div>
                </div>
              </div>

              {/* Calendar using unified colour system */}
              <CalendarGrid
                year={monthData.year}
                month={monthData.month}
                dailyData={monthData.daily_data}
                selectedDay={selectedDay}
                onDayClick={(day) => setSelectedDay(prev => prev?.day === day.day ? null : day)}
              />
            </div>
          ) : (
            <p className="text-xs text-gray-400 p-4 text-center">Failed to load details.</p>
          )}
        </div>
      )}

      {/* Day detail for yearly drill-down */}
      {selectedDay && selMonth && (
        <DayDetail day={selectedDay} onClose={() => setSelectedDay(null)} />
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
            <h1 className="text-2xl font-black text-gray-800">Analytics</h1>
            <p className="text-sm text-gray-400 mt-0.5">Your performance over time</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex gap-1 mb-6">
            <Tab label="Monthly" icon={Calendar} active={activeTab === "monthly"} onClick={() => setActiveTab("monthly")} />
            <Tab label="Yearly"  icon={BarChart3} active={activeTab === "yearly"}  onClick={() => setActiveTab("yearly")}  />
          </div>

          {activeTab === "monthly" && <MonthlyView />}
          {activeTab === "yearly"  && <YearlyView />}
        </div>
      </div>
    </>
  );
}