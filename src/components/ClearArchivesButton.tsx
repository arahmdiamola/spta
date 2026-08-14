"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

export default function ClearArchivesButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationPhrase, setConfirmationPhrase] = useState("");

  const handleClear = async () => {
    if (confirmationPhrase !== "CLEAR ALL") {
      setError("Please type CLEAR ALL to confirm");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/archives/clear", {
        method: "DELETE",
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to clear archives");
      }
      
      setIsOpen(false);
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
        className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors shrink-0 flex items-center space-x-2"
      >
        <Trash2 size={16} />
        <span>Clear Archives</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6">
              <div className="flex items-center space-x-3 text-rose-600 mb-4">
                <div className="p-2 bg-rose-100 rounded-full">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Clear All Archives</h3>
              </div>
              
              <p className="text-slate-600 mb-4 text-sm">
                This will permanently delete <strong>all historical archives</strong> of past school years. 
                You will not be able to view past records once they are cleared.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Type <strong className="text-rose-600">CLEAR ALL</strong> to confirm
                </label>
                <input 
                  type="text" 
                  value={confirmationPhrase}
                  onChange={(e) => setConfirmationPhrase(e.target.value)}
                  placeholder="CLEAR ALL"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-slate-900" 
                />
              </div>

              {error && <p className="text-rose-600 text-sm font-medium mb-4">{error}</p>}
              
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-2 mb-6">
                <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 leading-relaxed">
                  This action cannot be undone. All archive snapshots will be wiped from the database.
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
                  onClick={handleClear}
                  disabled={loading || confirmationPhrase !== "CLEAR ALL"}
                  className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                  {loading ? "Clearing..." : "Yes, Clear Archives"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
