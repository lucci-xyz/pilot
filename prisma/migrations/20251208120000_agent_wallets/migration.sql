-- Move wallets from project-level to agent-level

-- 1) Drop project FK/index from vaults; add agentId (nullable for backfill)
ALTER TABLE "vaults" DROP CONSTRAINT IF EXISTS "vaults_projectId_fkey";
ALTER TABLE "vaults" DROP CONSTRAINT IF EXISTS "vaults_projectId_key";
ALTER TABLE "vaults" DROP COLUMN IF EXISTS "projectId";
ALTER TABLE "vaults" ADD COLUMN IF NOT EXISTS "agentId" TEXT;

-- 2) Drop events FK temporarily
ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_agentId_fkey";

-- 3) Clean old data so we can enforce NOT NULL (safe for dev/test)
DELETE FROM "events";
DELETE FROM "vaults";

-- 4) Enforce constraints and indexes
CREATE UNIQUE INDEX IF NOT EXISTS "vaults_agentId_key" ON "vaults"("agentId");
ALTER TABLE "vaults" ALTER COLUMN "agentId" SET NOT NULL;
ALTER TABLE "vaults" ADD CONSTRAINT "vaults_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "events" ALTER COLUMN "agentId" SET NOT NULL;
ALTER TABLE "events" ADD CONSTRAINT "events_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

