import { prisma } from "@/lib/db";
import { Event } from "@/generated/prisma/client";

export type ActivityItem = {
  id: string;
  type: "funding" | "spend";
  amount: bigint;
  status: string;
  txHash: string | null;
  metadata: string | null;
  createdAt: Date;
  agentName: string | null;
  projectName: string;
};

// Get recent activity for a user
export async function getUserActivity(userId: string, limit: number = 10): Promise<ActivityItem[]> {
  const events = await prisma.event.findMany({
    where: {
      vault: {
        project: {
          userId,
        },
      },
    },
    include: {
      agent: true,
      vault: {
        include: {
          project: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return events.map((event) => ({
    id: event.id,
    type: event.type as "funding" | "spend",
    amount: event.amount,
    status: event.status,
    txHash: event.txHash,
    metadata: event.metadata,
    createdAt: event.createdAt,
    agentName: event.agent?.name ?? null,
    projectName: event.vault.project.name,
  }));
}

// Get activity for a specific project
export async function getProjectActivity(
  projectId: string,
  userId: string,
  limit: number = 20
): Promise<ActivityItem[]> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { vault: true },
  });

  if (!project?.vault) return [];

  const events = await prisma.event.findMany({
    where: { vaultId: project.vault.id },
    include: {
      agent: true,
      vault: {
        include: {
          project: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return events.map((event) => ({
    id: event.id,
    type: event.type as "funding" | "spend",
    amount: event.amount,
    status: event.status,
    txHash: event.txHash,
    metadata: event.metadata,
    createdAt: event.createdAt,
    agentName: event.agent?.name ?? null,
    projectName: event.vault.project.name,
  }));
}

// Create a funding event
export async function createFundingEvent(
  projectId: string,
  userId: string,
  amount: bigint,
  txHash?: string
): Promise<Event | null> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { vault: true },
  });

  if (!project?.vault) return null;

  // Create event and update vault balance
  const [event] = await prisma.$transaction([
    prisma.event.create({
      data: {
        type: "funding",
        amount,
        status: txHash ? "confirmed" : "pending",
        txHash,
        vaultId: project.vault.id,
      },
    }),
    prisma.vault.update({
      where: { id: project.vault.id },
      data: {
        balance: { increment: amount },
      },
    }),
  ]);

  return event;
}

// Get spend chart data for a user
export async function getUserSpendChartData(userId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const events = await prisma.event.findMany({
    where: {
      vault: {
        project: {
          userId,
        },
      },
      type: "spend",
      status: "confirmed",
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: "asc" },
  });

  // Daily (last `days`)
  const daily: Record<string, bigint> = {};
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const key = date.toISOString().split("T")[0];
    daily[key] = BigInt(0);
  }

  // Weekly (last 12 weeks)
  const weekly: Record<string, bigint> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const key = `${d.getFullYear()}-W${getWeekNumber(d)}`;
    weekly[key] = BigInt(0);
  }

  // Monthly (last 12 months)
  const monthly: Record<string, bigint> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthly[key] = BigInt(0);
  }

  events.forEach((event) => {
    const eventDate = event.createdAt;
    const dayKey = eventDate.toISOString().split("T")[0];
    if (daily[dayKey] !== undefined) {
      daily[dayKey] += BigInt(Math.abs(Number(event.amount)));
    }

    const weekKey = `${eventDate.getFullYear()}-W${getWeekNumber(eventDate)}`;
    if (weekly[weekKey] !== undefined) {
      weekly[weekKey] += BigInt(Math.abs(Number(event.amount)));
    }

    const monthKey = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}`;
    if (monthly[monthKey] !== undefined) {
      monthly[monthKey] += BigInt(Math.abs(Number(event.amount)));
    }
  });

  const dailyData = Object.entries(daily).map(([date, value]) => ({
    date,
    value: Number(value) / 1_000_000,
    label: new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
  }));

  const weeklyData = Object.entries(weekly).map(([key, value]) => ({
    date: key,
    value: Number(value) / 1_000_000,
    label: key,
  }));

  const monthlyData = Object.entries(monthly).map(([key, value]) => {
    const [year, month] = key.split("-").map(Number);
    const date = new Date(year, month - 1);
    return {
      date: key,
      value: Number(value) / 1_000_000,
      label: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    };
  });

  return { dailyData, weeklyData, monthlyData };
}

function getWeekNumber(date: Date) {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo.toString().padStart(2, "0");
}

// Get project comparison data
export async function getProjectComparisonData(userId: string) {
  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      agents: {
        include: {
          budgetRule: true,
        },
      },
    },
  });

  return projects.map((project) => {
    const totalSpent = project.agents.reduce(
      (sum, agent) => sum + Number(agent.budgetRule?.monthlySpent ?? 0),
      0
    );

    return {
      name: project.name,
      spend: totalSpent / 1_000_000, // Convert to dollars
      bots: project.agents.length,
    };
  });
}

