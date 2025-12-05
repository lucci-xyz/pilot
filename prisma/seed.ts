import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { config } from "dotenv";
import ws from "ws";

// Load environment variables
config();

// Configure Neon to use ws for WebSocket in Node.js
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set. Create a .env file with DATABASE_URL.");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

// Simple password hashing (same as in auth.ts)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.event.deleteMany();
  await prisma.agentBudgetRule.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.vault.deleteMany();
  await prisma.project.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  console.log("Creating test user...");
  const passwordHash = await hashPassword("password123");
  const user = await prisma.user.create({
    data: {
      email: "demo@pilot.app",
      passwordHash,
      name: "Demo User",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
    },
  });
  console.log(`✓ Created user: ${user.email}`);

  // Create projects
  console.log("Creating projects...");
  const project1 = await prisma.project.create({
    data: {
      name: "Customer Support",
      description: "AI-powered customer support automation",
      status: "active",
      userId: user.id,
      vault: {
        create: {
          address: `vault_${crypto.randomUUID().replace(/-/g, "")}`,
          balance: BigInt(50_000_000_000), // $50,000
        },
      },
    },
    include: { vault: true },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Content Generation",
      description: "Marketing content and copy generation",
      status: "active",
      userId: user.id,
      vault: {
        create: {
          address: `vault_${crypto.randomUUID().replace(/-/g, "")}`,
          balance: BigInt(25_000_000_000), // $25,000
        },
      },
    },
    include: { vault: true },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "Data Analysis",
      description: "Automated data analysis and reporting",
      status: "active",
      userId: user.id,
      vault: {
        create: {
          address: `vault_${crypto.randomUUID().replace(/-/g, "")}`,
          balance: BigInt(15_000_000_000), // $15,000
        },
      },
    },
    include: { vault: true },
  });

  console.log(`✓ Created ${3} projects`);

  // Create agents for project 1
  console.log("Creating agents...");
  const agent1 = await prisma.agent.create({
    data: {
      name: "Ticket Classifier",
      description: "Automatically classifies and routes support tickets",
      provider: "openai",
      model: "gpt-4o",
      status: "active",
      projectId: project1.id,
      budgetRule: {
        create: {
          dailyLimit: BigInt(500_000_000), // $500/day
          perTxLimit: BigInt(5_000_000),   // $5/tx
          monthlyLimit: BigInt(10_000_000_000), // $10,000/month
          dailySpent: BigInt(320_000_000), // $320 spent today
          monthlySpent: BigInt(4_500_000_000), // $4,500 spent this month
        },
      },
    },
  });

  const agent2 = await prisma.agent.create({
    data: {
      name: "FAQ Responder",
      description: "Answers common customer questions automatically",
      provider: "openai",
      model: "gpt-4o-mini",
      status: "active",
      projectId: project1.id,
      budgetRule: {
        create: {
          dailyLimit: BigInt(300_000_000), // $300/day
          perTxLimit: BigInt(2_000_000),   // $2/tx
          monthlyLimit: BigInt(6_000_000_000), // $6,000/month
          dailySpent: BigInt(180_000_000),
          monthlySpent: BigInt(2_800_000_000),
        },
      },
    },
  });

  const agent3 = await prisma.agent.create({
    data: {
      name: "Sentiment Analyzer",
      description: "Analyzes customer sentiment in real-time",
      provider: "anthropic",
      model: "claude-3-sonnet",
      status: "paused",
      projectId: project1.id,
      budgetRule: {
        create: {
          dailyLimit: BigInt(200_000_000),
          perTxLimit: BigInt(1_000_000),
          dailySpent: BigInt(0),
          monthlySpent: BigInt(1_200_000_000),
        },
      },
    },
  });

  // Create agents for project 2
  const agent4 = await prisma.agent.create({
    data: {
      name: "Blog Writer",
      description: "Generates SEO-optimized blog posts",
      provider: "openai",
      model: "gpt-4o",
      status: "active",
      projectId: project2.id,
      budgetRule: {
        create: {
          dailyLimit: BigInt(200_000_000),
          perTxLimit: BigInt(10_000_000),
          monthlyLimit: BigInt(4_000_000_000),
          dailySpent: BigInt(145_000_000),
          monthlySpent: BigInt(2_100_000_000),
        },
      },
    },
  });

  const agent5 = await prisma.agent.create({
    data: {
      name: "Social Media Bot",
      description: "Creates social media content",
      provider: "openai",
      model: "gpt-4o-mini",
      status: "active",
      projectId: project2.id,
      budgetRule: {
        create: {
          dailyLimit: BigInt(100_000_000),
          perTxLimit: BigInt(1_000_000),
          dailySpent: BigInt(65_000_000),
          monthlySpent: BigInt(950_000_000),
        },
      },
    },
  });

  // Create agent for project 3
  const agent6 = await prisma.agent.create({
    data: {
      name: "Report Generator",
      description: "Creates automated data reports",
      provider: "openai",
      model: "gpt-4o",
      status: "needs_setup",
      projectId: project3.id,
      budgetRule: {
        create: {
          dailyLimit: BigInt(300_000_000),
          perTxLimit: BigInt(15_000_000),
          monthlyLimit: BigInt(5_000_000_000),
          dailySpent: BigInt(0),
          monthlySpent: BigInt(0),
        },
      },
    },
  });

  console.log(`✓ Created ${6} agents`);

  // Create some events
  console.log("Creating events...");
  const now = new Date();

  // Funding events
  await prisma.event.create({
    data: {
      type: "funding",
      amount: BigInt(50_000_000_000),
      status: "confirmed",
      txHash: `0x${crypto.randomUUID().replace(/-/g, "")}`,
      vaultId: project1.vault!.id,
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  });

  await prisma.event.create({
    data: {
      type: "funding",
      amount: BigInt(25_000_000_000),
      status: "confirmed",
      txHash: `0x${crypto.randomUUID().replace(/-/g, "")}`,
      vaultId: project2.vault!.id,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // Spend events
  const agents = [agent1, agent2, agent4, agent5];
  for (let i = 0; i < 50; i++) {
    const agent = agents[i % agents.length];
    const project = agent.projectId === project1.id ? project1 : project2;
    const daysAgo = Math.floor(Math.random() * 14);
    const amount = BigInt(Math.floor(Math.random() * 5_000_000) + 100_000); // $0.10 - $5.00
    
    await prisma.event.create({
      data: {
        type: "spend",
        amount: -amount,
        status: "confirmed",
        metadata: JSON.stringify({
          tokens: Math.floor(Math.random() * 10000) + 100,
          model: agent.model,
          provider: agent.provider,
        }),
        vaultId: project.vault!.id,
        agentId: agent.id,
        createdAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`✓ Created 52 events`);

  // Create API key for the user
  console.log("Creating API key...");
  const apiKeyPlain = `pk_live_${crypto.randomUUID().replace(/-/g, "")}`;
  const keyHash = await hashPassword(apiKeyPlain);
  
  await prisma.apiKey.create({
    data: {
      name: "Development API Key",
      keyHash,
      keyPrefix: apiKeyPlain.substring(0, 8),
      permissions: ["read", "write", "execute"],
      userId: user.id,
    },
  });

  console.log(`✓ Created API key`);

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📝 Test credentials:");
  console.log("   Email: demo@pilot.app");
  console.log("   Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

