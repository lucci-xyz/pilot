"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/agents";

interface AgentBudgetDialogProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaults: {
    dailyLimit: number;
    perTxLimit: number;
    monthlyLimit?: number | null;
  };
}

export function AgentBudgetDialog({ action, defaults }: AgentBudgetDialogProps) {
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
        <Button size="sm" className="h-8 text-[12px]">
          Adjust limits
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Adjust budget limits</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dailyLimit" className="text-[12px] text-neutral-600">
              Daily limit (USD)
            </Label>
            <Input
              id="dailyLimit"
              name="dailyLimit"
              type="number"
              step="0.01"
              defaultValue={defaults.dailyLimit}
              required
              className="h-9 text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="perTxLimit" className="text-[12px] text-neutral-600">
              Per transaction limit (USD)
            </Label>
            <Input
              id="perTxLimit"
              name="perTxLimit"
              type="number"
              step="0.01"
              defaultValue={defaults.perTxLimit}
              required
              className="h-9 text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="monthlyLimit" className="text-[12px] text-neutral-600">
              Monthly limit (USD)
            </Label>
            <Input
              id="monthlyLimit"
              name="monthlyLimit"
              type="number"
              step="0.01"
              placeholder="No limit"
              defaultValue={defaults.monthlyLimit ?? ""}
              className="h-9 text-[13px]"
            />
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
              {isPending ? "Saving..." : "Save limits"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

