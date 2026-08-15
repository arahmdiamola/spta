import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Users, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import FinalizeButton from "./FinalizeButton";
import { getSession } from "@/lib/auth";
import RemoveTimeoutButton from "./RemoveTimeoutButton";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, { label: string; color: string; bg: string }> = {
  MEETING: { label: "Meeting", color: "text-blue-700", bg: "bg-blue-50" },
  ASSEMBLY: { label: "Assembly", color: "text-violet-700", bg: "bg-violet-50" },
  VOLUNTARY_WORK: { label: "Voluntary Work", color: "text-amber-700", bg: "bg-amber-50" },
};

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      attendances: { include: { parent: true }, orderBy: { timeIn: "desc" } },
      penalties: { include: { parent: true } },
    },
  });

  if (!event) {
    return <div className="p-8 text-center text-slate-500">Event not found.</div>;
  }

  const style = typeLabels[event.type] || typeLabels.MEETING;
  const totalParents = await prisma.parent.count();
  const absentCount = totalParents - event.attendances.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center space-x-4">
        <Link href="/events" className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{event.name}</h1>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style.color} ${style.bg} border`}>
              {style.label}
            </span>
          </div>
          <p className="text-slate-500">{formatInTimeZone(new Date(event.date), 'Asia/Manila', "MMMM d, yyyy 'at' h:mm a")}</p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-5">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Present</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{event.attendances.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-5">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Absent</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{absentCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-5">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Total Parents</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{totalParents}</p>
          </div>
        </div>
      </div>

      {/* Finalize button for Event */}
      <FinalizeButton eventId={event.id} penaltyCount={event.penalties.length} />

      {/* Attendance List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Attendance Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Time In</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Time Out</th>
                {event.type === "VOLUNTARY_WORK" && (
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Hours</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {event.attendances.length === 0 ? (
                <tr>
                  <td colSpan={event.type === "VOLUNTARY_WORK" ? 4 : 3} className="px-6 py-12 text-center text-slate-500">
                    <p className="font-medium">No attendance recorded yet.</p>
                    <p className="text-sm mt-1">Use the QR Scanner to start recording.</p>
                  </td>
                </tr>
              ) : (
                event.attendances.map((att: any) => (
                  <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{att.parent.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {att.timeIn ? formatInTimeZone(new Date(att.timeIn), 'Asia/Manila', "h:mm a") : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 flex items-center">
                      {att.timeOut ? (
                        <>
                          {formatInTimeZone(new Date(att.timeOut), 'Asia/Manila', "h:mm a")}
                          {isSuperAdmin && <RemoveTimeoutButton attendanceId={att.id} />}
                        </>
                      ) : (
                        <span className="text-amber-600 font-medium">Still checked in</span>
                      )}
                    </td>
                    {event.type === "VOLUNTARY_WORK" && (
                      <td className="px-6 py-4">
                        {att.totalHours ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <Clock size={12} className="mr-1" />
                            {att.totalHours.toFixed(1)} hrs
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Penalties Section */}
      {event.penalties.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Penalties (Absent Parents)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Penalty Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {event.penalties.map((pen: any) => (
                  <tr key={pen.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{pen.parent.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-rose-700">₱{pen.amount}</td>
                    <td className="px-6 py-4">
                      {pen.isPaid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">Paid</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">Unpaid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
