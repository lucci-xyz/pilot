import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Plus, ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { StatsCard } from "@/components/app/stats-card";
import { VaultCard } from "@/components/app/vault-card";
import { SpendChart } from "@/components/app/spend-chart";
import { ComparisonChart } from "@/components/app/comparison-chart";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWorkspace } from "@/lib/dummy-data/workspaces";
import { getProject } from "@/lib/dummy-data/projects";
import { getBotsByProject } from "@/lib/dummy-data/bots";
import { spendChartData } from "@/lib/dummy-data/charts";

interface ProjectPageProps {
  params: Promise<{ workspaceId: string; projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { workspaceId, projectId } = await params;
  const workspace = getWorkspace(workspaceId);
  const project = getProject(projectId);

  if (!workspace || !project) {
    notFound();
  }

  const bots = getBotsByProject(projectId);

  const botComparisonData = bots.map((bot) => ({
    name: bot.name,
    spend: bot.totalSpend,
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <AppHeader title={project.name} />
      <main className="flex-1 overflow-auto bg-neutral-50/50">
        <div className="mx-auto max-w-6xl space-y-6 p-6">
          <Link
            href={`/app/workspaces/${workspaceId}`}
            className="inline-flex items-center text-[12px] text-neutral-500 hover:text-neutral-700"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
            {workspace.name}
          </Link>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Bots" value={project.botCount} subtitle={`${bots.filter((b) => b.status === "active").length} active`} />
            <StatsCard title="Requests" value={bots.reduce((acc, b) => acc + b.requestsToday, 0).toLocaleString()} subtitle="today" />
            <StatsCard 
              title="Spend" 
              value={formatCurrency(project.budget.spent)}
              trend={{ value: 5, isPositive: false }}
            />
            <StatsCard title="Total" value={formatCurrency(project.totalSpend)} subtitle="all time" />
          </div>

          <Tabs defaultValue="bots" className="space-y-6">
            <TabsList className="h-9 bg-neutral-100/50 p-1">
              <TabsTrigger value="bots" className="text-[12px]">Bots</TabsTrigger>
              <TabsTrigger value="analytics" className="text-[12px]">Analytics</TabsTrigger>
              <TabsTrigger value="budget" className="text-[12px]">Budget</TabsTrigger>
            </TabsList>

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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {bots.map((bot) => (
                  <Link
                    key={bot.id}
                    href={`/app/workspaces/${workspaceId}/projects/${projectId}/bots/${bot.id}`}
                    className="group rounded-xl border border-neutral-100 bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-neutral-900">{bot.name}</p>
                        <StatusBadge status={bot.status} />
                      </div>
                      <ChevronRight className="h-4 w-4 text-neutral-300 transition-colors group-hover:text-neutral-500" strokeWidth={1.5} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
                      <div>
                        <p className="text-neutral-400">Model</p>
                        <p className="text-neutral-700">{bot.model}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Today</p>
                        <p className="text-neutral-700">{bot.requestsToday.toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <SpendChart
                  dailyData={spendChartData.daily}
                  weeklyData={spendChartData.weekly}
                  monthlyData={spendChartData.monthly}
                />
                <ComparisonChart data={botComparisonData} title="By bot" />
              </div>
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <VaultCard vault={project.vault} budget={project.budget} />
                <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Settings
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-[12px] text-neutral-500">Budget limit</p>
                      <p className="text-xl font-semibold text-neutral-900">
                        {formatCurrency(project.budget.allocated)}
                        <span className="ml-1 text-[12px] font-normal text-neutral-400">
                          / {project.budget.period}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-8 text-[12px]">Adjust</Button>
                      <Button variant="outline" size="sm" className="h-8 text-[12px]">Alerts</Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
