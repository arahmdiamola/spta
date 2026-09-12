"use client";

import React from "react";
import { Printer, X } from "lucide-react";

export interface ReceiptData {
  receiptNumber: number;
  parentName: string;
  categoryName: string | null; // fee category name or penalty event name
  amount: number;
  date: string; // ISO date string
  recordedBy: string;
  type: "contribution" | "penalty"; // to show different labels
}

export interface ReceiptModalProps {
  receipt: ReceiptData;
  schoolName: string;
  schoolAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function ReceiptModal({
  receipt,
  schoolName,
  schoolAddress,
  isOpen,
  onClose,
}: ReceiptModalProps) {
  if (!isOpen) return null;

  const formattedReceiptNum = String(receipt.receiptNumber || 0).padStart(7, "0");

  let formattedDate = "";
  try {
    const d = new Date(receipt.date);
    formattedDate = !isNaN(d.getTime())
      ? d.toLocaleString("en-PH", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : receipt.date;
  } catch {
    formattedDate = receipt.date;
  }

  const description =
    receipt.categoryName ||
    (receipt.type === "penalty" ? "Penalty Settlement" : "General Contribution");

  const formattedAmount = Number(receipt.amount || 0).toFixed(2);
  const typeLabel = receipt.type === "penalty" ? "Penalty:" : "Category:";

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=320,height=600");
    if (!printWindow) {
      alert("Please allow popups to print receipt.");
      return;
    }

    const printHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Receipt #${formattedReceiptNum}</title>
    <style>
      @page {
        size: 80mm auto;
        margin: 0;
      }
      * {
        box-sizing: border-box;
      }
      body {
        width: 80mm;
        font-family: monospace;
        font-size: 12px;
        padding: 5mm;
        margin: 0;
        color: #000;
        background: #fff;
        line-height: 1.35;
      }
      .text-center {
        text-align: center;
      }
      .text-right {
        text-align: right;
      }
      .bold {
        font-weight: bold;
      }
      .dashed-line {
        border-top: 1px dashed #000;
        margin: 8px 0;
      }
      .row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin: 4px 0;
        gap: 8px;
      }
      .small {
        font-size: 11px;
      }
      .footer {
        font-size: 10px;
        text-align: center;
        margin-top: 8px;
        line-height: 1.3;
      }
    </style>
  </head>
  <body>
    <div class="text-center bold" style="font-size: 13px;">${escapeHtml(schoolName)}</div>
    <div class="text-center small" style="margin-top: 2px;">${escapeHtml(schoolAddress)}</div>

    <div class="dashed-line"></div>

    <div class="text-center bold" style="letter-spacing: 0.5px;">OFFICIAL RECEIPT</div>
    <div class="row">
      <span>Receipt #:</span>
      <span class="bold">#${formattedReceiptNum}</span>
    </div>
    <div class="row">
      <span>Date:</span>
      <span>${escapeHtml(formattedDate)}</span>
    </div>

    <div class="dashed-line"></div>

    <div class="row">
      <span>Parent:</span>
      <span class="bold text-right">${escapeHtml(receipt.parentName)}</span>
    </div>
    <div class="row">
      <span>${escapeHtml(typeLabel)}</span>
      <span class="text-right">${escapeHtml(description)}</span>
    </div>
    <div class="row bold" style="margin-top: 6px;">
      <span>Amount Paid:</span>
      <span class="text-right">₱${formattedAmount}</span>
    </div>

    <div class="dashed-line"></div>

    <div class="row">
      <span>Recorded By:</span>
      <span>${escapeHtml(receipt.recordedBy)}</span>
    </div>

    <div class="dashed-line"></div>

    <div class="footer">
      <div>This is a computer-generated receipt.</div>
      <div style="margin-top: 2px;">No signature required.</div>
    </div>
  </body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();

    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 relative">
        {/* Top bar with close button */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Receipt Preview</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 pt-4">
          {/* Thermal Receipt Preview */}
          <div className="w-full max-w-[320px] mx-auto bg-white border border-dashed border-slate-300 rounded-xl p-5 shadow-sm font-mono text-xs text-slate-800 space-y-2">
            {/* School Header */}
            <div className="text-center">
              <div className="font-bold text-sm text-slate-900 leading-tight">
                {schoolName}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                {schoolAddress}
              </div>
            </div>

            {/* Separator */}
            <div className="border-b border-dashed border-slate-300 my-2" />

            {/* Official Receipt & Metadata */}
            <div className="text-center font-bold tracking-wider text-slate-900">
              OFFICIAL RECEIPT
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-600">
              <span>Receipt #:</span>
              <span className="font-semibold text-slate-800">#{formattedReceiptNum}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-600">
              <span>Date:</span>
              <span className="text-slate-700">{formattedDate}</span>
            </div>

            {/* Separator */}
            <div className="border-b border-dashed border-slate-300 my-2" />

            {/* Parent & Category Info */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-500 shrink-0">Parent:</span>
                <span className="font-semibold text-slate-900 text-right break-words">
                  {receipt.parentName}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-500 shrink-0">{typeLabel}</span>
                <span className="text-slate-800 text-right break-words">
                  {description}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-slate-900 text-xs">Amount Paid:</span>
                <span className="font-bold text-slate-900 text-sm text-right">
                  ₱{formattedAmount}
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="border-b border-dashed border-slate-300 my-2" />

            {/* Recorded By */}
            <div className="flex justify-between items-center text-[11px] text-slate-600">
              <span>Recorded By:</span>
              <span className="font-medium text-slate-800">{receipt.recordedBy}</span>
            </div>

            {/* Separator */}
            <div className="border-b border-dashed border-slate-300 my-2" />

            {/* Footer */}
            <div className="text-center text-[10px] text-slate-500 leading-tight pt-0.5 space-y-0.5">
              <div>This is a computer-generated receipt.</div>
              <div>No signature required.</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center space-x-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <Printer size={18} />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-sm font-medium text-slate-600 hover:text-slate-800 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
