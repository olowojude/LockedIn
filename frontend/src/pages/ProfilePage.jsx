// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import {
  User, Mail, Calendar, Share,
  ChevronLeft, ChevronRight,
  Activity, BarChart3,
  // Level icons
  Star, Flame, ShieldCheck, Gem, Rocket, Crown, Sparkles,
} from "lucide-react";
import { authService } from "../../utils/auth";
import Navbar from "../components/Navbar";
import api from "../../utils/api";

// ─── Level definitions ────────────────────────────────────────────────────────
const LEVELS = [
  { id: 1, name: "Beginner",   icon: Star,        requirement: 1,   color: "gray",    bgColor: "bg-gray-100",    description: "First day done" },
  { id: 2, name: "Committed",  icon: Flame,       requirement: 7,   color: "orange",  bgColor: "bg-orange-100",  description: "One week strong" },
  { id: 3, name: "Dedicated",  icon: ShieldCheck, requirement: 14,  color: "blue",    bgColor: "bg-blue-100",    description: "Two weeks consistent" },
  { id: 4, name: "Champion",   icon: Gem,         requirement: 30,  color: "teal",    bgColor: "bg-teal-100",    description: "Monthly warrior" },
  { id: 5, name: "Invincible", icon: Rocket,      requirement: 60,  color: "purple",  bgColor: "bg-purple-100",  description: "Two month streak" },
  { id: 6, name: "Legend",     icon: Crown,       requirement: 90,  color: "yellow",  bgColor: "bg-yellow-100",  description: "Three month master" },
  { id: 7, name: "Golden",     icon: Sparkles,    requirement: 180, color: "emerald", bgColor: "bg-emerald-100", description: "Half-year hero" },
];

// Static gradient map — avoids Tailwind purge issue with dynamic class strings
const GRADIENT_MAP = {
  gray:    "from-gray-400 to-gray-600",
  orange:  "from-orange-400 to-orange-600",
  blue:    "from-blue-400 to-blue-600",
  teal:    "from-teal-400 to-teal-600",
  purple:  "from-purple-400 to-purple-600",
  yellow:  "from-yellow-400 to-yellow-600",
  emerald: "from-emerald-400 to-emerald-600",
};

const SOLID_MAP = {
  gray:    "#9CA3AF",
  orange:  "#F97316",
  blue:    "#3B82F6",
  teal:    "#14B8A6",
  purple:  "#8B5CF6",
  yellow:  "#EAB308",
  emerald: "#10B981",
};

export default function ProfilePage() {
  const [streakData, setStreakData]               = useState(null);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const user = authService.getUser();

  useEffect(() => {
    api.get("/user-streak/")
      .then(res => setStreakData(res.data))
      .catch(() => setError("Failed to load streak data"))
      .finally(() => setLoading(false));
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getCurrentLevel = () => {
    if (!streakData) return LEVELS[0];
    const s = streakData.current_streak;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (s >= LEVELS[i].requirement) return LEVELS[i];
    }
    return LEVELS[0];
  };

  const getNextLevel = () => {
    if (!streakData) return LEVELS[1];
    for (const l of LEVELS) {
      if (streakData.current_streak < l.requirement) return l;
    }
    return LEVELS[LEVELS.length - 1];
  };

  const getProgressToNext = () => {
    if (!streakData) return 0;
    const cur  = getCurrentLevel();
    const next = getNextLevel();
    if (cur.id === next.id) return 100;
    const progress = streakData.current_streak - cur.requirement;
    const required = next.requirement - cur.requirement;
    return Math.max(0, Math.round((progress / required) * 100));
  };

  const getUnlockedBadges = () => {
    if (!streakData) return 0;
    return LEVELS.filter(l => streakData.total_locked_in_days >= l.requirement).length;
  };

  const handleShare = () => {
    if (!streakData) return;
    const level = getCurrentLevel();
    const text  = `I'm a ${level.name} on LockedIn! ${streakData.current_streak} day streak. Join me!`;
    if (navigator.share) {
      navigator.share({ title: "My LockedIn Profile", text, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(text).then(() => alert("Copied!"));
    }
  };

  useEffect(() => {
    if (streakData) {
      const cur = getCurrentLevel();
      const idx = LEVELS.findIndex(l => l.id === cur.id);
      setCurrentLevelIndex(idx >= 0 ? idx : 0);
    }
  }, [streakData]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-md mx-auto space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
                <div className="h-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-6 shadow-sm text-center max-w-sm">
            <User className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      </>
    );
  }

  const currentLevel   = getCurrentLevel();
  const nextLevel      = getNextLevel();
  const progressToNext = getProgressToNext();
  const displayLevel   = LEVELS[currentLevelIndex];
  const isCurrentLevel = displayLevel.id === currentLevel.id;
  const isUnlocked     = streakData.current_streak >= displayLevel.requirement;
  const unlockedBadges = getUnlockedBadges();

  const CurrentIcon  = currentLevel.icon;
  const DisplayIcon  = displayLevel.icon;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-4 py-6 space-y-4">

          {/* ── User card ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-0.5">
                {user?.first_name || user?.username || "User"}
              </h1>
              <p className="text-gray-400 text-sm">LockedIn Member</p>
            </div>

            <div className="space-y-2">
              {[
                { icon: User,     label: "Username",     value: user?.username },
                { icon: Mail,     label: "Email",        value: user?.email },
                { icon: Calendar, label: "Member Since", value: user?.date_joined
                    ? new Date(user.date_joined).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                    : null },
              ].filter(r => r.value).map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400">{label}</div>
                    <div className="text-sm font-medium text-gray-800">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Streak stats ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-sm">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Streak Statistics</h3>
                <p className="text-gray-400 text-xs">Your consistency journey</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200/60 text-center">
                <div className="text-3xl font-black text-orange-500 mb-0.5">{streakData.current_streak}</div>
                <div className="text-xs text-gray-500">Current streak</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200/60 text-center">
                <div className="text-3xl font-black text-purple-500 mb-0.5">{streakData.highest_streak_this_month || 0}</div>
                <div className="text-xs text-gray-500">Best this month</div>
              </div>
            </div>

            <button onClick={handleShare}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-sm text-sm">
              <Share className="w-4 h-4" />
              Share your progress
            </button>
          </div>

          {/* ── Current level ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Current Level</h3>
                <p className="text-gray-400 text-xs">Based on your streak</p>
              </div>
            </div>

            <div className={`${currentLevel.bgColor} rounded-2xl p-6 text-center mb-4`}>
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl bg-gradient-to-br ${GRADIENT_MAP[currentLevel.color]}`}>
                <CurrentIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{currentLevel.name}</h2>
              <p className="text-gray-500 text-sm mb-2">{currentLevel.description}</p>
              <div className="text-base font-bold text-gray-700">Level {currentLevel.id}</div>
            </div>

            {currentLevel.id !== LEVELS[LEVELS.length - 1].id ? (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/60">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Next: {nextLevel.name}</span>
                  <span className="text-xs text-gray-400">
                    {nextLevel.requirement - streakData.current_streak} days to go
                  </span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-700"
                    style={{ width: `${progressToNext}%` }} />
                </div>
                <div className="text-xs text-gray-400 text-center mt-1">{progressToNext}% complete</div>
              </div>
            ) : (
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
                <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="font-bold text-emerald-700">Max Level Reached!</div>
                <div className="text-xs text-emerald-600 mt-0.5">Legendary status achieved</div>
              </div>
            )}
          </div>

          {/* ── Level carousel ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-sm">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">All Levels</h3>
                <p className="text-gray-400 text-xs">Browse achievement levels</p>
              </div>
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 text-sm">Level {displayLevel.id}</h4>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentLevelIndex(i => Math.max(0, i - 1))}
                  disabled={currentLevelIndex === 0}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1 mx-1">
                  {LEVELS.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentLevelIndex ? "bg-indigo-500 w-4" : "bg-gray-200 w-1.5"
                    }`} />
                  ))}
                </div>
                <button onClick={() => setCurrentLevelIndex(i => Math.min(LEVELS.length - 1, i + 1))}
                  disabled={currentLevelIndex === LEVELS.length - 1}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Badge card */}
            <div className={`rounded-2xl p-6 border text-center relative overflow-hidden ${
              isUnlocked ? `${displayLevel.bgColor} border-opacity-60` : "bg-gray-100 border-gray-300"
            }`}>
              {isCurrentLevel && isUnlocked && (
                <div className="absolute top-3 right-3">
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                    CURRENT
                  </div>
                </div>
              )}

              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl ${
                isUnlocked ? `bg-gradient-to-br ${GRADIENT_MAP[displayLevel.color]}` : "bg-gray-300"
              }`}>
                <DisplayIcon className={`w-10 h-10 ${isUnlocked ? "text-white" : "text-gray-500"}`} />
              </div>

              <h3 className={`text-xl font-bold mb-1 ${isUnlocked ? "text-gray-800" : "text-gray-400"}`}>
                {displayLevel.name}
              </h3>
              <p className={`text-sm mb-2 ${isUnlocked ? "text-gray-500" : "text-gray-400"}`}>
                {displayLevel.description}
              </p>
              <div className={`font-bold ${isUnlocked ? "text-gray-700" : "text-gray-400"}`}>
                {displayLevel.requirement} {displayLevel.requirement === 1 ? "day" : "days"} streak
              </div>

              {!isUnlocked && (
                <div className="mt-4">
                  <div className="text-xs text-gray-400 mb-1.5">
                    {displayLevel.requirement - streakData.current_streak} days to unlock
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                      style={{ width: `${Math.min(100, (streakData.current_streak / displayLevel.requirement) * 100)}%` }} />
                  </div>
                </div>
              )}

              {isUnlocked && !isCurrentLevel && (
                <div className="mt-3">
                  <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold">UNLOCKED</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Achievements ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-sm">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Achievements</h3>
                <p className="text-gray-400 text-xs">Badge collection</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200/60 text-center">
                <div className="text-2xl font-black text-blue-500 mb-0.5">{unlockedBadges}</div>
                <div className="text-xs text-gray-500">Badges earned</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200/60 text-center">
                <div className="text-2xl font-black text-green-500 mb-0.5">
                  {Math.round((unlockedBadges / LEVELS.length) * 100)}%
                </div>
                <div className="text-xs text-gray-500">Completion</div>
              </div>
            </div>

            {/* Badge grid */}
            <div className="grid grid-cols-4 gap-3">
              {LEVELS.map(level => {
                const unlocked = streakData.total_locked_in_days >= level.requirement;
                const LIcon    = level.icon;
                return (
                  <div key={level.id} title={`${level.name} — ${level.requirement} days`}
                    className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${
                      unlocked
                        ? `bg-gradient-to-br ${GRADIENT_MAP[level.color]} shadow-md`
                        : "bg-gray-100 opacity-40"
                    }`}>
                    <LIcon className={`w-6 h-6 ${unlocked ? "text-white" : "text-gray-400"}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Quick stats ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Quick Stats</h3>
                <p className="text-gray-400 text-xs">At a glance</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: "Current Level",    value: currentLevel.name,                                    bg: "bg-gray-50" },
                { label: "Current Streak",   value: `${streakData.current_streak} days`,                  bg: "bg-orange-50", color: "text-orange-500" },
                { label: "Best This Month",  value: `${streakData.highest_streak_this_month || 0} days`,  bg: "bg-purple-50", color: "text-purple-500" },
                { label: "Total Locked-In",  value: `${streakData.total_locked_in_days} days`,            bg: "bg-green-50",  color: "text-green-500"  },
                { label: "Badges Collected", value: `${unlockedBadges}/${LEVELS.length}`,                 bg: "bg-blue-50",   color: "text-blue-500"   },
              ].map(({ label, value, bg, color }) => (
                <div key={label} className={`flex justify-between items-center p-3 ${bg} rounded-xl`}>
                  <span className="text-gray-600 text-sm font-medium">{label}</span>
                  <span className={`font-bold text-sm ${color || "text-gray-800"}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}