import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { Announcement } from "@/components/app/announcement";
import { StatsCard } from "@/components/app/stats-card";
import { ActivityFeed } from "@/components/app/activity-feed";
import { SpendChart } from "@/components/app/spend-chart";
import { ComparisonChart } from "@/components/app/comparison-chart";
import { ProjectList } from "@/components/app/project-list";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";
import { getUserProjects, getUserProjectStats } from "@/lib/data/projects";
import { getUserActivity, getUserSpendChartData, getProjectComparisonData } from "@/lib/data/events";

export default async function AppOverviewPage() {
  const user = await requireAuth();
  const projects = await getUserProjects(user.id);
  const stats = await getUserProjectStats(user.id);
  const activities = await getUserActivity(user.id, 5);
  const { dailyData, weeklyData, monthlyData } = await getUserSpendChartData(user.id, 30);
  const comparisonData = await getProjectComparisonData(user.id);

  const projectCards = projects.map((project) => ({
    id: project.id,
    name: project.name,
    agentCount: project.agentCount,
    avatar: project.avatar,
    monthlySpent: typeof project.monthlySpent === "bigint"
      ? Number(project.monthlySpent)
      : project.monthlySpent,
  }));

  const formatCurrency = (amount: number | bigint) => {
    const value = typeof amount === "bigint" ? Number(amount) / 1_000_000 : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Transform activities to the format expected by ActivityFeed
  const formattedActivities = activities.map((activity) => ({
    id: activity.id,
    type: activity.type === "funding" ? "vault_funded" as const : "budget_updated" as const,
    title: activity.type === "funding" ? "Vault funded" : "Agent spend",
    description: `${activity.agentName ?? "Unknown agent"} in ${activity.projectName}`,
    timestamp: activity.createdAt.toISOString(),
    user: {
      name: user.name,
      avatar: user.avatar ?? "",
    },
  }));

  return (
    <>
      <AppHeader title="Overview" />
      <main className="flex-1 overflow-auto bg-neutral-50/50">
        <div className="mx-auto max-w-6xl space-y-6 p-6">
          {projects.length === 0 && (
            <Announcement 
              message="Welcome to Pilot! Create your first project to get started." 
              variant="warning"
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Projects" value={stats.totalProjects} />
            <StatsCard 
              title="Agents" 
              value={stats.totalAgents} 
              subtitle={`${stats.activeAgents} active`} 
            />
            <StatsCard 
              title="Active" 
              value={stats.activeAgents} 
              subtitle={`${stats.pausedAgents} paused`} 
            />
            <StatsCard 
              title="Monthly spend" 
              value={formatCurrency(stats.totalMonthlySpent)} 
            />
          </div>

          {projects.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <SpendChart
                dailyData={dailyData}
                weeklyData={weeklyData}
                monthlyData={monthlyData}
              />
              <ComparisonChart data={comparisonData} />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Projects
                </p>
                <Link href="/app/projects/new">
                  <Button size="sm" className="h-7 bg-neutral-900 text-[11px] hover:bg-neutral-800">
                    <Plus className="mr-1 h-3 w-3" strokeWidth={1.5} />
                    New
                  </Button>
                </Link>
              </div>
              <div className="mt-4 space-y-2">
                <ProjectList projects={projectCards} />
              </div>
            </div>

            <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Activity
              </p>
              <div className="mt-4">
                {formattedActivities.length === 0 ? (
                  <p className="text-center py-4 text-[13px] text-neutral-500">
                    No recent activity
                  </p>
                ) : (
                  <ActivityFeed activities={formattedActivities} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
