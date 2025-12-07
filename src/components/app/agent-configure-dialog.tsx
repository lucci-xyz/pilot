"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/agents";

interface AgentConfigureDialogProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues: {
    name: string;
    provider?: string | null;
  };
}

export function AgentConfigureDialog({ action, defaultValues }: AgentConfigureDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await action({}, formData);
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

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 bg-neutral-900 text-[12px] hover:bg-neutral-800">
          Configure
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Configure agent</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[12px] text-neutral-600">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={defaultValues.name}
              required
              className="h-9 text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="provider" className="text-[12px] text-neutral-600">
              Provider
            </Label>
            <select
              id="provider"
              name="provider"
              defaultValue={defaultValues.provider ?? ""}
              className="h-9 w-full min-w-0 rounded-md border border-neutral-200 bg-white px-3 text-[13px] text-neutral-800 shadow-xs focus-visible:border-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-900/40"
            >
              <option value="">Select provider (optional)</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="custom">Custom</option>
            </select>
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
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

