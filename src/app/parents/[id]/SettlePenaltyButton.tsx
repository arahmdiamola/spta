"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReceiptModal, { ReceiptData } from "@/components/ReceiptModal";

export default function SettlePenaltyButton({ 
  penaltyId,
  parentName,
  eventName,
  amount,
  schoolName = "",
  schoolAddress = ""
}: { 
  penaltyId: string,
  parentName: string,
  eventName: string,
  amount: number,
  schoolName?: string,
  schoolAddress?: string
}) {
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
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

      const penalty = await res.json();

      // Show receipt
      setReceiptData({
        receiptNumber: 0, // Penalties don't have receipt numbers
        parentName: penalty.parent?.name || parentName,
        categoryName: penalty.event?.name || eventName,
        amount: penalty.amount || amount,
        date: penalty.settledAt || new Date().toISOString(),
        recordedBy: penalty.settledBy || "SYSTEM",
        type: "penalty",
      });

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to settle penalty. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleSettle}
        disabled={loading}
        className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {loading ? "Settling..." : "Settle"}
      </button>

      {receiptData && (
        <ReceiptModal
          receipt={receiptData}
          schoolName={schoolName}
          schoolAddress={schoolAddress}
          isOpen={true}
          onClose={() => setReceiptData(null)}
        />
      )}
    </>
  );
}
