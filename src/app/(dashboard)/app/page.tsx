import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { Announcement } from "@/components/app/announcement";
import { StatsCard } from "@/components/app/stats-card";
import { ActivityFeed } from "@/components/app/activity-feed";
import { SpendChart } from "@/components/app/spend-chart";
import { ComparisonChart } from "@/components/app/comparison-chart";
import { workspaces, getWorkspaceStats } from "@/lib/dummy-data/workspaces";
import { recentActivity } from "@/lib/dummy-data/activity";
import { spendChartData, projectComparisonData } from "@/lib/dummy-data/charts";
import { getBotStatusCounts } from "@/lib/dummy-data/bots";

export default function AppOverviewPage() {
  const stats = getWorkspaceStats();
  const botStatus = getBotStatusCounts();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <AppHeader title="Overview" />
      <main className="flex-1 overflow-auto bg-neutral-50/50">
        <div className="mx-auto max-w-6xl space-y-6 p-6">
          <Announcement message="New: Advanced budget controls now available" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Workspaces" value={stats.totalWorkspaces} />
            <StatsCard title="Projects" value={stats.totalProjects} subtitle={`${stats.totalBots} bots`} />
            <StatsCard title="Active bots" value={botStatus.active} subtitle={`${botStatus.paused} paused`} />
            <StatsCard 
              title="Total spend" 
              value={formatCurrency(stats.totalSpend)} 
              trend={{ value: 12, isPositive: false }}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SpendChart
              dailyData={spendChartData.daily}
              weeklyData={spendChartData.weekly}
              monthlyData={spendChartData.monthly}
            />
            <ComparisonChart data={projectComparisonData} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Workspaces
                </p>
              </div>
              <div className="mt-4 space-y-2">
                {workspaces.map((workspace) => (
                  <Link
                    key={workspace.id}
                    href={`/app/workspaces/${workspace.id}`}
                    className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-neutral-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 text-[12px] font-medium text-neutral-600">
                        {workspace.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-neutral-900">
                          {workspace.name}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {workspace.projectCount} projects
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-[13px] font-medium text-neutral-700">
                        {formatCurrency(workspace.budget.spent)}
                      </p>
                      <ChevronRight className="h-4 w-4 text-neutral-300" strokeWidth={1.5} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Activity
              </p>
              <div className="mt-4">
                <ActivityFeed activities={recentActivity.slice(0, 5)} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
