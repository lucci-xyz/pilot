"use client";

import { cn } from "@/lib/utils";

export type BotStatus = "active" | "paused" | "error" | "needs_setup";

interface StatusBadgeProps {
  status: BotStatus;
  className?: string;
}

const statusConfig: Record<BotStatus, { label: string; dotColor: string; textColor: string }> = {
  active: {
    label: "Active",
    dotColor: "bg-emerald-500",
    textColor: "text-emerald-600",
  },
  paused: {
    label: "Paused",
    dotColor: "bg-amber-400",
    textColor: "text-amber-600",
  },
  error: {
    label: "Error",
    dotColor: "bg-red-500",
    textColor: "text-red-600",
  },
  needs_setup: {
    label: "Setup",
    dotColor: "bg-neutral-300",
    textColor: "text-neutral-500",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-medium",
        config.textColor,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          config.dotColor,
          status === "active" && "animate-pulse"
        )}
      />
      {config.label}
    </span>
  );
}
