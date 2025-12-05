"use server";

import { redirect } from "next/navigation";
import {
  registerUser,
  authenticateUser,
  createSession,
  deleteSession,
} from "@/lib/auth";

export type AuthState = {
  error?: string;
  success?: boolean;
};

export async function signupAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!firstName || !lastName || !email || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const name = `${firstName} ${lastName}`;
  const result = await registerUser(email, password, name);

  if (!result.success) {
    return { error: result.error };
  }

  // Create session and redirect
  await createSession(result.user.id);
  redirect("/app");
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const result = await authenticateUser(email, password);

  if (!result.success) {
    return { error: result.error };
  }

  // Create session and redirect
  await createSession(result.user.id);
  redirect("/app");
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

