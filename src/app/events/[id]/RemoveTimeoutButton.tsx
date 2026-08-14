"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function RemoveTimeoutButton({ attendanceId }: { attendanceId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove the timeout for this parent? They will be marked as 'Still checked in'.")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/attendance/undo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceId, action: "out" }),
      });
      
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to remove timeout");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      title="Remove Timeout (Super Admin)"
      className="ml-2 inline-flex items-center text-xs text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-1 rounded transition-colors disabled:opacity-50"
    >
      <XCircle size={14} className="mr-1" />
      Remove
    </button>
  );
}
