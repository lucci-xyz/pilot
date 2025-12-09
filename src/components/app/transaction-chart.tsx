"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { Event } from "@/generated/prisma/client";

interface TransactionChartProps {
  events: Event[];
}

export function TransactionChart({ events }: TransactionChartProps) {
  // Group transactions by date (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const chartData = last7Days.map((date) => {
    const dayEvents = events.filter((e) => {
      const eventDate = new Date(e.createdAt);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === date.getTime();
    });

    const spending = dayEvents
      .filter((e) => e.type === "spend" && e.status === "confirmed")
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const funding = dayEvents
      .filter((e) => e.type === "funding" && e.status === "confirmed")
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      spending: Math.abs(spending) / 1_000_000,
      funding: funding / 1_000_000,
      total: Math.abs(spending) / 1_000_000,
    };
  });

  const maxValue = Math.max(...chartData.map((d) => Math.max(d.spending, d.funding)));
  const hasData = events.length > 0;

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Activity (Last 7 Days)
          </p>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#d97757" }} />
              <span className="text-[11px] text-neutral-600">Spend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#16a34a" }} />
              <span className="text-[11px] text-neutral-600">Funding</span>
            </div>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="flex h-[280px] items-center justify-center">
          <p className="text-[12px] text-neutral-500">No transactions yet</p>
        </div>
      ) : (
        <div className="[&_.recharts-active-bar]:hidden">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#999" }}
                axisLine={{ stroke: "#e5e5e5" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#999" }}
                axisLine={{ stroke: "#e5e5e5" }}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
                labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
                cursor={false}
              />
              <Bar 
                dataKey="spending" 
                fill="#d97757" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="funding" 
                fill="#16a34a" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent transactions list below chart */}
      {hasData && (
        <div className="mt-4 border-t border-neutral-100 pt-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
            Recent
          </p>
          <div className="space-y-1.5">
            {events.slice(0, 3).map((e) => (
              <div key={e.id} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: e.type === "funding" ? "#16a34a" : "#d97757",
                    }}
                  />
                  <span className="text-neutral-600 capitalize">{e.type}</span>
                  <span className="text-neutral-400">
                    {new Date(e.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <span
                  className="font-medium"
                  style={{
                    color: e.type === "funding" ? "#16a34a" : "#d97757",
                  }}
                >
                  {e.type === "funding" ? "+" : "-"}$
                  {(Math.abs(Number(e.amount)) / 1_000_000).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

