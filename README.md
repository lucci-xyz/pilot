# Pilot - AI Bot Management Platform

Pilot is a modern web application for managing AI bot workspaces, projects, and budgets. Built with Next.js, Tailwind CSS, and shadcn/ui using the Slack-inspired theme.

## Features

- **Workspace Management**: Create and manage multiple workspaces with budgets and vaults
- **Project Organization**: Organize bots into projects within workspaces
- **Bot Management**: Deploy, configure, and monitor AI bots with status tracking
- **Budget Controls**: Set and track budgets at workspace, project, and bot levels
- **Virtual Vaults**: Credit card-style vault management for spend tracking
- **Analytics**: Charts and visualizations for spend and usage tracking
- **Activity Feed**: Real-time activity tracking across workspaces
- **API Key Management**: Generate and manage API keys for bot integrations
- **Billing**: Subscription management and billing history

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui
- **Theme**: Slack-inspired purple accent theme
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project
cd pilot

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   └── (dashboard)/              # Authenticated dashboard
│       └── app/
│           ├── page.tsx          # Overview dashboard
│           ├── account/          # User account settings
│           ├── billing/          # Billing management
│           └── workspaces/       # Workspace pages
│               └── [workspaceId]/
│                   └── projects/
│                       └── [projectId]/
│                           └── bots/
│                               └── [botId]/
├── components/
│   ├── app/                      # App-specific components
│   │   ├── app-sidebar.tsx
│   │   ├── app-header.tsx
│   │   ├── announcement.tsx
│   │   ├── status-badge.tsx
│   │   ├── vault-card.tsx
│   │   ├── activity-feed.tsx
│   │   ├── code-tabs.tsx
│   │   ├── api-keys-list.tsx
│   │   ├── stats-card.tsx
│   │   ├── spend-chart.tsx
│   │   ├── comparison-chart.tsx
│   │   └── performance-chart.tsx
│   └── ui/                       # shadcn/ui components
└── lib/
    ├── dummy-data/               # Mock data for development
    │   ├── workspaces.ts
    │   ├── projects.ts
    │   ├── bots.ts
    │   ├── users.ts
    │   ├── activity.ts
    │   ├── billing.ts
    │   └── charts.ts
    └── utils.ts
```

## Routes

- `/login` - Sign in page
- `/signup` - Create account page
- `/forgot-password` - Password reset page
- `/app` - Dashboard overview
- `/app/account` - User profile and API keys
- `/app/billing` - Billing and subscription management
- `/app/workspaces/[workspaceId]` - Workspace detail view
- `/app/workspaces/[workspaceId]/projects/[projectId]` - Project detail view
- `/app/workspaces/[workspaceId]/projects/[projectId]/bots/[botId]` - Bot detail view

## Theme

The app uses a Slack-inspired theme with:
- **Primary Color**: Purple (`oklch(0.52 0.18 285)`)
- **Sidebar**: Dark aubergine background
- **Font**: Lato (Google Fonts)
- **Border Radius**: 0.5rem

## Deploy on Vercel

The easiest way to deploy Pilot is with [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/pilot)

## License

MIT
