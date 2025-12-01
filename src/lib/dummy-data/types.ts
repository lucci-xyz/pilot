export type BotStatus = "active" | "paused" | "error" | "needs_setup";

export interface Vault {
  id: string;
  name: string;
  balance: number;
  limit: number;
  currency: string;
  lastFourDigits: string;
  expiryDate: string;
  type: "credit" | "debit" | "virtual";
}

export interface Budget {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  currency: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  vault: Vault;
  budget: Budget;
  projectCount: number;
  botCount: number;
  totalSpend: number;
  members: number;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  createdAt: string;
  vault: Vault;
  budget: Budget;
  botCount: number;
  totalSpend: number;
  status: "active" | "archived";
}

export interface Bot {
  id: string;
  projectId: string;
  workspaceId: string;
  name: string;
  description: string;
  createdAt: string;
  status: BotStatus;
  vault: Vault;
  budget: Budget;
  totalSpend: number;
  requestsToday: number;
  requestsTotal: number;
  model: string;
  apiKey?: string;
  webhookUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "owner" | "admin" | "member";
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
  permissions: string[];
  requestCount: number;
  botId?: string;
}

export interface ActivityItem {
  id: string;
  type: "bot_created" | "budget_updated" | "project_created" | "bot_paused" | "bot_resumed" | "vault_funded" | "api_key_created" | "member_added";
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar: string;
  };
  metadata?: Record<string, unknown>;
}

export interface BillingItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "failed";
  invoiceUrl?: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface SpendChartData {
  daily: ChartDataPoint[];
  weekly: ChartDataPoint[];
  monthly: ChartDataPoint[];
}

