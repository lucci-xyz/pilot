"use client";

import { useState } from "react";
import { Copy, Check, Eye, EyeOff, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ApiKey } from "@/lib/dummy-data/types";

interface ApiKeysListProps {
  apiKeys: ApiKey[];
  className?: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ApiKeysList({ apiKeys, className }: ApiKeysListProps) {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const copyKey = async (key: string, keyId: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className={cn("rounded-xl border border-neutral-100 bg-white shadow-soft", className)}>
      <div className="flex items-center justify-between p-4 border-b border-neutral-50">
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
          API Keys
        </p>
        <Button size="sm" className="h-7 bg-neutral-900 text-[11px] hover:bg-neutral-800">
          <Plus className="mr-1 h-3 w-3" strokeWidth={1.5} />
          New key
        </Button>
      </div>
      <div className="divide-y divide-neutral-50">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-medium text-neutral-900">{apiKey.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="text-[11px] font-mono text-neutral-500">
                    {visibleKeys.has(apiKey.id) ? apiKey.key : "••••••••••••••••"}
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    {visibleKeys.has(apiKey.id) ? (
                      <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                  <button
                    onClick={() => copyKey(apiKey.key, apiKey.id)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    {copiedKey === apiKey.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.5} />
                    ) : (
                      <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-[12px]">
                  <DropdownMenuItem onClick={() => copyKey(apiKey.key, apiKey.id)}>
                    Copy
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Revoke
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-2 flex gap-4 text-[11px] text-neutral-400">
              <span>Created {formatDate(apiKey.createdAt)}</span>
              {apiKey.lastUsed && <span>Used {formatDate(apiKey.lastUsed)}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
