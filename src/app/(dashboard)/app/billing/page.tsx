import { Check } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAuth } from "@/lib/auth";
import { getUserProjects, getUserProjectStats } from "@/lib/data/projects";
import { cn } from "@/lib/utils";

export default async function BillingPage() {
  const user = await requireAuth();
  const projects = await getUserProjects(user.id);
  const stats = await getUserProjectStats(user.id);

  const formatCurrency = (amount: number | bigint) => {
    const value = typeof amount === "bigint" ? Number(amount) / 1_000_000 : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Plan information (could be stored in user model in future)
  const billingPlan = {
    name: "Free",
    price: 0,
    features: [
      "Up to 3 projects",
      "Up to 10 agents",
      "Basic analytics",
      "Email support",
    ],
    usage: {
      projects: { used: stats.totalProjects, limit: 3 },
      agents: { used: stats.totalAgents, limit: 10 },
    },
  };

  return (
    <>
      <AppHeader title="Billing" />
      <main className="flex-1 overflow-auto bg-neutral-50/50">
        <div className="mx-auto max-w-3xl space-y-6 p-6">
          <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Current plan
                </p>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  {formatCurrency(billingPlan.price)}
                  <span className="text-[13px] font-normal text-neutral-400">/mo</span>
                </p>
              </div>
              <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white">
                {billingPlan.name}
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              {[
                { 
                  label: "Projects", 
                  used: billingPlan.usage.projects.used, 
                  limit: billingPlan.usage.projects.limit,
                  percent: (billingPlan.usage.projects.used / billingPlan.usage.projects.limit) * 100
                },
                { 
                  label: "Agents", 
                  used: billingPlan.usage.agents.used, 
                  limit: billingPlan.usage.agents.limit,
                  percent: (billingPlan.usage.agents.used / billingPlan.usage.agents.limit) * 100
                },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-neutral-500">{item.label}</span>
                    <span className="text-neutral-700">{item.used} / {item.limit}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(item.percent, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-6">
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-3">
                Features
              </p>
              <div className="grid grid-cols-2 gap-2">
                {billingPlan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-[12px] text-neutral-600">
                    <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.5} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button className="h-9 bg-neutral-900 text-[12px] hover:bg-neutral-800">
                Upgrade
              </Button>
            </div>
          </div>

          <Tabs defaultValue="usage" className="space-y-6">
            <TabsList className="h-9 bg-neutral-100/50 p-1">
              <TabsTrigger value="usage" className="text-[12px]">Usage</TabsTrigger>
              <TabsTrigger value="projects" className="text-[12px]">By project</TabsTrigger>
            </TabsList>

            <TabsContent value="usage">
              <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-soft">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-4">
                  Current month
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-neutral-600">Total monthly spend</span>
                    <span className="text-[13px] font-medium text-neutral-900">
                      {formatCurrency(stats.totalMonthlySpent)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-neutral-600">Total vault balance</span>
                    <span className="text-[13px] font-medium text-neutral-900">
                      {formatCurrency(stats.totalBalance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-neutral-600">Active agents</span>
                    <span className="text-[13px] font-medium text-neutral-900">
                      {stats.activeAgents}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projects">
              <div className="rounded-xl border border-neutral-100 bg-white shadow-soft overflow-hidden">
                {projects.length === 0 ? (
                  <div className="p-6 text-center text-[13px] text-neutral-500">
                    No projects yet
                  </div>
                ) : (
                  projects.map((project, i) => (
                    <div
                      key={project.id}
                      className={cn(
                        "flex items-center justify-between px-4 py-3",
                        i !== projects.length - 1 && "border-b border-neutral-50"
                      )}
                    >
                      <div>
                        <p className="text-[13px] text-neutral-900">{project.name}</p>
                        <p className="text-[11px] text-neutral-400">
                          {project.agentCount} agents
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-medium text-neutral-700">
                          {formatCurrency(project.monthlySpent)}
                        </p>
                        <p className="text-[11px] text-neutral-400">this month</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
