"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
          <Check className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-medium text-neutral-900">Check your email</h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            We sent a reset link to your email
          </p>
        </div>
        <Button asChild className="w-full h-10 bg-neutral-900 text-[13px] font-medium hover:bg-neutral-800">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/login"
        className="inline-flex items-center text-[12px] text-neutral-500 hover:text-neutral-700"
      >
        <ArrowLeft className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
        Back
      </Link>

      <div>
        <h1 className="text-xl font-medium text-neutral-900">Reset password</h1>
        <p className="mt-1 text-[13px] text-neutral-500">
          Enter your email to receive a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[12px] font-medium text-neutral-600">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="h-10 border-neutral-200 text-[13px] placeholder:text-neutral-400 focus-visible:ring-primary"
            required
          />
        </div>
        <Button type="submit" className="w-full h-10 bg-neutral-900 text-[13px] font-medium hover:bg-neutral-800">
          Send reset link
        </Button>
      </form>
    </div>
  );
}
