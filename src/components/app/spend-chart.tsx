"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChartDataPoint } from "@/lib/dummy-data/types";

interface SpendChartProps {
  dailyData: ChartDataPoint[];
  weeklyData: ChartDataPoint[];
  monthlyData: ChartDataPoint[];
  className?: string;
}

export function SpendChart({
  dailyData,
  weeklyData,
  monthlyData,
  className,
}: SpendChartProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const data = { daily: dailyData, weekly: weeklyData, monthly: monthlyData }[period];

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
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                period === p
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {p.charAt(0).toUpperCase() + p.slice(1, 2)}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97757" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#d97757" stopOpacity={0} />
              </linearGradient>
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
                    <div className="rounded-lg bg-neutral-900 px-3 py-2 text-xs text-white shadow-lg">
                      ${payload[0].value?.toLocaleString()}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#d97757"
              strokeWidth={1.5}
              fill="url(#fillSpend)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
