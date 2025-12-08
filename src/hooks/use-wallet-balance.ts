"use client";

import { useState, useEffect, useCallback } from "react";
import { createSolanaRpc, address } from "@solana/kit";

const SOLANA_DEVNET_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const LAMPORTS_PER_SOL = BigInt(1_000_000_000);

export type WalletBalanceState = {
  balance: number | null; // Balance in SOL
  isLoading: boolean;
  error: string | null;
};

/**
 * Hook to fetch and track the SOL balance of a Solana wallet address.
 * Uses @solana/kit for RPC calls.
 */
export function useWalletBalance(walletAddress: string | null | undefined) {
  const [state, setState] = useState<WalletBalanceState>({
    balance: null,
    isLoading: false,
    error: null,
  });

  const fetchBalance = useCallback(async () => {
    if (!walletAddress) {
      setState({ balance: null, isLoading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const rpc = createSolanaRpc(SOLANA_DEVNET_RPC);
      const { value: lamports } = await rpc.getBalance(address(walletAddress)).send();
      const balanceInSol = Number(lamports) / Number(LAMPORTS_PER_SOL);
      
      setState({ balance: balanceInSol, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch balance";
      setState({ balance: null, isLoading: false, error: message });
    }
  }, [walletAddress]);

  // Fetch on mount and when address changes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { ...state, refetch: fetchBalance };
}

