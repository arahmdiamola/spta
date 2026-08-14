"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-sm"
    >
      <Printer size={18} />
      <span>Print Now (Ctrl+P)</span>
    </button>
  );
}
