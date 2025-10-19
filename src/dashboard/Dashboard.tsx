import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/app-sidebar"
import { ChartAreaInteractive } from "@/dashboard/components/chart-area-interactive"
import { DataTable } from "@/dashboard/components/data-table"
import { SectionCards } from "@/dashboard/components/section-cards"
import { SiteHeader } from "@/dashboard/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import data from "@/dashboard/data.json"

export default function DashboardICV() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = window.localStorage.getItem("token");
    const u = window.localStorage.getItem("user");
    console.log(t);
    setToken(t ?? null);
    try { setUser(u ? JSON.parse(u) : null); } catch { setUser(null); }
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" token={token} user={user}/>
      <SidebarInset>
        <SiteHeader title="Dashboard: Procesos Académicos"/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
