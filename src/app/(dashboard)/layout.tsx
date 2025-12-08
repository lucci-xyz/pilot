import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SolanaWalletProvider } from "@/components/app/solana-wallet-provider";
import { requireAuth, toSafeUser } from "@/lib/auth";
import { getUserProjects } from "@/lib/data/projects";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const safeUser = toSafeUser(user);
  const projects = await getUserProjects(user.id);

  return (
    <SolanaWalletProvider>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar user={safeUser} projects={projects} />
          <SidebarInset className="flex flex-col">
            {children}
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </SolanaWalletProvider>
  );
}
