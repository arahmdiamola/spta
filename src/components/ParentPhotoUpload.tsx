"use client";

import { useState } from "react";
import Base64ImageUpload from "./Base64ImageUpload";

interface ParentPhotoUploadProps {
  parentId: string;
  initialPhoto: string | null;
  readonly?: boolean;
}

export default function ParentPhotoUpload({ parentId, initialPhoto, readonly = false }: ParentPhotoUploadProps) {
  const [photo, setPhoto] = useState(initialPhoto || "");
  const [saving, setSaving] = useState(false);

  const handlePhotoChange = async (newPhoto: string) => {
    if (readonly) return;
    setPhoto(newPhoto);
    setSaving(true);
    
    try {
      await fetch(`/api/parents/${parentId}/photo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: newPhoto }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {readonly ? (
        <div className="w-32 h-32 rounded-full border-4 border-slate-50 overflow-hidden shadow-md flex items-center justify-center bg-slate-100 shrink-0">
          {photo ? (
            <img src={photo} alt="Parent" className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-400 text-sm">No photo</span>
          )}
        </div>
      ) : (
        <>
          <Base64ImageUpload 
            label="" 
            value={photo} 
            onChange={handlePhotoChange} 
          />
          {saving && <p className="text-xs text-indigo-500 mt-2">Saving...</p>}
        </>
      )}
    </div>
  );
}
