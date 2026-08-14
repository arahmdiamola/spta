"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function FinalizeButton({ eventId, penaltyCount }: { eventId: string; penaltyCount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFinalize = async () => {
    if (!confirm("This will assign penalties to all parents who did not attend. Continue?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.message);
      router.refresh();
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (penaltyCount > 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center space-x-3">
        <CheckCircle className="text-amber-600" size={20} />
        <p className="text-amber-800 font-medium text-sm">Penalties have already been assigned for this event.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-start space-x-4">
        <div className="text-amber-500 mt-0.5"><AlertTriangle size={24} /></div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900">Finalize Event</h3>
          <p className="text-sm text-slate-500 mt-1">Once finalized, all absent parents will be assigned the penalty fee. This action cannot be undone.</p>
          {result && (
            <p className="text-sm text-emerald-700 mt-3 font-medium bg-emerald-50 p-2 rounded-lg">{result}</p>
          )}
        </div>
        <button
          onClick={handleFinalize}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
        >
          {loading ? "Processing..." : "Assign Penalties"}
        </button>
      </div>
    </div>
  );
}
