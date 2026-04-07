//components/StreakCelebrationModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Flame, Share, Calendar, Target, Trophy, Sparkles, Award } from 'lucide-react';

const StreakCelebrationModal = ({ isOpen, onClose, streakData, onShare }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      // Trigger animation after modal opens
      setTimeout(() => setShowAnimation(true), 100);
    } else {
      setShowAnimation(false);
    }
  }, [isOpen]);

  if (!isOpen || !streakData) return null;

  const { current_streak, total_locked_in_days, today_locked_in } = streakData;

  // Get congratulations message based on streak
  const getStreakMessage = (streak) => {
    if (streak === 1) return "First day locked in!";
    if (streak <= 3) return "Building momentum!";
    if (streak <= 7) return "Getting consistent!";
    if (streak <= 14) return "On a roll!";
    if (streak <= 30) return "Absolutely crushing it!";
    if (streak <= 60) return "Legendary dedication!";
    if (streak <= 99) return "Almost at 100 days!";
    if (streak >= 100) return "Century club member!";
    return "On fire!";
  };

  // Get flame color based on streak
  const getFlameColor = (streak) => {
    if (streak <= 3) return "text-orange-400";
    if (streak <= 7) return "text-orange-500";
    if (streak <= 14) return "text-red-500";
    if (streak <= 30) return "text-red-600";
    return "text-yellow-400";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Premium Background Effects matching homepage */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-orange-100/40 via-red-50/30 to-transparent rounded-full blur-3xl animate-pulse opacity-80"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-yellow-100/35 via-orange-50/25 to-transparent rounded-full blur-3xl animate-pulse delay-1000 opacity-70"></div>
      </div>
      
      <div className={`relative bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl shadow-2xl max-w-sm w-full transform transition-all duration-500 ease-out overflow-hidden ${
        showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Premium overlay effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 via-red-50/40 to-yellow-50/30"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-300/60 to-transparent"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => {
            const colors = ['bg-orange-400', 'bg-red-400', 'bg-yellow-400'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            return (
              <div
                key={i}
                className={`absolute w-1 h-1 ${randomColor} rounded-full opacity-40`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${4 + Math.random() * 4}s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 8}s`
                }}
              ></div>
            );
          })}
        </div>
        
        {/* Close button */}
        <div className="relative flex justify-between items-center p-6 pb-2">
          <div className="text-xs text-orange-700 bg-orange-100/80 backdrop-blur-xl px-3 py-1 rounded-full shadow-sm border border-orange-200/60">
            Celebration Mode
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100/80 backdrop-blur-xl hover:bg-gray-200/80 rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-300 shadow-sm border border-gray-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main content */}
        <div className="relative px-6 pb-6">
          {/* Timer-like display for current streak */}
          <div className="text-center mb-8">
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
            <div className="text-gray-500 text-sm">
              Today's milestone reached!
            </div>
          </div>

          {/* Fire badge with glassmorphism */}
          <div className={`bg-white/70 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-8 text-center shadow-xl relative overflow-hidden transform transition-all duration-1000 delay-300 ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-red-50/30"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-200/60 to-transparent"></div>
            
            <div className="relative">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto shadow-lg border border-orange-200/50 mb-4">
                  <Flame className={`w-12 h-12 ${getFlameColor(current_streak)} transform transition-all duration-700 ${
                    showAnimation ? 'scale-100 rotate-0' : 'scale-50 rotate-12'
                  }`} />
                </div>
                
                {/* Animated fire particles around the flame */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-2 h-2 bg-yellow-400 rounded-full opacity-0 ${
                        showAnimation ? 'animate-ping' : ''
                      }`}
                      style={{
                        animationDelay: `${i * 200}ms`,
                        animationDuration: '1s',
                        left: `${(i - 1) * 12}px`,
                        top: `${-i * 6}px`
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2 drop-shadow-sm">
                Locked In!
              </h2>
              
              <p className="text-lg font-bold text-orange-600 mb-3">
                {current_streak}-day streak!
              </p>
              
              <p className="text-gray-600 text-sm mb-6 font-medium">
                {getStreakMessage(current_streak)}
              </p>

              {/* Stats with premium styling */}
              <div className="flex justify-center gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2 bg-blue-50/80 backdrop-blur-xl px-3 py-2 rounded-xl shadow-sm border border-blue-200/60">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700 font-medium">{total_locked_in_days} total</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50/80 backdrop-blur-xl px-3 py-2 rounded-xl shadow-sm border border-green-200/60">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium">All done</span>
                </div>
              </div>

              {/* Achievement badges for milestones */}
              {(current_streak === 7 || current_streak === 30 || current_streak === 100 || current_streak % 50 === 0) && (
                <div className={`mb-6 transform transition-all duration-1000 delay-700 ${
                  showAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                }`}>
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-2xl inline-flex items-center gap-2 font-bold shadow-lg backdrop-blur-xl">
                    <Trophy className="w-5 h-5" />
                    <span>
                      {current_streak === 7 && "Week Warrior!"}
                      {current_streak === 30 && "Month Master!"}
                      {current_streak === 100 && "Century Champion!"}
                      {current_streak % 50 === 0 && current_streak !== 100 && "Milestone Achieved!"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons with glassmorphism */}
          <div className={`space-y-4 mt-6 transform transition-all duration-1000 delay-500 ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <button
              onClick={onShare}
              className="w-full bg-gray-800/90 backdrop-blur-xl text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-900/90 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg border border-gray-700/50 hover:scale-105"
            >
              <Share className="w-5 h-5" />
              Share Achievement
            </button>
            
            <button
              onClick={onClose}
              className="w-full text-gray-600 py-3 text-lg font-medium hover:text-gray-800 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) translateX(0px);
              opacity: 0.3;
            }
            25% {
              transform: translateY(-15px) translateX(8px);
              opacity: 0.6;
            }
            50% {
              transform: translateY(-8px) translateX(-4px);
              opacity: 0.8;
            }
            75% {
              transform: translateY(-20px) translateX(12px);
              opacity: 0.4;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default StreakCelebrationModal;