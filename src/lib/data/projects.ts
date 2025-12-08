import { prisma } from "@/lib/db";
import { Project, Vault, Agent, AgentBudgetRule, Event } from "@/generated/prisma/client";
import { randomAvatarKey, ProjectAvatarKey } from "@/lib/project-avatars";

export type ProjectWithRelations = Project & {
  agents: (Agent & {
    wallet: Vault | null;
    budgetRule: AgentBudgetRule | null;
    events: Event[];
  })[];
};

export type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  avatar: ProjectAvatarKey | null;
  createdAt: Date;
  totalWalletBalance: bigint;
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
      agents: {
        include: {
          wallet: true,
          budgetRule: true,
          events: {
            where: { status: "confirmed", type: "spend" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return projects.map((project) => {
    const totalSpent = project.agents.reduce(
      (sum, agent) =>
        sum +
        agent.events.reduce(
          (acc, e) => acc + BigInt(Math.abs(Number(e.amount))),
          BigInt(0)
        ),
      BigInt(0)
    );
    
    const monthlySpent = project.agents.reduce(
      (sum, agent) => sum + (agent.budgetRule?.monthlySpent ?? BigInt(0)),
      BigInt(0)
    );

    const totalWalletBalance = project.agents.reduce(
      (sum, agent) => sum + (agent.wallet?.balance ?? BigInt(0)),
      BigInt(0)
    );

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      avatar: (project as Project & { avatar?: ProjectAvatarKey | null }).avatar ?? null,
      createdAt: project.createdAt,
      totalWalletBalance,
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
      agents: {
        include: {
          wallet: true,
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
      agents: {
        include: {
          wallet: true,
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
    (sum, p) => sum + p.agents.reduce((s, a) => s + (a.wallet?.balance ?? BigInt(0)), BigInt(0)),
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
  const avatarKey = randomAvatarKey();

  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      userId,
      avatar: avatarKey,
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

