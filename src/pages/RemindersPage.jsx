import { useState } from 'react'

export default function RemindersPage({ onNavigate, tasks }) {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )

  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  const testNotification = () => {
    if (permission === 'granted') {
      new Notification('Doit reminder 🔥', {
        body: 'Time to check your tasks and stay on track!',
        icon: '/icons/icon-192x192.png'
      })
    }
  }

  const withDeadlines = tasks
    .filter(t => t.deadline && !t.completed)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

  const overdue = withDeadlines.filter(t => new Date(t.deadline) < new Date())
  const upcoming = withDeadlines.filter(t => new Date(t.deadline) >= new Date())

  const formatDeadline = (dt) => {
    const d = new Date(dt)
    const diff = d - new Date()
    if (diff < 0) {
      const mins = Math.abs(Math.round(diff / 60000))
      if (mins < 60) return `Overdue by ${mins} min${mins !== 1 ? 's' : ''}`
      const hrs = Math.abs(Math.round(diff / 3600000))
      if (hrs < 24) return `Overdue by ${hrs} hour${hrs !== 1 ? 's' : ''}`
      const days = Math.abs(Math.round(diff / 86400000))
      return `Overdue by ${days} day${days !== 1 ? 's' : ''}`
    }
    const mins = Math.round(diff / 60000)
    if (mins < 60) return `Due in ${mins} min${mins !== 1 ? 's' : ''}`
    const hours = Math.round(diff / 3600000)
    if (hours < 24) return `Due in ${hours} hour${hours !== 1 ? 's' : ''}`
    const days = Math.round(diff / 86400000)
    return `Due in ${days} day${days !== 1 ? 's' : ''}`
  }

  const notifStatus = {
    granted: { icon: '🔔', title: 'Notifications enabled', desc: 'You will receive reminders for tasks with deadlines.', border: 'border-[rgba(78,203,161,0.3)]', bg: 'bg-[#eafaf4] dark:bg-[#0d2a1e]' },
    denied:  { icon: '🔕', title: 'Notifications blocked', desc: 'Go to your browser settings to re-enable notifications.', border: 'border-[rgba(247,122,106,0.3)]', bg: 'bg-[#fff0f0] dark:bg-[#2a0d0d]' },
    default: { icon: '🔔', title: 'Enable notifications', desc: 'Allow notifications so Doit can remind you about upcoming tasks.', border: 'border-[rgba(124,106,247,0.15)]', bg: '' },
  }
  const status = notifStatus[permission] || notifStatus.default

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      {/* Back to Dashboard — mobile only */}
      <button
        onClick={() => onNavigate && onNavigate('Dashboard')}
        className="lg:hidden flex items-center gap-1.5 text-xs mb-4 px-1"
        style={{ color: 'var(--text3)' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 2L4 7l5 5"/>
        </svg>
        Dashboard
      </button>

      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Reminders</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>Stay on top of your deadlines</p>
      </div>

      {/* Notification permission card — always black text for readability */}
      <div className={`rounded-2xl p-5 border ${status.border} ${status.bg}`}
        style={!status.bg ? { background: 'var(--surface)', border: '0.5px solid var(--border)' } : {}}>
        <div className="flex items-start gap-4">
          <div className="text-2xl">{status.icon}</div>
          <div className="flex-1">
            {/* Always use #1a1a2e for title so it's readable on both light and coloured backgrounds */}
            <div className="font-bold text-sm mb-1" style={{ color: '#1a1a2e' }}>
              {status.title}
            </div>
            <div className="text-xs mb-3" style={{ color: '#4a4a6a' }}>
              {status.desc}
            </div>
            {permission === 'default' && (
              <button onClick={requestPermission}
                className="px-4 py-2 bg-[#7c6af7] text-white rounded-xl text-sm font-medium hover:bg-[#6a58e5] transition-colors">
                Enable notifications
              </button>
            )}
            {permission === 'granted' && (
              <button onClick={testNotification}
                className="px-4 py-2 bg-[#4ecba1] text-white rounded-xl text-sm font-medium hover:bg-[#3ab88e] transition-colors">
                Send test notification
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-red-400 mb-3">⚠ Overdue ({overdue.length})</h2>
          <div className="flex flex-col gap-2">
            {overdue.map(t => (
              <div key={t.id} className="rounded-2xl p-4 flex items-center gap-3 border border-red-200 dark:border-red-900"
                style={{ background: 'var(--surface)' }}>
                <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{t.text}</div>
                  <div className="text-xs text-red-400 mt-0.5">{formatDeadline(t.deadline)}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--surface2)', color: 'var(--text3)' }}>{t.tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text)' }}>Upcoming ({upcoming.length})</h2>
          <div className="flex flex-col gap-2">
            {upcoming.map(t => (
              <div key={t.id} className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}>
                <div className="w-2 h-2 rounded-full bg-[#7c6af7] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{t.text}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                    {formatDeadline(t.deadline)} · {new Date(t.deadline).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-[10px] bg-[#f0eeff] text-[#7c6af7] px-2 py-0.5 rounded-full flex-shrink-0">
                  {t.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {withDeadlines.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--text3)' }}>
          <div className="text-5xl mb-3">⏰</div>
          <p className="text-sm font-medium">No deadlines set</p>
          <p className="text-xs mt-1">When adding tasks, tap the ⏰ icon to set a deadline.</p>
        </div>
      )}
    </div>
  )
}
