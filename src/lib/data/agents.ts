import { prisma } from "@/lib/db";
import { Agent, AgentBudgetRule, Event } from "@/generated/prisma/client";

export type AgentWithRelations = Agent & {
  budgetRule: AgentBudgetRule | null;
  events: Event[];
};

export type AgentSummary = {
  id: string;
  name: string;
  description: string | null;
  provider: string | null;
  model: string | null;
  status: string;
  createdAt: Date;
  projectId: string;
  dailyLimit: bigint;
  dailySpent: bigint;
  monthlySpent: bigint;
  totalSpent: bigint;
};

// Get all agents for a project
export async function getProjectAgents(projectId: string, userId: string): Promise<AgentSummary[]> {
  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) return [];

  const agents = await prisma.agent.findMany({
    where: { projectId },
    include: {
      budgetRule: true,
      events: {
        where: { status: "confirmed", type: "spend" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return agents.map((agent) => {
    const totalSpent = agent.events.reduce(
      (sum, e) => sum + BigInt(Math.abs(Number(e.amount))),
      BigInt(0)
    );

    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      provider: agent.provider,
      model: agent.model,
      status: agent.status,
      createdAt: agent.createdAt,
      projectId: agent.projectId,
      dailyLimit: agent.budgetRule?.dailyLimit ?? BigInt(0),
      dailySpent: agent.budgetRule?.dailySpent ?? BigInt(0),
      monthlySpent: agent.budgetRule?.monthlySpent ?? BigInt(0),
      totalSpent,
    };
  });
}

// Get a single agent with relations
export async function getAgent(
  agentId: string,
  userId: string
): Promise<AgentWithRelations | null> {
  const agent = await prisma.agent.findFirst({
    where: { id: agentId },
    include: {
      budgetRule: true,
      events: {
        orderBy: { createdAt: "desc" },
        take: 100,
      },
      project: true,
    },
  });

  if (!agent || agent.project.userId !== userId) return null;

  return agent;
}

// Create a new agent
export async function createAgent(
  projectId: string,
  userId: string,
  data: {
    name: string;
    description?: string;
    provider?: string;
    model?: string;
    dailyLimit: bigint;
    perTxLimit: bigint;
    monthlyLimit?: bigint;
  }
): Promise<Agent | null> {
  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) return null;

  return prisma.agent.create({
    data: {
      name: data.name,
      description: data.description,
      provider: data.provider,
      model: data.model,
      status: "needs_setup",
      projectId,
      budgetRule: {
        create: {
          dailyLimit: data.dailyLimit,
          perTxLimit: data.perTxLimit,
          monthlyLimit: data.monthlyLimit,
        },
      },
    },
    include: {
      budgetRule: true,
    },
  });
}

// Update an agent
export async function updateAgent(
  agentId: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
    provider?: string;
    model?: string;
    status?: string;
    webhookUrl?: string;
  }
): Promise<Agent | null> {
  const agent = await prisma.agent.findFirst({
    where: { id: agentId },
    include: { project: true },
  });

  if (!agent || agent.project.userId !== userId) return null;

  return prisma.agent.update({
    where: { id: agentId },
    data,
  });
}

// Update agent budget rule
export async function updateAgentBudget(
  agentId: string,
  userId: string,
  data: {
    dailyLimit?: bigint;
    perTxLimit?: bigint;
    monthlyLimit?: bigint;
  }
): Promise<AgentBudgetRule | null> {
  const agent = await prisma.agent.findFirst({
    where: { id: agentId },
    include: { project: true, budgetRule: true },
  });

  if (!agent || agent.project.userId !== userId || !agent.budgetRule) return null;

  return prisma.agentBudgetRule.update({
    where: { id: agent.budgetRule.id },
    data,
  });
}

// Delete an agent
export async function deleteAgent(agentId: string, userId: string): Promise<boolean> {
  const agent = await prisma.agent.findFirst({
    where: { id: agentId },
    include: { project: true },
  });

  if (!agent || agent.project.userId !== userId) return false;

  await prisma.agent.delete({
    where: { id: agentId },
  });

  return true;
}

// Get agent performance data (events over time)
export async function getAgentPerformance(agentId: string, userId: string, days: number = 14) {
  const agent = await prisma.agent.findFirst({
    where: { id: agentId },
    include: { project: true },
  });

  if (!agent || agent.project.userId !== userId) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const events = await prisma.event.findMany({
    where: {
      agentId,
      createdAt: { gte: startDate },
      status: "confirmed",
    },
    orderBy: { createdAt: "asc" },
  });

  // Group events by day
  const dailyData: Record<string, { requests: number; spend: bigint }> = {};
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const key = date.toISOString().split("T")[0];
    dailyData[key] = { requests: 0, spend: BigInt(0) };
  }

  events.forEach((event) => {
    const key = event.createdAt.toISOString().split("T")[0];
    if (dailyData[key]) {
      dailyData[key].requests += 1;
      if (event.type === "spend") {
        dailyData[key].spend += BigInt(Math.abs(Number(event.amount)));
      }
    }
  });

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    requests: data.requests,
    spend: data.spend,
  }));
}

