// src/pages/WrappedPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight,
  Flame, TrendingUp, TrendingDown,
  Share, Dumbbell, ThumbsUp, Lock,
  BarChart2, Star, CheckCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAspects } from "../../utils/useAspects";
import api from "../../utils/api";

// ─── Performance icon (replaces emojis) ──────────────────────────────────────
const PerformanceIcon = ({ type, size = 48 }) => {
  const cls = `text-white`;
  const style = { width: size, height: size };

  const configs = {
    "fire":        { Icon: Flame,      bg: "#F97316" },
    "muscle":      { Icon: Dumbbell,   bg: "#3B82F6" },
    "thumbs-up":   { Icon: ThumbsUp,   bg: "#10B981" },
    "trending-up": { Icon: TrendingUp, bg: "#6366F1" },
  };

  const config = configs[type] || configs["trending-up"];
  const { Icon, bg } = config;

  return (
    <div className="rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
      style={{ width: size + 32, height: size + 32, backgroundColor: bg }}>
      <Icon className={cls} style={style} strokeWidth={1.5} />
    </div>
  );
};

// ─── Slide wrapper ────────────────────────────────────────────────────────────
const Slide = ({ children, bg = "bg-white", visible }) => (
  <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ${bg} ${
    visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"
  }`}>
    {children}
  </div>
);

// ─── Slide 1: Hero ────────────────────────────────────────────────────────────
const HeroSlide = ({ wrap, visible }) => (
  <Slide bg="bg-indigo-600" visible={visible}>
    <div className="text-center text-white w-full">
      <PerformanceIcon type={wrap.performance_emoji} size={52} />
      <div className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-3">
        Week {wrap.week_number} Wrapped
      </div>
      <h1 className="text-4xl font-black mb-3">{wrap.aspect_name}</h1>
      <div className="text-indigo-200 text-sm">
        {new Date(wrap.week_start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        {" — "}
        {new Date(wrap.week_end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </div>
    </div>
  </Slide>
);

// ─── Slide 2: Locked-in days ──────────────────────────────────────────────────
const LockedInSlide = ({ wrap, visible }) => {
  const pct = Math.round((wrap.locked_in_days / wrap.total_days) * 100);
  return (
    <Slide visible={visible}>
      <div className="text-center w-full">
        <div className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-6">
          This week you were
        </div>
        <div className="text-8xl font-black text-gray-800 mb-2">{wrap.locked_in_days}</div>
        <div className="text-2xl font-bold text-gray-500 mb-6">
          {wrap.locked_in_days === 1 ? "day" : "days"} locked in
        </div>

        <div className="w-full max-w-xs mx-auto mb-4">
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
              style={{ width: `${pct}%` }} />
          </div>
          <div className="text-gray-400 text-sm">{pct}% of the week</div>
        </div>

        {wrap.longest_streak_this_week > 1 && (
          <div className="mt-6 inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 px-4 py-2 rounded-2xl font-bold text-sm">
            <Flame className="w-4 h-4" />
            {wrap.longest_streak_this_week}-day streak this week
          </div>
        )}
      </div>
    </Slide>
  );
};

// ─── Slide 3: Completion rate ─────────────────────────────────────────────────
const RateSlide = ({ wrap, visible }) => {
  const improved = wrap.is_improvement;
  const diff     = wrap.improvement_percentage;

  return (
    <Slide visible={visible}>
      <div className="text-center w-full">
        <div className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-6">
          Completion rate
        </div>

        {/* Circular progress */}
        <div className="relative w-36 h-36 mx-auto mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" strokeWidth="10" />
            <circle cx="50" cy="50" r="40" fill="none"
              stroke="#6366F1" strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - wrap.completion_rate / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1.2s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl font-black text-gray-800">{Math.round(wrap.completion_rate)}%</div>
          </div>
        </div>

        <div className="text-gray-500 text-sm mb-5">
          {wrap.completed_activities} of {wrap.total_activities} activities completed
        </div>

        {diff !== null && diff !== undefined ? (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold ${
            improved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {improved
              ? <TrendingUp className="w-4 h-4" />
              : <TrendingDown className="w-4 h-4" />}
            {Math.abs(diff).toFixed(1)}% {improved ? "better" : "lower"} than last week
          </div>
        ) : (
          <div className="text-gray-400 text-sm">First week of data</div>
        )}
      </div>
    </Slide>
  );
};

// ─── Slide 4: Reflection ──────────────────────────────────────────────────────
const ReflectionSlide = ({ wrap, visible, onSave }) => {
  const [notes, setNotes]   = useState(wrap.reflection_notes || "");
  const [proud, setProud]   = useState(wrap.proudest_moment || "");
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ reflection_notes: notes, proudest_moment: proud });
    setSaving(false);
    setSaved(true);
  };

  return (
    <Slide visible={visible}>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Star className="w-5 h-5 text-indigo-400" />
          <div className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Reflect</div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Proudest moment this week
            </label>
            <textarea rows={2} value={proud}
              onChange={e => setProud(e.target.value)}
              placeholder="What went really well?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              style={{ color: "#111827" }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes for next week
            </label>
            <textarea rows={3} value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What do you want to do differently?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              style={{ color: "#111827" }}
            />
          </div>
          <button onClick={handleSave} disabled={saving || saved}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
            {saved ? <><CheckCircle className="w-4 h-4" /> Saved</> : saving ? "Saving…" : "Save reflection"}
          </button>
        </div>
      </div>
    </Slide>
  );
};

// ─── Slide 5: Share / done ────────────────────────────────────────────────────
const ShareSlide = ({ wrap, visible, onShare, onDone }) => (
  <Slide bg="bg-gray-900" visible={visible}>
    <div className="text-center text-white w-full">
      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-5">
        <Lock className="w-10 h-10 text-white" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-black mb-2">Week {wrap.week_number} complete</h2>
      <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
        {wrap.completion_rate >= 70
          ? "Incredible consistency. Keep going."
          : "Every week is a new chance. You've got this."}
      </p>
      <div className="space-y-3 w-full max-w-xs mx-auto">
        <button onClick={onShare}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
          <Share className="w-4 h-4" />
          Share this wrapped
        </button>
        <button onClick={onDone}
          className="w-full py-3 text-gray-400 hover:text-gray-200 font-medium transition-colors text-sm">
          Back to Lock
        </button>
      </div>
    </div>
  </Slide>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const SLIDE_COUNT = 5;

export default function WrappedPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { fetchWrapped } = useAspects();

  const [wrap, setWrap]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [slide, setSlide]     = useState(0);

  useEffect(() => {
    fetchWrapped(id).then(res => {
      if (res.ok) setWrap(res.data);
      else setError(res.error);
      setLoading(false);
    });
  }, [id]);

  const handleSaveReflection = async (data) => {
    try { await api.patch(`/wrapped/${id}/`, data); } catch { /* silent */ }
  };

  const handleShare = () => {
    if (!wrap) return;
    const text = `Week ${wrap.week_number} wrapped for ${wrap.aspect_name}: ${Math.round(wrap.completion_rate)}% completion, ${wrap.locked_in_days} days locked in! #LockedIn`;
    if (navigator.share) {
      navigator.share({ title: "LockedIn Wrapped", text, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(text).then(() => alert("Copied!"));
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-10 text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </>
    );
  }

  if (error || !wrap) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-10 text-center">
          <p className="text-red-400 text-sm mb-4">{error || "Wrapped not found"}</p>
          <button onClick={() => navigate(-1)} className="text-indigo-600 font-semibold text-sm">
            Go back
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      {/* Slide area */}
      <div className="flex-1 relative overflow-hidden">
        <HeroSlide       wrap={wrap} visible={slide === 0} />
        <LockedInSlide   wrap={wrap} visible={slide === 1} />
        <RateSlide       wrap={wrap} visible={slide === 2} />
        <ReflectionSlide wrap={wrap} visible={slide === 3} onSave={handleSaveReflection} />
        <ShareSlide
          wrap={wrap}
          visible={slide === 4}
          onShare={handleShare}
          onDone={() => navigate(`/aspects/${wrap.aspect}`)}
        />
      </div>

      {/* Controls */}
      <div className="bg-white border-t border-gray-100 px-6 py-4">
        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mb-4">
          {Array.from({ length: SLIDE_COUNT }, (_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slide ? "bg-indigo-600 w-6" : "bg-gray-200 w-1.5"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3 items-center">
          {slide > 0 && (
            <button onClick={() => setSlide(s => s - 1)}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <div className="flex-1" />
          {slide < SLIDE_COUNT - 1 && (
            <button onClick={() => setSlide(s => s + 1)}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}