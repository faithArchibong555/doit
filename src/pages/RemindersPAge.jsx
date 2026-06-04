import { useState } from 'react'

export default function RemindersPage({ tasks }) {
  const [permission, setPermission] = useState(Notification.permission)

  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  const testNotification = () => {
    if (permission === 'granted') {
      new Notification('Doit reminder 🔥', {
        body: "Time to check your tasks and stay on track!",
        icon: '/icons/icon-192x192.png'
      })
    }
  }

  // Tasks with deadlines
  const withDeadlines = tasks
    .filter(t => t.deadline && !t.completed)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

  const overdue = withDeadlines.filter(t => new Date(t.deadline) < new Date())
  const upcoming = withDeadlines.filter(t => new Date(t.deadline) >= new Date())

  const formatDeadline = (dt) => {
    const d = new Date(dt)
    const now = new Date()
    const diff = d - now
    const hours = Math.round(diff / 3600000)
    const days = Math.round(diff / 86400000)
    if (diff < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`
    if (hours < 24) return `Due in ${hours} hour${hours !== 1 ? 's' : ''}`
    return `Due in ${days} day${days !== 1 ? 's' : ''}`
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold text-[#1a1a2e] dark:text-white">Reminders</h1>
        <p className="text-sm text-[#6b6b8a] mt-0.5">Stay on top of your deadlines</p>
      </div>

      {/* Notification permission */}
      <div className={`rounded-2xl p-5 border ${
        permission === 'granted'
          ? 'bg-[#eafaf4] border-[rgba(78,203,161,0.3)]'
          : permission === 'denied'
          ? 'bg-[#fff0f0] border-[rgba(247,122,106,0.3)]'
          : 'bg-white dark:bg-[#1e1e3a] border-[rgba(124,106,247,0.15)]'
      }`}>
        <div className="flex items-start gap-4">
          <div className="text-2xl">{permission === 'granted' ? '🔔' : permission === 'denied' ? '🔕' : '🔔'}</div>
          <div className="flex-1">
            <div className="font-bold text-sm text-[#1a1a2e] dark:text-white mb-1">
              {permission === 'granted' ? 'Notifications enabled' : permission === 'denied' ? 'Notifications blocked' : 'Enable notifications'}
            </div>
            <div className="text-xs text-[#6b6b8a] mb-3">
              {permission === 'granted'
                ? 'You will receive reminders for your tasks with deadlines.'
                : permission === 'denied'
                ? 'Notifications are blocked. Go to your browser settings to re-enable them.'
                : 'Allow notifications so Doit can remind you about upcoming tasks.'}
            </div>
            {permission === 'default' && (
              <button onClick={requestPermission} className="px-4 py-2 bg-[#7c6af7] text-white rounded-xl text-sm font-medium">
                Enable notifications
              </button>
            )}
            {permission === 'granted' && (
              <button onClick={testNotification} className="px-4 py-2 bg-[#4ecba1] text-white rounded-xl text-sm font-medium">
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
              <div key={t.id} className="bg-white dark:bg-[#1e1e3a] border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#1a1a2e] dark:text-white truncate">{t.text}</div>
                  <div className="text-xs text-red-400 mt-0.5">{formatDeadline(t.deadline)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[#1a1a2e] dark:text-white mb-3">Upcoming ({upcoming.length})</h2>
          <div className="flex flex-col gap-2">
            {upcoming.map(t => (
              <div key={t.id} className="bg-white dark:bg-[#1e1e3a] border border-[rgba(124,106,247,0.12)] rounded-2xl p-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#7c6af7] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#1a1a2e] dark:text-white truncate">{t.text}</div>
                  <div className="text-xs text-[#6b6b8a] mt-0.5">{formatDeadline(t.deadline)} · {new Date(t.deadline).toLocaleDateString()}</div>
                </div>
                <span className="text-[10px] bg-[#f0eeff] text-[#7c6af7] px-2 py-0.5 rounded-full flex-shrink-0">{t.tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {withDeadlines.length === 0 && (
        <div className="text-center py-12 text-[#a0a0bc]">
          <div className="text-5xl mb-3">⏰</div>
          <p className="text-sm font-medium">No deadlines set</p>
          <p className="text-xs mt-1">When adding tasks, tap the ⏰ icon to set a deadline and it will appear here.</p>
        </div>
      )}
    </div>
  )
}
