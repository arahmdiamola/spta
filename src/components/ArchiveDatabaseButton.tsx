"use client";

import { useState } from "react";
import { Archive, AlertTriangle } from "lucide-react";

export default function ArchiveDatabaseButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [yearName, setYearName] = useState("");

  const handleArchive = async () => {
    if (!yearName.trim()) {
      setError("Please enter a name for the archive (e.g. SY 2025-2026)");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/settings/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yearName }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to archive database");
      }
      
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors shrink-0 flex items-center space-x-2"
      >
        <Archive size={16} />
        <span>Archive School Year</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6">
              <div className="flex items-center space-x-3 text-indigo-600 mb-4">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <Archive size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Archive & Reset</h3>
              </div>
              
              <p className="text-slate-600 mb-4 text-sm">
                This will save a snapshot of all current data (parents, events, expenses) and then <strong>clear the live database</strong> for the new school year. The archived data will be available in read-only mode.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Archive Name</label>
                <input 
                  type="text" 
                  value={yearName}
                  onChange={(e) => setYearName(e.target.value)}
                  placeholder="e.g. SY 2024-2025"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900" 
                />
              </div>

              {error && <p className="text-rose-600 text-sm font-medium mb-4">{error}</p>}
              
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-2 mb-6">
                <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 leading-relaxed">
                  This action cannot be undone. Make sure you have entered the correct school year name.
                </p>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleArchive}
                  disabled={loading || !yearName.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                  {loading ? "Archiving..." : "Archive & Reset"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
