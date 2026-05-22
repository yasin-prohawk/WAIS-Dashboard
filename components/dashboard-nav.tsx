'use client'

import { cn } from '@/lib/utils'

interface DashboardNavProps {
  title: string
  description?: string
  className?: string
}

/** Page title bar for Tailwind/shadcn module pages. Menu & theme live in DashboardHeader. */
export function DashboardNav({ title, description, className }: DashboardNavProps) {
  return (
    <div
      className={cn(
        'mb-4 rounded-lg bg-primary px-4 py-3 text-primary-foreground sm:mb-6',
        className,
      )}
    >
      <h1 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
      {description && (
        <p className="mt-0.5 text-sm opacity-80">{description}</p>
      )}
    </div>
  )
}

export default DashboardNav
