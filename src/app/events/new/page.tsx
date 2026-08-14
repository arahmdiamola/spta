"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const eventTypes = [
  { value: "MEETING", label: "Meeting", description: "General parent meeting or conference" },
  { value: "ASSEMBLY", label: "Assembly", description: "School-wide assembly requiring parent attendance" },
  { value: "VOLUNTARY_WORK", label: "Voluntary Work / Clean-up Drive", description: "Tracked by hours. Absences incur a penalty fee." },
];

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState("MEETING");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const date = formData.get("date") as string;

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type: selectedType, date }),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      router.push("/events");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center space-x-4">
        <Link href="/events" className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Event</h1>
          <p className="text-slate-500">Set up a new meeting, assembly, or voluntary work.</p>
        </div>
      </header>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-slate-900">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="e.g., Monthly PTA Meeting"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">
              Event Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {eventTypes.map((type) => (
                <button
                  type="button"
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all ${
                    selectedType === type.value
                      ? "border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500"
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{type.label}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-semibold text-slate-900">
              Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Link
              href="/events"
              className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Save size={20} />
              <span>{isSubmitting ? "Creating..." : "Create Event"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
