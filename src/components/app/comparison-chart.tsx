"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface ComparisonChartProps {
  data: Array<{
    name: string;
    spend: number;
    [key: string]: string | number;
  }>;
  title?: string;
  className?: string;
  colors?: Record<string, string>;
}

function withAlpha(color: string | undefined, alpha: number) {
  if (!color) return `rgba(217, 119, 87, ${alpha})`; // fallback
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const int = hex.length === 3
      ? hex.split("").map((c) => parseInt(c + c, 16))
      : [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map((c) => parseInt(c, 16));
    const [r, g, b] = int;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

export function ComparisonChart({
  data,
  title = "By project",
  className,
  colors,
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
              cursor={false}
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
              activeBar={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`${entry.name}-${index}`}
                  fill={withAlpha(colors?.[entry.name], 0.35)}
                  stroke={withAlpha(colors?.[entry.name], 0.65)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
