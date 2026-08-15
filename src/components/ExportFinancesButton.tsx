"use client";

import { Download } from "lucide-react";

interface ExportFinancesButtonProps {
  reports: any[];
}

export default function ExportFinancesButton({ reports }: ExportFinancesButtonProps) {
  const handleExport = () => {
    // Generate CSV
    const rows: string[] = [];
    
    // Header
    rows.push("Fee Category,Parent Name,Children Count,Expected (Due),Paid,Balance,Status");

    reports.forEach(report => {
      const feeName = report.fee.name.replace(/,/g, ''); // sanitize commas
      
      report.parentDetails.forEach((detail: any) => {
        if (detail.due > 0 || detail.paid > 0) {
          const parentName = detail.parent.name.replace(/,/g, '');
          const childrenCount = detail.parent.children?.length || 0;
          let status = "Unpaid";
          if (detail.balance <= 0) status = "Settled";
          else if (detail.paid > 0) status = "Partial";

          rows.push(`${feeName},${parentName},${childrenCount},${detail.due},${detail.paid},${detail.balance},${status}`);
        }
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Finances_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExport}
      className="flex items-center space-x-2 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
    >
      <Download size={16} />
      <span>Export CSV</span>
    </button>
  );
}
