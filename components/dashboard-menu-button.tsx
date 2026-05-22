'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDashboardNav } from '@/components/dashboard-nav-provider'
import { cn } from '@/lib/utils'

type DashboardMenuButtonProps = {
  className?: string
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'icon' | 'lg'
}

/** Opens the global left sidebar drawer. Use in any page header or navbar. */
export function DashboardMenuButton({
  className,
  variant = 'secondary',
  size = 'icon',
}: DashboardMenuButtonProps) {
  const { openSidebar } = useDashboardNav()

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn('shrink-0', className)}
      onClick={openSidebar}
      aria-label="Open navigation menu"
    >
      <Menu className="h-4 w-4" />
    </Button>
  )
}
