"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div className={cn("rounded-xl border border-neutral-100 bg-white p-5 shadow-soft", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
        {title}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-semibold tracking-tight text-neutral-900">{value}</p>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-emerald-500" : "text-red-500"
            )}
          >
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-[12px] text-neutral-400">{subtitle}</p>
      )}
    </div>
  );
}
