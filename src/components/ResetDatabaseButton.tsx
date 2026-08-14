"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertOctagon } from "lucide-react";

export default function ResetDatabaseButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    const confirmation = window.prompt("DANGER: This will delete ALL Parents, Children, Events, Attendances, Penalties, and Contributions. Your school settings and admin users will be kept.\n\nType 'RESET' to confirm:");
    
    if (confirmation !== "RESET") {
      if (confirmation !== null) {
        alert("Reset cancelled. You must type 'RESET' exactly.");
      }
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/settings/reset", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to reset database");
      }

      alert("Database successfully reset!");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to reset database.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
    >
      <AlertOctagon size={18} />
      <span>{loading ? "Resetting Database..." : "Reset Database"}</span>
    </button>
  );
}
