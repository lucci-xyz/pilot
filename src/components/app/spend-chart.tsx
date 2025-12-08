"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  // Allow additional numeric series keys for multi-series charts
  [key: string]: string | number | undefined;
}

type SpendChartSeries = {
  key: string;
  label: string;
  color?: string;
};

interface SpendChartProps {
  dailyData: ChartDataPoint[];
  weeklyData: ChartDataPoint[];
  monthlyData: ChartDataPoint[];
  className?: string;
  // Optional multi-series rendering (per-agent)
  series?: SpendChartSeries[];
  stacked?: boolean;
  colors?: Record<string, string>;
}

export function SpendChart({
  dailyData,
  weeklyData,
  monthlyData,
  className,
  series,
  stacked = true,
  colors,
}: SpendChartProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const data = { daily: dailyData, weekly: weeklyData, monthly: monthlyData }[period];
  const colorPalette = colors
    ? undefined
    : ["#d97757", "#2563eb", "#16a34a", "#9333ea", "#f97316", "#0ea5e9"];

  return (
    <div className={cn("rounded-xl border border-neutral-100 bg-white p-5 shadow-soft", className)}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
          Spend
        </p>
        <div className="flex gap-1 rounded-lg bg-neutral-50 p-0.5">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                period === p
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
              aria-pressed={period === p}
            >
              {p === "daily" ? "Daily" : p === "weekly" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              {series && series.length > 0 ? (
                series.map((s, idx) => {
                  const c = colors?.[s.key] ?? (colorPalette ? colorPalette[idx % (colorPalette.length || 1)] : "#d97757");
                  return (
                    <linearGradient id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1" key={s.key}>
                      <stop offset="0%" stopColor={c} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  );
                })
              ) : (
                <linearGradient id="fillSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97757" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#d97757" stopOpacity={0} />
                </linearGradient>
              )}
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#a3a3a3" }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#a3a3a3" }}
              tickFormatter={(v) => `$${v / 1000}k`}
              width={40}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg bg-neutral-900 px-3 py-2 text-xs text-white shadow-lg space-y-1">
                      {payload.map((p) => (
                        <div key={p.dataKey} className="flex items-center justify-between gap-3">
                          <span className="text-neutral-200">{(p.name as string) ?? p.dataKey}</span>
                          <span className="text-white">${Number(p.value ?? 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            {series && series.length > 0 ? (
              series.map((s, idx) => {
                const c = colors?.[s.key] ?? (colorPalette ? colorPalette[idx % (colorPalette.length || 1)] : "#d97757");
                return (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={c}
                    strokeWidth={1.5}
                    fill={`url(#fill-${s.key})`}
                    stackId={stacked ? "1" : undefined}
                  />
                );
              })
            ) : (
              <Area
                type="monotone"
                dataKey="value"
                stroke="#d97757"
                strokeWidth={1.5}
                fill="url(#fillSpend)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
