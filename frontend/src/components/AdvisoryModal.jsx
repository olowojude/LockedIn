// src/components/AdvisoryModal.jsx
import React from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * AdvisoryModal — shown when a user tries to add a 4th+ daily action.
 * Props:
 *   isOpen    — boolean
 *   onBypass  — called when user chooses to add anyway
 *   onCancel  — called when user cancels
 *   count     — current number of actions (so the message can be specific)
 */
export default function AdvisoryModal({ isOpen, onBypass, onCancel, count = 3 }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500" />

        <div className="p-6">
          {/* Icon + heading */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base leading-snug">
                More than 3 actions?
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">Heads up before you continue</p>
            </div>
            <button
              onClick={onCancel}
              className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5">
            <p className="text-amber-800 text-sm leading-relaxed">
              It's advisable to stick to <span className="font-bold">3 major actions</span> that'll
              help you make real progress in this area. More than that can dilute your focus
              and make it harder to stay locked in.
            </p>
            <p className="text-amber-600 text-xs mt-2">
              You currently have {count} action{count !== 1 ? "s" : ""}. Adding more is allowed,
              but less is usually more.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={onBypass}
              className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Add anyway
            </button>
            <button
              onClick={onCancel}
              className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors text-sm"
            >
              Keep it at {count}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}