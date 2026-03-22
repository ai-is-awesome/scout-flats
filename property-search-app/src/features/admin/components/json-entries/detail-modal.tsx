"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type DetailModalProps = {
  title: string;
  data: unknown;
  onClose: () => void;
};

export function DetailModal({ title, data, onClose }: DetailModalProps) {
  const [copied, setCopied] = useState(false);
  const textContent = `${JSON.stringify(data, null, 2)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      aria-modal="true"
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded px-2 py-1 text-sm hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
        <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
