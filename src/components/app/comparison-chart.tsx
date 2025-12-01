"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface ComparisonChartProps {
  data: Array<{
    name: string;
    spend: number;
    [key: string]: string | number;
  }>;
  title?: string;
  className?: string;
}

export function ComparisonChart({
  data,
  title = "By project",
  className,
}: ComparisonChartProps) {
  return (
    <div className={cn("rounded-xl border border-neutral-100 bg-white p-5 shadow-soft", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
        {title}
      </p>
      <div className="mt-4 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#a3a3a3" }}
              tickFormatter={(v) => `$${v / 1000}k`}
            />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#525252" }}
              width={100}
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
            <Bar
              dataKey="spend"
              fill="#d97757"
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
