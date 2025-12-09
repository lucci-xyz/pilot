-- CreateTable
CREATE TABLE "agent_budgets" (
    "id" TEXT NOT NULL,
    "monthlyBudgetUsd" DECIMAL(18,6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "agent_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_transactions" (
    "id" TEXT NOT NULL,
    "amountUsd" DECIMAL(18,6) NOT NULL,
    "token" TEXT NOT NULL DEFAULT 'USDC',
    "txSignature" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "agent_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_budgets_agentId_key" ON "agent_budgets"("agentId");

-- CreateIndex
CREATE INDEX "agent_budgets_projectId_idx" ON "agent_budgets"("projectId");

-- CreateIndex
CREATE INDEX "agent_transactions_agentId_createdAt_idx" ON "agent_transactions"("agentId", "createdAt");

-- CreateIndex
CREATE INDEX "agent_transactions_projectId_createdAt_idx" ON "agent_transactions"("projectId", "createdAt");

-- AddForeignKey
ALTER TABLE "agent_budgets" ADD CONSTRAINT "agent_budgets_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_budgets" ADD CONSTRAINT "agent_budgets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_transactions" ADD CONSTRAINT "agent_transactions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_transactions" ADD CONSTRAINT "agent_transactions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
