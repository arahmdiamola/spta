"use client";

import { useState } from "react";
import * as htmlToImage from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { DownloadCloud } from "lucide-react";

export default function BatchDownloadZipButton({ parentsCount }: { parentsCount: number }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleBatchDownload = async () => {
    const cards = document.querySelectorAll<HTMLDivElement>("[data-id-card-export]");
    if (cards.length === 0) return;

    setDownloading(true);
    setProgress(0);

    const zip = new JSZip();

    try {
      // Small delay to ensure any fonts/images are rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const parentName = card.getAttribute("data-parent-name") || `Parent_${i}`;
        
        const dataUrl = await htmlToImage.toPng(card, {
          pixelRatio: 4, // High resolution
          backgroundColor: "white",
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
          }
        });

        // Convert dataUrl to blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        zip.file(`${parentName.replace(/\s+/g, '_')}_ID_Card.png`, blob);
        
        setProgress(Math.round(((i + 1) / cards.length) * 100));
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "SPTA_Parent_ID_Cards.zip");

    } catch (error) {
      console.error("Failed to batch download images", error);
      alert("Failed to batch download ID cards. Please try again.");
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  return (
    <button
      onClick={handleBatchDownload}
      disabled={downloading || parentsCount === 0}
      className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
    >
      <DownloadCloud size={18} />
      <span>{downloading ? `Generating ZIP (${progress}%)` : "Download All as ZIP"}</span>
    </button>
  );
}
