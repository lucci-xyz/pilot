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
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { WalletSelectDialog } from "./wallet-select-dialog";

type FundWalletDialogProps = {
  projectWalletAddress: string;
  projectName: string;
  onSuccess?: () => void;
  children?: React.ReactNode;
};

export function FundWalletDialog({
  projectWalletAddress,
  projectName,
  onSuccess,
  children,
}: FundWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const [walletSelectOpen, setWalletSelectOpen] = useState(false);
  const [amount, setAmount] = useState("");
  
  const { connected, publicKey, disconnect, wallet } = useWallet();
  const { state, fundWallet, reset } = useFundWallet();
  const { balance: connectedWalletBalance, refetch: refetchBalance } = useWalletBalance(
    publicKey?.toBase58()
  );

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
      setAmount("");
    }
  }, [open, reset]);

  const handleFund = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const signature = await fundWallet(projectWalletAddress, amountNum);
    if (signature) {
      refetchBalance();
      onSuccess?.();
    }
  };

  const handleConnect = () => {
    setWalletSelectOpen(true);
  };

  const amountNum = parseFloat(amount) || 0;
  const hasInsufficientFunds = connectedWalletBalance !== null && amountNum > connectedWalletBalance;

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
            <DialogTitle className="text-[15px]">Fund project wallet</DialogTitle>
            <DialogDescription className="text-[13px]">
              Transfer SOL from your wallet to {projectName}&apos;s devnet vault.
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
                      {amount} SOL has been sent to the project wallet.
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
                  Connect your Solana wallet to fund this project.
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
                        {connectedWalletBalance !== null
                          ? `${connectedWalletBalance.toFixed(4)} SOL`
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

                {/* Amount input */}
                {!state.txSignature && (
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-[12px]">
                      Amount (SOL)
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
                )}

                {/* Destination info */}
                <div className="rounded-lg border border-neutral-100 bg-white p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Destination
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-neutral-600 break-all">
                    {projectWalletAddress}
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
                      `Send ${amount || "0"} SOL`
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
