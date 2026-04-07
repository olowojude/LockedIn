// src/pages/WelcomeScreen.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock, Layers, Flame, ChevronRight, BarChart3,
} from "lucide-react";

const SLIDES = [
  {
    icon: Lock,
    iconColor: "#6366F1",
    iconBg: "#EEF2FF",
    title: "Welcome to LockedIn",
    body: "Track your consistency like a pro — without the stress. Whether you're building a fitness habit, levelling up your finances, or sharpening a skill, LockedIn keeps you honest and on track every single day.",
  },
  {
    icon: Layers,
    iconColor: "#10B981",
    iconBg: "#ECFDF5",
    title: "Everything is a Lock",
    body: "A Lock is any area of your life you want to stay consistent in. Each Lock has its own daily actions, a streak counter, and a heat-map calendar that shows exactly how consistent you've been.",
  },
  {
    icon: Flame,
    iconColor: "#F97316",
    iconBg: "#FFF7ED",
    title: "Lock in every day",
    body: "Complete all your daily actions and you're locked in for the day. Build streaks, earn badges, and get a weekly Wrapped every Saturday — your personal performance recap for the week.",
  },
  {
    icon: BarChart3,
    iconColor: "#6366F1",
    iconBg: "#EEF2FF",
    title: "You're in control",
    body: "Create as many Locks as you need — fitness, mindfulness, career, or anything custom. Visit the Locks tab in the navigation to create your first one. We recommend starting with just one or two and building from there.",
    isLast: true,
  },
];

export default function WelcomeScreen() {
  const navigate    = useNavigate();
  const [slide, setSlide] = useState(0);

  const current = SLIDES[slide];
  const isLast  = slide === SLIDES.length - 1;
  const Icon    = current.icon;

  const advance = () => {
    if (isLast) {
      localStorage.setItem("lockedin_welcome_seen", "true");
      navigate("/", { replace: true });
    } else {
      setSlide(s => s + 1);
    }
  };

  const skip = () => {
    localStorage.setItem("lockedin_welcome_seen", "true");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-10">
          {SLIDES.map((_, i) => (
            <div key={i} className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === slide ? 24 : 6,
                backgroundColor: i === slide ? "#6366F1" : "#E5E7EB",
              }} />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-6">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ backgroundColor: current.iconBg }}>
            <Icon className="w-8 h-8" style={{ color: current.iconColor }} />
          </div>

          {/* Text */}
          <h1 className="text-2xl font-black text-gray-800 mb-4 leading-snug">
            {current.title}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {current.body}
          </p>

          {/* Tip on last slide */}
          {isLast && (
            <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
              <p className="text-indigo-700 text-xs leading-relaxed">
                <span className="font-semibold">Pro tip:</span> Keep each Lock to{" "}
                <span className="font-semibold">3 daily actions max</span>. Focused beats
                busy — every time.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <button onClick={advance}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-colors text-base mb-3">
          {isLast ? "Get started" : "Next"}
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Skip */}
        {!isLast && (
          <button onClick={skip}
            className="w-full text-center text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors py-2">
            Skip intro
          </button>
        )}

      </div>
    </div>
  );
}