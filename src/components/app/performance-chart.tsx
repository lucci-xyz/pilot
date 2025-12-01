"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface PerformanceChartProps {
  data: Array<{
    date: string;
    requests: number;
    errors: number;
    latency: number;
  }>;
  className?: string;
}

export function PerformanceChart({ data, className }: PerformanceChartProps) {
  return (
    <div className={cn("rounded-xl border border-neutral-100 bg-white p-5 shadow-soft", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
        Performance
      </p>
      <div className="mt-4 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#a3a3a3" }}
              tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { day: "numeric" })}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#a3a3a3" }}
              width={40}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg bg-neutral-900 px-3 py-2 text-xs text-white shadow-lg">
                      <p className="text-neutral-400">{new Date(label).toLocaleDateString()}</p>
                      <p className="mt-1">{payload[0].value?.toLocaleString()} requests</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="requests"
              stroke="#d97757"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
