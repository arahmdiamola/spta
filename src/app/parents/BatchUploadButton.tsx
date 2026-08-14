"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, Download } from "lucide-react";
import { useRouter } from "next/navigation";

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
  return lines.map(line => {
    const row = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuote = !inQuote;
      } else if (line[i] === ',' && !inQuote) {
        row.push(cur.trim().replace(/^"|"$/g, ''));
        cur = "";
      } else {
        cur += line[i];
      }
    }
    row.push(cur.trim().replace(/^"|"$/g, ''));
    return row;
  });
}

export default function BatchUploadButton() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length < 2) throw new Error("CSV is empty or missing data.");

      // Skip header row
      const dataRows = rows.slice(1);
      
      const parentsMap = new Map<string, { name: string; contactInfo: string; children: { name: string; grade: string }[] }>();

      for (const row of dataRows) {
        const [parentName, contactInfo, childName, childGrade] = row;
        if (!parentName) continue;

        if (!parentsMap.has(parentName)) {
          parentsMap.set(parentName, { name: parentName, contactInfo: contactInfo || "", children: [] });
        }
        
        if (childName && childGrade) {
          parentsMap.get(parentName)!.children.push({ name: childName, grade: childGrade });
        }
      }

      const parentsList = Array.from(parentsMap.values());

      const res = await fetch("/api/parents/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parentsList),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to batch upload");
      }

      alert(`Successfully uploaded ${parentsList.length} parents!`);
      router.refresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Parent Name,Contact Info,Child Name,Child Grade\nJohn Doe,09123456789,Jane Doe,Grade 1\nJane Smith,09198765432,Baby Smith,Kinder\nJane Smith,09198765432,Toddler Smith,Grade 2\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "parents_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center space-x-2">
      <input 
        type="file" 
        accept=".csv" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
      <button 
        onClick={downloadTemplate}
        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-4 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-sm"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Template</span>
      </button>
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50"
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
        <span>Batch Upload CSV</span>
      </button>
    </div>
  );
}
