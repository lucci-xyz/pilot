"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, AuthState } from "@/lib/actions/auth";

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-medium text-neutral-900">Welcome back</h1>
        <p className="mt-1 text-[13px] text-neutral-500">
          Sign in to your account
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-600">
            {state.error}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[12px] font-medium text-neutral-600">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="h-10 border-neutral-200 text-[13px] placeholder:text-neutral-400 focus-visible:ring-primary"
            required
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[12px] font-medium text-neutral-600">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-[12px] text-neutral-500 hover:text-neutral-700"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="h-10 border-neutral-200 text-[13px] placeholder:text-neutral-400 focus-visible:ring-primary"
            required
          />
        </div>
        <Button 
          type="submit" 
          disabled={pending}
          className="w-full h-10 bg-neutral-900 text-[13px] font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-[12px] text-neutral-500">
        No account?{" "}
        <Link href="/signup" className="text-neutral-900 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
