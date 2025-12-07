"use client";

import { useState, useTransition } from "react";
import { Copy, Check, Eye, EyeOff, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ApiKeyActionState } from "@/lib/actions/api-keys";

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
  permissions: string[];
  requestCount: number;
  botId?: string;
  revokeAction: () => Promise<void>;
}

interface ApiKeysListProps {
  apiKeys: ApiKey[];
  createAction: (state: ApiKeyActionState, formData: FormData) => Promise<ApiKeyActionState>;
  className?: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ApiKeysList({ apiKeys, createAction, className }: ApiKeysListProps) {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [createState, setCreateState] = useState<ApiKeyActionState>({});
  const [isPending, startTransition] = useTransition();

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

  const handleCreate = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createAction({}, formData);
      setCreateState(result);
    });
  };

  const handleDialogChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setCreateState({});
    }
  };

  return (
    <div className={cn("rounded-xl border border-neutral-100 bg-white shadow-soft", className)}>
      <div className="flex items-center justify-between p-4 border-b border-neutral-50">
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
          API Keys
        </p>
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-7 bg-neutral-900 text-[11px] hover:bg-neutral-800">
              <Plus className="mr-1 h-3 w-3" strokeWidth={1.5} />
              New key
            </Button>
          </DialogTrigger>
          {open && (
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base">Create API key</DialogTitle>
              </DialogHeader>
              <form action={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-[12px] text-neutral-600">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Production key"
                    required
                    className="h-9 text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="permissions" className="text-[12px] text-neutral-600">
                    Permissions
                  </Label>
                  <Input
                    id="permissions"
                    name="permissions"
                    defaultValue="read,write"
                    className="h-9 text-[13px]"
                  />
                  <p className="text-[11px] text-neutral-400">
                    Comma separated (e.g. read,write,execute)
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expiresAt" className="text-[12px] text-neutral-600">
                    Expires
                  </Label>
                  <Input
                    id="expiresAt"
                    name="expiresAt"
                    type="date"
                    className="h-9 text-[13px]"
                  />
                </div>
                {createState.error && (
                  <p className="text-[12px] text-red-500">{createState.error}</p>
                )}
                {createState.plainKey && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">
                    Copy your new key now. It will not be shown again:
                    <div className="mt-1 font-mono text-[11px] break-all">{createState.plainKey}</div>
                  </div>
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
                    {isPending ? "Creating..." : "Create key"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          )}
        </Dialog>
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
                    type="button"
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
                    type="button"
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
                  <form action={apiKey.revokeAction}>
                    <DropdownMenuItem asChild className="text-red-600">
                      <button type="submit" className="w-full text-left">
                        Revoke
                      </button>
                    </DropdownMenuItem>
                  </form>
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
