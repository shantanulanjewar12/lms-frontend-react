import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../store'

export default function ThemeToggle({ size = 'md' }) {
  const { isDark, toggleTheme } = useThemeStore()
  const s = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'

  return (
    <button
      onClick={toggleTheme}
      className={`${s} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110`}
      style={{
        background: isDark ? 'rgba(129,140,248,0.15)' : 'rgba(99,102,241,0.1)',
        border: '1.5px solid var(--border)',
        color: isDark ? '#818cf8' : '#6366f1',
      }}
      aria-label="Toggle theme"
    >
      <div style={{ transition: 'transform 0.4s ease', transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)' }}>
        {isDark ? <Moon size={size === 'sm' ? 14 : 18} /> : <Sun size={size === 'sm' ? 14 : 18} />}
      </div>
    </button>
  )
}
