// src/shared/sidebar/nav-main.tsx
"use client"

import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { NavItem } from "@/shared/site" // ← Agregar 'type' aquí

interface User {
  role?: string | string[];
  roles?: string[];
}

interface NavMainProps {
  items: NavItem[];
}

export function NavMain({ items }: NavMainProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getCurrentUser = (): User | null => {
      try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
      } catch {
        return null;
      }
    };

    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const isAdmin = user?.role?.includes('admin') || user?.roles?.includes('admin');

  // Filtrar items basado en el rol del usuario
  const filteredItems = items
    .filter(item => {
      if (item.adminOnly && !isAdmin) {
        return false;
      }
      return true;
    })
    .map(item => ({
      ...item,
      items: item.items?.filter(subItem => {
        if (subItem.adminOnly && !isAdmin) {
          return false;
        }
        return true;
      }) || []
    }))
    .filter(item => item.items.length > 0 || !item.items);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.items && item.items.length > 0 && (
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.items && item.items.length > 0 && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}