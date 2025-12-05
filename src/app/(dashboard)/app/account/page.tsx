import { AppHeader } from "@/components/app/app-header";
import { ApiKeysList } from "@/components/app/api-keys-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAuth } from "@/lib/auth";
import { getUserApiKeys } from "@/lib/data/api-keys";

export default async function AccountPage() {
  const user = await requireAuth();
  const apiKeys = await getUserApiKeys(user.id);

  // Transform API keys for the component
  const formattedApiKeys = apiKeys.map((key) => ({
    id: key.id,
    name: key.name,
    key: `${key.keyPrefix}${"*".repeat(24)}${key.keyPrefix.slice(-4)}`,
    createdAt: key.createdAt.toISOString(),
    lastUsed: key.lastUsedAt?.toISOString() ?? null,
    expiresAt: key.expiresAt?.toISOString() ?? null,
    permissions: key.permissions,
    requestCount: key.requestCount,
  }));

  return (
    <>
      <AppHeader title="Account" />
      <main className="flex-1 overflow-auto bg-neutral-50/50">
        <div className="mx-auto max-w-2xl space-y-6 p-6">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="h-9 bg-neutral-100/50 p-1">
              <TabsTrigger value="profile" className="text-[12px]">Profile</TabsTrigger>
              <TabsTrigger value="api-keys" className="text-[12px]">API Keys</TabsTrigger>
              <TabsTrigger value="security" className="text-[12px]">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-soft">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                    <AvatarFallback className="text-sm">
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-[15px] font-medium text-neutral-900">{user.name}</p>
                    <p className="text-[12px] text-neutral-500">{user.email}</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-medium text-neutral-600">First name</Label>
                      <Input defaultValue={user.name.split(" ")[0]} className="h-10 text-[13px]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-medium text-neutral-600">Last name</Label>
                      <Input defaultValue={user.name.split(" ").slice(1).join(" ")} className="h-10 text-[13px]" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-medium text-neutral-600">Email</Label>
                    <Input defaultValue={user.email} className="h-10 text-[13px]" disabled />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button className="h-9 bg-neutral-900 text-[12px] hover:bg-neutral-800">
                    Save changes
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="api-keys" className="space-y-6">
              <ApiKeysList apiKeys={formattedApiKeys} />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-soft">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Password
                </p>
                <div className="mt-4 grid gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-medium text-neutral-600">Current password</Label>
                    <Input type="password" className="h-10 text-[13px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-medium text-neutral-600">New password</Label>
                    <Input type="password" className="h-10 text-[13px]" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button className="h-9 bg-neutral-900 text-[12px] hover:bg-neutral-800">
                    Update password
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-soft">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Two-factor authentication
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[13px] text-neutral-600">
                    Add an extra layer of security
                  </p>
                  <Button variant="outline" size="sm" className="h-8 text-[12px]">
                    Enable
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
