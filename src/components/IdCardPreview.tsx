"use client";

import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { Download } from "lucide-react";
import ParentIdCard, { IDCardSettings } from "./ParentIdCard";

export default function IdCardPreview({ parent, settings, userRole }: { parent: any, settings: IDCardSettings, userRole?: string }) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!printRef.current) return;
    setDownloading(true);

    try {
      // Small delay to ensure any fonts/images are rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await htmlToImage.toPng(printRef.current, {
        pixelRatio: 4, // High resolution
        backgroundColor: "white", 
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        }
      });
      
      const link = document.createElement("a");
      link.download = `${parent.name.replace(/\s+/g, '_')}_ID_Card.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download image", error);
      alert("Failed to download ID card. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center space-y-4">
      <div className="flex items-center justify-between w-full mb-2">
        <h3 className="font-bold text-slate-900">ID Card Preview</h3>
        {userRole === "SUPER_ADMIN" && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center space-x-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            <Download size={16} />
            <span>{downloading ? "Generating..." : "Download PNG"}</span>
          </button>
        )}
      </div>
      
      {/* Container for the ID Card to ensure it's captured correctly */}
      <div 
        ref={printRef} 
        className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden"
      >
        <ParentIdCard parent={parent} settings={settings} />
      </div>
    </div>
  );
}
