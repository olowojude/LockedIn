// src/pages/Onboarding.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, ChevronLeft, Check, Plus, Trash2,
  Dumbbell, DollarSign, BookOpen, Heart,
  Users, Briefcase, Brain, Palette, Sparkles, Infinity,
} from "lucide-react";
import { useAspects } from "../../utils/useAspects";
import AdvisoryModal from "../components/AdvisoryModal";

// ─── Data ─────────────────────────────────────────────────────────────────────
const ASPECT_OPTIONS = [
  { type: "fitness",       label: "Body & Fitness",    icon: Dumbbell,   color: "#FF6B6B", description: "Workouts, nutrition, movement" },
  { type: "finance",       label: "Financial Growth",  icon: DollarSign, color: "#10B981", description: "Savings, budgeting, investing" },
  { type: "skills",        label: "Skill Development", icon: BookOpen,   color: "#3B82F6", description: "Learning, practice, mastery" },
  { type: "health",        label: "Health & Wellness", icon: Heart,      color: "#EC4899", description: "Sleep, medication, mental health" },
  { type: "relationships", label: "Relationships",     icon: Users,      color: "#F59E0B", description: "Family, friends, connection" },
  { type: "career",        label: "Career Progress",   icon: Briefcase,  color: "#8B5CF6", description: "Goals, skills, networking" },
  { type: "mindfulness",   label: "Mindfulness",       icon: Brain,      color: "#06B6D4", description: "Meditation, focus, clarity" },
  { type: "creativity",    label: "Creative Pursuits", icon: Palette,    color: "#F97316", description: "Art, music, writing, making" },
  { type: "custom",        label: "Custom Goal",       icon: Sparkles,   color: "#6366F1", description: "Define your own path" },
];

// Duration options — null days = forever
const DURATION_OPTIONS = [
  { days: 30,   label: "30 Days",  sub: "A solid start",         icon: null      },
  { days: 60,   label: "60 Days",  sub: "Build real habits",     icon: null      },
  { days: 90,   label: "90 Days",  sub: "Transform your life",   icon: null      },
  { days: null, label: "Forever",  sub: "No end date, just consistency", icon: Infinity },
];

const STEPS    = ["Pick a Lock", "Set your sprint", "Your why", "Daily actions", "Make it yours"];
const PLACEHOLDERS = [
  "e.g. 30 min workout",
  "e.g. Track all meals",
  "e.g. 8 glasses of water",
  "e.g. 10 min stretching",
  "e.g. Sleep by 10pm",
];
const COLORS = [
  "#FF6B6B", "#10B981", "#3B82F6", "#EC4899",
  "#F59E0B", "#8B5CF6", "#06B6D4", "#F97316",
  "#6366F1", "#84CC16", "#EF4444", "#14B8A6",
];

// ─── Step bar ─────────────────────────────────────────────────────────────────
const StepBar = ({ current, total }) => (
  <div className="flex items-center gap-1.5 mb-8">
    {Array.from({ length: total }, (_, i) => (
      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
        i < current ? "bg-indigo-600" : i === current ? "bg-indigo-300" : "bg-gray-200"
      }`} />
    ))}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate       = useNavigate();
  const { createAspect } = useAspects();

  const [step, setStep]         = useState(0);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);
  const [showAdvisory, setShowAdvisory] = useState(false);

  // Form state
  const [selectedType, setSelectedType] = useState(null);
  const [customName, setCustomName]     = useState("");
  const [duration, setDuration]         = useState(30);     // null = forever
  const [why, setWhy]                   = useState("");
  const [activities, setActivities]     = useState([""]);
  const [color, setColor]               = useState("#6366F1");

  const selected     = ASPECT_OPTIONS.find(a => a.type === selectedType);
  const isForever    = duration === null;
  const filledCount  = activities.filter(a => a.trim()).length;

  const handleSelectType = (type) => {
    setSelectedType(type);
    const opt = ASPECT_OPTIONS.find(a => a.type === type);
    if (opt) setColor(opt.color);
  };

  const updateActivity = (i, val) =>
    setActivities(prev => prev.map((a, idx) => idx === i ? val : a));

  const removeActivity = (i) =>
    setActivities(prev => prev.filter((_, idx) => idx !== i));

  const requestAddActivity = () => {
    if (filledCount >= 3) setShowAdvisory(true);
    else setActivities(prev => [...prev, ""]);
  };

  const canProceed = () => {
    if (step === 0) return !!selectedType && (selectedType !== "custom" || customName.trim());
    if (step === 1) return duration !== undefined; // null (forever) is valid
    if (step === 2) return true;
    if (step === 3) return filledCount >= 1;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    setError(null);

    const today = new Date();
    const fmt   = (d) => d.toISOString().split("T")[0];

    let targetDate = null;
    if (!isForever) {
      const td = new Date(today);
      td.setDate(td.getDate() + duration);
      targetDate = fmt(td);
    }

    const result = await createAspect({
      aspect_type:        selectedType,
      custom_name:        selectedType === "custom" ? customName.trim() : null,
      start_date:         fmt(today),
      target_date:        targetDate,   // null for forever
      why_statement:      why.trim(),
      color,
      icon:               "target",
      default_activities: activities.filter(a => a.trim()),
    });

    setSaving(false);
    if (result.ok) navigate("/aspects", { replace: true });
    else setError(result.error);
  };

  // End date label shown in step 1 preview
  const endDateLabel = isForever
    ? "No end date — just keep going"
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() + duration);
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      })();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              Locked<span className="text-indigo-600">In</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Create a new Lock</p>
          </div>

          <StepBar current={step} total={STEPS.length} />

          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">

            {/* ── Step 0: Pick type ── */}
            {step === 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">What do you want to lock in on?</h2>
                <p className="text-gray-400 text-sm mb-6">Pick the area of your life you want to transform.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ASPECT_OPTIONS.map(({ type, label, icon: Icon, color: c, description }) => (
                    <button key={type} onClick={() => handleSelectType(type)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all duration-200 ${
                        selectedType === type ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: c + "22" }}>
                        <Icon className="w-5 h-5" style={{ color: c }} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-800 text-sm">{label}</div>
                        <div className="text-gray-400 text-xs truncate">{description}</div>
                      </div>
                      {selectedType === type && <Check className="w-4 h-4 text-indigo-600 ml-auto flex-shrink-0" />}
                    </button>
                  ))}
                </div>
                {selectedType === "custom" && (
                  <div className="mt-4">
                    <input type="text" placeholder="Name your Lock…"
                      value={customName} onChange={e => setCustomName(e.target.value)}
                      maxLength={60}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      style={{ color: "#111827" }} />
                  </div>
                )}
              </div>
            )}

            {/* ── Step 1: Duration ── */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">How long is your sprint?</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Choose a fixed period to build momentum, or go forever if you want this to be a permanent habit.
                </p>
                <div className="space-y-3">
                  {DURATION_OPTIONS.map(({ days, label, sub, icon: DIcon }) => (
                    <button key={String(days)} onClick={() => setDuration(days)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${
                        duration === days ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                      }`}>
                      <div className="flex items-center gap-3">
                        {DIcon && (
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <DIcon className="w-4 h-4 text-indigo-600" />
                          </div>
                        )}
                        <div className="text-left">
                          <div className="font-bold text-gray-800">{label}</div>
                          <div className="text-gray-400 text-sm">{sub}</div>
                        </div>
                      </div>
                      {duration === days && <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />}
                    </button>
                  ))}
                </div>

                {selected && (
                  <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="text-xs text-gray-400">{isForever ? "This Lock" : "Sprint ends"}</div>
                    <div className="font-semibold text-gray-800 mt-0.5">{endDateLabel}</div>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Why ── */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">What's your why?</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Shows on your daily check-in as a reminder. Optional — you can skip this.
                </p>
                <textarea rows={5}
                  placeholder={`Why do you want to lock in on ${selected?.label || "this"}?\n\ne.g. "I want to feel confident and have energy…"`}
                  value={why} onChange={e => setWhy(e.target.value)} maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                  style={{ color: "#111827" }} />
                <div className="text-right text-xs text-gray-400 mt-1">{why.length}/500</div>
              </div>
            )}

            {/* ── Step 3: Daily actions ── */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Your daily actions</h2>
                <p className="text-gray-400 text-sm mb-1">What will you do every day to make progress?</p>
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-5">
                  <p className="text-amber-700 text-xs">
                    We recommend <span className="font-semibold">3 focused actions max</span> — you decide
                    how many works for you. You can change these any time inside your Lock.
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  {activities.map((act, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: i < 3 ? color : "#9CA3AF" }}>
                        {i + 1}
                      </div>
                      <input type="text"
                        placeholder={PLACEHOLDERS[i] || `Action ${i + 1}…`}
                        value={act} onChange={e => updateActivity(i, e.target.value)}
                        maxLength={120}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        style={{ color: "#111827" }} />
                      {activities.length > 1 && (
                        <button onClick={() => removeActivity(i)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={requestAddActivity}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  Add another action
                </button>

                {filledCount > 3 && (
                  <p className="text-xs text-gray-400 text-center mt-3">
                    {filledCount} actions — make sure each one truly moves the needle.
                  </p>
                )}
              </div>
            )}

            {/* ── Step 4: Colour ── */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Make it yours</h2>
                <p className="text-gray-400 text-sm mb-6">Pick a colour for your Lock card.</p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Lock colour</label>
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setColor(c)}
                        className={`w-9 h-9 rounded-full transition-transform duration-150 ${
                          color === c ? "scale-125 ring-2 ring-offset-2 ring-gray-400" : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-2xl p-4 border-2 transition-all duration-300"
                  style={{ borderColor: color + "60", backgroundColor: color + "10" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: color }}>
                      {selected && <selected.icon className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">
                        {selectedType === "custom" ? customName || "My Lock" : selected?.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {isForever ? "Forever" : `${duration} day sprint`}
                      </div>
                    </div>
                  </div>
                  {activities.filter(a => a.trim()).length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-gray-200/60">
                      {activities.filter(a => a.trim()).map((a, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0" />
                          {a}
                        </div>
                      ))}
                    </div>
                  )}
                  {why && (
                    <p className="mt-3 text-xs text-gray-400 italic border-t border-gray-200/60 pt-3">
                      "{why.slice(0, 80)}{why.length > 80 ? "…" : ""}"
                    </p>
                  )}
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
                )}
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex items-center justify-between mt-8">
              {step > 0 ? (
                <button onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <button onClick={() => navigate("/aspects")}
                  className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
                  Cancel
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleFinish} disabled={saving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-all">
                  {saving ? "Creating…" : "Create Lock"}
                  {!saving && <Check className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>
      </div>

      <AdvisoryModal
        isOpen={showAdvisory}
        count={filledCount}
        onBypass={() => { setShowAdvisory(false); setActivities(prev => [...prev, ""]); }}
        onCancel={() => setShowAdvisory(false)}
      />
    </>
  );
}