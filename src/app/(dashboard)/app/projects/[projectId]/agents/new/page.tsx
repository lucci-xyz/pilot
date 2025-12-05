"use client";

import { use } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAgentAction, ActionState } from "@/lib/actions/projects";

const initialState: ActionState = {};

interface NewAgentPageProps {
  params: Promise<{ projectId: string }>;
}

export default function NewAgentPage({ params }: NewAgentPageProps) {
  const { projectId } = use(params);
  const boundAction = createAgentAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <>
      <AppHeader title="New Agent" />
      <main className="flex-1 overflow-auto bg-neutral-50/50">
        <div className="mx-auto max-w-xl space-y-6 p-6">
          <Link
            href={`/app/projects/${projectId}`}
            className="inline-flex items-center text-[12px] text-neutral-500 hover:text-neutral-700"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
            Back to Project
          </Link>

          <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-medium text-neutral-900">Create a new agent</h2>
            <p className="mt-1 text-[13px] text-neutral-500">
              Agents are AI models that can spend from your project&apos;s budget.
            </p>

            <form action={formAction} className="mt-6 space-y-4">
              {state.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-600">
                  {state.error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[12px] font-medium text-neutral-600">
                  Agent name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Customer Support Bot"
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
                  placeholder="What does this agent do?"
                  className="h-10 text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="provider" className="text-[12px] font-medium text-neutral-600">
                    Provider
                  </Label>
                  <Input
                    id="provider"
                    name="provider"
                    placeholder="e.g., openai"
                    className="h-10 text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="model" className="text-[12px] font-medium text-neutral-600">
                    Model
                  </Label>
                  <Input
                    id="model"
                    name="model"
                    placeholder="e.g., gpt-4o"
                    className="h-10 text-[13px]"
                  />
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4 mt-4">
                <p className="text-[12px] font-medium text-neutral-600 mb-3">Budget limits</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dailyLimit" className="text-[12px] font-medium text-neutral-600">
                      Daily limit (USD)
                    </Label>
                    <Input
                      id="dailyLimit"
                      name="dailyLimit"
                      type="number"
                      step="0.01"
                      defaultValue="100"
                      className="h-10 text-[13px]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="perTxLimit" className="text-[12px] font-medium text-neutral-600">
                      Per transaction (USD)
                    </Label>
                    <Input
                      id="perTxLimit"
                      name="perTxLimit"
                      type="number"
                      step="0.01"
                      defaultValue="10"
                      className="h-10 text-[13px]"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="monthlyLimit" className="text-[12px] font-medium text-neutral-600">
                    Monthly limit (USD) <span className="text-neutral-400">(optional)</span>
                  </Label>
                  <Input
                    id="monthlyLimit"
                    name="monthlyLimit"
                    type="number"
                    step="0.01"
                    placeholder="No limit"
                    className="h-10 text-[13px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Link href={`/app/projects/${projectId}`}>
                  <Button variant="outline" type="button" className="h-9 text-[12px]">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={pending}
                  className="h-9 bg-neutral-900 text-[12px] hover:bg-neutral-800"
                >
                  {pending ? "Creating..." : "Create agent"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

