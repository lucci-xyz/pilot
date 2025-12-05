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
import { requireAuth } from "@/lib/auth";
import { getProject } from "@/lib/data/projects";
import { getAgent, getAgentPerformance } from "@/lib/data/agents";

interface AgentPageProps {
  params: Promise<{ projectId: string; agentId: string }>;
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { projectId, agentId } = await params;
  const user = await requireAuth();
  const project = await getProject(projectId, user.id);

  if (!project) {
    notFound();
  }

  const agent = await getAgent(agentId, user.id);

  if (!agent) {
    notFound();
  }

  const performanceData = await getAgentPerformance(agentId, user.id, 14);

  const formatCurrency = (amount: number | bigint) => {
    const value = typeof amount === "bigint" ? Number(amount) / 1_000_000 : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalSpent = agent.events
    .filter((e) => e.type === "spend" && e.status === "confirmed")
    .reduce((sum, e) => sum + BigInt(Math.abs(Number(e.amount))), BigInt(0));

  const totalRequests = agent.events.filter((e) => e.type === "spend").length;
  const todayRequests = agent.events.filter((e) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return e.type === "spend" && e.createdAt >= today;
  }).length;

  // Vault and budget data for display
  const vaultData = {
    id: agent.id,
    name: `${agent.name} Budget`,
    balance: Number(agent.budgetRule?.dailyLimit ?? 0) / 1_000_000,
    limit: Number(agent.budgetRule?.dailyLimit ?? 0) / 1_000_000,
    currency: "USD",
    lastFourDigits: agent.id.slice(-4),
    expiryDate: "N/A",
    type: "virtual" as const,
  };

  const budgetData = {
    id: agent.id,
    name: `Daily Budget`,
    allocated: Number(agent.budgetRule?.dailyLimit ?? 0) / 1_000_000,
    spent: Number(agent.budgetRule?.dailySpent ?? 0) / 1_000_000,
    currency: "USD",
    period: "daily" as const,
  };

  // Transform performance data for chart
  const chartData = performanceData.map((d) => ({
    date: d.date,
    requests: d.requests,
    errors: 0,
    latency: 150,
  }));

  return (
    <>
      <AppHeader title={agent.name} />
      <main className="flex-1 overflow-auto bg-neutral-50/50">
        <div className="mx-auto max-w-6xl space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/app/projects/${projectId}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50"
              >
                <ArrowLeft className="h-4 w-4 text-neutral-600" strokeWidth={1.5} />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-medium text-neutral-900">{agent.name}</h1>
                  <StatusBadge status={agent.status as "active" | "paused" | "error" | "needs_setup"} />
                </div>
                <p className="text-[12px] text-neutral-500">{agent.model ?? "No model set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {agent.status === "active" ? (
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
            <StatsCard title="Requests today" value={todayRequests.toLocaleString()} />
            <StatsCard 
              title="Daily spent" 
              value={formatCurrency(agent.budgetRule?.dailySpent ?? BigInt(0))}
              subtitle={`of ${formatCurrency(agent.budgetRule?.dailyLimit ?? BigInt(0))}`}
            />
            <StatsCard title="Total spent" value={formatCurrency(totalSpent)} />
            <StatsCard title="Total requests" value={totalRequests.toLocaleString()} />
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="h-9 bg-neutral-100/50 p-1">
              <TabsTrigger value="overview" className="text-[12px]">Overview</TabsTrigger>
              <TabsTrigger value="setup" className="text-[12px]">Setup</TabsTrigger>
              <TabsTrigger value="budget" className="text-[12px]">Budget</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <PerformanceChart data={chartData} />
                <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Details
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      { label: "Status", value: <StatusBadge status={agent.status as "active" | "paused" | "error" | "needs_setup"} /> },
                      { label: "Model", value: agent.model ?? "Not set" },
                      { label: "Provider", value: agent.provider ?? "Not set" },
                      { label: "Created", value: agent.createdAt.toLocaleDateString() },
                      { label: "Project", value: <Link href={`/app/projects/${projectId}`} className="text-primary hover:underline">{project.name}</Link> },
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
              <BotSetupSection botId={agent.id} webhookUrl={agent.webhookUrl ?? undefined} />
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <VaultCard vault={vaultData} budget={budgetData} />
                <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Budget Limits
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-neutral-500">Daily limit</span>
                      <span className="text-[12px] font-medium text-neutral-700">
                        {formatCurrency(agent.budgetRule?.dailyLimit ?? BigInt(0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-neutral-500">Per transaction</span>
                      <span className="text-[12px] font-medium text-neutral-700">
                        {formatCurrency(agent.budgetRule?.perTxLimit ?? BigInt(0))}
                      </span>
                    </div>
                    {agent.budgetRule?.monthlyLimit && (
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-neutral-500">Monthly limit</span>
                        <span className="text-[12px] font-medium text-neutral-700">
                          {formatCurrency(agent.budgetRule.monthlyLimit)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex gap-2">
                    <Button size="sm" className="h-8 text-[12px]">Adjust limits</Button>
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

