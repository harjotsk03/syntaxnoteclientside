// app/(protected)/layout.tsx (protected layout)
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getAuthUser, getRepos } from "@/hooks/useGitHubRepos";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="py-4 px-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
