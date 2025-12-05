"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createProject } from "@/lib/data/projects";
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
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;

  if (!name || name.trim().length === 0) {
    return { error: "Project name is required" };
  }

  try {
    const project = await createProject(user.id, {
      name: name.trim(),
      description: description?.trim() || undefined,
    });

    redirect(`/app/projects/${project.id}`);
  } catch {
    return { error: "Failed to create project" };
  }
}

export async function createAgentAction(
  projectId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAuth();
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const provider = formData.get("provider") as string | null;
  const model = formData.get("model") as string | null;
  const dailyLimitStr = formData.get("dailyLimit") as string;
  const perTxLimitStr = formData.get("perTxLimit") as string;
  const monthlyLimitStr = formData.get("monthlyLimit") as string | null;

  if (!name || name.trim().length === 0) {
    return { error: "Agent name is required" };
  }

  const dailyLimit = parseFloat(dailyLimitStr || "100") * 1_000_000;
  const perTxLimit = parseFloat(perTxLimitStr || "10") * 1_000_000;
  const monthlyLimit = monthlyLimitStr ? parseFloat(monthlyLimitStr) * 1_000_000 : undefined;

  try {
    const agent = await createAgent(projectId, user.id, {
      name: name.trim(),
      description: description?.trim() || undefined,
      provider: provider?.trim() || undefined,
      model: model?.trim() || undefined,
      dailyLimit: BigInt(Math.floor(dailyLimit)),
      perTxLimit: BigInt(Math.floor(perTxLimit)),
      monthlyLimit: monthlyLimit ? BigInt(Math.floor(monthlyLimit)) : undefined,
    });

    if (!agent) {
      return { error: "Project not found or you don't have access" };
    }

    redirect(`/app/projects/${projectId}/agents/${agent.id}`);
  } catch {
    return { error: "Failed to create agent" };
  }
}

