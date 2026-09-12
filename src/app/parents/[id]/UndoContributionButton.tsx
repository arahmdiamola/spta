"use client";

import { useState } from "react";
import { Undo2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface UndoContributionButtonProps {
  contributionId: string;
  amount: number;
  receiptNumber: number;
}

export default function UndoContributionButton({
  contributionId,
  amount,
  receiptNumber,
}: UndoContributionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleUndo = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contributions/${contributionId}/undo`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to undo payment");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to undo payment.");
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
        title="Undo Payment"
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
              <h3 className="text-lg font-bold text-slate-900">Undo Payment?</h3>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to undo this payment of ₱{amount}? Receipt #{receiptNumber} will be voided. This action will be logged in the audit trail.
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
                onClick={handleUndo}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? "Undoing..." : "Yes, Undo Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
