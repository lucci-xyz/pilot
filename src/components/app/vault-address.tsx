"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Droplets, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FundWalletDialog } from "@/components/app/fund-wallet-dialog";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { useSplTokenBalance } from "@/hooks/use-spl-token-balance";
import { cn } from "@/lib/utils";

const TOKEN_OPTIONS = [
  { symbol: "SOL", label: "SOL", kind: "native" as const, decimals: 9 },
  { symbol: "USDC-DEV", label: "USDC-Dev", kind: "spl" as const, mint: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr", decimals: 6 },
  { symbol: "USDC", label: "USDC", kind: "spl" as const, mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", decimals: 6 },
] as const;

type VaultAddressProps = {
  address?: string | null;
  walletName?: string;
  className?: string;
  cluster?: "devnet" | "mainnet-beta";
};

export function VaultAddress({
  address,
  walletName = "Wallet",
  className,
  cluster = "devnet",
}: VaultAddressProps) {
  const [copied, setCopied] = useState(false);
  const { balance, isLoading, refetch } = useWalletBalance(address);
  const { balance: usdcDevBalance, refetch: refetchUsdcDev } = useSplTokenBalance(
    address ?? null,
    TOKEN_OPTIONS[1].mint,
    TOKEN_OPTIONS[1].decimals
  );
  const { balance: usdcBalance, refetch: refetchUsdc } = useSplTokenBalance(
    address ?? null,
    TOKEN_OPTIONS[2].mint,
    TOKEN_OPTIONS[2].decimals
  );

  if (!address) return null;

  const clusterLabel = cluster === "mainnet-beta" ? "Mainnet" : "Devnet";
  const explorerUrl = `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
  const faucetUrl = `https://faucet.solana.com/?address=${address}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy address", error);
    }
  };

  const handleFundSuccess = () => {
    // Refetch balance after successful funding
    refetch();
    refetchUsdcDev();
    refetchUsdc();
  };

  const tokenBalances = [
    { label: "SOL", value: balance, isLoading },
    { label: "USDC-Dev", value: usdcDevBalance, isLoading: false },
    { label: "USDC", value: usdcBalance, isLoading: false },
  ];

  const [balancesDialogOpen, setBalancesDialogOpen] = useState(false);

  return (
    <div className={cn("rounded-xl border border-neutral-100 bg-white p-4 shadow-soft", className)}>
      <div className="space-y-3">
        {/* Address info */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Wallet address
            </p>
            <button
              onClick={handleCopy}
              className="flex h-5 w-5 items-center justify-center rounded hover:bg-neutral-100 transition-colors"
              aria-label="Copy vault address"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-600" strokeWidth={2} />
              ) : (
                <Copy className="h-3 w-3 text-neutral-400 hover:text-neutral-600" strokeWidth={1.5} />
              )}
            </button>
          </div>
          <p className="mt-1 font-mono text-[12px] text-neutral-900 break-all">{address}</p>
          <p className="text-[12px] text-neutral-500">Solana • {clusterLabel}</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {/* View Balances Dialog */}
          <Dialog open={balancesDialogOpen} onOpenChange={setBalancesDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-[12px]"
                aria-label="View token balances"
              >
                <Wallet className="h-3.5 w-3.5" strokeWidth={1.5} />
                Balances
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base">Token Balances</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-3">
                  {tokenBalances.map((t) => (
                    <div
                      key={t.label}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3"
                    >
                      <span className="text-[13px] font-medium text-neutral-700">{t.label}</span>
                      <span className="text-[15px] font-semibold text-neutral-900">
                        {t.isLoading ? "..." : t.value !== null ? t.value.toFixed(4) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Funding Actions */}
                <div className="border-t border-neutral-100 pt-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-3">
                    Fund Wallet
                  </p>
                  <div className="flex gap-2">
                    <FundWalletDialog
                      walletAddress={address}
                      walletOwnerName={walletName}
                      onSuccess={handleFundSuccess}
                    >
                      <Button className="flex-1 h-9 bg-neutral-900 text-[12px] hover:bg-neutral-800">
                        <Wallet className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Fund Wallet
                      </Button>
                    </FundWalletDialog>
                    
                    {cluster === "devnet" && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 text-[12px]"
                        aria-label="Get devnet SOL from faucet"
                      >
                        <a href={faucetUrl} target="_blank" rel="noreferrer">
                          <Droplets className="h-3.5 w-3.5" strokeWidth={1.5} />
                          SOL Faucet
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 px-3 text-[12px]"
            aria-label="View vault in Solana Explorer"
          >
            <a href={explorerUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
              Explorer
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
