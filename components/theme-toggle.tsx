'use client'

import { useTheme } from '@/components/theme-provider'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="
        fixed bottom-6 right-6 z-50
        w-12 h-12 rounded-full shadow-lg
        flex items-center justify-center
        bg-white dark:bg-slate-800
        border border-gray-200 dark:border-slate-700
        text-gray-700 dark:text-yellow-400
        hover:scale-110 hover:shadow-xl
        transition-all duration-200
      "
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
