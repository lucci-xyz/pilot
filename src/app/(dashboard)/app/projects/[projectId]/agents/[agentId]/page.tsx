import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { StatsCard } from "@/components/app/stats-card";
import { VaultCard } from "@/components/app/vault-card";
import { VaultAddress } from "@/components/app/vault-address";
import { StatusBadge } from "@/components/app/status-badge";
import { BotSetupSection } from "@/components/app/bot-setup-section";
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

  // Vault and budget data for display
  const walletBalance = Number(agent.wallet?.balance ?? BigInt(0)) / 1_000_000;

  const vaultData = {
    id: agent.wallet?.id ?? agent.id,
    name: `${agent.name} Wallet`,
    balance: walletBalance,
    limit: walletBalance,
    currency: "USD",
    lastFourDigits: agent.wallet?.address.slice(-4) ?? agent.id.slice(-4),
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

  const toDollars = (value: bigint | number | null | undefined) =>
    Number(value ?? 0) / 1_000_000;

  return (
    <>
      <AppHeader title={agent.name} />
      <main className="flex-1 overflow-auto bg-neutral-50/50">
        <div className="mx-auto max-w-7xl space-y-5 p-6">
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
                <p className="text-[12px] text-neutral-500">{agent.provider ?? "No provider set"}</p>
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

          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-3">
              <VaultCard vault={vaultData} budget={budgetData} />
              <VaultAddress address={agent.wallet?.address} walletName={agent.name} />
            </div>
            <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Recent Transactions
              </p>
              <div className="mt-4 space-y-2">
                {agent.events.length === 0 ? (
                  <p className="text-[13px] text-neutral-500">No transactions yet.</p>
                ) : (
                  agent.events.slice(0, 6).map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-[12px]">
                      <div className="flex flex-col">
                        <span className="text-neutral-700 capitalize">{e.type}</span>
                        <span className="text-neutral-400">{e.createdAt.toLocaleDateString()}</span>
                      </div>
                      <span className={e.type === "funding" ? "text-emerald-600" : "text-neutral-700"}>
                        {e.type === "funding" ? "+" : "-"}
                        {formatCurrency(BigInt(Math.abs(Number(e.amount))))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr] items-start">
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Details
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Status", value: <StatusBadge status={agent.status as "active" | "paused" | "error" | "needs_setup"} /> },
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

              <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Budget & Limits
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
              </div>
            </div>

            <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft h-full">
              <div className="mt-0 h-full w-full overflow-hidden">
                <BotSetupSection
                  botId={agent.id}
                  webhookUrl={agent.webhookUrl ?? undefined}
                  webhookAction={updateAgentWebhookAction.bind(null, agent.id, projectId)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

