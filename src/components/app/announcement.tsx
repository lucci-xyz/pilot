"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AnnouncementProps {
  message: string;
  variant?: "default" | "warning";
  dismissible?: boolean;
  className?: string;
}

export function Announcement({
  message,
  variant = "default",
  dismissible = true,
  className,
}: AnnouncementProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg px-4 py-2.5 text-[13px]",
        variant === "default" && "bg-neutral-50 text-neutral-600",
        variant === "warning" && "bg-amber-50 text-amber-700",
        className
      )}
    >
      <span>{message}</span>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="ml-4 rounded p-0.5 opacity-60 hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
