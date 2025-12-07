import { Keypair } from "@solana/web3.js";
import { createCipheriv, createHash, randomBytes } from "crypto";

const ENCRYPTION_KEY_ENV = process.env.VAULT_ENCRYPTION_KEY;

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

export function generateSolanaVaultKeypair(): { address: string; encryptedPrivateKey: string } {
  const keypair = Keypair.generate();
  const secretBase64 = Buffer.from(keypair.secretKey).toString("base64");

  return {
    address: keypair.publicKey.toBase58(),
    encryptedPrivateKey: encryptSecret(secretBase64),
  };
}

