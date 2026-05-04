"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-white rounded-2xl border border-border shadow-2xl w-full max-h-[90vh] flex flex-col animate-float-up",
          size === "sm" && "max-w-md",
          size === "md" && "max-w-2xl",
          size === "lg" && "max-w-4xl",
        )}
      >
        <div className="flex items-center justify-between px-6 h-14 border-b border-border shrink-0">
          <h3 className="text-base font-semibold text-brand-900 truncate">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-md text-muted-foreground hover:bg-muted inline-flex items-center justify-center"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
