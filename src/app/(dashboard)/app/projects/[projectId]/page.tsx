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
  const spendData = await getUserSpendChartData(user.id, 30);

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

  const agentComparisonData = agents.map((agent) => ({
    name: agent.name,
    spend: Number(agent.monthlySpent) / 1_000_000,
  }));

  // Vault and budget data for display
  const vaultData = {
    id: project.vault?.id ?? "",
    name: `${project.name} Vault`,
    balance: Number(project.vault?.balance ?? 0) / 1_000_000,
    limit: 100000,
    currency: "USD",
    lastFourDigits: project.vault?.address.slice(-4) ?? "0000",
    expiryDate: "N/A",
    type: "virtual" as const,
  };

  const budgetData = {
    id: project.id,
    name: `${project.name} Budget`,
    allocated: 100000,
    spent: totalMonthlySpent / 1_000_000,
    currency: "USD",
    period: "monthly" as const,
  };

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
              title="Vault balance" 
              value={formatCurrency(project.vault?.balance ?? BigInt(0))}
            />
            <StatsCard title="Status" value={project.status} />
          </div>

          <Tabs defaultValue="agents" className="space-y-6">
            <TabsList className="h-9 bg-neutral-100/50 p-1">
              <TabsTrigger value="agents" className="text-[12px]">Agents</TabsTrigger>
              <TabsTrigger value="analytics" className="text-[12px]">Analytics</TabsTrigger>
              <TabsTrigger value="budget" className="text-[12px]">Budget</TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  {agents.length} agents
                </p>
                <Link href={`/app/projects/${projectId}/agents/new`}>
                  <Button size="sm" className="h-8 bg-neutral-900 text-[12px] hover:bg-neutral-800">
                    <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
                    New
                  </Button>
                </Link>
              </div>
              {agents.length === 0 ? (
                <div className="rounded-xl border border-neutral-100 bg-white p-8 text-center shadow-soft">
                  <p className="text-[13px] text-neutral-500">
                    No agents yet. Create one to get started!
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {agents.map((agent) => (
                    <Link
                      key={agent.id}
                      href={`/app/projects/${projectId}/agents/${agent.id}`}
                      className="group rounded-xl border border-neutral-100 bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-medium text-neutral-900">{agent.name}</p>
                          <StatusBadge status={agent.status as "active" | "paused" | "error" | "needs_setup"} />
                        </div>
                        <ChevronRight className="h-4 w-4 text-neutral-300 transition-colors group-hover:text-neutral-500" strokeWidth={1.5} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
                        <div>
                          <p className="text-neutral-400">Model</p>
                          <p className="text-neutral-700">{agent.model ?? "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400">Daily spent</p>
                          <p className="text-neutral-700">{formatCurrency(agent.dailySpent)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <SpendChart
                  dailyData={spendData}
                  weeklyData={[]}
                  monthlyData={[]}
                />
                <ComparisonChart data={agentComparisonData} title="By agent" />
              </div>
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <VaultCard vault={vaultData} budget={budgetData} />
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
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}

