// src/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/app-sidebar"
import { AdminPanel } from "@/admin/components/AdminPanel"
import { AdminRoute } from "@/admin/components/AdminRoute"
import { SiteHeader } from "@/dashboard/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface User {
  first_name?: string;
  email?: string;
  avatar?: string;
  role?: string | string[];
  roles?: string[];
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Leer cookie con JSON del login de Google
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
      return match ? decodeURIComponent(match[2]) : null
    }

    const authDataStr = getCookie('auth_data')
    console.log("authDataStr", authDataStr)
    if (authDataStr) {
      const authData = JSON.parse(authDataStr)
      console.log("authData", authData)
      localStorage.setItem('token', JSON.stringify(authData.token))
      localStorage.setItem('user', JSON.stringify(authData.user))
      document.cookie = "auth_data=; path=/; max-age=0"
    }

    const t = window.localStorage.getItem("token")
    const u = window.localStorage.getItem("user")
    setToken(t ?? null)
    try { setUser(u ? JSON.parse(u) : null) } catch { setUser(null) }
    setMounted(true)
  }, [])

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
        <SiteHeader title="Panel de Administración"/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}