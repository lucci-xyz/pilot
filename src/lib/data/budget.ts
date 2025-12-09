import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

type Decimal = Prisma.Decimal;
const Decimal = Prisma.Decimal;

export type BudgetInfo = {
  budget: {
    id: string;
    monthlyBudgetUsd: Decimal;
    active: boolean;
  } | null;
  currentMonthSpendUsd: Decimal;
};

/**
 * Get the active budget for an agent.
 * Returns null if no active budget exists.
 */
export async function getActiveAgentBudget(agentId: string) {
  return prisma.agentBudget.findFirst({
    where: {
      agentId,
      active: true,
    },
  });
}

/**
 * Get the start of the current calendar month in UTC.
 */
function getStartOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
}

/**
 * Calculate the total spend for an agent in the current calendar month.
 * Sums all confirmed AgentTransaction.amountUsd for the given agentId.
 */
export async function getAgentSpendForCurrentMonth(agentId: string): Promise<Decimal> {
  const startOfMonth = getStartOfCurrentMonth();

  const result = await prisma.agentTransaction.aggregate({
    where: {
      agentId,
      status: "confirmed",
      createdAt: {
        gte: startOfMonth,
      },
    },
    _sum: {
      amountUsd: true,
    },
  });

  return result._sum.amountUsd ?? new Decimal(0);
}

/**
 * Error thrown when an agent would exceed their budget.
 */
export class BudgetExceededError extends Error {
  constructor(
    public readonly agentId: string,
    public readonly currentSpendUsd: Decimal,
    public readonly nextAmountUsd: Decimal,
    public readonly monthlyBudgetUsd: Decimal
  ) {
    const remaining = monthlyBudgetUsd.minus(currentSpendUsd);
    super(
      `Budget exceeded for agent ${agentId}. ` +
        `Current spend: $${currentSpendUsd.toFixed(2)}, ` +
        `Requested: $${nextAmountUsd.toFixed(2)}, ` +
        `Monthly budget: $${monthlyBudgetUsd.toFixed(2)}, ` +
        `Remaining: $${remaining.toFixed(2)}`
    );
    this.name = "BudgetExceededError";
  }

  toJSON() {
    return {
      error: "BUDGET_EXCEEDED",
      message: this.message,
      agentId: this.agentId,
      currentSpendUsd: this.currentSpendUsd.toNumber(),
      nextAmountUsd: this.nextAmountUsd.toNumber(),
      monthlyBudgetUsd: this.monthlyBudgetUsd.toNumber(),
      remainingUsd: this.monthlyBudgetUsd.minus(this.currentSpendUsd).toNumber(),
    };
  }
}

/**
 * Assert that an agent is within their budget before allowing a transaction.
 * 
 * - If no active budget exists, the transaction is allowed.
 * - If currentSpend + nextAmountUsd exceeds monthlyBudgetUsd, throws BudgetExceededError.
 * 
 * @param agentId - The agent's ID
 * @param nextAmountUsd - The amount (in USD) of the next transaction
 * @throws BudgetExceededError if the budget would be exceeded
 */
export async function assertAgentWithinBudget(
  agentId: string,
  nextAmountUsd: number | Decimal
): Promise<void> {
  const budget = await getActiveAgentBudget(agentId);

  // No active budget means no restrictions
  if (!budget) {
    return;
  }

  const currentSpend = await getAgentSpendForCurrentMonth(agentId);
  const nextAmount = nextAmountUsd instanceof Decimal ? nextAmountUsd : new Decimal(nextAmountUsd);
  const totalAfterTx = currentSpend.plus(nextAmount);

  if (totalAfterTx.greaterThan(budget.monthlyBudgetUsd)) {
    throw new BudgetExceededError(agentId, currentSpend, nextAmount, budget.monthlyBudgetUsd);
  }
}

/**
 * Get budget info for an agent including current month spend.
 */
export async function getAgentBudgetInfo(agentId: string): Promise<BudgetInfo> {
  const [budget, currentMonthSpendUsd] = await Promise.all([
    getActiveAgentBudget(agentId),
    getAgentSpendForCurrentMonth(agentId),
  ]);

  return {
    budget: budget
      ? {
          id: budget.id,
          monthlyBudgetUsd: budget.monthlyBudgetUsd,
          active: budget.active,
        }
      : null,
    currentMonthSpendUsd,
  };
}

/**
 * Create or update the active budget for an agent.
 * Deactivates any existing active budget for the agent first.
 */
export async function upsertAgentBudget(
  agentId: string,
  projectId: string,
  monthlyBudgetUsd: number | Decimal
): Promise<{ id: string; monthlyBudgetUsd: Decimal; active: boolean }> {
  // Deactivate existing active budgets
  await prisma.agentBudget.updateMany({
    where: {
      agentId,
      active: true,
    },
    data: {
      active: false,
    },
  });

  // Create new active budget
  const budget = await prisma.agentBudget.create({
    data: {
      agentId,
      projectId,
      monthlyBudgetUsd: monthlyBudgetUsd instanceof Decimal ? monthlyBudgetUsd : new Decimal(monthlyBudgetUsd),
      active: true,
    },
  });

  return {
    id: budget.id,
    monthlyBudgetUsd: budget.monthlyBudgetUsd,
    active: budget.active,
  };
}

/**
 * Record an agent transaction.
 */
export async function recordAgentTransaction(data: {
  agentId: string;
  projectId: string;
  amountUsd: number | Decimal;
  token?: string;
  txSignature?: string;
  description?: string;
  status?: string;
}) {
  return prisma.agentTransaction.create({
    data: {
      agentId: data.agentId,
      projectId: data.projectId,
      amountUsd: data.amountUsd instanceof Decimal ? data.amountUsd : new Decimal(data.amountUsd),
      token: data.token ?? "USDC",
      txSignature: data.txSignature,
      description: data.description,
      status: data.status ?? "confirmed",
    },
  });
}

