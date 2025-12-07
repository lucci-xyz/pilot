"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createApiKey, deleteApiKey } from "@/lib/data/api-keys";

export type ApiKeyActionState = {
  error?: string;
  success?: string;
  plainKey?: string;
};

export async function createApiKeyAction(
  _prevState: ApiKeyActionState,
  formData: FormData
): Promise<ApiKeyActionState> {
  const user = await requireAuth();
  const name = (formData.get("name") as string | null)?.trim();
  const permissionsValue = (formData.get("permissions") as string | null) ?? "read,write";
  const expiresAtRaw = formData.get("expiresAt") as string | null;

  if (!name) {
    return { error: "Name is required" };
  }

  const permissions = permissionsValue
    .split(",")
    .map((perm) => perm.trim())
    .filter(Boolean);

  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : undefined;

  try {
    const { plainKey } = await createApiKey(user.id, {
      name,
      permissions,
      expiresAt,
    });

    revalidatePath("/app/account");

    return {
      success: "API key created",
      plainKey,
    };
  } catch (error) {
    console.error(error);
    return { error: "Unable to create API key" };
  }
}

export async function revokeApiKeyAction(apiKeyId: string) {
  const user = await requireAuth();
  const deleted = await deleteApiKey(apiKeyId, user.id);

  if (!deleted) {
    throw new Error("API key not found");
  }

  revalidatePath("/app/account");
}

