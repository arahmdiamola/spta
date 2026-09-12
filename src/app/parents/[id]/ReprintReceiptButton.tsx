"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import ReceiptModal from "@/components/ReceiptModal";

interface ReprintReceiptButtonProps {
  receiptNumber: number;
  parentName: string;
  categoryName: string | null;
  amount: number;
  date: string;
  recordedBy: string;
  type: "contribution" | "penalty";
  schoolName: string;
  schoolAddress: string;
}

export default function ReprintReceiptButton({
  receiptNumber,
  parentName,
  categoryName,
  amount,
  date,
  recordedBy,
  type,
  schoolName,
  schoolAddress,
}: ReprintReceiptButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded-lg transition-colors"
        title="Print Receipt"
      >
        <Printer size={14} />
      </button>

      {isOpen && (
        <ReceiptModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          schoolName={schoolName}
          schoolAddress={schoolAddress}
          receipt={{
            receiptNumber,
            parentName,
            categoryName,
            amount,
            date,
            recordedBy,
            type,
          }}
        />
      )}
    </>
  );
}
