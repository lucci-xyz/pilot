import { Check, Download } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { billingHistory, billingPlan } from "@/lib/dummy-data/billing";
import { workspaces } from "@/lib/dummy-data/workspaces";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
                { label: "Bots", used: billingPlan.usage.bots.used, limit: billingPlan.usage.bots.limit },
                { label: "API calls", used: `${(billingPlan.usage.apiCalls.used / 1000000).toFixed(1)}M`, limit: `${(billingPlan.usage.apiCalls.limit / 1000000)}M`, percent: (billingPlan.usage.apiCalls.used / billingPlan.usage.apiCalls.limit) * 100 },
                { label: "Storage", used: `${billingPlan.usage.storage.used}GB`, limit: `${billingPlan.usage.storage.limit}GB`, percent: (billingPlan.usage.storage.used / billingPlan.usage.storage.limit) * 100 },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-neutral-500">{item.label}</span>
                    <span className="text-neutral-700">{item.used} / {item.limit}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.percent || (typeof item.used === 'number' ? (item.used / (item.limit as number)) * 100 : 50)}%` }}
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
                {billingPlan.features.slice(0, 6).map((feature) => (
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
              <Button variant="outline" className="h-9 text-[12px]">
                Cancel
              </Button>
            </div>
          </div>

          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="h-9 bg-neutral-100/50 p-1">
              <TabsTrigger value="history" className="text-[12px]">History</TabsTrigger>
              <TabsTrigger value="workspaces" className="text-[12px]">By workspace</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <div className="rounded-xl border border-neutral-100 bg-white shadow-soft overflow-hidden">
                {billingHistory.map((item, i) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between px-4 py-3",
                      i !== billingHistory.length - 1 && "border-b border-neutral-50"
                    )}
                  >
                    <div>
                      <p className="text-[13px] text-neutral-900">{item.description}</p>
                      <p className="text-[11px] text-neutral-400">{formatDate(item.date)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-[13px] font-medium text-neutral-700">{formatCurrency(item.amount)}</p>
                      <span className={cn(
                        "text-[11px] font-medium",
                        item.status === "paid" ? "text-emerald-500" : 
                        item.status === "pending" ? "text-amber-500" : "text-red-500"
                      )}>
                        {item.status}
                      </span>
                      {item.invoiceUrl && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Download className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="workspaces">
              <div className="rounded-xl border border-neutral-100 bg-white shadow-soft overflow-hidden">
                {workspaces.map((workspace, i) => (
                  <div
                    key={workspace.id}
                    className={cn(
                      "flex items-center justify-between px-4 py-3",
                      i !== workspaces.length - 1 && "border-b border-neutral-50"
                    )}
                  >
                    <div>
                      <p className="text-[13px] text-neutral-900">{workspace.name}</p>
                      <p className="text-[11px] text-neutral-400">
                        {workspace.projectCount} projects, {workspace.botCount} bots
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-medium text-neutral-700">
                        {formatCurrency(workspace.budget.spent)}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        of {formatCurrency(workspace.budget.allocated)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
