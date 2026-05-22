'use client'

import { cn } from '@/lib/utils'

type ResponsiveChartProps = {
  children: React.ReactNode
  /** Tailwind height classes, e.g. h-48 sm:h-56 md:h-64 */
  className?: string
  minHeight?: number
}

/** Wraps Recharts ResponsiveContainer with a stable mobile-friendly height. */
export function ResponsiveChart({
  children,
  className,
  minHeight = 200,
}: ResponsiveChartProps) {
  return (
    <div
      className={cn('w-full min-w-0', className)}
      style={{ minHeight }}
    >
      {children}
    </div>
  )
}
