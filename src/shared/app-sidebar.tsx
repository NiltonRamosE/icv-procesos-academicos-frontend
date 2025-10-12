"use client"

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
import {navMainCollapse, navSimpleMain, navMainOptions} from "@/shared/site"; 
const data = {
  user: {
    name: "Nilton",
    email: "niltonencarnacion17@gmail.com",
    avatar: "/images/9440461.webp",
  },
  navMain: navMainCollapse,
  navMainSecondary: navSimpleMain,
  navOptions: navMainOptions,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard" title="Dashboard" className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                  <span><img src="/incadev_logotipo.svg" alt="Logotipo Incadev" title="Logotipo Incadev"/></span>
                </div>
                <span className="text-xl font-bold">Incadev</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navMainSecondary}/>
        <NavSecondary items={data.navOptions} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
