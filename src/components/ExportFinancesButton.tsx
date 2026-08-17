"use client";

import { Download } from "lucide-react";
import { useState } from "react";

export default function ExportFinancesButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/finances/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header if possible, otherwise fallback
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Finances_Report_${new Date().toISOString().split('T')[0]}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Failed to export finances. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center space-x-2 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
    >
      <Download size={16} />
      <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
    </button>
  );
}
