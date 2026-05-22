import { cn } from '@/lib/utils'

type ResponsiveTableProps = {
  children: React.ReactNode
  className?: string
}

/** Horizontal scroll wrapper for data tables on small screens. */
export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn('dashboard-table-scroll -mx-1 w-full overflow-x-auto px-1', className)}>
      {children}
    </div>
  )
}
