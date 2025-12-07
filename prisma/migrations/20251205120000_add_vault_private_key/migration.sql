-- Add encrypted private key storage for Solana vaults
ALTER TABLE "vaults" ADD COLUMN "encryptedPrivateKey" TEXT NOT NULL DEFAULT '';
ALTER TABLE "vaults" ALTER COLUMN "encryptedPrivateKey" DROP DEFAULT;

