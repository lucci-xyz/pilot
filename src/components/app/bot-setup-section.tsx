"use client";

import { Button } from "@/components/ui/button";
import { CodeTabs, getBotSetupCode } from "@/components/app/code-tabs";

interface BotSetupSectionProps {
  botId: string;
  webhookUrl?: string;
}

export function BotSetupSection({ botId, webhookUrl }: BotSetupSectionProps) {
  const setupCode = getBotSetupCode(botId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-3">
          Integration
        </p>
        <CodeTabs tabs={setupCode} />
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
          Webhook
        </p>
        <div className="mt-3 flex items-center gap-3">
          <code className="flex-1 rounded-lg bg-neutral-50 px-3 py-2 text-[12px] font-mono text-neutral-600">
            {webhookUrl || "Not configured"}
          </code>
          <Button variant="outline" size="sm" className="h-8 text-[12px]">
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
