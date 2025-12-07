"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupAction, AuthState } from "@/lib/actions/auth";

const initialState: AuthState = {};

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-medium text-neutral-900">Create account</h1>
        <p className="mt-1 text-[13px] text-neutral-500">
          Get started with Pilot
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-600">
            {state.error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-[12px] font-medium text-neutral-600">
              First name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Jane"
              className="h-10 border-neutral-200 text-[13px] placeholder:text-neutral-400 focus-visible:ring-primary"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-[12px] font-medium text-neutral-600">
              Last name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Doe"
              className="h-10 border-neutral-200 text-[13px] placeholder:text-neutral-400 focus-visible:ring-primary"
              required
            />
          </div>
        </div>
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
          <Label htmlFor="password" className="text-[12px] font-medium text-neutral-600">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="h-10 border-neutral-200 text-[13px] placeholder:text-neutral-400 focus-visible:ring-primary"
            required
            minLength={8}
          />
          <p className="text-[11px] text-neutral-400">Minimum 8 characters</p>
        </div>
        <Button 
          type="submit" 
          disabled={pending}
          className="w-full h-10 bg-neutral-900 text-[13px] font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-center text-[12px] text-neutral-500">
        Have an account?{" "}
        <Link href="/login" className="text-neutral-900 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
