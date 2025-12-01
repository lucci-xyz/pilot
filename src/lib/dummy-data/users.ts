import { User, ApiKey } from "./types";

export const currentUser: User = {
  id: "user-1",
  name: "Sarah Chen",
  email: "sarah@acmecorp.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  role: "owner",
  createdAt: "2024-01-10T10:00:00Z",
};

export const workspaceMembers: User[] = [
  currentUser,
  {
    id: "user-2",
    name: "Alex Johnson",
    email: "alex@acmecorp.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    role: "admin",
    createdAt: "2024-01-15T14:00:00Z",
  },
  {
    id: "user-3",
    name: "Maya Patel",
    email: "maya@acmecorp.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    role: "member",
    createdAt: "2024-02-01T09:00:00Z",
  },
  {
    id: "user-4",
    name: "James Wilson",
    email: "james@acmecorp.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    role: "member",
    createdAt: "2024-02-15T11:00:00Z",
  },
  {
    id: "user-5",
    name: "Emma Davis",
    email: "emma@acmecorp.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    role: "member",
    createdAt: "2024-03-01T16:00:00Z",
  },
];

export const apiKeys: ApiKey[] = [
  {
    id: "key-1",
    name: "Production API Key",
    key: "pk_live_************************a4b2",
    createdAt: "2024-02-01T10:00:00Z",
    lastUsed: "2024-11-28T15:30:00Z",
    expiresAt: "2025-02-01T10:00:00Z",
    permissions: ["read", "write", "execute"],
    requestCount: 1250000,
  },
  {
    id: "key-2",
    name: "Development API Key",
    key: "pk_test_************************c7d9",
    createdAt: "2024-03-15T14:00:00Z",
    lastUsed: "2024-11-29T09:45:00Z",
    expiresAt: null,
    permissions: ["read", "write", "execute"],
    requestCount: 45000,
  },
  {
    id: "key-3",
    name: "Read-only Key",
    key: "pk_read_************************e1f3",
    createdAt: "2024-06-01T09:00:00Z",
    lastUsed: "2024-11-27T12:00:00Z",
    expiresAt: "2025-06-01T09:00:00Z",
    permissions: ["read"],
    requestCount: 320000,
  },
  {
    id: "key-4",
    name: "Webhook Signing Key",
    key: "whsec_************************g5h8",
    createdAt: "2024-08-01T11:00:00Z",
    lastUsed: "2024-11-29T08:15:00Z",
    expiresAt: null,
    permissions: ["webhook"],
    requestCount: 890000,
  },
  {
    id: "key-5",
    name: "CI/CD Pipeline Key",
    key: "pk_cicd_************************i9j2",
    createdAt: "2024-09-15T16:00:00Z",
    lastUsed: "2024-11-29T06:00:00Z",
    expiresAt: "2025-09-15T16:00:00Z",
    permissions: ["read", "execute"],
    requestCount: 125000,
  },
];

export function getApiKey(id: string): ApiKey | undefined {
  return apiKeys.find((k) => k.id === id);
}

