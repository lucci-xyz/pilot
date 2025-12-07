"use client";

import { cn } from "@/lib/utils";

export interface Vault {
  id: string;
  name: string;
  balance: number;
  limit: number;
  currency: string;
  lastFourDigits: string;
  expiryDate: string;
  type: "credit" | "debit" | "virtual";
}

export interface Budget {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  currency: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
}

interface VaultCardProps {
  vault: Vault;
  budget?: Budget;
  className?: string;
}

export function VaultCard({ vault, budget, className }: VaultCardProps) {
  const usagePercent = budget ? Math.round((budget.spent / budget.allocated) * 100) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: vault.currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={cn("rounded-xl border border-neutral-100 bg-white p-5 shadow-soft", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Balance
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
            {formatCurrency(vault.balance)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[11px] text-neutral-400">
            •••• {vault.lastFourDigits}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-neutral-400">
            {vault.expiryDate}
          </p>
        </div>
      </div>

      {budget && (
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-neutral-500">Budget used</span>
            <span className="font-medium text-neutral-700">
              {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                usagePercent > 90 ? "bg-red-500" :
                usagePercent > 75 ? "bg-amber-400" : "bg-primary"
              )}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
