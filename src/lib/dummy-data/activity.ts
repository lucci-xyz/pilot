import { ActivityItem } from "./types";

export const recentActivity: ActivityItem[] = [
  {
    id: "act-1",
    type: "bot_created",
    title: "New bot created",
    description: "Trend Analyzer was created in Analytics Bot project",
    timestamp: "2024-11-29T14:30:00Z",
    user: {
      name: "Sarah Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
  },
  {
    id: "act-2",
    type: "budget_updated",
    title: "Budget increased",
    description: "Customer Support project budget increased to $15,000/month",
    timestamp: "2024-11-29T12:15:00Z",
    user: {
      name: "Alex Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
  },
  {
    id: "act-3",
    type: "bot_paused",
    title: "Bot paused",
    description: "Sentiment Analyzer was paused due to budget constraints",
    timestamp: "2024-11-29T10:00:00Z",
    user: {
      name: "Maya Patel",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    },
  },
  {
    id: "act-4",
    type: "vault_funded",
    title: "Vault funded",
    description: "Added $10,000 to Acme Corp Vault",
    timestamp: "2024-11-28T16:45:00Z",
    user: {
      name: "Sarah Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
  },
  {
    id: "act-5",
    type: "project_created",
    title: "New project created",
    description: "Data Analysis project was created in Acme Corp workspace",
    timestamp: "2024-11-28T11:30:00Z",
    user: {
      name: "Alex Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
  },
  {
    id: "act-6",
    type: "api_key_created",
    title: "API key created",
    description: "New CI/CD Pipeline Key was generated",
    timestamp: "2024-11-27T15:20:00Z",
    user: {
      name: "James Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    },
  },
  {
    id: "act-7",
    type: "member_added",
    title: "Team member added",
    description: "Emma Davis was added to the workspace",
    timestamp: "2024-11-27T09:00:00Z",
    user: {
      name: "Sarah Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
  },
  {
    id: "act-8",
    type: "bot_resumed",
    title: "Bot resumed",
    description: "FAQ Responder was resumed after maintenance",
    timestamp: "2024-11-26T14:00:00Z",
    user: {
      name: "Maya Patel",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    },
  },
  {
    id: "act-9",
    type: "budget_updated",
    title: "Budget adjusted",
    description: "Sales Assistant daily budget reduced to $400",
    timestamp: "2024-11-26T10:30:00Z",
    user: {
      name: "Alex Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
  },
  {
    id: "act-10",
    type: "bot_created",
    title: "New bot created",
    description: "Metrics Bot was created in Analytics Bot project",
    timestamp: "2024-11-25T16:00:00Z",
    user: {
      name: "Emma Davis",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    },
  },
];

export function getActivityByWorkspace(workspaceId: string): ActivityItem[] {
  // In a real app, this would filter by workspace
  // For demo purposes, return all activity
  return recentActivity;
}

export function getActivityByProject(projectId: string): ActivityItem[] {
  // In a real app, this would filter by project
  return recentActivity.slice(0, 5);
}

