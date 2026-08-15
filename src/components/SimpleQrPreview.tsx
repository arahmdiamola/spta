"use client";

import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { IDCardSettings } from "./ParentIdCard";

export default function SimpleQrPreview({ parent, settings, userRole }: { parent: any, settings: IDCardSettings, userRole?: string }) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!printRef.current) return;
    setDownloading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await htmlToImage.toPng(printRef.current, {
        pixelRatio: 4,
        backgroundColor: "white", 
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        }
      });
      
      const link = document.createElement("a");
      link.download = `${parent.name.replace(/\s+/g, '_')}_QR_Pass.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download image", error);
      alert("Failed to download QR Pass. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center space-y-4">
      <div className="flex items-center justify-between w-full mb-2">
        <h3 className="font-bold text-slate-900">QR Code Pass</h3>
        {userRole === "SUPER_ADMIN" && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center space-x-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            <Download size={16} />
            <span>{downloading ? "Generating..." : "Download Pass"}</span>
          </button>
        )}
      </div>
      
      <div 
        className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden flex justify-center w-full"
      >
        {/* Simple QR Card Template */}
        <div 
          ref={printRef}
          className="w-[2.5in] h-[3.5in] bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 p-4 shadow-sm"
          style={{ pageBreakInside: "avoid" }}
        >
          <h2 className="text-sm font-black text-slate-800 text-center uppercase tracking-wide leading-tight mb-6">
            {settings.schoolName || "School Name"}
          </h2>
          
          <div className="p-3 bg-white border-2 border-slate-100 rounded-xl shadow-sm mb-6">
            <QRCodeSVG value={parent.qrCodeId} size={140} />
          </div>
          
          <h1 className="text-lg font-black text-slate-900 text-center leading-tight uppercase">
            {parent.name}
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Scan to Record Attendance
          </p>
        </div>
      </div>
    </div>
  );
}
