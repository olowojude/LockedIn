// components/MinimalisticLevelDisplay.jsx

import React from 'react';
import { Flame, Trophy, Star, Target, Zap, Crown, Award, TrendingUp } from 'lucide-react';

// Updated Level definitions based on current streak (not total days)
const LEVELS = [
  { id: 1, name: "Beginner", icon: Target, requirement: 1, color: "gray", description: "First day done" },
  { id: 2, name: "Committed", icon: Flame, requirement: 7, color: "orange", description: "One week strong" },
  { id: 3, name: "Dedicated", icon: Star, requirement: 14, color: "blue", description: "Two weeks consistent" },
  { id: 4, name: "Champion", icon: Trophy, requirement: 30, color: "yellow", description: "Monthly warrior" },
  { id: 5, name: "Invincible", icon: Zap, requirement: 60, color: "purple", description: "Two month streak" },
  { id: 6, name: "Legend", icon: Award, requirement: 90, color: "emerald", description: "Three month master" },
  { id: 7, name: "Golden", icon: Crown, requirement: 180, color: "yellow", description: "Half-year hero" }
];

const MinimalisticLevelDisplay = ({ streakData, loading, error, onViewProfile }) => {
  // Get current user level based on CURRENT STREAK (not total days)
  const getCurrentLevel = () => {
    if (!streakData) return LEVELS[0];
    
    const currentStreak = streakData.current_streak;
    let currentLevel = LEVELS[0];
    
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (currentStreak >= LEVELS[i].requirement) {
        currentLevel = LEVELS[i];
        break;
      }
    }
    
    return currentLevel;
  };

  // Get badges earned - only based on current streak achievements
  const getUnlockedBadges = () => {
    if (!streakData) return 0;
    
    // Badges should only be awarded based on current streak to avoid confusion
    // This way badges match the current level system
    const currentStreak = streakData.current_streak;
    let badges = 0;
    
    // Count how many level requirements the user has met
    for (let level of LEVELS) {
      if (currentStreak >= level.requirement) {
        badges++;
      }
    }
    
    return badges;
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-4 shadow-lg mb-6">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded mb-3 w-32"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-4 shadow-lg mb-6">
        <div className="text-center text-red-600">
          <TrendingUp className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!streakData) return null;

  const currentLevel = getCurrentLevel();
  const unlockedBadges = getUnlockedBadges();

  return (
    <div 
      onClick={onViewProfile}
      className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-4 shadow-lg mb-6 cursor-pointer hover:bg-white/70 transition-all duration-300 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-200/50 to-transparent"></div>
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
              <Flame className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-gray-800 font-bold text-sm">Level Progress</h3>
          </div>
          <div className="text-xs text-gray-500 bg-gray-100/80 px-2 py-1 rounded-full">
            Tap to view
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-center gap-4">
          {/* Current Level Badge */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 ${
            `bg-gradient-to-br from-${currentLevel.color}-400 to-${currentLevel.color}-600`
          }`}>
            <currentLevel.icon className="w-6 h-6 text-white" />
          </div>
          
          {/* Level Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-800 font-bold text-lg">{currentLevel.name}</span>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-gray-600 text-sm font-medium">
              {currentLevel.description} • {unlockedBadges} badges earned
            </div>
          </div>
          
          {/* Streak Display */}
          <div className="text-right">
            <div className="text-xl font-bold text-orange-600">
              {streakData.current_streak}
            </div>
            <div className="text-xs text-gray-600">day streak</div>
          </div>
        </div>

        {/* Quick Stats - Removed total days display */}
        <div className="mt-4 pt-3 border-t border-gray-200/60">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Level {currentLevel.id} of {LEVELS.length}</span>
            <span className="flex items-center gap-1">
              View full progress
              <TrendingUp className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalisticLevelDisplay;