import { useState, useEffect } from 'react'

// Live countdown — updates every second, shows exactly what the user set
function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function formatDiff(deadline, now) {
  const diff = new Date(deadline) - now
  const abs = Math.abs(diff)
  const overdue = diff < 0

  const totalSecs = Math.floor(abs / 1000)
  const secs = totalSecs % 60
  const mins = Math.floor(totalSecs / 60) % 60
  const hours = Math.floor(totalSecs / 3600) % 24
  const days = Math.floor(totalSecs / 86400)

  let str = ''
  if (days > 0) str = `${days}d ${hours}h`
  else if (hours > 0) str = `${hours}h ${mins}m`
  else if (mins > 0) str = `${mins}m ${secs}s`
  else str = `${secs}s`

  return overdue ? `Overdue by ${str}` : `Due in ${str}`
}

export default function RemindersPage({ tasks, permission, requestPermission }) {
  const now = useNow()
  // Permission state and the actual notification scheduling now live in
  // TodoLanding (via useReminderScheduler), so they survive navigating away
  // from this page. This component only handles display + the permission
  // prompt UI + firing an instant test notification.

  const testNotification = () => {
    if (permission === 'granted') {
      new Notification('Doit reminder 🔥', {
        body: 'This is what your task reminders will look like!',
        icon: '/icons/icon-192x192.png'
      })
    }
  }

  const withDeadlines = tasks
    .filter(t => t.deadline && !t.completed)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

  const overdue = withDeadlines.filter(t => new Date(t.deadline) < now)
  const upcoming = withDeadlines.filter(t => new Date(t.deadline) >= now)

  const notifStatus = {
    granted: { icon: '🔔', title: 'Notifications enabled', desc: 'You will receive a notification when each task deadline arrives.', borderColor: 'rgba(78,203,161,0.3)', bg: '#eafaf4' },
    denied:  { icon: '🔕', title: 'Notifications blocked', desc: 'Go to your browser or phone settings and allow notifications for this app.', borderColor: 'rgba(247,122,106,0.3)', bg: '#fff0f0' },
    default: { icon: '🔔', title: 'Enable notifications', desc: 'Allow notifications so Doit can alert you exactly when a task is due.', borderColor: 'var(--border)', bg: 'var(--surface)' },
  }
  const status = notifStatus[permission] || notifStatus.default

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Reminders</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>Live countdown to your deadlines</p>
      </div>

      {/* Notification permission */}
      <div className="rounded-2xl p-5 border" style={{ background: status.bg, borderColor: status.borderColor }}>
        <div className="flex items-start gap-4">
          <div className="text-2xl">{status.icon}</div>
          <div className="flex-1">
            <div className="font-bold text-sm mb-1" style={{ color: '#1a1a2e' }}>{status.title}</div>
            <div className="text-xs mb-3" style={{ color: '#4a4a6a' }}>{status.desc}</div>
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
            {permission === 'denied' && (
              <p className="text-xs text-red-400">
                On iPhone: Settings → Safari → {'{'}Your site{'}'} → Notifications → Allow<br/>
                On Android: Settings → Apps → Browser → Notifications → Allow
              </p>
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
                <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{t.text}</div>
                  <div className="text-xs text-red-400 mt-0.5 font-mono">{formatDiff(t.deadline, now)}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--surface2)', color: 'var(--text3)' }}>{t.tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming with live countdown */}
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
                  <div className="flex items-center gap-2 mt-0.5">
                    {/* Live countdown in monospace so it doesn't jump */}
                    <span className="text-xs font-mono text-[#7c6af7]">{formatDiff(t.deadline, now)}</span>
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>
                      · {new Date(t.deadline).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
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
          <p className="text-xs mt-1">Tap ⏰ when adding a task to set a deadline.</p>
        </div>
      )}
    </div>
  )
}
