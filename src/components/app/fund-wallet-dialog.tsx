"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Wallet, Loader2, Check, AlertCircle, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFundWallet } from "@/hooks/use-fund-wallet";
import { useSplTokenBalance } from "@/hooks/use-spl-token-balance";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { WalletSelectDialog } from "./wallet-select-dialog";

const TOKEN_OPTIONS = [
  { symbol: "SOL", label: "SOL", kind: "native" as const },
  { symbol: "USDC-DEV", label: "USDC-Dev", kind: "spl" as const, mint: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr", decimals: 6 },
  { symbol: "USDC", label: "USDC", kind: "spl" as const, mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", decimals: 6 },
] as const;

type TokenSymbol = (typeof TOKEN_OPTIONS)[number]["symbol"];

type FundWalletDialogProps = {
  walletAddress: string;
  walletOwnerName: string;
  onSuccess?: () => void;
  children?: React.ReactNode;
};

export function FundWalletDialog({
  walletAddress,
  walletOwnerName,
  onSuccess,
  children,
}: FundWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const [walletSelectOpen, setWalletSelectOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState<TokenSymbol>("SOL");
  
  const { connected, publicKey, disconnect, wallet } = useWallet();
  const { state, fundWallet, fundSplToken, reset } = useFundWallet();
  const { balance: solBalance, refetch: refetchSolBalance } = useWalletBalance(publicKey?.toBase58());
  const {
    balance: usdcDevBalance,
    refetch: refetchUsdcDevBalance,
  } = useSplTokenBalance(publicKey ?? null, TOKEN_OPTIONS[1].mint, TOKEN_OPTIONS[1].decimals);
  const {
    balance: usdcBalance,
    refetch: refetchUsdcBalance,
  } = useSplTokenBalance(publicKey ?? null, TOKEN_OPTIONS[2].mint, TOKEN_OPTIONS[2].decimals);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
      setAmount("");
    }
  }, [open, reset]);

  const selectedToken = TOKEN_OPTIONS.find((t) => t.symbol === tokenSymbol) ?? TOKEN_OPTIONS[0];

  const selectedBalance =
    selectedToken.symbol === "SOL"
      ? solBalance
      : selectedToken.symbol === "USDC-DEV"
        ? usdcDevBalance
        : usdcBalance;

  const handleFund = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    let signature: string | null = null;

    if (selectedToken.kind === "native") {
      signature = await fundWallet(walletAddress, amountNum);
      if (signature) {
        refetchSolBalance();
      }
    } else {
      signature = await fundSplToken(
        walletAddress,
        amountNum,
        selectedToken.mint,
        selectedToken.decimals
      );
      if (signature) {
        if (selectedToken.symbol === "USDC-DEV") {
          refetchUsdcDevBalance();
        } else {
          refetchUsdcBalance();
        }
      }
    }

    if (signature) {
      onSuccess?.();
    }
  };

  const handleConnect = () => {
    setWalletSelectOpen(true);
  };

  const amountNum = parseFloat(amount) || 0;
  const hasInsufficientFunds = selectedBalance !== null && amountNum > selectedBalance;

  // Get wallet icon
  const walletIcon = wallet?.adapter?.icon;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" size="sm" className="h-8 px-3 text-[12px]">
              <Wallet className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
              Fund
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Fund wallet</DialogTitle>
            <DialogDescription className="text-[13px]">
              Transfer {selectedToken.label} from your wallet to {walletOwnerName}&apos;s devnet wallet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Success state */}
            {state.txSignature && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-emerald-800">
                      Transaction successful!
                    </p>
                    <p className="mt-1 text-[12px] text-emerald-700">
                      {amount} {selectedToken.label} has been sent to the wallet.
                    </p>
                    <a
                      href={`https://explorer.solana.com/tx/${state.txSignature}?cluster=devnet`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center text-[12px] text-emerald-700 hover:text-emerald-800"
                    >
                      View transaction
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Error state */}
            {state.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />
                  <div>
                  <p className="text-[13px] font-medium text-red-800">
                      Transaction failed
                    </p>
                    <p className="mt-1 text-[12px] text-red-700">{state.error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Connection state */}
            {!connected ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-[13px] text-neutral-600">
                  Connect your Solana wallet to fund this address.
                </p>
                <Button
                  onClick={handleConnect}
                  className="mt-3 h-9 w-full bg-neutral-900 text-[12px] hover:bg-neutral-800"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <>
                {/* Connected wallet info */}
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {walletIcon ? (
                        <img
                          src={walletIcon}
                          alt={wallet?.adapter?.name || "Wallet"}
                          className="h-6 w-6 rounded-md"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-200">
                          <Wallet className="h-3 w-3 text-neutral-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                          Connected
                        </p>
                        <p className="font-mono text-[12px] text-neutral-700">
                          {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        Balance
                      </p>
                      <p className="text-[13px] font-medium text-neutral-900">
                        {selectedBalance !== null
                          ? `${selectedBalance.toFixed(4)} ${selectedToken.label}`
                          : "Loading..."}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={disconnect}
                    className="mt-2 h-7 px-2 text-[11px] text-neutral-500 hover:text-neutral-700"
                  >
                    Disconnect
                  </Button>
                </div>

                {/* Token selection and amount */}
                {!state.txSignature && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="token" className="text-[12px]">
                        Token
                      </Label>
                      <select
                        id="token"
                        value={tokenSymbol}
                        onChange={(e) => setTokenSymbol(e.target.value as TokenSymbol)}
                        className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none"
                        disabled={state.isLoading}
                      >
                        {TOKEN_OPTIONS.map((token) => (
                          <option key={token.symbol} value={token.symbol}>
                            {token.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-[12px]">
                        Amount ({selectedToken.label})
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="0.1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-10 text-[13px]"
                        disabled={state.isLoading}
                      />
                      {hasInsufficientFunds && (
                        <p className="text-[12px] text-red-500">Insufficient balance</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Destination info */}
                <div className="rounded-lg border border-neutral-100 bg-white p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Destination
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-neutral-600 break-all">
                    {walletAddress}
                  </p>
                </div>

                {/* Action buttons */}
                {!state.txSignature && (
                  <Button
                    onClick={handleFund}
                    disabled={
                      state.isLoading ||
                      !amount ||
                      parseFloat(amount) <= 0 ||
                      hasInsufficientFunds
                    }
                    className="h-10 w-full bg-neutral-900 text-[12px] hover:bg-neutral-800"
                  >
                    {state.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Send ${amount || "0"} ${selectedToken.label}`
                    )}
                  </Button>
                )}

                {state.txSignature && (
                  <Button
                    onClick={() => setOpen(false)}
                    className="h-10 w-full bg-neutral-900 text-[12px] hover:bg-neutral-800"
                  >
                    Done
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom wallet selection dialog */}
      <WalletSelectDialog open={walletSelectOpen} onOpenChange={setWalletSelectOpen} />
    </>
  );
}
