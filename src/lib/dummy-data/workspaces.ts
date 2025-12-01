import { Workspace } from "./types";

export const workspaces: Workspace[] = [
  {
    id: "ws-1",
    name: "Acme Corp",
    description: "Main workspace for Acme Corporation AI initiatives",
    createdAt: "2024-01-15T10:00:00Z",
    vault: {
      id: "vault-ws-1",
      name: "Acme Corp Vault",
      balance: 45000,
      limit: 100000,
      currency: "USD",
      lastFourDigits: "4242",
      expiryDate: "12/26",
      type: "virtual",
    },
    budget: {
      id: "budget-ws-1",
      name: "Monthly AI Budget",
      allocated: 50000,
      spent: 32450,
      currency: "USD",
      period: "monthly",
    },
    projectCount: 4,
    botCount: 12,
    totalSpend: 128500,
    members: 8,
  },
  {
    id: "ws-2",
    name: "Personal Projects",
    description: "Side projects and experiments",
    createdAt: "2024-03-20T14:30:00Z",
    vault: {
      id: "vault-ws-2",
      name: "Personal Vault",
      balance: 2500,
      limit: 5000,
      currency: "USD",
      lastFourDigits: "8888",
      expiryDate: "08/25",
      type: "credit",
    },
    budget: {
      id: "budget-ws-2",
      name: "Monthly Budget",
      allocated: 500,
      spent: 287,
      currency: "USD",
      period: "monthly",
    },
    projectCount: 2,
    botCount: 3,
    totalSpend: 1240,
    members: 1,
  },
  {
    id: "ws-3",
    name: "StartupXYZ",
    description: "AI automation for StartupXYZ",
    createdAt: "2024-06-01T09:00:00Z",
    vault: {
      id: "vault-ws-3",
      name: "StartupXYZ Vault",
      balance: 15000,
      limit: 25000,
      currency: "USD",
      lastFourDigits: "1234",
      expiryDate: "03/27",
      type: "virtual",
    },
    budget: {
      id: "budget-ws-3",
      name: "Q4 AI Budget",
      allocated: 20000,
      spent: 8750,
      currency: "USD",
      period: "monthly",
    },
    projectCount: 3,
    botCount: 7,
    totalSpend: 42300,
    members: 5,
  },
];

export function getWorkspace(id: string): Workspace | undefined {
  return workspaces.find((w) => w.id === id);
}

export function getWorkspaceStats() {
  return {
    totalWorkspaces: workspaces.length,
    totalProjects: workspaces.reduce((acc, w) => acc + w.projectCount, 0),
    totalBots: workspaces.reduce((acc, w) => acc + w.botCount, 0),
    totalSpend: workspaces.reduce((acc, w) => acc + w.totalSpend, 0),
  };
}

