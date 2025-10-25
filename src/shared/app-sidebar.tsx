// src/shared/app-sidebar.tsx
import * as React from "react"
import { NavMain } from "@/shared/sidebar/nav-main"
import { NavSecondary } from "@/shared/sidebar/nav-secondary"
import { NavUser } from "@/shared/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  navMainCollapse, 
  navSimpleMain, 
  navMainOptions, 
  navAdminSecondary
} from "@/shared/site"

interface User {
  first_name?: string;
  email?: string;
  avatar?: string;
  role?: string | string[];
  roles?: string[];
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  token?: string | null;
  user?: User | null;
};

export function AppSidebar({ token, user, ...props }: AppSidebarProps) {
  const [searchTerm, setSearchTerm] = React.useState('')

  const shownUser = {
    name: user?.first_name ?? "Invitado",
    email: user?.email ?? "—",
    avatar: user?.avatar ?? "/academico/images/9440461.webp",
    token: token ?? "token_invalido"
  };

  const isAdmin = user?.role?.includes('admin') || user?.roles?.includes('admin');

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/academico/dashboard" title="Dashboard" className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                  <span><img src="/academico/incadev_logotipo.svg" alt="Logotipo Incadev" title="Logotipo Incadev"/></span>
                </div>
                <span className="text-xl font-bold">Incadev</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* NavMain con funcionalidad de búsqueda */}
        <NavMain items={navMainCollapse} searchTerm={searchTerm} />
        
        <NavSecondary items={navSimpleMain}/>
        
        {isAdmin && (
          <NavSecondary 
            items={navAdminSecondary} 
            className="border-t pt-4 mt-4"
          />
        )}
        
        {/* NavSecondary con búsqueda */}
        <NavSecondary 
          items={navMainOptions} 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          className="mt-auto" 
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={shownUser} />
      </SidebarFooter>
    </Sidebar>
  )
}