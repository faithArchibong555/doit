import { useState, useEffect } from 'react'

export default function DarkModeToggle({ sidebar = false }) {
  const [dark, setDark] = useState(() => localStorage.getItem('darkMode') === 'true')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('darkMode', dark)
  }, [dark])

  if (sidebar) {
    return (
      <button
        onClick={() => setDark(!dark)}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-all w-full text-left"
      >
        <span>{dark ? '☀️' : '🌙'}</span>
        {dark ? 'Light mode' : 'Dark mode'}
      </button>
    )
  }

  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
