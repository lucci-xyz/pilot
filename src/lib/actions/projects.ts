"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createProject, deleteProject } from "@/lib/data/projects";
import { createAgent } from "@/lib/data/agents";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createProjectAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAuth();

  if (!process.env.VAULT_ENCRYPTION_KEY) {
    return { error: "VAULT_ENCRYPTION_KEY is not set. Add it to your .env and restart." };
  }
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;

  if (!name || name.trim().length === 0) {
    return { error: "Project name is required" };
  }

  const project = await createProject(user.id, {
    name: name.trim(),
    description: description?.trim() || undefined,
  });

  redirect(`/app/projects/${project.id}`);
}

export async function createAgentAction(
  projectId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAuth();
  
  const name = formData.get("name") as string;
  const provider = formData.get("provider") as string | null;
  const dailyLimitStr = formData.get("dailyLimit") as string;
  const perTxLimitStr = formData.get("perTxLimit") as string;
  const monthlyLimitStr = formData.get("monthlyLimit") as string | null;

  if (!name || name.trim().length === 0) {
    return { error: "Agent name is required" };
  }

  const dailyLimit = parseFloat(dailyLimitStr || "100");
  const perTxLimit = parseFloat(perTxLimitStr || "10");
  const monthlyLimit = monthlyLimitStr ? parseFloat(monthlyLimitStr) : undefined;

  if (Number.isNaN(dailyLimit) || Number.isNaN(perTxLimit)) {
    return { error: "Budget limits must be numbers" };
  }
  if (monthlyLimit !== undefined && Number.isNaN(monthlyLimit)) {
    return { error: "Monthly limit must be a number" };
  }

  const agent = await createAgent(projectId, user.id, {
    name: name.trim(),
    provider: provider?.trim() || undefined,
    dailyLimit: BigInt(Math.floor(dailyLimit * 1_000_000)),
    perTxLimit: BigInt(Math.floor(perTxLimit * 1_000_000)),
    monthlyLimit: monthlyLimit !== undefined ? BigInt(Math.floor(monthlyLimit * 1_000_000)) : undefined,
  });

  if (!agent) {
    return { error: "Project not found or you don't have access" };
  }

  redirect(`/app/projects/${projectId}/agents/${agent.id}`);
}

export async function deleteProjectAction(projectId: string): Promise<ActionState> {
  const user = await requireAuth();

  const success = await deleteProject(projectId, user.id);
  if (!success) {
    return { error: "Project not found or you don't have access" };
  }

  // Refresh dashboard data and sidebar projects
  revalidatePath("/app");
  revalidatePath("/app", "layout");

  return { success: true };
}

