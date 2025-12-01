import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pause, Play, Settings } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { StatsCard } from "@/components/app/stats-card";
import { VaultCard } from "@/components/app/vault-card";
import { StatusBadge } from "@/components/app/status-badge";
import { BotSetupSection } from "@/components/app/bot-setup-section";
import { PerformanceChart } from "@/components/app/performance-chart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWorkspace } from "@/lib/dummy-data/workspaces";
import { getProject } from "@/lib/dummy-data/projects";
import { getBot } from "@/lib/dummy-data/bots";
import { botPerformanceData } from "@/lib/dummy-data/charts";

interface BotPageProps {
  params: Promise<{ workspaceId: string; projectId: string; botId: string }>;
}

export default async function BotPage({ params }: BotPageProps) {
  const { workspaceId, projectId, botId } = await params;
  const workspace = getWorkspace(workspaceId);
  const project = getProject(projectId);
  const bot = getBot(botId);

  if (!workspace || !project || !bot) {
    notFound();
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <AppHeader title={bot.name} />
      <main className="flex-1 overflow-auto bg-neutral-50/50">
        <div className="mx-auto max-w-6xl space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/app/workspaces/${workspaceId}/projects/${projectId}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50"
              >
                <ArrowLeft className="h-4 w-4 text-neutral-600" strokeWidth={1.5} />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-medium text-neutral-900">{bot.name}</h1>
                  <StatusBadge status={bot.status} />
                </div>
                <p className="text-[12px] text-neutral-500">{bot.model}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {bot.status === "active" ? (
                <Button variant="outline" size="sm" className="h-8 text-[12px]">
                  <Pause className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
                  Pause
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="h-8 text-[12px]">
                  <Play className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
                  Resume
                </Button>
              )}
              <Button size="sm" className="h-8 bg-neutral-900 text-[12px] hover:bg-neutral-800">
                <Settings className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
                Configure
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Requests" value={bot.requestsToday.toLocaleString()} subtitle="today" />
            <StatsCard 
              title="Budget" 
              value={formatCurrency(bot.budget.spent)}
              subtitle={`of ${formatCurrency(bot.budget.allocated)}`}
              trend={{
                value: Math.round((bot.budget.spent / bot.budget.allocated) * 100),
                isPositive: bot.budget.spent < bot.budget.allocated * 0.8,
              }}
            />
            <StatsCard title="Total spend" value={formatCurrency(bot.totalSpend)} />
            <StatsCard title="Total requests" value={bot.requestsTotal.toLocaleString()} />
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="h-9 bg-neutral-100/50 p-1">
              <TabsTrigger value="overview" className="text-[12px]">Overview</TabsTrigger>
              <TabsTrigger value="setup" className="text-[12px]">Setup</TabsTrigger>
              <TabsTrigger value="budget" className="text-[12px]">Budget</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <PerformanceChart data={botPerformanceData} />
                <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Details
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      { label: "Status", value: <StatusBadge status={bot.status} /> },
                      { label: "Model", value: bot.model },
                      { label: "Created", value: new Date(bot.createdAt).toLocaleDateString() },
                      { label: "Project", value: <Link href={`/app/workspaces/${workspaceId}/projects/${projectId}`} className="text-primary hover:underline">{project.name}</Link> },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[12px] text-neutral-500">{item.label}</span>
                        <span className="text-[12px] text-neutral-700">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="setup" className="space-y-6">
              <BotSetupSection botId={bot.id} webhookUrl={bot.webhookUrl} />
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <VaultCard vault={bot.vault} budget={bot.budget} />
                <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Alerts
                  </p>
                  <div className="mt-4 space-y-2">
                    {[50, 75, 90, 100].map((threshold) => (
                      <div
                        key={threshold}
                        className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2"
                      >
                        <span className="text-[12px] text-neutral-700">{threshold}%</span>
                        <span className="text-[11px] text-neutral-400">
                          {threshold === 100 ? "Pause" : "Email"}
                        </span>
                      </div>
                    ))}
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
