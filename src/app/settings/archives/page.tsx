"use client";

import { useState, useEffect } from "react";
import { Archive as ArchiveIcon, Calendar, Users, CalendarDays, Wallet, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ArchivesPage() {
  const [archives, setArchives] = useState<{ id: string; yearName: string; createdAt: string }[]>([]);
  const [selectedArchiveId, setSelectedArchiveId] = useState<string>("");
  const [archiveData, setArchiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    fetch("/api/archives")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setArchives(data);
          if (data.length > 0) {
            setSelectedArchiveId(data[0].id);
          }
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedArchiveId) return;

    setLoadingData(true);
    fetch(`/api/archives/${selectedArchiveId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          const parsed = JSON.parse(data.data);
          setArchiveData(parsed);
        }
        setLoadingData(false);
      });
  }, [selectedArchiveId]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading archives...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/settings" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <ArchiveIcon size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Historical Archives</h1>
            <p className="text-slate-500 mt-1">Read-only snapshots of past school years.</p>
          </div>
        </div>
      </header>

      {archives.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <ArchiveIcon size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Archives Found</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            You haven't archived any school years yet. Archives are created from the Settings page at the end of the year.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 px-2">Available Years</h3>
            {archives.map((arch) => (
              <button
                key={arch.id}
                onClick={() => setSelectedArchiveId(arch.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium border ${
                  selectedArchiveId === arch.id 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className={selectedArchiveId === arch.id ? "text-indigo-200" : "text-slate-400"} />
                  <span className="truncate">{arch.yearName}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Main View */}
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[600px]">
            {loadingData ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                Loading archive data...
              </div>
            ) : archiveData ? (
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{archives.find(a => a.id === selectedArchiveId)?.yearName}</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Archived on {new Date(archiveData.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center space-x-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                      <Users size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Parents</p>
                      <p className="text-2xl font-black text-slate-900">{archiveData.parents?.length || 0}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center space-x-4">
                    <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
                      <CalendarDays size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Events</p>
                      <p className="text-2xl font-black text-slate-900">{archiveData.events?.length || 0}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center space-x-4">
                    <div className="bg-rose-100 text-rose-600 p-3 rounded-xl">
                      <Wallet size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expenses Recorded</p>
                      <p className="text-2xl font-black text-slate-900">{archiveData.expenses?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Lists Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Events Preview */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <h3 className="font-bold text-slate-800">Events Snapshot</h3>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {archiveData.events?.slice(0, 50).map((ev: any) => (
                        <div key={ev.id} className="p-3 text-sm flex justify-between items-center hover:bg-slate-50">
                          <div>
                            <p className="font-semibold text-slate-800">{ev.name}</p>
                            <p className="text-xs text-slate-500">{new Date(ev.date).toLocaleDateString()} • {ev.type}</p>
                          </div>
                          <div className="text-xs font-bold bg-slate-200 px-2 py-1 rounded text-slate-600">
                            {ev.attendances?.length || 0} Attended
                          </div>
                        </div>
                      ))}
                      {(!archiveData.events || archiveData.events.length === 0) && (
                        <p className="p-4 text-center text-sm text-slate-500 italic">No events in this archive.</p>
                      )}
                    </div>
                  </div>

                  {/* Expenses Preview */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <h3 className="font-bold text-slate-800">Expenses Snapshot</h3>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {archiveData.expenses?.map((exp: any) => (
                        <div key={exp.id} className="p-3 text-sm flex justify-between items-center hover:bg-slate-50">
                          <div>
                            <p className="font-semibold text-slate-800">{exp.description}</p>
                            <p className="text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()} • By {exp.requestedBy}</p>
                          </div>
                          <div className="text-sm font-black text-rose-600">
                            - ₱{exp.amount}
                          </div>
                        </div>
                      ))}
                      {(!archiveData.expenses || archiveData.expenses.length === 0) && (
                        <p className="p-4 text-center text-sm text-slate-500 italic">No expenses in this archive.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
