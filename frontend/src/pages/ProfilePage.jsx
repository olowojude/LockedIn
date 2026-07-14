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
import { PAGE, TEXT } from "../../utils/design";

// ─── Level definitions ────────────────────────────────────────────────────────
// Colors are intentionally uniform now (not a rainbow per level) — current vs.
// locked vs. unlocked is communicated by state, not by hue, matching the
// reference design's black/orange/cream restraint.
const LEVELS = [
  { id: 1, name: "Beginner",   icon: Star,        requirement: 1,   description: "First day done" },
  { id: 2, name: "Committed",  icon: Flame,       requirement: 7,   description: "One week strong" },
  { id: 3, name: "Dedicated",  icon: ShieldCheck, requirement: 14,  description: "Two weeks consistent" },
  { id: 4, name: "Champion",   icon: Gem,         requirement: 30,  description: "Monthly warrior" },
  { id: 5, name: "Invincible", icon: Rocket,      requirement: 60,  description: "Two month streak" },
  { id: 6, name: "Legend",     icon: Crown,       requirement: 90,  description: "Three month master" },
  { id: 7, name: "Golden",     icon: Sparkles,    requirement: 180, description: "Half-year hero" },
];

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
        <div className={`${PAGE} p-6`}>
          <div className="max-w-md mx-auto space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm animate-pulse">
                <div className="h-6 bg-[#EFECE3] rounded w-40 mb-4" />
                <div className="h-20 bg-[#EFECE3] rounded" />
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
        <div className={`${PAGE} p-6 flex items-center justify-center`}>
          <div className="bg-white rounded-3xl p-6 shadow-sm text-center max-w-sm border border-[#E5E1D6]">
            <User className="w-10 h-10 text-[#B4392A] mx-auto mb-3" />
            <p className="text-[#B4392A] text-sm">{error}</p>
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
      <div className={PAGE}>
        <div className="max-w-md mx-auto px-4 py-6 space-y-4">

          {/* ── User card ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E1D6]">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#141414] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold font-display text-[#1A1A1A] mb-0.5">
                {user?.first_name || user?.username || "User"}
              </h1>
              <p className="text-[#8C8A80] text-sm">LockedIn Member</p>
            </div>

            <div className="space-y-2">
              {[
                { icon: User,     label: "Username",     value: user?.username },
                { icon: Mail,     label: "Email",        value: user?.email },
                { icon: Calendar, label: "Member Since", value: user?.date_joined
                    ? new Date(user.date_joined).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                    : null },
              ].filter(r => r.value).map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-[#F1EFE9] rounded-xl">
                  <Icon className="w-4 h-4 text-[#8C8A80] flex-shrink-0" />
                  <div>
                    <div className="text-xs text-[#8C8A80]">{label}</div>
                    <div className="text-sm font-medium text-[#1A1A1A]">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Streak stats ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E1D6]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#FF5A1F] rounded-2xl flex items-center justify-center shadow-sm">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold font-display text-[#1A1A1A]">Streak Statistics</h3>
                <p className="text-[#8C8A80] text-xs">Your consistency journey</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#FFE7DA] rounded-2xl p-4 border border-[#FFC4A3] text-center">
                <div className="text-3xl font-black font-display text-[#FF5A1F] mb-0.5">{streakData.current_streak}</div>
                <div className="text-xs text-[#8C8A80]">Current streak</div>
              </div>
              <div className="bg-[#EFECE3] rounded-2xl p-4 border border-[#E5E1D6] text-center">
                <div className="text-3xl font-black font-display text-[#1A1A1A] mb-0.5">{streakData.highest_streak_this_month || 0}</div>
                <div className="text-xs text-[#8C8A80]">Best this month</div>
              </div>
            </div>

            <button onClick={handleShare}
              className="w-full bg-[#141414] hover:bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm text-sm">
              <Share className="w-4 h-4" />
              Share your progress
            </button>
          </div>

          {/* ── Current level ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E1D6]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#141414] rounded-2xl flex items-center justify-center shadow-sm">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold font-display text-[#1A1A1A]">Current Level</h3>
                <p className="text-[#8C8A80] text-xs">Based on your streak</p>
              </div>
            </div>

            <div className="bg-[#FFE7DA] rounded-2xl p-6 text-center mb-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl bg-[#141414]">
                <CurrentIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold font-display text-[#1A1A1A] mb-1">{currentLevel.name}</h2>
              <p className="text-[#3A3830] text-sm mb-2">{currentLevel.description}</p>
              <div className="text-base font-bold text-[#FF5A1F]">Level {currentLevel.id}</div>
            </div>

            {currentLevel.id !== LEVELS[LEVELS.length - 1].id ? (
              <div className="bg-[#F1EFE9] rounded-xl p-4 border border-[#E5E1D6]">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-[#3A3830]">Next: {nextLevel.name}</span>
                  <span className="text-xs text-[#8C8A80]">
                    {nextLevel.requirement - streakData.current_streak} days to go
                  </span>
                </div>
                <div className="h-2.5 bg-[#E5E1D6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF5A1F] rounded-full transition-all duration-700"
                    style={{ width: `${progressToNext}%` }} />
                </div>
                <div className="text-xs text-[#8C8A80] text-center mt-1">{progressToNext}% complete</div>
              </div>
            ) : (
              <div className="bg-[#FFE7DA] rounded-xl p-4 border border-[#FFC4A3] text-center">
                <Sparkles className="w-8 h-8 text-[#FF5A1F] mx-auto mb-2" />
                <div className="font-bold text-[#FF5A1F]">Max Level Reached!</div>
                <div className="text-xs text-[#8C8A80] mt-0.5">Legendary status achieved</div>
              </div>
            )}
          </div>

          {/* ── Level carousel ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E1D6]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#141414] rounded-2xl flex items-center justify-center shadow-sm">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold font-display text-[#1A1A1A]">All Levels</h3>
                <p className="text-[#8C8A80] text-xs">Browse achievement levels</p>
              </div>
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-[#1A1A1A] text-sm">Level {displayLevel.id}</h4>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentLevelIndex(i => Math.max(0, i - 1))}
                  disabled={currentLevelIndex === 0}
                  className="w-8 h-8 bg-[#EFECE3] hover:bg-[#E5E1D6] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1 mx-1">
                  {LEVELS.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentLevelIndex ? "bg-[#FF5A1F] w-4" : "bg-[#E5E1D6] w-1.5"
                    }`} />
                  ))}
                </div>
                <button onClick={() => setCurrentLevelIndex(i => Math.min(LEVELS.length - 1, i + 1))}
                  disabled={currentLevelIndex === LEVELS.length - 1}
                  className="w-8 h-8 bg-[#EFECE3] hover:bg-[#E5E1D6] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Badge card */}
            <div className={`rounded-2xl p-6 border text-center relative overflow-hidden ${
              isUnlocked ? "bg-[#FFE7DA] border-[#FFC4A3]" : "bg-[#F1EFE9] border-[#E5E1D6]"
            }`}>
              {isCurrentLevel && isUnlocked && (
                <div className="absolute top-3 right-3">
                  <div className="bg-[#FF5A1F] text-white text-xs px-2.5 py-1 rounded-full font-bold">
                    CURRENT
                  </div>
                </div>
              )}

              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl ${
                isUnlocked ? "bg-[#141414]" : "bg-[#DCD6C6]"
              }`}>
                <DisplayIcon className={`w-10 h-10 ${isUnlocked ? "text-white" : "text-[#8C8A80]"}`} />
              </div>

              <h3 className={`text-xl font-bold font-display mb-1 ${isUnlocked ? "text-[#1A1A1A]" : "text-[#8C8A80]"}`}>
                {displayLevel.name}
              </h3>
              <p className={`text-sm mb-2 ${isUnlocked ? "text-[#3A3830]" : "text-[#8C8A80]"}`}>
                {displayLevel.description}
              </p>
              <div className={`font-bold ${isUnlocked ? "text-[#FF5A1F]" : "text-[#8C8A80]"}`}>
                {displayLevel.requirement} {displayLevel.requirement === 1 ? "day" : "days"} streak
              </div>

              {!isUnlocked && (
                <div className="mt-4">
                  <div className="text-xs text-[#8C8A80] mb-1.5">
                    {displayLevel.requirement - streakData.current_streak} days to unlock
                  </div>
                  <div className="h-2 bg-[#E5E1D6] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF5A1F] rounded-full"
                      style={{ width: `${Math.min(100, (streakData.current_streak / displayLevel.requirement) * 100)}%` }} />
                  </div>
                </div>
              )}

              {isUnlocked && !isCurrentLevel && (
                <div className="mt-3">
                  <span className="bg-[#EFECE3] text-[#1A1A1A] text-xs px-3 py-1 rounded-full font-bold">UNLOCKED</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Achievements ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E1D6]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#141414] rounded-2xl flex items-center justify-center shadow-sm">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold font-display text-[#1A1A1A]">Achievements</h3>
                <p className="text-[#8C8A80] text-xs">Badge collection</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#EFECE3] rounded-2xl p-4 border border-[#E5E1D6] text-center">
                <div className="text-2xl font-black font-display text-[#1A1A1A] mb-0.5">{unlockedBadges}</div>
                <div className="text-xs text-[#8C8A80]">Badges earned</div>
              </div>
              <div className="bg-[#FFE7DA] rounded-2xl p-4 border border-[#FFC4A3] text-center">
                <div className="text-2xl font-black font-display text-[#FF5A1F] mb-0.5">
                  {Math.round((unlockedBadges / LEVELS.length) * 100)}%
                </div>
                <div className="text-xs text-[#8C8A80]">Completion</div>
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
                      unlocked ? "bg-[#141414] shadow-md" : "bg-[#EFECE3] opacity-50"
                    }`}>
                    <LIcon className={`w-6 h-6 ${unlocked ? "text-white" : "text-[#8C8A80]"}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Quick stats ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E1D6]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#141414] rounded-2xl flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold font-display text-[#1A1A1A]">Quick Stats</h3>
                <p className="text-[#8C8A80] text-xs">At a glance</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: "Current Level",    value: currentLevel.name,                                    bg: "bg-[#F1EFE9]" },
                { label: "Current Streak",   value: `${streakData.current_streak} days`,                  bg: "bg-[#FFE7DA]", color: "text-[#FF5A1F]" },
                { label: "Best This Month",  value: `${streakData.highest_streak_this_month || 0} days`,  bg: "bg-[#F1EFE9]", color: "text-[#1A1A1A]" },
                { label: "Total Locked-In",  value: `${streakData.total_locked_in_days} days`,            bg: "bg-[#FFE7DA]", color: "text-[#FF5A1F]" },
                { label: "Badges Collected", value: `${unlockedBadges}/${LEVELS.length}`,                 bg: "bg-[#F1EFE9]", color: "text-[#1A1A1A]" },
              ].map(({ label, value, bg, color }) => (
                <div key={label} className={`flex justify-between items-center p-3 ${bg} rounded-xl`}>
                  <span className="text-[#3A3830] text-sm font-medium">{label}</span>
                  <span className={`font-bold text-sm ${color || "text-[#1A1A1A]"}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}