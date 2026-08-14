"use client";

import { useState } from "react";
import Base64ImageUpload from "./Base64ImageUpload";

interface ParentPhotoUploadProps {
  parentId: string;
  initialPhoto: string | null;
}

export default function ParentPhotoUpload({ parentId, initialPhoto }: ParentPhotoUploadProps) {
  const [photo, setPhoto] = useState(initialPhoto || "");
  const [saving, setSaving] = useState(false);

  const handlePhotoChange = async (newPhoto: string) => {
    setPhoto(newPhoto);
    setSaving(true);
    
    try {
      await fetch(`/api/parents/${parentId}/photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: newPhoto }),
      });
    } catch (e) {
      console.error("Failed to save photo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Base64ImageUpload 
        label="" 
        value={photo} 
        onChange={handlePhotoChange} 
      />
      {saving && <p className="text-xs text-indigo-500 mt-2">Saving...</p>}
    </div>
  );
}
