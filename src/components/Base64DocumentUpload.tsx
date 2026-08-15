"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";

interface Base64DocumentUploadProps {
  label: string;
  value: string;
  onChange: (base64: string) => void;
}

export default function Base64DocumentUpload({ label, value, onChange }: Base64DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [isPdf, setIsPdf] = useState(value.startsWith("data:application/pdf"));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setIsPdf(result.startsWith("data:application/pdf"));
      onChange(result);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    onChange("");
    setIsPdf(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="flex items-start space-x-4">
        {value ? (
          <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 w-32 h-32 flex-shrink-0 flex items-center justify-center group">
            {isPdf ? (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <FileText size={32} className="mb-2 text-rose-500" />
                <span className="text-xs font-semibold">PDF Document</span>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={value} alt={label} className="max-w-full max-h-full object-contain" />
            )}
            
            <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <button 
              type="button"
              onClick={handleClear}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-slate-100 text-rose-500 z-10"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-6 py-4 border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <Upload size={24} className="mb-2" />
            <span className="text-xs font-medium">{loading ? "Loading..." : "Upload Image or PDF"}</span>
            <span className="text-[10px] mt-1 text-slate-400">Max 2MB</span>
          </button>
        )}
        
        <input 
          type="file" 
          accept="image/*,application/pdf" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
