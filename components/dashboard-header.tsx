'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { DashboardMenuButton } from '@/components/dashboard-menu-button'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Routes with their own top bar — global header is hidden to avoid duplication. */
const CUSTOM_MODULE_PATHS = [
  '/facility-engineering',
  '/biomedical-engineering',
  '/cleansing-services',
  '/complaints',
  '/linen-laundry',
  '/waste-management',
  '/deduction',
  '/additional-works',
  '/quality-assurance',
  '/variation-management',
  '/beyond-economic-repair',
  '/reports',
  '/general-master',
  '/user-management',
  '/finance',
  '/bis',
]

type DashboardHeaderProps = {
  title?: string
  description?: string
  showBack?: boolean
  className?: string
}

/** Global top bar with hamburger menu — hidden on home (home has its own header). */
export function DashboardHeader({
  title,
  description,
  showBack = true,
  className,
}: DashboardHeaderProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  if (pathname === '/' || CUSTOM_MODULE_PATHS.some((p) => pathname.startsWith(p))) {
    return null
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-primary px-3 py-2.5 text-primary-foreground sm:px-4 sm:py-3',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <DashboardMenuButton className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25" />

        {showBack && (
          <Link href="/" className="shrink-0">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to home</span>
            </Button>
          </Link>
        )}

        {(title || description) && (
          <div className="min-w-0">
            {title && (
              <h1 className="truncate text-base font-bold tracking-tight sm:text-xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="truncate text-xs opacity-80 sm:text-sm">{description}</p>
            )}
          </div>
        )}
      </div>

      <Button
        variant="secondary"
        size="icon"
        className="h-8 w-8 shrink-0 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </header>
  )
}
