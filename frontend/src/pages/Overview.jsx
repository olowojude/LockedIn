// Overview.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar, ChevronLeft, ChevronRight, Filter,
  TrendingUp, Target, Award, BarChart3, RefreshCw, Eye,
} from "lucide-react";
import api from "../../utils/api";


const Overview = () => {
  const [yearData, setYearData]         = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthlyData, setMonthlyData]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [monthLoading, setMonthLoading] = useState(false);
  const [error, setError]               = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Fetchers ────────────────────────────────────────────────────────────────
  const fetchYearlyData = async (year, showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/yearly-overview/?year=${year}`);
      setYearData(response.data);
    } catch (err) {
      console.error("Error fetching yearly data:", err);
      setError(err.response?.data?.error || "Failed to load yearly overview");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchMonthlyData = async (year, month) => {
    setMonthLoading(true);
    try {
      const response = await api.get(`/monthly-overview/?month=${month}&year=${year}`);
      setMonthlyData(response.data);
    } catch (err) {
      console.error("Error fetching monthly data:", err);
      setMonthlyData(null);
    } finally {
      setMonthLoading(false);
    }
  };

  useEffect(() => { fetchYearlyData(selectedYear); }, [selectedYear]);

  useEffect(() => {
    if (selectedMonth) fetchMonthlyData(selectedYear, selectedMonth);
    else setMonthlyData(null);
  }, [selectedMonth, selectedYear]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const navigateYear = (direction) => {
    const newYear = direction === "next" ? selectedYear + 1 : selectedYear - 1;
    const current = new Date().getFullYear();
    if (newYear >= current - 5 && newYear <= current) {
      setSelectedYear(newYear);
      setSelectedMonth(null);
    }
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(prev => (prev === month ? null : month));
  };

  const getMonthColor = (lockedInDays, daysInMonth) => {
    const pct = (lockedInDays / daysInMonth) * 100;
    if (pct >= 80) return "bg-green-500 border-green-600";
    if (pct >= 60) return "bg-blue-500 border-blue-600";
    if (pct >= 40) return "bg-yellow-500 border-yellow-600";
    if (pct >= 20) return "bg-orange-500 border-orange-600";
    if (pct > 0)   return "bg-red-400 border-red-500";
    return "bg-gray-200 border-gray-300";
  };

  const getYearlyStats = () => {
    if (!yearData) return null;
    const stats = yearData.monthly_stats;
    const totalLockedInDays        = stats.reduce((s, m) => s + m.locked_in_days, 0);
    const totalDaysInYear          = stats.reduce((s, m) => s + m.days_in_month, 0);
    const averageMonthlyPerformance = stats.reduce((s, m) => s + m.locked_in_percentage, 0) / 12;
    const bestMonth                = stats.reduce((b, m) => m.locked_in_percentage > b.locked_in_percentage ? m : b);
    return {
      totalLockedInDays,
      yearlyPercentage: Math.round((totalLockedInDays / totalDaysInYear) * 100),
      averageMonthlyPerformance: Math.round(averageMonthlyPerformance),
      bestMonth,
    };
  };

  const handleRefresh = () => {
    fetchYearlyData(selectedYear, true);
    if (selectedMonth) fetchMonthlyData(selectedYear, selectedMonth);
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-3 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded mb-4 w-32 sm:w-48" />
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="h-16 sm:h-20 md:h-24 bg-gray-200 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-16 sm:h-20 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl text-center">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Overview Error</h2>
            <p className="text-red-600 mb-6 text-sm sm:text-base">{error}</p>
            <button
              onClick={() => fetchYearlyData(selectedYear)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-red-500 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-red-600 transition-colors text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const yearlyStats = getYearlyStats();

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-br from-blue-100/30 via-indigo-50/20 to-transparent rounded-full blur-3xl animate-pulse opacity-80 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-tl from-purple-100/25 via-pink-50/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000 opacity-70 translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative z-10 p-3 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-800 mb-2 tracking-tight">
              Overview
              <span className="text-indigo-500 text-sm sm:text-base md:text-lg font-normal ml-1 sm:ml-2">
                Dashboard
              </span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Your yearly locked-in performance</p>
          </div>

          {/* Year card */}
          <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl">

            {/* Year nav */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => navigateYear("prev")}
                  className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{selectedYear}</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Year Overview</p>
                </div>
                <button
                  onClick={() => navigateYear("next")}
                  disabled={selectedYear >= new Date().getFullYear()}
                  className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Summary stats */}
            {yearlyStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                {[
                  { bg: "green",  Icon: Target,   value: yearlyStats.totalLockedInDays,          label: "Locked-In Days" },
                  { bg: "blue",   Icon: BarChart3, value: `${yearlyStats.yearlyPercentage}%`,     label: "Year Success" },
                  { bg: "purple", Icon: TrendingUp,value: `${yearlyStats.averageMonthlyPerformance}%`, label: "Monthly Avg" },
                  { bg: "orange", Icon: Award,     value: yearlyStats.bestMonth.month_name,       label: "Best Month", wide: true },
                ].map(({ bg, Icon, value, label, wide }) => (
                  <div key={label} className={`bg-${bg}-50/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-${bg}-200/60 text-center ${wide ? "col-span-2 lg:col-span-1" : ""}`}>
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-${bg}-600 mx-auto mb-2 sm:mb-3`} />
                    <div className={`text-xl sm:text-2xl md:text-3xl font-bold text-${bg}-600 mb-1`}>{value}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Monthly grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Monthly Breakdown</h3>
                <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">Click a month for details</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                {yearData?.monthly_stats.map((month) => (
                  <button
                    key={month.month}
                    onClick={() => handleMonthSelect(month.month)}
                    className={`relative p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      selectedMonth === month.month
                        ? "ring-2 sm:ring-4 ring-indigo-200 shadow-lg sm:shadow-xl"
                        : "shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl"
                    } ${getMonthColor(month.locked_in_days, month.days_in_month)}`}
                  >
                    <div className="text-white">
                      <div className="text-xs sm:text-sm font-bold mb-1">{month.month_name.slice(0, 3)}</div>
                      <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1">{month.locked_in_days}</div>
                      <div className="text-xs opacity-90">{Math.round(month.locked_in_percentage)}%</div>
                    </div>
                    {selectedMonth === month.month && (
                      <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                          <Eye className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-6 text-xs">
                {[
                  { color: "bg-gray-200", label: "No activity" },
                  { color: "bg-red-400",    label: "1–20%" },
                  { color: "bg-orange-500", label: "20–40%" },
                  { color: "bg-yellow-500", label: "40–60%" },
                  { color: "bg-blue-500",   label: "60–80%" },
                  { color: "bg-green-500",  label: "80–100%" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1 sm:gap-2">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 ${color} rounded border`} />
                    <span className="text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly drill-down */}
          {selectedMonth && (
            <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                    {monthlyData?.month_name} {selectedYear} Details
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">Daily breakdown and statistics</p>
                </div>
                <button
                  onClick={() => setSelectedMonth(null)}
                  className="p-2 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-90" />
                </button>
              </div>

              {monthLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3" />
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {Array.from({ length: 35 }, (_, i) => (
                      <div key={i} className="h-6 sm:h-8 bg-gray-200 rounded" />
                    ))}
                  </div>
                </div>
              ) : monthlyData ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Monthly stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {[
                      { bg: "green",  value: monthlyData.statistics.total_locked_in_days,     label: "Locked Days" },
                      { bg: "blue",   value: `${monthlyData.statistics.locked_in_percentage}%`, label: "Success Rate" },
                      { bg: "purple", value: monthlyData.statistics.total_days_with_tasks,    label: "Active Days" },
                      { bg: "orange", value: `${monthlyData.statistics.active_days_percentage}%`, label: "Activity Rate" },
                    ].map(({ bg, value, label }) => (
                      <div key={label} className={`bg-${bg}-50/80 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-${bg}-200/60 text-center`}>
                        <div className={`text-lg sm:text-xl md:text-2xl font-bold text-${bg}-600 mb-1`}>{value}</div>
                        <div className="text-xs sm:text-sm text-gray-600">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">Daily Calendar</h4>
                    <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                        <div key={d} className="text-center text-xs sm:text-sm font-medium text-gray-500 p-1 sm:p-2">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {/* Empty cells for day offset */}
                      {Array.from({
                        length: new Date(monthlyData.year, monthlyData.month - 1, 1).getDay(),
                      }, (_, i) => <div key={`empty-${i}`} className="h-8 sm:h-10 md:h-12" />)}

                      {monthlyData.daily_data.map(day => {
                        let colorClass = "bg-gray-100 border-gray-200";
                        if (day.total_tasks === 0) {
                          colorClass = "bg-gray-100 border-gray-200";
                        } else if (day.is_locked_in) {
                          colorClass = "bg-green-500 border-green-600 text-white shadow-sm";
                        } else if (day.completion_rate >= 75) {
                          colorClass = "bg-green-300 border-green-400 text-white";
                        } else if (day.completion_rate >= 50) {
                          colorClass = "bg-yellow-300 border-yellow-400";
                        } else if (day.completion_rate >= 25) {
                          colorClass = "bg-orange-300 border-orange-400";
                        } else {
                          colorClass = "bg-red-200 border-red-300";
                        }
                        return (
                          <div
                            key={day.day}
                            title={`${day.completed_tasks}/${day.total_tasks} tasks (${day.completion_rate}%)`}
                            className={`h-8 sm:h-10 md:h-12 rounded-md sm:rounded-lg border-2 flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-200 ${colorClass}`}
                          >
                            {day.day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-6 sm:py-8">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">Failed to load monthly details</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;