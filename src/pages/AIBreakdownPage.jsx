import { useMemo, useState } from 'react'

export default function AIBreakdownPage({ tasks, mood, onSaveBreakdown }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const tasksWithSubtasks = useMemo(() => {
    return (tasks || [])
      .filter(t => t.subtasks?.length > 0)
      // newest first (fallback to id)
      .sort((a, b) => (b.created_at ? new Date(b.created_at) : 0) - (a.created_at ? new Date(a.created_at) : 0))
  }, [tasks])

  // show most recent few, collapse the rest to keep page tidy
  const RECENT_LIMIT = 3
  const recentTasks = tasksWithSubtasks.slice(0, RECENT_LIMIT)
  const olderTasks = tasksWithSubtasks.slice(RECENT_LIMIT)
  const [showOlder, setShowOlder] = useState(false)

  const handleBreakdown = async () => {
    const text = input.trim()
    if (!text) return
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: text, mood: mood || 'focused' })
      })
      const payload = await res.json()
      const subtasks = payload.subtasks
      const error = payload.error
      const details = payload.details
      if (error || !subtasks) {
        const detailMsg = details ? (typeof details === 'string' ? details : details.message || JSON.stringify(details)) : null
        throw new Error(detailMsg ? `${error || 'AI error'}: ${detailMsg}` : (error || 'No subtasks returned'))
      }
      const entry = { task: text, steps: subtasks, timestamp: new Date() }
      setResult(entry)
      setInput('')

      // Persist to Supabase so it appears on My Tasks (and acts like history)
      if (onSaveBreakdown) {
        await onSaveBreakdown({ taskText: text, subtasks })
      }
    } catch (err) {
      setResult({
        task: text,
        steps: null,
        error: err.message || "An unexpected error occurred."
      })
    } finally {
      setLoading(false)
    }
  }

  const historyTasks = showOlder ? tasksWithSubtasks : recentTasks

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">


      <div>
        <h1 className="text-xl font-bold text-[#1a1a2e] dark:text-white">AI Breakdown</h1>
        <p className="text-sm text-[#6b6b8a] mt-0.5">Type any goal or complex task and AI will turn it into clear steps</p>
      </div>

      {/* Input */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f6e] rounded-2xl p-6">
        <div className="text-white font-bold text-sm mb-1">What do you want to accomplish?</div>
        <div className="text-white/40 text-xs mb-4">Be as specific or vague as you like — AI will clarify</div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleBreakdown() }}}
          placeholder="e.g. Launch my app, Learn to cook pasta, Write a business plan..."
          rows={3}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-[#7c6af7] resize-none"
        />
        <button
          onClick={handleBreakdown}
          disabled={loading || !input.trim()}
          className="mt-3 w-full py-3 bg-[#7c6af7] hover:bg-[#6a58e5] disabled:opacity-40 text-white rounded-xl font-medium text-sm transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Breaking it down...
            </span>
          ) : '✦ Break this down'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white dark:bg-[#1e1e3a] border border-[rgba(124,106,247,0.2)] rounded-2xl p-5">
          <div className="text-xs text-[#7c6af7] font-medium uppercase tracking-wider mb-2">Your roadmap</div>
          <div className="font-bold text-[#1a1a2e] dark:text-white mb-4">"{result.task}"</div>
          {result.error ? (
            <div className="text-sm text-[#f7a26a] bg-[#fdf3e9] p-3 rounded-xl">{result.error}</div>
          ) : (
            <div className="flex flex-col gap-2">
              {result.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-[#f8f7ff] dark:bg-[#252545] rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-[#7c6af7] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-sm text-[#1a1a2e] dark:text-white/80">{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tasks that already have AI breakdowns */}
      {tasksWithSubtasks.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[#1a1a2e] dark:text-white mb-3">
            Recent AI breakdown history
          </h2>
          {olderTasks.length > 0 && (
            <div className="mb-3">
              <button
                onClick={() => setShowOlder(v => !v)}
                className="text-xs px-3 py-1.5 rounded-full border border-[rgba(124,106,247,0.25)] text-[#7c6af7] hover:bg-white/5 transition-all"
              >
                {showOlder ? 'Show fewer' : `Show ${olderTasks.length} more`}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {historyTasks.map(task => (
              <div key={task.id} className="bg-white dark:bg-[#1e1e3a] border border-[rgba(124,106,247,0.12)] rounded-2xl p-4">
                <div className="font-medium text-sm text-[#1a1a2e] dark:text-white mb-2">{task.text}</div>
                <div className="flex flex-col gap-1.5">
                  {task.subtasks.map((sub, i) => (
                    <div key={sub.id} className="flex items-center gap-2 text-xs text-[#6b6b8a]">
                      <button
                        type="button"
                        onClick={() => {
                          // Reuse the same parent/subtask completion logic from My Tasks.
                          // This page currently only visualizes history; marking is handled
                          // via the main TaskList UI in My Tasks.
                          // (No-op here to avoid breaking behavior without wiring.)
                        }}
                        className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 border transition-colors ${
                          sub.completed
                            ? 'bg-[#4ecba1] border-[#4ecba1]'
                            : 'bg-transparent border-[rgba(124,106,247,0.35)] hover:border-[#7c6af7]'
                        }`}
                        aria-label={sub.completed ? 'Mark subtask incomplete' : 'Mark subtask complete'}
                      >
                        {sub.completed && (
                          <svg width="10" height="10" viewBox="0 0 10 10">
                            <polyline points="1,5 4,8 9,2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                          </svg>
                        )}
                      </button>
                      <span className={sub.completed ? 'line-through opacity-50' : ''}>{sub.text}</span>

                    </div>
                  ))}
                </div>
                <div className="mt-2 h-1 bg-[#f0eeff] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7c6af7] rounded-full"
                    style={{
                      width: `${Math.round(task.subtasks.filter(s => s.completed).length / task.subtasks.length * 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
