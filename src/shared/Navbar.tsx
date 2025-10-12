"use client"
import * as React from "react"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import incadev_logo from "../../public/incadev_isologotipo.svg";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { navManagementGroupItems, navCoursesItems, navHomeItems } from "@/shared/site"

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full bg-theme-smoky-black backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span><img src="/incadev_logotipo.svg" alt="Logotipo Incadev" /></span>
              </div>
              <span className="text-xl font-bold text-white">Incadev</span>
            </a>
          </div>

          <div className="hidden md:flex md:items-center md:justify-center md:flex-1">
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Inicio</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                            href="/dashboard"
                          >
                            <div className="mt-4 mb-2 text-lg font-medium">
                              Incadev
                            </div>
                            <p className="text-muted-foreground text-sm leading-tight">
                              Beautifully designed components built with Tailwind CSS.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      {navHomeItems.map((component, index) => (
                        <ListItem 
                          key={index}
                          href={component.href} 
                          title={component.title}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Mis Cursos</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-4">
                      <li>
                        {navCoursesItems.map((component, index) => (
                          <NavigationMenuLink key={index} asChild>
                            <a href={component.href}>
                              <div className="font-medium">{component.title}</div>
                              <div className="text-muted-foreground">
                                {component.description}
                              </div>
                            </a>
                          </NavigationMenuLink>
                        ))}
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Gestión de Grupo</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {navManagementGroupItems.map((component, index) => (
                        <ListItem
                          key={index}
                          title={component.title}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <a href="/dashboard/catalogo">Catálogo de Cursos</a>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <a href="/dashboard/informacion-grupos">Información de Grupos</a>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">
              <div className="px-3 py-2">
                <h3 className="mb-2 px-3 text-sm font-semibold text-gray-500">Inicio</h3>
                <a
                  href="/dashboard"
                  className="block rounded-lg px-3 py-2 text-base font-medium hover:bg-gray-50"
                >
                  Dashboard
                </a>
                {navHomeItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-base font-medium hover:bg-gray-50"
                  >
                    {item.title}
                  </a>
                ))}
              </div>

              <div className="px-3 py-2">
                <h3 className="mb-2 px-3 text-sm font-semibold text-gray-500">Mis Cursos</h3>
                {navCoursesItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-base font-medium hover:bg-gray-50"
                  >
                    {item.title}
                  </a>
                ))}
              </div>

              <div className="px-3 py-2">
                <h3 className="mb-2 px-3 text-sm font-semibold text-gray-500">Gestión de Grupo</h3>
                {navManagementGroupItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-base font-medium hover:bg-gray-50"
                  >
                    {item.title}
                  </a>
                ))}
              </div>

              <a
                href="/dashboard/catalogo"
                className="block rounded-lg px-3 py-2 text-base font-medium hover:bg-gray-50"
              >
                Catálogo de Cursos
              </a>
              <a
                href="/dashboard/informacion-grupos"
                className="block rounded-lg px-3 py-2 text-base font-medium hover:bg-gray-50"
              >
                Información de Grupos
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <a href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
}