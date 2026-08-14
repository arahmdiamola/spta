"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettlePenaltyButton({ penaltyId }: { penaltyId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSettle = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/penalties/${penaltyId}/settle`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to settle penalty");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to settle penalty. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSettle}
      disabled={loading}
      className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
    >
      {loading ? "Settling..." : "Settle"}
    </button>
  );
}
