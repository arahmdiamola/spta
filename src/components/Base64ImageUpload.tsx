"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface Base64ImageUploadProps {
  label: string;
  value: string;
  onChange: (base64: string) => void;
}

export default function Base64ImageUpload({ label, value, onChange }: Base64ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="flex items-start space-x-4">
        {value ? (
          <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 w-32 h-32 flex-shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={label} className="max-w-full max-h-full object-contain" />
            <button 
              onClick={handleClear}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-slate-100 text-rose-500"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <Upload size={24} className="mb-2" />
            <span className="text-xs font-medium">{loading ? "Loading..." : "Upload"}</span>
          </button>
        )}
        
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="flex-1 text-xs text-slate-500 mt-2">
          Recommended: Transparent PNG, max 1MB. Image will be embedded directly into ID cards.
        </div>
      </div>
    </div>
  );
}
