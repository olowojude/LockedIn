// src/pages/AspectsDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Flame, CheckCircle, ChevronRight,
  Layers, TrendingUp, Pencil, Trash2, X,
  Check, AlertTriangle, MoreVertical, Info,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAspects } from "../../utils/useAspects";
import api from "../../utils/api";
import {
  PAGE, CONTAINER, CARD, TEXT, BTN,
  NOTICE, NOTICE_TEXT, MODAL_OVERLAY, MODAL_CARD,
  PROGRESS_TRACK, PROGRESS_FILL, LOCK_ACCENT_BAR,
} from "../../utils/design";

// ─── Progress ring ────────────────────────────────────────────────────────────
const ProgressRing = ({ completed, total, color }) => {
  const r    = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - (total > 0 ? completed / total : 0));
  return (
    <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="26" cy="26" r={r} fill="none" stroke="#E5E7EB" strokeWidth="4" />
      <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <text x="26" y="26" textAnchor="middle" dominantBaseline="central" fill="#374151"
        style={{ fontSize: "11px", fontWeight: 600, transform: "rotate(90deg)", transformOrigin: "26px 26px" }}>
        {completed}/{total}
      </text>
    </svg>
  );
};

// ─── Edit modal ───────────────────────────────────────────────────────────────
const EditLockModal = ({ aspect, onClose, onSaved }) => {
  const [name, setName]           = useState(aspect.custom_name || aspect.display_name);
  const [activities, setActivities] = useState([...(aspect.default_activities || [])]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);

  const updateActivity = (i, val) => setActivities(p => p.map((a, idx) => idx === i ? val : a));
  const removeActivity = (i)      => setActivities(p => p.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = { default_activities: activities.filter(a => a.trim()) };
      if (aspect.aspect_type === "custom") payload.custom_name = name.trim() || aspect.display_name;
      const res = await api.patch(`/aspects/${aspect.id}/`, payload);
      onSaved(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const filledCount = activities.filter(a => a.trim()).length;

  return (
    <div className={MODAL_OVERLAY}>
      <div className={`${MODAL_CARD} max-h-[90vh] flex flex-col`}>
        <div className="h-1 w-full" style={{ backgroundColor: aspect.color }} />

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className={TEXT.sectionTitle}>Edit Lock</h3>
          <button onClick={onClose} className={BTN.icon}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {aspect.aspect_type === "custom" && (
            <div>
              <label className={TEXT.label + " block mb-2"}>Lock name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                maxLength={60}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                style={{ color: "#111827" }} />
            </div>
          )}

          <div>
            <label className={TEXT.label + " block mb-1"}>Default daily actions</label>
            <p className={TEXT.caption + " mb-3"}>
              These auto-fill each day. You can still change them individually inside the Lock.
            </p>

            {filledCount === 0 && (
              <div className={`${NOTICE} flex items-start gap-2 mb-3`}>
                <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className={NOTICE_TEXT}>
                  For maximum focus, add no more than{" "}
                  <span className="font-semibold">3 daily actions</span> — quality over quantity.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {activities.map((act, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: i < 3 ? aspect.color : "#9CA3AF" }}>
                    {i + 1}
                  </div>
                  <input type="text" value={act}
                    onChange={e => updateActivity(i, e.target.value)}
                    maxLength={120} placeholder={`Action ${i + 1}…`}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    style={{ color: "#111827" }} />
                  <button onClick={() => removeActivity(i)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button onClick={() => setActivities(p => [...p, ""])}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-all text-sm font-medium">
              <Plus className="w-3.5 h-3.5" />
              Add action
            </button>

            {filledCount > 3 && (
              <div className={`${NOTICE} flex items-start gap-2 mt-2`}>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className={NOTICE_TEXT}>
                  More than 3 actions — consider focusing on your top 3 for best results.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className={`${BTN.secondary} flex-1 py-2.5 text-sm`}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: aspect.color }}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete confirm modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({ aspect, onConfirm, onCancel, deleting }) => (
  <div className={MODAL_OVERLAY}>
    <div className={MODAL_CARD}>
      <div className="p-6 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-7 h-7 text-red-400" />
        </div>
        <h3 className={TEXT.sectionTitle + " mb-2"}>Delete this Lock?</h3>
        <p className="text-gray-500 text-sm mb-1 font-semibold">{aspect.display_name}</p>
        <p className={TEXT.caption + " mb-6"}>
          All activities, calendar data, and milestones will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className={`${BTN.secondary} flex-1 py-3 text-sm`}>Keep it</button>
          <button onClick={onConfirm} disabled={deleting}
            className={`${BTN.danger} flex-1 py-3 text-sm disabled:opacity-50`}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Lock card ────────────────────────────────────────────────────────────────
const AspectCard = ({ aspect, onClick, onRefresh }) => {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [showEdit, setShowEdit]     = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const { deleteAspect }            = useAspects();

  const {
    display_name, color, today_locked_in,
    today_completion_count, today_total_count,
    current_streak, days_remaining, progress_percentage,
    why_statement, is_forever,
  } = aspect;

  const total     = today_total_count    || 0;
  const completed = today_completion_count || 0;
  const isDailyTasks = aspect.custom_name === "Daily Tasks" && is_forever;

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteAspect(aspect.id);
    setDeleting(false);
    if (res.ok) { setShowDelete(false); onRefresh(); }
  };

  return (
    <>
      <div className={`${CARD} overflow-hidden relative`}>
        <div className={LOCK_ACCENT_BAR} style={{ backgroundColor: color }} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon dot */}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: color + "20" }}>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={TEXT.cardTitle}>{display_name}</h3>
                {isDailyTasks && (
                  <span className="text-xs text-indigo-400 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                    Daily
                  </span>
                )}
              </div>
              {why_statement && (
                <p className={TEXT.caption + " mt-0.5 line-clamp-1"}>{why_statement}</p>
              )}

              <div className="flex items-center gap-3 mt-2">
                {total === 0 ? (
                  <span className={TEXT.caption}>No activities yet</span>
                ) : today_locked_in ? (
                  <div className="flex items-center gap-1 text-xs font-semibold" style={{ color }}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Locked in
                  </div>
                ) : (
                  <span className={TEXT.caption}>{completed}/{total} today</span>
                )}

                {current_streak > 0 && (
                  <>
                    <div className="w-px h-3 bg-gray-200" />
                    <div className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                      <Flame className="w-3 h-3" />
                      {current_streak}d
                    </div>
                  </>
                )}

                {!is_forever && days_remaining > 0 && (
                  <>
                    <div className="w-px h-3 bg-gray-200" />
                    <span className={TEXT.caption}>{days_remaining}d left</span>
                  </>
                )}
                {is_forever && (
                  <>
                    <div className="w-px h-3 bg-gray-200" />
                    <span className={TEXT.caption}>Ongoing</span>
                  </>
                )}
              </div>

              {!is_forever && progress_percentage !== null && (
                <div className="mt-2.5">
                  <div className={PROGRESS_TRACK}>
                    <div className={PROGRESS_FILL}
                      style={{ width: `${progress_percentage}%`, backgroundColor: color }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className={TEXT.caption}>Sprint</span>
                    <span className="text-xs font-medium" style={{ color }}>{progress_percentage}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="relative">
                <button
                  onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
                  className={BTN.icon}>
                  <MoreVertical className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute top-9 right-0 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 w-40">
                      <button onClick={() => { setShowEdit(true); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Pencil className="w-4 h-4 text-gray-400" />
                        Edit Lock
                      </button>
                      {!isDailyTasks && (
                        <button onClick={() => { setShowDelete(true); setMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
              {total > 0 && <ProgressRing completed={completed} total={total} color={color} />}
            </div>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditLockModal aspect={aspect} onClose={() => setShowEdit(false)}
          onSaved={() => { onRefresh(); setShowEdit(false); }} />
      )}
      {showDelete && (
        <DeleteConfirmModal aspect={aspect} onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)} deleting={deleting} />
      )}
    </>
  );
};

// ─── Summary strip ────────────────────────────────────────────────────────────
const SummaryStrip = ({ aspects }) => {
  const total    = aspects.length;
  const lockedIn = aspects.filter(a => a.today_locked_in).length;
  const allDone  = total > 0 && lockedIn === total;

  return (
    <div className={`rounded-2xl p-4 mb-5 flex items-center justify-between transition-colors ${
      allDone ? "bg-indigo-600" : `${CARD}`
    }`}>
      <div>
        <div className={`text-sm font-medium ${allDone ? "text-indigo-100" : TEXT.caption}`}>
          {allDone ? "All Locks locked in today" : "Today's progress"}
        </div>
        <div className={`text-2xl font-black mt-0.5 ${allDone ? "text-white" : "text-gray-800"}`}>
          {lockedIn} / {total}
        </div>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${allDone ? "bg-white/20" : "bg-indigo-50"}`}>
        <TrendingUp className={`w-6 h-6 ${allDone ? "text-white" : "text-indigo-400"}`} />
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AspectsDashboard() {
  const navigate = useNavigate();
  const { dashboard, loading, error, fetchDashboard } = useAspects();

  useEffect(() => { fetchDashboard(); }, []);

  // Sort: Daily Tasks first
  const sorted = dashboard ? [...dashboard].sort((a, b) => {
    if (a.custom_name === "Daily Tasks" && a.is_forever) return -1;
    if (b.custom_name === "Daily Tasks" && b.is_forever) return 1;
    return 0;
  }) : [];

  return (
    <>
      <Navbar />
      <div className={PAGE}>
        <div className={CONTAINER}>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={TEXT.pageTitle}>My Locks</h1>
              <p className={TEXT.caption + " mt-0.5"}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <button onClick={() => navigate("/onboarding")}
              className={`${BTN.primary} w-10 h-10 flex items-center justify-center shadow-sm`}>
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {loading && (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className={`${CARD} p-4 animate-pulse`}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gray-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32" />
                      <div className="h-3 bg-gray-200 rounded w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <p className="text-red-500 text-sm mb-3">{error}</p>
              <button onClick={fetchDashboard} className="text-red-600 font-semibold text-sm underline">
                Try again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {sorted.length > 0 && <SummaryStrip aspects={sorted} />}
              {sorted.length === 0 ? (
                <div className={`${CARD} p-6 text-center`}>
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Layers className="w-7 h-7 text-indigo-300" />
                  </div>
                  <h3 className={TEXT.sectionTitle + " mb-1"}>No Locks yet</h3>
                  <p className={TEXT.caption + " mb-4 max-w-xs mx-auto"}>
                    Create your first Lock to start tracking daily progress.
                  </p>
                  <button onClick={() => navigate("/onboarding")}
                    className={`${BTN.primary} inline-flex items-center gap-2 px-5 py-2.5 text-sm`}>
                    <Plus className="w-4 h-4" />
                    Create a Lock
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sorted.map(aspect => (
                    <AspectCard key={aspect.id} aspect={aspect}
                      onClick={() => navigate(`/aspects/${aspect.id}`)}
                      onRefresh={fetchDashboard} />
                  ))}
                  <button onClick={() => navigate("/onboarding")}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50/50 transition-all text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    Add another Lock
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}