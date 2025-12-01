"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeTabsProps {
  tabs: {
    id: string;
    label: string;
    code: string;
  }[];
  className?: string;
}

export function CodeTabs({ tabs, className }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);
  const [copied, setCopied] = useState(false);

  const activeCode = tabs.find((t) => t.id === activeTab)?.code || "";

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("rounded-xl border border-neutral-100 bg-white shadow-soft overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-neutral-50 px-1 py-1">
        <div className="flex gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={copyToClipboard}
          className="mr-1 rounded-md p-1.5 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.5} />
          ) : (
            <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed text-neutral-700">
        <code>{activeCode}</code>
      </pre>
    </div>
  );
}

export function getBotSetupCode(botId: string, apiKey: string = "YOUR_API_KEY") {
  return [
    {
      id: "nextjs",
      label: "Next.js",
      code: `import { NextResponse } from "next/server";

const BOT_ID = "${botId}";

export async function POST(request: Request) {
  const body = await request.json();
  
  const response = await fetch(
    \`https://api.pilot.dev/v1/bots/\${BOT_ID}/invoke\`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${process.env.PILOT_API_KEY}\`,
      },
      body: JSON.stringify({ input: body.message }),
    }
  );

  return NextResponse.json(await response.json());
}`,
    },
    {
      id: "curl",
      label: "cURL",
      code: `curl -X POST https://api.pilot.dev/v1/bots/${botId}/invoke \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{"input": "Your message"}'`,
    },
    {
      id: "env",
      label: "Env",
      code: `PILOT_API_KEY=${apiKey}
PILOT_BOT_ID=${botId}`,
    },
  ];
}
