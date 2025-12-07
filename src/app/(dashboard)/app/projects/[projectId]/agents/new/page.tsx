"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAgentAction, ActionState } from "@/lib/actions/projects";
import { cn } from "@/lib/utils";

const initialState: ActionState = {};

interface NewAgentPageProps {
  params: Promise<{ projectId: string }>;
}

export default function NewAgentPage({ params }: NewAgentPageProps) {
  const { projectId } = use(params);
  const boundAction = createAgentAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [step, setStep] = useState<"details" | "budget">("details");
  const [dailyLimit, setDailyLimit] = useState("100");
  const [perTxLimit, setPerTxLimit] = useState("10");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [monthlyCapEnabled, setMonthlyCapEnabled] = useState(true);
  const [presetId, setPresetId] = useState<"safe" | "balanced" | "aggressive">("balanced");

  const presets = {
    safe: { daily: "50", perTx: "10", monthly: "200", monthlyCapEnabled: true, label: "Safe" },
    balanced: { daily: "100", perTx: "25", monthly: "500", monthlyCapEnabled: true, label: "Balanced" },
    aggressive: { daily: "250", perTx: "50", monthly: "", monthlyCapEnabled: false, label: "Aggressive" },
  } as const;

  const applyPreset = (id: "safe" | "balanced" | "aggressive") => {
    const p = presets[id];
    setPresetId(id);
    setDailyLimit(p.daily);
    setPerTxLimit(p.perTx);
    setMonthlyLimit(p.monthly);
    setMonthlyCapEnabled(p.monthlyCapEnabled);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (step === "details") {
      e.preventDefault();
      setStep("budget");
      return;
    }
    // allow submit on budget step
  };

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
            <h2 className="text-lg font-medium text-neutral-900">
              {step === "details" ? "Create a new agent" : "Create agent budget"}
            </h2>
            <p className="mt-1 text-[13px] text-neutral-500">
              {step === "details"
                ? "Define the agent details. You can optionally set a provider."
                : "Set spend limits so the agent can use your project budget safely."}
            </p>

            <form action={formAction} onSubmit={handleSubmit} className="mt-6 space-y-4">
              {state.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-600">
                  {state.error}
                </div>
              )}

              <div className="relative overflow-hidden">
                <div
                  className={`space-y-4 transition-all duration-300 ${
                    step === "details" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 absolute inset-0 pointer-events-none"
                  }`}
                >
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
                  <Label htmlFor="provider" className="text-[12px] font-medium text-neutral-600">
                      Provider <span className="text-neutral-400">(optional)</span>
                  </Label>
                    <select
                    id="provider"
                    name="provider"
                      defaultValue=""
                      className="h-10 w-full min-w-0 rounded-md border border-neutral-200 bg-white px-3 text-[13px] text-neutral-800 shadow-xs focus-visible:border-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-900/40"
                    >
                      <option value="">Select provider (optional)</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="custom">Custom</option>
                    </select>
                </div>
                </div>

                <div
                  className={`space-y-4 transition-all duration-300 ${
                    step === "budget" ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute inset-0 pointer-events-none"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={mode === "simple" ? "default" : "outline"}
                        size="sm"
                        className="h-8 text-[13px]"
                        onClick={() => setMode("simple")}
                      >
                        Simple
                      </Button>
                      <Button
                        type="button"
                        variant={mode === "advanced" ? "default" : "outline"}
                        size="sm"
                        className="h-8 text-[13px]"
                        onClick={() => setMode("advanced")}
                      >
                        Advanced
                      </Button>
              </div>

                    {mode === "simple" ? (
                      <div className="grid gap-3 sm:grid-cols-3">
                        {(["safe", "balanced", "aggressive"] as const).map((id) => {
                          const p = presets[id];
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => applyPreset(id)}
                              className={cn(
                                "w-full rounded-lg border p-3 text-left transition hover:border-neutral-300",
                                presetId === id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 bg-white"
                              )}
                            >
                              <div className="space-y-1">
                                <p className="text-[14px] font-semibold text-neutral-900">{p.label}</p>
                                <div className="space-y-0.5 text-[13px] text-neutral-700 leading-5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-neutral-500">Per-transaction</span>
                                    <span className="font-semibold">${p.perTx}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-neutral-500">Daily cap</span>
                                    <span className="font-semibold">${p.daily}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-neutral-500">Monthly cap</span>
                                    <span className="font-semibold">
                                      {p.monthlyCapEnabled ? `$${p.monthly}` : "No cap"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <p className="text-[13px] font-medium text-neutral-700">Daily max</p>
                            <span className="text-[13px] font-semibold text-neutral-900">${dailyLimit || "0"}</span>
                          </div>
                          <input
                            type="range"
                      name="dailyLimit"
                            min={0}
                            max={1000}
                            step={5}
                            value={Number(dailyLimit || 0)}
                            onChange={(e) => setDailyLimit(e.target.value)}
                            className="w-full accent-neutral-900 h-2"
                          />
                          <div className="flex flex-wrap gap-2 text-[12px]">
                            {[25, 50, 100, 200].map((preset) => (
                              <Button
                                key={preset}
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-[11px]"
                                onClick={() => setDailyLimit(preset.toString())}
                              >
                                ${preset}
                              </Button>
                            ))}
                          </div>
                          <p className="text-[13px] text-neutral-500">Quick presets for daily cap.</p>
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <p className="text-[13px] font-medium text-neutral-700">Per-transaction max</p>
                            <span className="text-[13px] font-semibold text-neutral-900">${perTxLimit || "0"}</span>
                  </div>
                          <input
                            type="range"
                      name="perTxLimit"
                            min={0}
                            max={200}
                            step={1}
                            value={Number(perTxLimit || 0)}
                            onChange={(e) => setPerTxLimit(e.target.value)}
                            className="w-full accent-neutral-900 h-2"
                          />
                          <div className="flex flex-wrap gap-2 text-[12px]">
                            {[1, 5, 10, 20].map((preset) => (
                              <Button
                                key={preset}
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-[11px]"
                                onClick={() => setPerTxLimit(preset.toString())}
                              >
                                ${preset}
                              </Button>
                            ))}
                          </div>
                          <p className="text-[13px] text-neutral-500">Good for small, frequent calls.</p>
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3">
                            <p className="text-[13px] font-medium text-neutral-700">Monthly cap (optional)</p>
                            <Button
                              type="button"
                              variant={monthlyCapEnabled ? "default" : "outline"}
                              size="sm"
                              className="h-8 text-[12px]"
                              onClick={() =>
                                setMonthlyCapEnabled((v) => {
                                  const next = !v;
                                  if (!next) setMonthlyLimit("");
                                  return next;
                                })
                              }
                            >
                              {monthlyCapEnabled ? "Set cap" : "No limit"}
                            </Button>
                          </div>
                          {monthlyCapEnabled ? (
                            <>
                              <div className="flex items-center justify-between">
                                <p className="text-[13px] text-neutral-700">Monthly limit</p>
                                <span className="text-[13px] font-semibold text-neutral-900">${monthlyLimit || "0"}</span>
                              </div>
                              <input
                                type="range"
                                name="monthlyLimit"
                                min={0}
                                max={5000}
                                step={50}
                                value={Number(monthlyLimit || 0)}
                                onChange={(e) => setMonthlyLimit(e.target.value)}
                                className="w-full accent-neutral-900 h-2"
                              />
                              <div className="flex flex-wrap gap-2 text-[12px]">
                                {[200, 500, 1000, 2000].map((preset) => (
                                  <Button
                                    key={preset}
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2.5 text-[11px]"
                                    onClick={() => setMonthlyLimit(preset.toString())}
                                  >
                                    ${preset}
                                  </Button>
                                ))}
                              </div>
                              <p className="text-[13px] text-neutral-500">Use if you need a hard monthly ceiling.</p>
                            </>
                          ) : (
                            <p className="text-[13px] text-neutral-500">No monthly cap applied.</p>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Hidden inputs to ensure values post with either mode */}
                    <input type="hidden" name="dailyLimit" value={dailyLimit} />
                    <input type="hidden" name="perTxLimit" value={perTxLimit} />
                    <input
                      type="hidden"
                      name="monthlyLimit"
                      value={monthlyCapEnabled ? monthlyLimit : ""}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                {step === "budget" && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    className="h-9 text-[12px]"
                    onClick={() => setStep("details")}
                  >
                    Back
                  </Button>
                )}
                {step === "details" ? (
                  <Button
                    type="submit"
                    disabled={pending}
                    className="h-9 bg-neutral-900 text-[12px] hover:bg-neutral-800"
                  >
                    Next
                  </Button>
                ) : (
                <Button 
                  type="submit" 
                  disabled={pending}
                  className="h-9 bg-neutral-900 text-[12px] hover:bg-neutral-800"
                >
                  {pending ? "Creating..." : "Create agent"}
                </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

