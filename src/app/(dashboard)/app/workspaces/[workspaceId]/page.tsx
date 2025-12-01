import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { Announcement } from "@/components/app/announcement";
import { StatsCard } from "@/components/app/stats-card";
import { VaultCard } from "@/components/app/vault-card";
import { ActivityFeed } from "@/components/app/activity-feed";
import { SpendChart } from "@/components/app/spend-chart";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWorkspace } from "@/lib/dummy-data/workspaces";
import { getProjectsByWorkspace } from "@/lib/dummy-data/projects";
import { getBotsByWorkspace } from "@/lib/dummy-data/bots";
import { getActivityByWorkspace } from "@/lib/dummy-data/activity";
import { spendChartData } from "@/lib/dummy-data/charts";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  const workspace = getWorkspace(workspaceId);

  if (!workspace) {
    notFound();
  }

  const projects = getProjectsByWorkspace(workspaceId);
  const bots = getBotsByWorkspace(workspaceId);
  const activities = getActivityByWorkspace(workspaceId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <AppHeader title={workspace.name} />
      <main className="flex-1 overflow-auto bg-neutral-50/50">
        <div className="mx-auto max-w-6xl space-y-6 p-6">
          <Announcement message="Budget at 65% — review usage or increase allocation" variant="warning" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Projects" value={workspace.projectCount} />
            <StatsCard title="Bots" value={workspace.botCount} subtitle={`${bots.filter((b) => b.status === "active").length} active`} />
            <StatsCard 
              title="Monthly spend" 
              value={formatCurrency(workspace.budget.spent)}
              trend={{ value: 8, isPositive: false }}
            />
            <StatsCard title="Balance" value={formatCurrency(workspace.vault.balance)} />
          </div>

          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="h-9 bg-neutral-100/50 p-1">
              <TabsTrigger value="projects" className="text-[12px]">Projects</TabsTrigger>
              <TabsTrigger value="bots" className="text-[12px]">Bots</TabsTrigger>
              <TabsTrigger value="budget" className="text-[12px]">Budget</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  {projects.length} projects
                </p>
                <Button size="sm" className="h-8 bg-neutral-900 text-[12px] hover:bg-neutral-800">
                  <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
                  New
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/app/workspaces/${workspaceId}/projects/${project.id}`}
                    className="group rounded-xl border border-neutral-100 bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-md"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-[13px] font-medium text-neutral-900">{project.name}</p>
                      <ChevronRight className="h-4 w-4 text-neutral-300 transition-colors group-hover:text-neutral-500" strokeWidth={1.5} />
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400">{project.botCount} bots</p>
                    <div className="mt-3 flex items-center justify-between text-[12px]">
                      <span className="text-neutral-500">{formatCurrency(project.budget.spent)}</span>
                      <span className="text-neutral-400">/ {formatCurrency(project.budget.allocated)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bots" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  {bots.length} bots
                </p>
                <Button size="sm" className="h-8 bg-neutral-900 text-[12px] hover:bg-neutral-800">
                  <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
                  New
                </Button>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-white shadow-soft overflow-hidden">
                <div className="grid grid-cols-[1fr_100px_100px_80px] gap-4 border-b border-neutral-50 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  <div>Name</div>
                  <div>Requests</div>
                  <div>Spend</div>
                  <div>Status</div>
                </div>
                {bots.map((bot) => (
                  <Link
                    key={bot.id}
                    href={`/app/workspaces/${workspaceId}/projects/${bot.projectId}/bots/${bot.id}`}
                    className="grid grid-cols-[1fr_100px_100px_80px] gap-4 px-4 py-3 text-[13px] transition-colors hover:bg-neutral-50"
                  >
                    <div className="font-medium text-neutral-900">{bot.name}</div>
                    <div className="text-neutral-500">{bot.requestsToday.toLocaleString()}</div>
                    <div className="text-neutral-500">{formatCurrency(bot.totalSpend)}</div>
                    <div><StatusBadge status={bot.status} /></div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <VaultCard vault={workspace.vault} budget={workspace.budget} />
                <SpendChart
                  dailyData={spendChartData.daily}
                  weeklyData={spendChartData.weekly}
                  monthlyData={spendChartData.monthly}
                />
              </div>
              <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Activity
                </p>
                <div className="mt-4">
                  <ActivityFeed activities={activities.slice(0, 5)} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
