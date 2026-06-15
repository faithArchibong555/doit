import { useState, useEffect } from 'react'

export default function DarkModeToggle({ sidebar = false }) {
  const [dark, setDark] = useState(() => {
    // Only use saved preference — never default to dark automatically
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return saved === 'true'
    return false // default is LIGHT mode
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', String(dark))
  }, [dark])

  if (sidebar) {
    return (
      <button
        onClick={() => setDark(d => !d)}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-all w-full text-left"
      >
        <span>{dark ? '☀️' : '🌙'}</span>
        {dark ? 'Light mode' : 'Dark mode'}
      </button>
    )
  }

  return (
    <button
      onClick={() => setDark(d => !d)}
      className="p-2 rounded-lg transition-colors"
      style={{ background: 'var(--surface2)', color: 'var(--text2)' }}
      aria-label="Toggle dark mode"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
