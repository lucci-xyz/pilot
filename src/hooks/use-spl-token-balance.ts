"use client";

import { useState, useCallback, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export type SplTokenBalanceState = {
  balance: number | null; // Balance in token units (respecting decimals)
  isLoading: boolean;
  error: string | null;
};

/**
 * Fetch SPL token balance for the connected wallet on devnet.
 * Returns balance in human-readable units using provided decimals.
 */
export function useSplTokenBalance(
  owner: PublicKey | string | null,
  mintAddress: string | null,
  decimals = 6
) {
  const { connection } = useConnection();
  const [state, setState] = useState<SplTokenBalanceState>({
    balance: null,
    isLoading: false,
    error: null,
  });

  const fetchBalance = useCallback(async () => {
    if (!owner || !mintAddress) {
      setState({ balance: null, isLoading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const mint = new PublicKey(mintAddress);
      const ownerKey = owner instanceof PublicKey ? owner : new PublicKey(owner);
      const accounts = await connection.getParsedTokenAccountsByOwner(ownerKey, { mint });

      let total = 0n;
      for (const { account } of accounts.value) {
        const amountStr = account.data.parsed.info.tokenAmount.amount as string;
        total += BigInt(amountStr);
      }

      const balance = Number(total) / 10 ** decimals;
      setState({ balance, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch token balance";
      setState({ balance: null, isLoading: false, error: message });
    }
  }, [connection, owner, mintAddress, decimals]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { ...state, refetch: fetchBalance };
}

