'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Home } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useDashboardNav } from '@/components/dashboard-nav-provider'
import { DASHBOARD_MODULES } from '@/lib/dashboard-modules'
import { cn } from '@/lib/utils'

export function DashboardSidebar() {
  const pathname = usePathname()
  const { open, setOpen, closeSidebar } = useDashboardNav()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-[min(100vw-2rem,20rem)] p-0 sm:max-w-xs">
        <SheetHeader className="border-b border-border px-4 py-4 text-left">
          <SheetTitle className="text-base">Dashboard Menu</SheetTitle>
          <p className="text-muted-foreground text-xs font-normal">
            Select a module or submenu item
          </p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5.5rem)]">
          <nav className="flex flex-col gap-1 p-3">
            <Link
              href="/"
              onClick={closeSidebar}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted',
                pathname === '/' && 'bg-primary/10 text-primary',
              )}
            >
              <Home className="h-4 w-4 shrink-0" />
              Home
            </Link>

            {DASHBOARD_MODULES.map((module) => {
              const Icon = module.icon
              const isActive =
                pathname === module.href ||
                pathname.startsWith(`${module.href}/`)

              return (
                <Collapsible key={module.id} defaultOpen={isActive} className="group">
                  <div
                    className={cn(
                      'rounded-lg border border-transparent',
                      isActive && 'border-primary/20 bg-primary/5',
                    )}
                  >
                    <div className="flex items-center">
                      <Link
                        href={module.href}
                        onClick={closeSidebar}
                        className={cn(
                          'flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-muted/80',
                          isActive && 'font-semibold text-primary',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-80" />
                        <span className="leading-snug">{module.label}</span>
                      </Link>
                      <CollapsibleTrigger
                        className="rounded-md p-2 hover:bg-muted"
                        aria-label={`Toggle ${module.label} submenu`}
                      >
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="pb-2 pl-9 pr-2">
                      <ul className="space-y-0.5 border-l border-border pl-3">
                        {module.submenu.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={closeSidebar}
                              className="block rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
