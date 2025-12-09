import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getAgentBudgetInfo,
  upsertAgentBudget,
} from "@/lib/data/budget";

type RouteContext = {
  params: Promise<{ agentId: string }>;
};

/**
 * Verify that the current user owns the agent.
 */
async function verifyAgentOwnership(agentId: string, userId: string) {
  const agent = await prisma.agent.findFirst({
    where: {
      id: agentId,
      project: {
        userId,
      },
    },
    include: {
      project: true,
    },
  });

  return agent;
}

/**
 * GET /api/agents/[agentId]/budget
 * 
 * Returns the current budget and current month spend for an agent.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { agentId } = await context.params;

    // Verify ownership
    const agent = await verifyAgentOwnership(agentId, user.id);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get budget info
    const budgetInfo = await getAgentBudgetInfo(agentId);

    return NextResponse.json({
      agentId,
      projectId: agent.projectId,
      budget: budgetInfo.budget
        ? {
            id: budgetInfo.budget.id,
            monthlyBudgetUsd: budgetInfo.budget.monthlyBudgetUsd.toNumber(),
            active: budgetInfo.budget.active,
          }
        : null,
      currentMonthSpendUsd: budgetInfo.currentMonthSpendUsd.toNumber(),
      remainingBudgetUsd: budgetInfo.budget
        ? budgetInfo.budget.monthlyBudgetUsd
            .minus(budgetInfo.currentMonthSpendUsd)
            .toNumber()
        : null,
    });
  } catch (error) {
    console.error("Error fetching agent budget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/[agentId]/budget
 * 
 * Create or update the active budget for an agent.
 * Body: { monthlyBudgetUsd: number }
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { agentId } = await context.params;

    // Verify ownership
    const agent = await verifyAgentOwnership(agentId, user.id);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Parse body
    const body = await request.json();
    const { monthlyBudgetUsd } = body;

    // Validate input
    if (typeof monthlyBudgetUsd !== "number" || monthlyBudgetUsd < 0) {
      return NextResponse.json(
        { error: "monthlyBudgetUsd must be a non-negative number" },
        { status: 400 }
      );
    }

    // Create/update budget
    const budget = await upsertAgentBudget(
      agentId,
      agent.projectId,
      monthlyBudgetUsd
    );

    // Get current spend for response
    const budgetInfo = await getAgentBudgetInfo(agentId);

    return NextResponse.json({
      success: true,
      agentId,
      projectId: agent.projectId,
      budget: {
        id: budget.id,
        monthlyBudgetUsd: budget.monthlyBudgetUsd.toNumber(),
        active: budget.active,
      },
      currentMonthSpendUsd: budgetInfo.currentMonthSpendUsd.toNumber(),
      remainingBudgetUsd: budget.monthlyBudgetUsd
        .minus(budgetInfo.currentMonthSpendUsd)
        .toNumber(),
    });
  } catch (error) {
    console.error("Error setting agent budget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

