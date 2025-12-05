import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { User } from "@/generated/prisma/client";

const SESSION_COOKIE_NAME = "pilot_session";
const SESSION_DURATION_DAYS = 30;

// Simple but secure password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Generate a secure random token
function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Create a new session for a user
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  // Set the session cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

// Get the current session from cookies
export async function getSession(): Promise<{ user: User } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    // Session expired or not found, clear the cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return { user: session.user };
}

// Delete the current session (logout)
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

// Require authentication - redirect to login if not authenticated
export async function requireAuth(): Promise<User> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session.user;
}

// Register a new user
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<{ success: true; user: User } | { success: false; error: string }> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    return { success: true, user };
  } catch {
    return { success: false, error: "Failed to create account" };
  }
}

// Authenticate a user
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: true; user: User } | { success: false; error: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    return { success: true, user };
  } catch {
    return { success: false, error: "Authentication failed" };
  }
}

// Get user for API routes (without redirect)
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

// Type for serializable user (without password)
export type SafeUser = Omit<User, "passwordHash">;

export function toSafeUser(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

