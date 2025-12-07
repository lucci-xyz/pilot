"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type ActionState = {
  error?: string;
  success?: string;
};

type AgentStatus = "active" | "paused" | "error" | "needs_setup";

async function assertAgentOwnership(agentId: string, projectId: string, userId: string) {
  const agent = await prisma.agent.findFirst({
    where: {
      id: agentId,
      projectId,
      project: {
        userId,
      },
    },
    include: {
      budgetRule: true,
    },
  });

  if (!agent) {
    throw new Error("Agent not found");
  }

  return agent;
}

function toMinorUnits(value: number) {
  return BigInt(Math.round(value * 1_000_000));
}

function revalidateAgentPaths(projectId: string, agentId: string) {
  revalidatePath("/app");
  revalidatePath(`/app/projects/${projectId}`);
  revalidatePath(`/app/projects/${projectId}/agents/${agentId}`);
}

export async function updateAgentStatusAction(
  agentId: string,
  projectId: string,
  status: AgentStatus
) {
  const user = await requireAuth();
  await assertAgentOwnership(agentId, projectId, user.id);

  await prisma.agent.update({
    where: { id: agentId },
    data: { status },
  });

  revalidateAgentPaths(projectId, agentId);
}

export async function updateAgentDetailsAction(
  agentId: string,
  projectId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAuth();
  await assertAgentOwnership(agentId, projectId, user.id);

  const name = (formData.get("name") as string | null)?.trim();
  const provider = (formData.get("provider") as string | null)?.trim() || null;

  if (!name) {
    return { error: "Name is required" };
  }

  await prisma.agent.update({
    where: { id: agentId },
    data: {
      name,
      provider,
    },
  });

  revalidateAgentPaths(projectId, agentId);
  return { success: "Agent updated" };
}

export async function updateAgentBudgetAction(
  agentId: string,
  projectId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAuth();
  const agent = await assertAgentOwnership(agentId, projectId, user.id);

  if (!agent.budgetRule) {
    return { error: "Budget rule not found" };
  }

  const dailyLimit = Number(formData.get("dailyLimit"));
  const perTxLimit = Number(formData.get("perTxLimit"));
  const monthlyLimitRaw = formData.get("monthlyLimit");

  if (Number.isNaN(dailyLimit) || Number.isNaN(perTxLimit)) {
    return { error: "Limits must be valid numbers" };
  }

  const monthlyLimit =
    monthlyLimitRaw && monthlyLimitRaw !== ""
      ? Number(monthlyLimitRaw)
      : null;

  await prisma.agentBudgetRule.update({
    where: { id: agent.budgetRule.id },
    data: {
      dailyLimit: toMinorUnits(dailyLimit),
      perTxLimit: toMinorUnits(perTxLimit),
      monthlyLimit: monthlyLimit === null ? null : toMinorUnits(monthlyLimit),
    },
  });

  revalidateAgentPaths(projectId, agentId);
  return { success: "Budget limits updated" };
}

export async function updateAgentWebhookAction(
  agentId: string,
  projectId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAuth();
  await assertAgentOwnership(agentId, projectId, user.id);

  const webhookUrl = (formData.get("webhookUrl") as string | null)?.trim() || null;

  await prisma.agent.update({
    where: { id: agentId },
    data: {
      webhookUrl,
    },
  });

  revalidateAgentPaths(projectId, agentId);
  return { success: webhookUrl ? "Webhook updated" : "Webhook cleared" };
}

