import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Plus, ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { StatsCard } from "@/components/app/stats-card";
import { SpendChart } from "@/components/app/spend-chart";
import type { ChartDataPoint } from "@/components/app/spend-chart";
import { ComparisonChart } from "@/components/app/comparison-chart";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";
import { getProject } from "@/lib/data/projects";
import { getProjectAgents } from "@/lib/data/agents";
import { getProjectActivity, getUserSpendChartData } from "@/lib/data/events";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const user = await requireAuth();
  const project = await getProject(projectId, user.id);

  if (!project) {
    notFound();
  }

  const agents = await getProjectAgents(projectId, user.id);
  const activities = await getProjectActivity(projectId, user.id);
  const { dailyData, weeklyData, monthlyData } = await getUserSpendChartData(user.id, 30);

  // Build per-agent daily series (last 14 days) from events loaded with project
  const days = 14;
  const dateBuckets: { date: string; label: string }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dateBuckets.push({ date: d.toISOString().split("T")[0], label });
  }

  const agentSeries = agents.map((agent) => ({
    key: agent.id,
    label: agent.name,
  }));

  const colorPalette = ["#d97757", "#2563eb", "#16a34a", "#9333ea", "#f97316", "#0ea5e9"];
  const agentColors = Object.fromEntries(
    agentSeries.map((s, idx) => [s.key, colorPalette[idx % colorPalette.length]])
  );
  const agentNameColors = Object.fromEntries(
    agents.map((a, idx) => [a.name, colorPalette[idx % colorPalette.length]])
  );

  const dailySeriesData: ChartDataPoint[] = dateBuckets.map((bucket) => {
    const entry: ChartDataPoint = {
      date: bucket.date,
      label: bucket.label,
      value: 0,
    };

    agentSeries.forEach((s) => {
      const agent = project.agents.find((a) => a.id === s.key);
      const spendForDay =
        agent?.events
          .filter((e) => e.type === "spend" && e.status === "confirmed")
          .filter((e) => e.createdAt.toISOString().split("T")[0] === bucket.date)
          .reduce((sum, e) => sum + Math.abs(Number(e.amount)) / 1_000_000, 0) ?? 0;

      entry[s.key] = spendForDay;
      entry.value += spendForDay;
    });

    return entry;
  });

  const formatCurrency = (amount: number | bigint) => {
    const value = typeof amount === "bigint" ? Number(amount) / 1_000_000 : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalMonthlySpent = agents.reduce(
    (sum, agent) => sum + Number(agent.monthlySpent),
    0
  );

  const totalWalletBalance = agents.reduce(
    (sum, agent) => sum + Number(agent.walletBalance),
    0
  );

  const agentComparisonData = agents.map((agent) => ({
    name: agent.name,
    spend: Number(agent.monthlySpent) / 1_000_000,
  }));

  return (
    <>
      <AppHeader title={project.name} />
      <main className="flex-1 overflow-auto bg-neutral-50/50">
        <div className="mx-auto max-w-6xl space-y-6 p-6">
          <Link
            href="/app"
            className="inline-flex items-center text-[12px] text-neutral-500 hover:text-neutral-700"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
            Back to Overview
          </Link>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              title="Agents" 
              value={agents.length} 
              subtitle={`${agents.filter((a) => a.status === "active").length} active`} 
            />
            <StatsCard 
              title="Monthly spend" 
              value={formatCurrency(totalMonthlySpent)}
            />
            <StatsCard 
              title="Wallet balance" 
              value={formatCurrency(totalWalletBalance)}
            />
            <StatsCard title="Status" value={project.status} />
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Agent wallets
                </p>
                <Link href={`/app/projects/${projectId}/agents/new`}>
                  <Button size="sm" className="h-8 bg-neutral-900 text-[12px] hover:bg-neutral-800">
                    <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
                    New
                  </Button>
                </Link>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {agents.length === 0 ? (
                  <p className="text-[13px] text-neutral-500">No agents yet. Create one to provision a wallet.</p>
                ) : (
                  agents.map((agent) => (
                    <div key={agent.id} className="rounded-lg border border-neutral-100 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-medium text-neutral-900">{agent.name}</p>
                        <StatusBadge status={agent.status as "active" | "paused" | "error" | "needs_setup"} />
                      </div>
                      <p className="mt-1 text-[12px] text-neutral-500">{agent.provider ?? "No provider"}</p>
                      <p className="mt-2 text-[20px] font-semibold text-neutral-900">
                        {formatCurrency(agent.walletBalance)}
                      </p>
                      <Link
                        href={`/app/projects/${projectId}/agents/${agent.id}`}
                        className="mt-2 inline-flex text-[12px] text-primary hover:underline"
                      >
                        Manage →
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <SpendChart
                dailyData={dailySeriesData}
                weeklyData={dailySeriesData}
                monthlyData={dailySeriesData}
                series={agentSeries}
                stacked={true}
                colors={agentColors}
              />
              <ComparisonChart data={agentComparisonData} title="By agent" colors={agentNameColors} />
            </div>

            <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Recent Activity
              </p>
              <div className="mt-4 space-y-2">
                {activities.length === 0 ? (
                  <p className="text-[13px] text-neutral-500">No recent activity</p>
                ) : (
                  activities.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between py-2 text-[12px]"
                    >
                      <div>
                        <p className="text-neutral-700">
                          {activity.type === "funding" ? "Funded" : "Spent"} by{" "}
                          {activity.agentName ?? "Unknown"}
                        </p>
                        <p className="text-neutral-400">
                          {activity.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <p className={activity.type === "funding" ? "text-emerald-600" : "text-neutral-700"}>
                        {activity.type === "funding" ? "+" : "-"}
                        {formatCurrency(BigInt(Math.abs(Number(activity.amount))))}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

