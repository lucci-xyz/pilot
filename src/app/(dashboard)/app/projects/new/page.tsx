"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProjectAction, ActionState } from "@/lib/actions/projects";

const initialState: ActionState = {};

export default function NewProjectPage() {
  const [state, formAction, pending] = useActionState(createProjectAction, initialState);

  return (
    <>
      <AppHeader title="New Project" />
      <main className="flex-1 overflow-auto bg-neutral-50/50">
        <div className="mx-auto max-w-xl space-y-6 p-6">
          <Link
            href="/app"
            className="inline-flex items-center text-[12px] text-neutral-500 hover:text-neutral-700"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
            Back to Overview
          </Link>

          <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-medium text-neutral-900">Create a new project</h2>
            <p className="mt-1 text-[13px] text-neutral-500">
              Projects help you organize your AI agents and manage their budgets.
            </p>

            <form action={formAction} className="mt-6 space-y-4">
              {state.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-600">
                  {state.error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[12px] font-medium text-neutral-600">
                  Project name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Customer Support Bots"
                  className="h-10 text-[13px]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-[12px] font-medium text-neutral-600">
                  Description <span className="text-neutral-400">(optional)</span>
                </Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="What will this project be used for?"
                  className="h-10 text-[13px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Link href="/app">
                  <Button variant="outline" type="button" className="h-9 text-[12px]">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={pending}
                  className="h-9 bg-neutral-900 text-[12px] hover:bg-neutral-800"
                >
                  {pending ? "Creating..." : "Create project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

