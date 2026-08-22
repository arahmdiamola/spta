"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { CheckCircle, AlertTriangle, Info, QrCode, Keyboard } from "lucide-react";

const Scanner = dynamic(() => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner), { ssr: false });

type Event = { id: string; name: string; type: string };

export default function ScannerPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [scanResult, setScanResult] = useState<{ message: string; type: "success" | "error" | "info" | "in" | "out", attendanceId?: string } | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [cooldown, setCooldown] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [isUndoing, setIsUndoing] = useState(false);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
      });
  }, []);

  const processCode = async (text: string) => {
    if (!selectedEventId || cooldown || text === lastScannedCode) return;
    
    setCooldown(true);
    setLastScannedCode(text);

    try {
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeId: text, eventId: selectedEventId }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setScanResult({ message: data.error, type: "error" });
      } else {
        setScanResult({ 
          message: data.message, 
          type: data.type || "success",
          attendanceId: data.attendanceId
        });
      }
    } catch (err: any) {
      setScanResult({ message: "Network error", type: "error" });
    }

    // Cooldown before next scan
    setTimeout(() => {
      setCooldown(false);
      setLastScannedCode("");
    }, 3000);
  };

  const handleUndo = async () => {
    if (!scanResult?.attendanceId || isUndoing) return;
    setIsUndoing(true);
    try {
      const res = await fetch("/api/attendance/undo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          attendanceId: scanResult.attendanceId,
          action: scanResult.type 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setScanResult({ message: "Action undone successfully.", type: "info" });
        setLastScannedCode(""); // Allow immediate rescan
      } else {
        alert(data.error || "Failed to undo");
      }
    } catch (err) {
      alert("Network error while undoing.");
    } finally {
      setIsUndoing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processCode(manualCode.trim());
      setManualCode(""); // clear input
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">QR Scanner</h1>
        <p className="text-slate-500 text-lg mt-1">Scan parent QR codes to record attendance.</p>
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div>
          <label className="text-sm font-semibold text-slate-900 mb-2 block">
            Select Active Event
          </label>
          <select 
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            <option value="">-- Select an event to start scanning --</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>{evt.name} ({evt.type.replace("_", " ")})</option>
            ))}
          </select>
        </div>

        {selectedEventId ? (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2 space-y-4">
              <div className="rounded-2xl overflow-hidden border-4 border-indigo-100 shadow-inner bg-slate-900 relative">
                <Scanner 
                  onScan={(result) => {
                    if (result && result.length > 0) {
                      processCode(result[0].rawValue);
                    }
                  }}
                  onError={(error) => {
                    console.error(error);
                    setCameraError(error.message || "Failed to access camera. Please check permissions or ensure you are using HTTPS / localhost.");
                  }}
                  constraints={{
                    facingMode: "environment",
                  }}
                  formats={["qr_code"]}
                />
              </div>
              
              {cameraError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
                  <AlertTriangle className="inline mr-2" size={16} />
                  {cameraError}
                </div>
              )}
              
              {/* Manual Override */}
              <form onSubmit={handleManualSubmit} className="flex space-x-2 pt-2">
                <div className="relative flex-1">
                  <Keyboard size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Manual QR Code ID..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <button type="submit" className="bg-slate-800 text-white px-4 rounded-xl text-sm font-medium hover:bg-slate-900 transition-colors">
                  Submit
                </button>
              </form>
            </div>

            <div className="md:w-1/2 space-y-4">
              <h3 className="font-bold text-slate-900 text-lg">Scan Results</h3>
              {scanResult ? (
                <div className="space-y-3">
                  <div className={`p-4 rounded-xl border flex items-start space-x-3 transition-all ${
                    scanResult.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                    scanResult.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                    scanResult.type === 'out' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                    'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    {scanResult.type === 'error' && <AlertTriangle className="mt-0.5 shrink-0" />}
                    {scanResult.type === 'info' && <Info className="mt-0.5 shrink-0" />}
                    {scanResult.type !== 'error' && scanResult.type !== 'info' && <CheckCircle className="mt-0.5 shrink-0" />}
                    <div className="font-medium text-lg flex-1">{scanResult.message}</div>
                  </div>
                  
                  {scanResult.attendanceId && (scanResult.type === 'in' || scanResult.type === 'out') && (
                    <button
                      onClick={handleUndo}
                      disabled={isUndoing}
                      className="w-full py-2 px-4 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {isUndoing ? "Undoing..." : "Undo Last Scan"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  <QrCode size={48} className="mx-auto mb-3 opacity-20" />
                  <p>Point camera at a parent's QR code</p>
                </div>
              )}

              {cooldown && (
                <div className="text-sm text-slate-500 flex items-center justify-center space-x-2 animate-pulse mt-4">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Processing...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 border border-slate-100">
            Please select an event above to activate the camera.
          </div>
        )}
      </div>
    </div>
  );
}
