"use client";

import { useState, useEffect } from "react";
import { Activity, ArrowLeft, Filter, Search } from "lucide-react";
import Link from "next/link";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = (action: string) => {
    setLoading(true);
    const url = action === "ALL" ? "/api/audit" : `/api/audit?action=${action}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setLogs(data);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs(filterAction);
  }, [filterAction]);

  const filteredLogs = logs.filter(log => 
    searchQuery === "" || 
    log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionColor = (action: string) => {
    switch(action) {
      case "CREATE": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "UPDATE": return "bg-blue-100 text-blue-700 border-blue-200";
      case "DELETE": return "bg-rose-100 text-rose-700 border-rose-200";
      case "RESET": return "bg-purple-100 text-purple-700 border-purple-200";
      case "ARCHIVE": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/settings" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Audit Trail</h1>
            <p className="text-slate-500 mt-1">Track system activities and changes.</p>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Controls */}
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-white border border-slate-200 text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">Create (Add)</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="RESET">Reset</option>
              <option value="ARCHIVE">Archive</option>
            </select>
          </div>

          <div className="relative w-full md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading audit trail...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <Activity size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No audit logs found matching your criteria.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                      @{log.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                      {log.entity}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-md truncate">
                      {log.details || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
