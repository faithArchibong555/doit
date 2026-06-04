export default function ProgressPage({ tasks, profile }) {
  const streak = profile?.streak || 0
  const done = tasks.filter(t => t.completed).length
  const total = tasks.length
  const pct = total > 0 ? Math.round(done / total * 100) : 0

  const allSubs = tasks.flatMap(t => t.subtasks || [])
  const subsDone = allSubs.filter(s => s.completed).length
  const subsPct = allSubs.length > 0 ? Math.round(subsDone / allSubs.length * 100) : 0

  const byTag = tasks.reduce((acc, t) => {
    const tag = t.tag || 'General'
    if (!acc[tag]) acc[tag] = { total: 0, done: 0 }
    acc[tag].total++
    if (t.completed) acc[tag].done++
    return acc
  }, {})

  const TAG_COLORS = { General:'#7c6af7', Work:'#0C447C', Health:'#4ecba1', Personal:'#b04ab8', Finance:'#f7a26a', Learning:'#f77a6a' }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold text-[#1a1a2e] dark:text-white">Progress</h1>
        <p className="text-sm text-[#6b6b8a] mt-0.5">Your productivity at a glance</p>
      </div>

      {/* Big stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { val: done,    label: 'Tasks Done',   color: '#7c6af7' },
          { val: `🔥${streak}`, label: 'Day Streak', color: '#f7a26a' },
          { val: `${pct}%`,  label: 'Completion', color: '#4ecba1' },
          { val: subsDone, label: 'Steps Done',  color: '#0C447C' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#1e1e3a] border border-[rgba(124,106,247,0.12)] rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-[11px] text-[#a0a0bc] uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Overall progress bars */}
      <div className="bg-white dark:bg-[#1e1e3a] border border-[rgba(124,106,247,0.12)] rounded-2xl p-5">
        <h2 className="text-sm font-bold text-[#1a1a2e] dark:text-white mb-4">Overall progress</h2>
        <div className="flex flex-col gap-4">
          {[
            { label: 'Tasks completed', pct, color: '#7c6af7', detail: `${done} of ${total}` },
            { label: 'Steps completed', pct: subsPct, color: '#4ecba1', detail: `${subsDone} of ${allSubs.length}` },
            { label: 'Streak progress', pct: Math.min(streak * 10, 100), color: '#f7a26a', detail: `${streak} days` },
          ].map(row => (
            <div key={row.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-[#1a1a2e] dark:text-white/80">{row.label}</span>
                <span className="text-xs text-[#a0a0bc]">{row.detail}</span>
              </div>
              <div className="h-2.5 bg-[#f0eeff] dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${row.pct}%`, background: row.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By category */}
      {Object.keys(byTag).length > 0 && (
        <div className="bg-white dark:bg-[#1e1e3a] border border-[rgba(124,106,247,0.12)] rounded-2xl p-5">
          <h2 className="text-sm font-bold text-[#1a1a2e] dark:text-white mb-4">By category</h2>
          <div className="flex flex-col gap-4">
            {Object.entries(byTag).map(([tag, data]) => {
              const tagPct = Math.round(data.done / data.total * 100)
              const color = TAG_COLORS[tag] || '#7c6af7'
              return (
                <div key={tag}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium" style={{ color }}>{tag}</span>
                    <span className="text-xs text-[#a0a0bc]">{data.done}/{data.total} · {tagPct}%</span>
                  </div>
                  <div className="h-2 bg-[#f0eeff] dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${tagPct}%`, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-12 text-[#a0a0bc]">
          <div className="text-5xl mb-3">📊</div>
          <p className="text-sm">Add some tasks to start tracking your progress</p>
        </div>
      )}
    </div>
  )
}
