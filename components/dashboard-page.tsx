import { cn } from '@/lib/utils'

type DashboardPageProps = {
  children: React.ReactNode
  className?: string
}

/** Standard page container with responsive padding for module dashboards. */
export function DashboardPage({ children, className }: DashboardPageProps) {
  return (
    <main
      className={cn(
        'dashboard-page min-h-screen bg-background',
        'px-3 py-4 sm:px-4 sm:py-6 md:px-6',
        className,
      )}
    >
      {children}
    </main>
  )
}
