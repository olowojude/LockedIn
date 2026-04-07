// components/LockedInLevelSystem.jsx
import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Star, Target, Zap, Crown, ChevronLeft, ChevronRight, Award } from 'lucide-react';

// Level definitions based on streak milestones
const LEVELS = [
  { 
    id: 1, 
    name: "Beginner", 
    icon: Target, 
    requirement: 1, 
    color: "gray",
    description: "First step taken"
  },
  { 
    id: 2, 
    name: "Committed", 
    icon: Flame, 
    requirement: 7, 
    color: "orange",
    description: "One week strong"
  },
  { 
    id: 3, 
    name: "Dedicated", 
    icon: Star, 
    requirement: 30, 
    color: "blue",
    description: "Monthly consistency"
  },
  { 
    id: 4, 
    name: "Champion", 
    icon: Trophy, 
    requirement: 50, 
    color: "yellow",
    description: "Hall of Fame"
  },
  { 
    id: 5, 
    name: "Invincible", 
    icon: Zap, 
    requirement: 100, 
    color: "purple",
    description: "Century club"
  },
  { 
    id: 6, 
    name: "Legend", 
    icon: Award, 
    requirement: 150, 
    color: "emerald",
    description: "Legendary status"
  },
  { 
    id: 7, 
    name: "Golden", 
    icon: Crown, 
    requirement: 200, 
    color: "yellow",
    description: "Golden achievement"
  }
];

const LockedInLevelSystem = ({ streakData, loading, error }) => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  // Get current user level based on total locked-in days
  const getCurrentLevel = () => {
    if (!streakData) return LEVELS[0];
    
    const totalDays = streakData.total_locked_in_days;
    let currentLevel = LEVELS[0];
    
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalDays >= LEVELS[i].requirement) {
        currentLevel = LEVELS[i];
        break;
      }
    }
    
    return currentLevel;
  };

  // Get next level
  const getNextLevel = () => {
    if (!streakData) return LEVELS[1];
    
    const totalDays = streakData.total_locked_in_days;
    
    for (let level of LEVELS) {
      if (totalDays < level.requirement) {
        return level;
      }
    }
    
    return LEVELS[LEVELS.length - 1];
  };

  // Get progress to next level
  const getProgressToNext = () => {
    if (!streakData) return 0;
    
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    
    if (currentLevel.id === nextLevel.id) return 100;
    
    const totalDays = streakData.total_locked_in_days;
    const progress = totalDays - currentLevel.requirement;
    const required = nextLevel.requirement - currentLevel.requirement;
    
    return Math.round((progress / required) * 100);
  };

  // Navigate between levels
  const navigateLevel = (direction) => {
    if (direction === 'prev' && currentLevelIndex > 0) {
      setCurrentLevelIndex(currentLevelIndex - 1);
    } else if (direction === 'next' && currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
    }
  };

  // Set initial level index to current level when data loads
  useEffect(() => {
    if (streakData) {
      const currentLevel = getCurrentLevel();
      const currentIndex = LEVELS.findIndex(level => level.id === currentLevel.id);
      setCurrentLevelIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [streakData]);

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-40"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg mb-6">
        <div className="text-center text-red-600">
          <Flame className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!streakData) return null;

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressToNext = getProgressToNext();
  const displayLevel = LEVELS[currentLevelIndex];
  const isCurrentLevel = displayLevel.id === currentLevel.id;
  const isUnlocked = streakData.total_locked_in_days >= displayLevel.requirement;

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-gray-800 font-bold text-lg">Level System</h3>
          <p className="text-gray-600 text-sm">Your progress journey</p>
        </div>
      </div>

      {/* Current Streak Display */}
      <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-4 mb-6 border border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {streakData.current_streak}
              </div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-orange-600">
              {streakData.total_locked_in_days}
            </div>
            <div className="text-xs text-gray-600">Total Days</div>
          </div>
        </div>
      </div>

      {/* Level Badge Carousel */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-gray-800 font-semibold">Your Level</h4>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateLevel('prev')}
              disabled={currentLevelIndex === 0}
              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <div className="flex gap-1 mx-2">
              {LEVELS.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentLevelIndex ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => navigateLevel('next')}
              disabled={currentLevelIndex === LEVELS.length - 1}
              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Level Badge Display */}
        <div className={`rounded-xl p-6 transition-all duration-300 border text-center ${
          isUnlocked 
            ? `bg-${displayLevel.color}-100 border-${displayLevel.color}-300` 
            : 'bg-gray-100 border-gray-300'
        }`}>
          {isCurrentLevel && isUnlocked && (
            <div className="mb-2">
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                CURRENT
              </span>
            </div>
          )}
          
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${
            isUnlocked 
              ? `bg-gradient-to-br from-${displayLevel.color}-400 to-${displayLevel.color}-600` 
              : 'bg-gray-300'
          }`}>
            <displayLevel.icon className={`w-8 h-8 ${isUnlocked ? 'text-white' : 'text-gray-500'}`} />
          </div>
          
          <h3 className={`text-xl font-bold mb-2 ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
            {displayLevel.name}
          </h3>
          
          <p className={`text-sm mb-3 ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
            {displayLevel.description}
          </p>
          
          <div className={`text-lg font-bold ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
            {displayLevel.requirement} {displayLevel.requirement === 1 ? 'day' : 'days'}
          </div>
          
          {!isUnlocked && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">
                {displayLevel.requirement - streakData.total_locked_in_days} days to unlock
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (streakData.total_locked_in_days / displayLevel.requirement) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress to Next Level */}
      {currentLevel.id !== LEVELS[LEVELS.length - 1].id && (
        <div className="bg-white/70 rounded-xl p-4 border border-gray-200 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-800 font-semibold text-sm">Next Level: {nextLevel.name}</span>
            <span className="text-gray-600 text-sm">
              {nextLevel.requirement - streakData.total_locked_in_days} days to go
            </span>
          </div>
          
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-700"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            {progressToNext}% complete
          </div>
        </div>
      )}

      {/* Max Level Reached */}
      {currentLevel.id === LEVELS[LEVELS.length - 1].id && (
        <div className="bg-yellow-100 rounded-xl p-4 border border-yellow-300 text-center mb-4">
          <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-yellow-800">Max Level Reached!</div>
          <div className="text-sm text-yellow-700">Legendary status achieved</div>
        </div>
      )}

      {/* Achievement Summary */}
      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div className="bg-white/50 rounded-lg p-3">
          <div className="font-bold text-gray-800">{currentLevel.name}</div>
          <div className="text-xs text-gray-600">Current Level</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="font-bold text-orange-600">{streakData.current_streak}</div>
          <div className="text-xs text-gray-600">Current Streak</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="font-bold text-purple-600">
            {LEVELS.filter(level => streakData.total_locked_in_days >= level.requirement).length}
          </div>
          <div className="text-xs text-gray-600">Badges Earned</div>
        </div>
      </div>
    </div>
  );
};

export default LockedInLevelSystem;