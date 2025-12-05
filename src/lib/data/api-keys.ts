import { prisma } from "@/lib/db";
import { ApiKey } from "@/generated/prisma/client";

export type ApiKeySummary = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  permissions: string[];
  requestCount: number;
};

// Get all API keys for a user
export async function getUserApiKeys(userId: string): Promise<ApiKeySummary[]> {
  const keys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return keys.map((key) => ({
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    createdAt: key.createdAt,
    lastUsedAt: key.lastUsedAt,
    expiresAt: key.expiresAt,
    permissions: key.permissions,
    requestCount: key.requestCount,
  }));
}

// Hash a key for storage
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate a new API key
function generateApiKey(prefix: string = "pk_live_"): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const key = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${prefix}${key}`;
}

// Create a new API key
export async function createApiKey(
  userId: string,
  data: {
    name: string;
    permissions?: string[];
    expiresAt?: Date;
  }
): Promise<{ apiKey: ApiKey; plainKey: string }> {
  const plainKey = generateApiKey();
  const keyHash = await hashApiKey(plainKey);
  const keyPrefix = plainKey.substring(0, 8);

  const apiKey = await prisma.apiKey.create({
    data: {
      name: data.name,
      keyHash,
      keyPrefix,
      permissions: data.permissions ?? ["read", "write"],
      expiresAt: data.expiresAt,
      userId,
    },
  });

  return { apiKey, plainKey };
}

// Delete an API key
export async function deleteApiKey(keyId: string, userId: string): Promise<boolean> {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
  });

  if (!key) return false;

  await prisma.apiKey.delete({
    where: { id: keyId },
  });

  return true;
}

// Verify an API key (for agent authentication)
export async function verifyApiKey(
  plainKey: string
): Promise<{ valid: true; userId: string; permissions: string[] } | { valid: false }> {
  const keyHash = await hashApiKey(plainKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
  });

  if (!apiKey) return { valid: false };

  // Check expiration
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false };
  }

  // Update last used and request count
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: {
      lastUsedAt: new Date(),
      requestCount: { increment: 1 },
    },
  });

  return {
    valid: true,
    userId: apiKey.userId,
    permissions: apiKey.permissions,
  };
}

