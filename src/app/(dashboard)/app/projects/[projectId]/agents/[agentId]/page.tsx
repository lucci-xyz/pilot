import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { StatsCard } from "@/components/app/stats-card";
import { VaultAddress } from "@/components/app/vault-address";
import { StatusBadge } from "@/components/app/status-badge";
import { BotSetupSection } from "@/components/app/bot-setup-section";
import { TransactionChart } from "@/components/app/transaction-chart";
import { requireAuth } from "@/lib/auth";
import { getProject } from "@/lib/data/projects";
import { getAgent, getAgentPerformance } from "@/lib/data/agents";
import { AgentStatusForm } from "@/components/app/agent-status-form";
import { AgentConfigureDialog } from "@/components/app/agent-configure-dialog";
import { AgentBudgetDialog } from "@/components/app/agent-budget-dialog";
import {
  updateAgentBudgetAction,
  updateAgentDetailsAction,
  updateAgentStatusAction,
  updateAgentWebhookAction,
} from "@/lib/actions/agents";
import { cn } from "@/lib/utils";

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

  const toDollars = (value: bigint | number | null | undefined) =>
    Number(value ?? 0) / 1_000_000;

  // Calculate budget usage percentage
  const dailyBudgetPercent = agent.budgetRule?.dailyLimit
    ? Math.round((Number(agent.budgetRule.dailySpent ?? 0) / Number(agent.budgetRule.dailyLimit)) * 100)
    : 0;

  return (
    <>
      <AppHeader title={agent.name} />
      <main className="flex-1 overflow-auto bg-neutral-50/50">
        <div className="mx-auto max-w-7xl space-y-5 p-6">
          
          {/* Compact Header with Actions */}
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
                <p className="text-[12px] text-neutral-500">
                  {agent.provider ?? "No provider"} • Created {agent.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {agent.status === "active" ? (
                <AgentStatusForm
                  action={updateAgentStatusAction.bind(null, agent.id, projectId, "paused")}
                  label="Pause"
                  pendingLabel="Pausing..."
                  variant="outline"
                  icon={<Pause className="h-3.5 w-3.5" strokeWidth={1.5} />}
                />
              ) : (
                <AgentStatusForm
                  action={updateAgentStatusAction.bind(null, agent.id, projectId, "active")}
                  label="Resume"
                  pendingLabel="Resuming..."
                  variant="outline"
                  icon={<Play className="h-3.5 w-3.5" strokeWidth={1.5} />}
                />
              )}
              <AgentConfigureDialog
                action={updateAgentDetailsAction.bind(null, agent.id, projectId)}
                defaultValues={{
                  name: agent.name,
                  provider: agent.provider,
                }}
              />
            </div>
          </div>

          {/* Visual Stats Row */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatsCard
              title="Total Spent"
              value={formatCurrency(totalSpent)}
              subtitle="All time"
            />
            <StatsCard
              title="Daily Budget"
              value={`${dailyBudgetPercent}%`}
              subtitle={`${formatCurrency(agent.budgetRule?.dailySpent ?? BigInt(0))} of ${formatCurrency(agent.budgetRule?.dailyLimit ?? BigInt(0))}`}
            />
            <StatsCard
              title="Requests"
              value={totalRequests}
              subtitle={`${todayRequests} today`}
            />
            <StatsCard
              title="Wallet Balance"
              value={formatCurrency(BigInt(agent.wallet?.balance ?? 0))}
              subtitle="USDC equivalent"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            
            {/* Left: Wallet, Budget & Integration */}
            <div className="space-y-4">
              {/* Wallet with all token balances */}
              <VaultAddress address={agent.wallet?.address} walletName={agent.name} />
              
              {/* Compact Budget Controls */}
              <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Budget Limits
                  </p>
                  <AgentBudgetDialog
                    action={updateAgentBudgetAction.bind(null, agent.id, projectId)}
                    defaults={{
                      dailyLimit: toDollars(agent.budgetRule?.dailyLimit ?? 0),
                      perTxLimit: toDollars(agent.budgetRule?.perTxLimit ?? 0),
                      monthlyLimit: agent.budgetRule?.monthlyLimit
                        ? toDollars(agent.budgetRule?.monthlyLimit)
                        : null,
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Daily</p>
                    <p className="text-[13px] font-semibold text-neutral-900">
                      {formatCurrency(agent.budgetRule?.dailyLimit ?? BigInt(0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Per TX</p>
                    <p className="text-[13px] font-semibold text-neutral-900">
                      {formatCurrency(agent.budgetRule?.perTxLimit ?? BigInt(0))}
                    </p>
                  </div>
                  {agent.budgetRule?.monthlyLimit && (
                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Monthly</p>
                      <p className="text-[13px] font-semibold text-neutral-900">
                        {formatCurrency(agent.budgetRule.monthlyLimit)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bot Setup - Below Budget */}
              <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-soft">
                <BotSetupSection
                  botId={agent.id}
                  webhookUrl={agent.webhookUrl ?? undefined}
                  webhookAction={updateAgentWebhookAction.bind(null, agent.id, projectId)}
                />
              </div>
            </div>

            {/* Right: Transaction Chart */}
            <div className="space-y-4">
              <TransactionChart events={agent.events} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

