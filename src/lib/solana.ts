import {
  createKeyPairFromPrivateKeyBytes,
  createKeyPairSignerFromBytes,
  getAddressFromPublicKey,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  sendAndConfirmTransactionFactory,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstruction,
  signTransactionMessageWithSigners,
  assertIsTransactionWithBlockhashLifetime,
  getSignatureFromTransaction,
  address,
  lamports,
  type Address,
  type KeyPairSigner,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ENCRYPTION_KEY_ENV = process.env.VAULT_ENCRYPTION_KEY;

// Solana devnet RPC endpoint
const SOLANA_DEVNET_RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const SOLANA_DEVNET_WS = process.env.SOLANA_WS_URL || "wss://api.devnet.solana.com";

// Lamports per SOL constant (1 SOL = 10^9 lamports)
export const LAMPORTS_PER_SOL = BigInt(1_000_000_000);

function getEncryptionKey(): Buffer {
  if (!ENCRYPTION_KEY_ENV) {
    throw new Error("VAULT_ENCRYPTION_KEY is not set");
  }

  // Derive a 32-byte key from the provided secret to support simple passphrases
  return createHash("sha256").update(ENCRYPTION_KEY_ENV).digest();
}

export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Store as iv:ciphertext:tag (base64) for easy decryption later
  return `${iv.toString("base64")}:${encrypted.toString("base64")}:${authTag.toString("base64")}`;
}

export function decryptSecret(encrypted: string): string {
  const key = getEncryptionKey();
  const [ivBase64, ciphertextBase64, authTagBase64] = encrypted.split(":");

  if (!ivBase64 || !ciphertextBase64 || !authTagBase64) {
    throw new Error("Invalid encrypted format");
  }

  const iv = Buffer.from(ivBase64, "base64");
  const ciphertext = Buffer.from(ciphertextBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}

/**
 * Generate a new Solana vault keypair and return the address and encrypted private key.
 * Generates private key bytes ourselves to avoid non-extractable CryptoKey issues.
 */
export async function generateSolanaVaultKeypair(): Promise<{ address: string; encryptedPrivateKey: string }> {
  // Generate 32 random bytes as the private key seed
  const privateKeyBytes = randomBytes(32);
  
  // Create a keypair from the private key bytes
  const keypair = await createKeyPairFromPrivateKeyBytes(new Uint8Array(privateKeyBytes));
  
  // Export the public key (public keys are always extractable)
  const publicKeyBytes = new Uint8Array(await crypto.subtle.exportKey("raw", keypair.publicKey));
  
  // Combine into 64-byte secret key format (private + public) for compatibility
  const secretKey = Buffer.concat([privateKeyBytes, publicKeyBytes]);
  const secretBase64 = secretKey.toString("base64");
  
  // Get the address from the public key
  const addressStr = await getAddressFromPublicKey(keypair.publicKey);

  return {
    address: addressStr,
    encryptedPrivateKey: encryptSecret(secretBase64),
  };
}

/**
 * Restore a KeyPairSigner from an encrypted private key.
 * Uses @solana/kit's createKeyPairSignerFromBytes.
 */
export async function signerFromEncryptedSecret(encryptedPrivateKey: string): Promise<KeyPairSigner> {
  const secretBase64 = decryptSecret(encryptedPrivateKey);
  const secretKey = Buffer.from(secretBase64, "base64");
  return createKeyPairSignerFromBytes(new Uint8Array(secretKey));
}

/**
 * Create a Solana devnet RPC client.
 */
export function getDevnetRpc() {
  return createSolanaRpc(SOLANA_DEVNET_RPC);
}

/**
 * Create a Solana devnet RPC subscriptions client (for confirmations).
 */
export function getDevnetRpcSubscriptions() {
  return createSolanaRpcSubscriptions(SOLANA_DEVNET_WS);
}

/**
 * Send SOL on devnet.
 * 
 * @param encryptedPrivateKey - The encrypted private key of the sender
 * @param recipientAddress - The recipient's Solana address
 * @param amountSol - Amount in SOL to send
 * @returns Transaction signature
 */
export async function sendSolDevnet(
  encryptedPrivateKey: string,
  recipientAddress: string,
  amountSol: number
): Promise<string> {
  const rpc = getDevnetRpc();
  const rpcSubscriptions = getDevnetRpcSubscriptions();
  
  // Restore the signer from encrypted key
  const sender = await signerFromEncryptedSecret(encryptedPrivateKey);
  const recipient = address(recipientAddress);
  
  // Convert SOL to lamports
  const lamportsAmount = lamports(BigInt(Math.round(amountSol * Number(LAMPORTS_PER_SOL))));
  
  // Get a recent blockhash
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
  
  // Create the transfer instruction
  const transferInstruction = getTransferSolInstruction({
    source: sender,
    destination: recipient,
    amount: lamportsAmount,
  });
  
  // Build the transaction message with explicit blockhash lifetime
  const baseMessage = createTransactionMessage({ version: 0 });
  const messageWithPayer = setTransactionMessageFeePayer(sender.address, baseMessage);
  const messageWithLifetime = setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, messageWithPayer);
  const messageWithInstruction = appendTransactionMessageInstruction(transferInstruction, messageWithLifetime);
  
  // Sign the transaction
  const signedTransaction = await signTransactionMessageWithSigners(messageWithInstruction);
  
  // Assert the transaction has blockhash lifetime (required by sendAndConfirm)
  assertIsTransactionWithBlockhashLifetime(signedTransaction);
  
  // Create send and confirm function
  const sendAndConfirm = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });
  
  // Send and confirm
  await sendAndConfirm(signedTransaction, { commitment: "confirmed" });
  
  // Get the signature from the signed transaction using Kit's built-in function
  const signature = getSignatureFromTransaction(signedTransaction);
  
  return signature;
}

/**
 * Get SOL balance for an address on devnet.
 */
export async function getSolBalanceDevnet(addressStr: string): Promise<number> {
  const rpc = getDevnetRpc();
  const { value: lamportsBalance } = await rpc.getBalance(address(addressStr)).send();
  return Number(lamportsBalance) / Number(LAMPORTS_PER_SOL);
}

/**
 * X402 Payment details returned from a 402 response.
 */
export type X402PaymentDetails = {
  // The recipient address for the payment
  payTo: string;
  // Amount to pay (in the smallest unit of the token)
  amount: string;
  // Token to use for payment (e.g., "SOL", "USDC")
  token: string;
  // Network to use (e.g., "solana-devnet")
  network: string;
  // Optional: USD equivalent of the payment amount
  amountUsd?: number;
  // Optional: expiration timestamp
  expires?: number;
  // Additional metadata
  [key: string]: unknown;
};

/**
 * Process an x402 payment on Solana devnet.
 * Currently supports SOL transfers only (USDC SPL token support can be added).
 * 
 * @param encryptedPrivateKey - The encrypted private key of the payer
 * @param paymentDetails - The x402 payment details from the 402 response
 * @returns Transaction signature
 */
export async function processX402PaymentSolana(
  encryptedPrivateKey: string,
  paymentDetails: X402PaymentDetails
): Promise<string> {
  const { payTo, amount, token, network } = paymentDetails;

  // Validate network
  if (network !== "solana-devnet" && network !== "solana") {
    throw new Error(`Unsupported network for x402 payment: ${network}`);
  }

  // For now, we only support SOL transfers on devnet
  // USDC SPL token transfers would require additional setup with @solana-program/token
  if (token !== "SOL") {
    throw new Error(
      `Token ${token} not supported for x402 payments yet. Only SOL is supported on devnet.`
    );
  }

  // Amount is in lamports for SOL
  const amountSol = parseInt(amount, 10) / Number(LAMPORTS_PER_SOL);

  return sendSolDevnet(encryptedPrivateKey, payTo, amountSol);
}
