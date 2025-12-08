"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FundWalletDialog } from "@/components/app/fund-wallet-dialog";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { cn } from "@/lib/utils";

type VaultAddressProps = {
  address?: string | null;
  projectName?: string;
  className?: string;
  cluster?: "devnet" | "mainnet-beta";
};

export function VaultAddress({
  address,
  projectName = "Project",
  className,
  cluster = "devnet",
}: VaultAddressProps) {
  const [copied, setCopied] = useState(false);
  const { balance, isLoading, refetch } = useWalletBalance(address);

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
  };

  return (
    <div className={cn("rounded-xl border border-neutral-100 bg-white p-4 shadow-soft", className)}>
      <div className="space-y-4">
        {/* Address and balance info */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Vault address
            </p>
            <p className="mt-1 font-mono text-[12px] text-neutral-900 break-all">{address}</p>
            <p className="text-[12px] text-neutral-500">Solana • {clusterLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              SOL Balance
            </p>
            <p className="mt-1 text-[15px] font-semibold text-neutral-900">
              {isLoading ? "..." : balance !== null ? `${balance.toFixed(4)} SOL` : "—"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-3 text-[12px]"
            aria-label="Copy vault address"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                Copy
              </>
            )}
          </Button>
          
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

          {/* Fund wallet button - opens dialog */}
          <FundWalletDialog
            projectWalletAddress={address}
            projectName={projectName}
            onSuccess={handleFundSuccess}
          />

          {/* Devnet faucet shortcut */}
          {cluster === "devnet" && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 px-3 text-[12px]"
              aria-label="Get devnet SOL from faucet"
            >
              <a href={faucetUrl} target="_blank" rel="noreferrer">
                <Droplets className="h-3.5 w-3.5" strokeWidth={1.5} />
                Faucet
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
