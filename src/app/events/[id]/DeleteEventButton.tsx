"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteEventButton({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the event "${eventName}"? This will also remove all associated attendances and penalties.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete event");
      }

      router.push("/events");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete event. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 hover:bg-rose-100 text-rose-600 rounded-full transition-colors disabled:opacity-50"
      title="Delete Event"
    >
      <Trash2 size={24} />
    </button>
  );
}
