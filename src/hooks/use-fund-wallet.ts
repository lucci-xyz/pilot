"use client";

import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

export type FundWalletState = {
  isLoading: boolean;
  error: string | null;
  txSignature: string | null;
};

export type UseFundWalletReturn = {
  state: FundWalletState;
  fundWallet: (recipientAddress: string, amountSol: number) => Promise<string | null>;
  fundSplToken: (
    recipientAddress: string,
    amountTokens: number,
    mintAddress: string,
    decimals: number
  ) => Promise<string | null>;
  reset: () => void;
};

/**
 * Hook to transfer SOL from connected wallet to an agent wallet address.
 * Uses @solana/wallet-adapter for wallet connection and transaction signing.
 */
export function useFundWallet(): UseFundWalletReturn {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [state, setState] = useState<FundWalletState>({
    isLoading: false,
    error: null,
    txSignature: null,
  });

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, txSignature: null });
  }, []);

  const fundWallet = useCallback(
    async (recipientAddress: string, amountSol: number): Promise<string | null> => {
      if (!publicKey) {
        setState({ isLoading: false, error: "Wallet not connected", txSignature: null });
        return null;
      }

      if (amountSol <= 0) {
        setState({ isLoading: false, error: "Amount must be greater than 0", txSignature: null });
        return null;
      }

      setState({ isLoading: true, error: null, txSignature: null });

      try {
        const recipient = new PublicKey(recipientAddress);
        const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);

        // Create transfer transaction following official pattern
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipient,
            lamports,
          })
        );

        // Get latest blockhash and context
        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        // Send transaction via wallet adapter
        const signature = await sendTransaction(transaction, connection, { minContextSlot });

        // Confirm transaction
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });

        setState({ isLoading: false, error: null, txSignature: signature });
        return signature;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        setState({ isLoading: false, error: message, txSignature: null });
        return null;
      }
    },
    [connection, publicKey, sendTransaction]
  );

  const fundSplToken = useCallback(
    async (
      recipientAddress: string,
      amountTokens: number,
      mintAddress: string,
      decimals: number
    ): Promise<string | null> => {
      if (!publicKey) {
        setState({ isLoading: false, error: "Wallet not connected", txSignature: null });
        return null;
      }

      if (amountTokens <= 0) {
        setState({ isLoading: false, error: "Amount must be greater than 0", txSignature: null });
        return null;
      }

      setState({ isLoading: true, error: null, txSignature: null });

      try {
        const mint = new PublicKey(mintAddress);
        const recipient = new PublicKey(recipientAddress);

        const amountBaseUnits = BigInt(Math.round(amountTokens * 10 ** decimals));
        const transaction = new Transaction();

        // Ensure ATAs exist
        const fromAta = getAssociatedTokenAddressSync(mint, publicKey);
        const toAta = getAssociatedTokenAddressSync(mint, recipient, true);

        const fromAtaInfo = await connection.getAccountInfo(fromAta);
        if (!fromAtaInfo) {
          transaction.add(
            createAssociatedTokenAccountInstruction(publicKey, fromAta, publicKey, mint)
          );
        }

        const toAtaInfo = await connection.getAccountInfo(toAta);
        if (!toAtaInfo) {
          transaction.add(createAssociatedTokenAccountInstruction(publicKey, toAta, recipient, mint));
        }

        transaction.add(createTransferInstruction(fromAta, toAta, publicKey, amountBaseUnits));

        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = publicKey;

        const signature = await sendTransaction(transaction, connection, { minContextSlot });

        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });

        setState({ isLoading: false, error: null, txSignature: signature });
        return signature;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        setState({ isLoading: false, error: message, txSignature: null });
        return null;
      }
    },
    [connection, publicKey, sendTransaction]
  );

  return { state, fundWallet, fundSplToken, reset };
}
