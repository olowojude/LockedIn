import React, { useState, useEffect } from 'react';
import { X, Flame, Share, Calendar, Target, Trophy, Sparkles } from 'lucide-react';

const StreakCelebrationModal = ({ isOpen, onClose, streakData, lockName, isAllDone, onShare }) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowAnimation(true), 100);
    } else {
      setShowAnimation(false);
    }
  }, [isOpen]);

  if (!isOpen || !streakData) return null;

  const { current_streak, total_locked_in_days } = streakData;

  const getStreakMessage = (streak) => {
    if (streak === 1)   return "First day locked in!";
    if (streak <= 3)    return "Building momentum!";
    if (streak <= 7)    return "Getting consistent!";
    if (streak <= 14)   return "On a roll!";
    if (streak <= 30)   return "Absolutely crushing it!";
    if (streak <= 60)   return "Legendary dedication!";
    if (streak <= 99)   return "Almost at 100 days!";
    if (streak >= 100)  return "Century club member!";
    return "On fire!";
  };

  const getFlameColor = (streak) => {
    if (streak <= 3)  return "text-orange-400";
    if (streak <= 7)  return "text-orange-500";
    if (streak <= 14) return "text-red-500";
    if (streak <= 30) return "text-red-600";
    return "text-yellow-400";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-orange-100/40 via-red-50/30 to-transparent rounded-full blur-3xl animate-pulse opacity-80" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-yellow-100/35 via-orange-50/25 to-transparent rounded-full blur-3xl animate-pulse opacity-70" />
      </div>

      <div className={`relative bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl shadow-2xl max-w-sm w-full transform transition-all duration-500 ease-out overflow-hidden ${
        showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 via-red-50/40 to-yellow-50/30 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-300/60 to-transparent pointer-events-none" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => {
            const colors = ['bg-orange-400', 'bg-red-400', 'bg-yellow-400'];
            const color  = colors[i % colors.length];
            return (
              <div key={i} className={`absolute w-1 h-1 ${color} rounded-full opacity-40`}
                style={{
                  left: `${(i * 8.3) % 100}%`,
                  top:  `${(i * 13.7) % 100}%`,
                  animation: `float ${4 + (i % 4)}s infinite ease-in-out`,
                  animationDelay: `${(i * 0.6) % 4}s`,
                }} />
            );
          })}
        </div>

        {/* Header */}
        <div className="relative flex justify-between items-center p-6 pb-2">
          <div className="text-xs text-orange-700 bg-orange-100/80 backdrop-blur-xl px-3 py-1 rounded-full shadow-sm border border-orange-200/60">
            {isAllDone ? "All Locks Complete!" : "Lock Complete!"}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 bg-gray-100/80 backdrop-blur-xl hover:bg-gray-200/80 rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-300 shadow-sm border border-gray-200/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main content */}
        <div className="relative px-6 pb-6">
          {/* Streak display — only show real number when all locks are done */}
          <div className="text-center mb-6">
            {isAllDone ? (
              <>
                <div className={`relative text-6xl font-black text-gray-800 mb-2 transform transition-all duration-700 drop-shadow-sm ${
                  showAnimation ? 'scale-100' : 'scale-75'
                }`}>
                  {current_streak}
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-gray-600 text-lg font-medium">
                  {current_streak === 1 ? 'Day' : 'Days'} Streak
                </div>
                <div className="text-gray-500 text-sm">All locks done today!</div>
              </>
            ) : (
              <>
                <div className={`text-5xl mb-2 transform transition-all duration-700 ${
                  showAnimation ? 'scale-100' : 'scale-75'
                }`}>
                  🔒
                </div>
                <div className="text-gray-600 text-lg font-medium">Lock complete!</div>
                <div className="text-gray-400 text-sm">Finish all locks to see your streak</div>
              </>
            )}
          </div>

          {/* Fire badge */}
          <div className={`bg-white/70 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-6 text-center shadow-xl relative overflow-hidden transform transition-all duration-1000 delay-300 ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-red-50/30 pointer-events-none" />

            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border border-orange-200/50">
                <Flame className={`w-12 h-12 ${getFlameColor(current_streak)} transform transition-all duration-700 ${
                  showAnimation ? 'scale-100' : 'scale-50'
                }`} />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {isAllDone ? "All Locked In!" : `${lockName || "Lock"} done!`}
              </h2>

              <p className="text-lg font-bold text-orange-600 mb-3">
                {isAllDone
                  ? `${current_streak}-day streak!`
                  : "One lock down — keep going!"}
              </p>

              <p className="text-gray-600 text-sm mb-5 font-medium">
                {isAllDone
                  ? getStreakMessage(current_streak)
                  : "Finish the rest of your locks to lock in the day."}
              </p>

              {/* Stats */}
              <div className="flex justify-center gap-4 mb-4 text-sm">
                {isAllDone && (
                  <div className="flex items-center gap-2 bg-blue-50/80 px-3 py-2 rounded-xl border border-blue-200/60">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">{total_locked_in_days} total</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-green-50/80 px-3 py-2 rounded-xl border border-green-200/60">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium">
                    {isAllDone ? "All done" : "Keep going"}
                  </span>
                </div>
              </div>

              {/* Milestone badge */}
              {isAllDone && (current_streak === 7 || current_streak === 30 || current_streak === 100 || (current_streak > 0 && current_streak % 50 === 0)) && (
                <div className={`mb-2 transform transition-all duration-1000 delay-700 ${
                  showAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                }`}>
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-2xl inline-flex items-center gap-2 font-bold shadow-lg text-sm">
                    <Trophy className="w-4 h-4" />
                    {current_streak === 7   && "Week Warrior!"}
                    {current_streak === 30  && "Month Master!"}
                    {current_streak === 100 && "Century Champion!"}
                    {current_streak % 50 === 0 && current_streak !== 100 && "Milestone Achieved!"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className={`space-y-3 mt-5 transform transition-all duration-1000 delay-500 ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            {isAllDone && (
              <button onClick={onShare}
                className="w-full bg-gray-800/90 backdrop-blur-xl text-white py-4 rounded-2xl font-bold text-base hover:bg-gray-900/90 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg border border-gray-700/50 hover:scale-105">
                <Share className="w-5 h-5" />
                Share Achievement
              </button>
            )}
            <button onClick={onClose}
              className="w-full text-gray-600 py-3 text-base font-medium hover:text-gray-800 transition-colors">
              {isAllDone ? "Continue" : "Keep going →"}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
            25%       { transform: translateY(-15px) translateX(8px); opacity: 0.6; }
            50%       { transform: translateY(-8px) translateX(-4px); opacity: 0.8; }
            75%       { transform: translateY(-20px) translateX(12px); opacity: 0.4; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default StreakCelebrationModal;