import { useState } from 'react'

export default function AIBreakdownPage({ tasks, mood }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

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
      const { subtasks, error } = await res.json()
      if (error || !subtasks) throw new Error(error || 'No subtasks returned')
      const entry = { task: text, steps: subtasks, timestamp: new Date() }
      setResult(entry)
      setHistory(prev => [entry, ...prev])
      setInput('')
    } catch (err) {
      setResult({ task: text, steps: null, error: "AI breakdown isn't available right now. Add your Anthropic API key to enable this feature." })
    } finally {
      setLoading(false)
    }
  }

  const tasksWithSubtasks = tasks.filter(t => t.subtasks?.length > 0)

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
          <h2 className="text-sm font-bold text-[#1a1a2e] dark:text-white mb-3">Tasks with AI breakdowns</h2>
          <div className="flex flex-col gap-3">
            {tasksWithSubtasks.map(task => (
              <div key={task.id} className="bg-white dark:bg-[#1e1e3a] border border-[rgba(124,106,247,0.12)] rounded-2xl p-4">
                <div className="font-medium text-sm text-[#1a1a2e] dark:text-white mb-2">{task.text}</div>
                <div className="flex flex-col gap-1.5">
                  {task.subtasks.map((sub, i) => (
                    <div key={sub.id} className="flex items-center gap-2 text-xs text-[#6b6b8a]">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sub.completed ? 'bg-[#4ecba1]' : 'bg-[#7c6af7]'}`} />
                      <span className={sub.completed ? 'line-through opacity-50' : ''}>{sub.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 h-1 bg-[#f0eeff] rounded-full overflow-hidden">
                  <div className="h-full bg-[#7c6af7] rounded-full" style={{ width: `${Math.round(task.subtasks.filter(s=>s.completed).length / task.subtasks.length * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
