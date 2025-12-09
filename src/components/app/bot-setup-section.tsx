"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CodeTabs, getBotSetupCode } from "@/components/app/code-tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/agents";

interface BotSetupSectionProps {
  botId: string;
  webhookUrl?: string;
  webhookAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
}

export function BotSetupSection({ botId, webhookUrl, webhookAction }: BotSetupSectionProps) {
  const setupCode = getBotSetupCode(botId);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await webhookAction({}, formData);
      setState(result);
      if (result.success) {
        setOpen(false);
        setState({});
      }
    });
  };

  const handleDialogChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setState({});
    }
  };

  const [codeDialogOpen, setCodeDialogOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Integration Code - Compact */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Integration</p>
          <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-[11px] text-neutral-600">
                View Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base">Integration Setup</DialogTitle>
              </DialogHeader>
              <div className="overflow-x-auto text-[12px] [&_pre]:text-[12px] [&_pre]:leading-relaxed [&_code]:text-[12px]">
                <CodeTabs tabs={setupCode} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-[11px] text-neutral-600 mb-1.5">API Endpoint</p>
          <code className="block rounded bg-white px-2.5 py-1.5 text-[11px] font-mono text-neutral-700 border border-neutral-200 break-all">
            POST /api/agents/{botId}/x402-call
          </code>
        </div>
      </div>

      {/* Webhook - Compact */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-2">
          Webhook
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-neutral-50 border border-neutral-200 px-2.5 py-1.5 text-[11px] font-mono text-neutral-600 truncate">
            {webhookUrl || "Not configured"}
          </code>
          <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-[11px]">
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base">Webhook URL</DialogTitle>
              </DialogHeader>
              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="webhookUrl" className="text-[12px] text-neutral-600">
                    URL
                  </Label>
                  <Input
                    id="webhookUrl"
                    name="webhookUrl"
                    placeholder="https://example.com/webhook"
                    defaultValue={webhookUrl ?? ""}
                    className="h-9 text-[13px]"
                  />
                  <p className="text-[11px] text-neutral-400">
                    Leave empty to remove the webhook.
                  </p>
                </div>
                {state.error && (
                  <p className="text-[12px] text-red-500">{state.error}</p>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 text-[12px]"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-8 bg-neutral-900 text-[12px] hover:bg-neutral-800"
                    disabled={isPending}
                  >
                    {isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
