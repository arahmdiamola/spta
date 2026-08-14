import prisma from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Plus, Users, Clock } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, { label: string; color: string; bg: string; border: string }> = {
  MEETING: { label: "Meeting", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
  ASSEMBLY: { label: "Assembly", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-100" },
  VOLUNTARY_WORK: { label: "Voluntary Work", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" },
};

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    include: {
      attendances: true,
      penalties: true,
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Events</h1>
          <p className="text-slate-500 text-lg mt-1">Manage meetings, assemblies, and voluntary works.</p>
        </div>
        <Link
          href="/events/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus size={20} />
          <span>Create Event</span>
        </Link>
      </header>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 bg-slate-50 rounded-full">
              <Calendar size={32} className="text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-900">No events yet</p>
            <p className="text-sm text-slate-500">Create your first meeting, assembly, or voluntary work event.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const style = typeLabels[event.type] || typeLabels.MEETING;
            return (
              <Link
                href={`/events/${event.id}`}
                key={event.id}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all hover:border-indigo-200 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style.color} ${style.bg} ${style.border} border`}>
                    {style.label}
                  </span>
                  <span className="text-xs text-slate-400">{format(new Date(event.date), "MMM d, yyyy")}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{event.name}</h3>
                <div className="mt-4 flex items-center space-x-4 text-sm text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Users size={14} />
                    <span>{event.attendances.length} attended</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{event.penalties.filter((p: any) => !p.isPaid).length} penalties</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
