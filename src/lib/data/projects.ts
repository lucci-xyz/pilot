import { prisma } from "@/lib/db";
import { Project, Vault, Agent, AgentBudgetRule, Event } from "@/generated/prisma/client";

export type ProjectWithRelations = Project & {
  vault: Vault | null;
  agents: (Agent & {
    budgetRule: AgentBudgetRule | null;
    events: Event[];
  })[];
};

export type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: Date;
  vaultBalance: bigint;
  agentCount: number;
  activeAgentCount: number;
  totalSpent: bigint;
  monthlySpent: bigint;
};

// Get all projects for a user
export async function getUserProjects(userId: string): Promise<ProjectSummary[]> {
  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      vault: {
        include: {
          events: {
            where: { status: "confirmed" },
          },
        },
      },
      agents: {
        include: {
          budgetRule: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return projects.map((project) => {
    const totalSpent = project.vault?.events
      .filter((e) => e.type === "spend")
      .reduce((sum, e) => sum + BigInt(Math.abs(Number(e.amount))), BigInt(0)) ?? BigInt(0);
    
    const monthlySpent = project.agents.reduce(
      (sum, agent) => sum + (agent.budgetRule?.monthlySpent ?? BigInt(0)),
      BigInt(0)
    );

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt,
      vaultBalance: project.vault?.balance ?? BigInt(0),
      agentCount: project.agents.length,
      activeAgentCount: project.agents.filter((a) => a.status === "active").length,
      totalSpent,
      monthlySpent,
    };
  });
}

// Get a single project with all relations
export async function getProject(projectId: string, userId: string): Promise<ProjectWithRelations | null> {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      vault: true,
      agents: {
        include: {
          budgetRule: true,
          events: {
            orderBy: { createdAt: "desc" },
            take: 100,
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

// Get project stats for a user
export async function getUserProjectStats(userId: string) {
  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      vault: true,
      agents: {
        include: {
          budgetRule: true,
        },
      },
    },
  });

  const totalProjects = projects.length;
  const totalAgents = projects.reduce((sum, p) => sum + p.agents.length, 0);
  const activeAgents = projects.reduce(
    (sum, p) => sum + p.agents.filter((a) => a.status === "active").length,
    0
  );
  const pausedAgents = projects.reduce(
    (sum, p) => sum + p.agents.filter((a) => a.status === "paused").length,
    0
  );
  const errorAgents = projects.reduce(
    (sum, p) => sum + p.agents.filter((a) => a.status === "error").length,
    0
  );
  const needsSetupAgents = projects.reduce(
    (sum, p) => sum + p.agents.filter((a) => a.status === "needs_setup").length,
    0
  );
  const totalBalance = projects.reduce(
    (sum, p) => sum + (p.vault?.balance ?? BigInt(0)),
    BigInt(0)
  );
  const totalMonthlySpent = projects.reduce(
    (sum, p) =>
      sum + p.agents.reduce((s, a) => s + (a.budgetRule?.monthlySpent ?? BigInt(0)), BigInt(0)),
    BigInt(0)
  );

  return {
    totalProjects,
    totalAgents,
    activeAgents,
    pausedAgents,
    errorAgents,
    needsSetupAgents,
    totalBalance,
    totalMonthlySpent,
  };
}

// Create a new project
export async function createProject(
  userId: string,
  data: {
    name: string;
    description?: string;
  }
): Promise<Project> {
  // Generate a unique vault address (in production, this would be a real Solana address)
  const vaultAddress = `vault_${crypto.randomUUID().replace(/-/g, "")}`;

  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      userId,
      vault: {
        create: {
          address: vaultAddress,
          balance: BigInt(0),
        },
      },
    },
    include: {
      vault: true,
    },
  });
}

// Update a project
export async function updateProject(
  projectId: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
    status?: string;
  }
): Promise<Project | null> {
  // Verify ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) return null;

  return prisma.project.update({
    where: { id: projectId },
    data,
  });
}

// Delete a project
export async function deleteProject(projectId: string, userId: string): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) return false;

  await prisma.project.delete({
    where: { id: projectId },
  });

  return true;
}

