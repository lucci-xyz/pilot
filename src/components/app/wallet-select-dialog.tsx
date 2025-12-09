"use client";

import { useState, useCallback, useEffect } from "react";
import { useWallet, type Wallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { Wallet as WalletIcon, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type WalletSelectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Get wallet icon URL or use fallback
function getWalletIcon(wallet: Wallet): string | null {
  try {
    return wallet.adapter.icon;
  } catch {
    return null;
  }
}

// Check if wallet is installed/available
function isWalletInstalled(wallet: Wallet): boolean {
  return (
    wallet.readyState === WalletReadyState.Installed ||
    wallet.readyState === WalletReadyState.Loadable
  );
}

export function WalletSelectDialog({ open, onOpenChange }: WalletSelectDialogProps) {
  const { wallets, select, connecting, connected } = useWallet();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Close dialog when connected
  useEffect(() => {
    if (connected && open) {
      onOpenChange(false);
      setConnectingWallet(null);
      setError(null);
    }
  }, [connected, open, onOpenChange]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setConnectingWallet(null);
      setError(null);
    }
  }, [open]);

  const handleSelectWallet = useCallback(
    async (wallet: Wallet) => {
      setError(null);
      setConnectingWallet(wallet.adapter.name);
      
      try {
        select(wallet.adapter.name);
        // The wallet adapter will handle the connection
        // and the useEffect above will close the dialog when connected
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to connect");
        setConnectingWallet(null);
      }
    },
    [select]
  );

  // Separate installed and not-installed wallets
  const installedWallets = wallets.filter(isWalletInstalled);
  const notInstalledWallets = wallets.filter((w) => !isWalletInstalled(w));

  const hasWallets = installedWallets.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Connect wallet</DialogTitle>
          <DialogDescription className="text-[13px]">
            Select a Solana wallet to connect.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-[12px] text-red-700">{error}</p>
            </div>
          )}

          {hasWallets ? (
            <div className="space-y-1.5">
              {installedWallets.map((wallet) => {
                const icon = getWalletIcon(wallet);
                const isConnecting = connectingWallet === wallet.adapter.name;

                return (
                  <button
                    key={wallet.adapter.name}
                    onClick={() => handleSelectWallet(wallet)}
                    disabled={connecting}
                    className="flex w-full items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 text-left transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {icon ? (
                      <img
                        src={icon}
                        alt={wallet.adapter.name}
                        className="h-8 w-8 rounded-lg"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
                        <WalletIcon className="h-4 w-4 text-neutral-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-neutral-900">
                        {wallet.adapter.name}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {wallet.readyState === WalletReadyState.Installed
                          ? "Detected"
                          : "Available"}
                      </p>
                    </div>
                    {isConnecting && (
                      <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200">
                <WalletIcon className="h-5 w-5 text-neutral-500" />
              </div>
              <p className="text-[13px] font-medium text-neutral-700">
                No wallets found
              </p>
              <p className="mt-1 text-[12px] text-neutral-500">
                Install a Solana wallet extension to continue.
              </p>
              <div className="mt-4 space-y-2">
                <a
                  href="https://phantom.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-[12px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Get Phantom
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://solflare.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-[12px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Get Solflare
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {/* Show other available wallets that aren't installed */}
          {hasWallets && notInstalledWallets.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer list-none text-center text-[11px] text-neutral-400 hover:text-neutral-600">
                <span className="group-open:hidden">
                  + {notInstalledWallets.length} more wallets
                </span>
                <span className="hidden group-open:inline">Show less</span>
              </summary>
              <div className="mt-2 space-y-1.5">
                {notInstalledWallets.slice(0, 5).map((wallet) => {
                  const icon = getWalletIcon(wallet);
                  return (
                    <a
                      key={wallet.adapter.name}
                      href={wallet.adapter.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 p-2.5 text-left opacity-60 transition-colors hover:bg-neutral-50 hover:opacity-100"
                    >
                      {icon ? (
                        <img
                          src={icon}
                          alt={wallet.adapter.name}
                          className="h-6 w-6 rounded-md grayscale"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-100">
                          <WalletIcon className="h-3 w-3 text-neutral-400" />
                        </div>
                      )}
                      <span className="flex-1 text-[12px] text-neutral-600">
                        {wallet.adapter.name}
                      </span>
                      <ExternalLink className="h-3 w-3 text-neutral-400" />
                    </a>
                  );
                })}
              </div>
            </details>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

