import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, AlertCircle } from "lucide-react";

// Shows on every page load. Closing it hides it for this page view only.
export default function ClosingPopup({ onAskQuestion }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="closing-popup-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
          aria-label="Close announcement"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-3 flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <h2 id="closing-popup-title" className="text-lg font-bold">
            Monarch Mail is closing its storefront
          </h2>
        </div>

        <p className="text-sm text-gray-700">
          Our last day for retail, mail pickup, and package pickup is <strong>Wednesday, November 25, 2026</strong>.
          Please pick up all mail and packages by end of day, and bring in mailbox keys to avoid a $10 fee.
        </p>
        <p className="mt-3 text-sm text-gray-700">
          Sale-only days for remaining inventory and fixtures: Nov 27, 28, and 30.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/FAQ"
            onClick={() => setOpen(false)}
            className="flex-1 rounded-lg bg-blue-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-800"
          >
            Read the FAQ
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onAskQuestion?.();
            }}
            className="flex-1 rounded-lg border border-blue-900 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50"
          >
            Ask a question
          </button>
        </div>
      </div>
    </div>
  );
}
