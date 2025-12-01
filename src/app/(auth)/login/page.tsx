"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/app");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-medium text-neutral-900">Welcome back</h1>
        <p className="mt-1 text-[13px] text-neutral-500">
          Sign in to your account
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
            type="password"
            placeholder="••••••••"
            className="h-10 border-neutral-200 text-[13px] placeholder:text-neutral-400 focus-visible:ring-primary"
            required
          />
        </div>
        <Button type="submit" className="w-full h-10 bg-neutral-900 text-[13px] font-medium hover:bg-neutral-800">
          Sign in
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[11px] text-neutral-400">or</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          onClick={() => router.push("/app")}
          className="h-10 border-neutral-200 text-[13px] font-normal text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
        >
          Google
        </Button>
        <Button 
          variant="outline" 
          onClick={() => router.push("/app")}
          className="h-10 border-neutral-200 text-[13px] font-normal text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
        >
          GitHub
        </Button>
      </div>

      <p className="text-center text-[12px] text-neutral-500">
        No account?{" "}
        <Link href="/signup" className="text-neutral-900 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
