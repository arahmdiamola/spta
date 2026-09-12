"use client";

import { useState } from "react";
import { Undo2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface UndoPenaltyButtonProps {
  penaltyId: string;
  amount: number;
  eventName: string;
}

export default function UndoPenaltyButton({
  penaltyId,
  amount,
  eventName,
}: UndoPenaltyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleUnsettle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/penalties/${penaltyId}/unsettle`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to unsettle penalty");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to unsettle penalty.");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-lg transition-colors disabled:opacity-50"
        title="Unsettle Penalty"
      >
        <Undo2 size={14} />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-full">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Unsettle Penalty?</h3>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to unsettle this penalty of ₱{amount} for {eventName}? The penalty will return to unpaid status. This action will be logged.
            </p>

            <div className="flex justify-end items-center space-x-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleUnsettle}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? "Unsettling..." : "Yes, Unsettle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
