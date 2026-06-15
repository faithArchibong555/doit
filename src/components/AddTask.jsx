import { useState } from 'react'

const TAGS = ['General', 'Work', 'Health', 'Personal', 'Finance', 'Learning']
const TAG_COLORS = {
  General:  { bg: '#f0eeff', text: '#3C3489' },
  Work:     { bg: '#E6F1FB', text: '#0C447C' },
  Health:   { bg: '#E1F5EE', text: '#085041' },
  Personal: { bg: '#F8EEFF', text: '#5C1A7E' },
  Finance:  { bg: '#FAEEDA', text: '#633806' },
  Learning: { bg: '#FAECE7', text: '#712B13' },
}

export default function AddTask({ onAdd }) {
  const [input, setInput] = useState('')
  const [tag, setTag] = useState('General')
  const [deadline, setDeadline] = useState('')


  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleAdd = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setDeadline('')
    setShowDatePicker(false)
    await onAdd({ text, tag, deadline: deadline || null })
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="What needs to get done?"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="flex-1 px-3 py-2.5 text-sm border rounded-xl outline-none transition-colors"
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        />

        {/* Clock button — same height as Add button */}
        <button
          type="button"
          onClick={() => setShowDatePicker(s => !s)}
          title="Set deadline"
          className={`h-10 w-10 flex items-center justify-center rounded-xl border text-base transition-all flex-shrink-0 ${
            deadline
              ? 'bg-[#7c6af7] border-[#7c6af7] text-white'
              : 'border-[rgba(124,106,247,0.2)] hover:border-[#7c6af7]'
          }`}
          style={!deadline ? { background: 'var(--surface2)', color: 'var(--text2)' } : {}}
        >
          ⏰
        </button>

        {/* Add button — no + icon AND text, just the word */}
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="h-10 px-5 bg-[#7c6af7] hover:bg-[#6a58e5] disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-all flex-shrink-0"
        >
          Add
        </button>
      </div>

      {/* Date picker — shown inline when clock is tapped */}
      {showDatePicker && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--text2)' }}>Set deadline:</span>
          <input
            type="datetime-local"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: 'var(--text)' }}
          />

          {deadline && (
            <button onClick={() => { setDeadline(''); setShowDatePicker(false) }}
              className="text-xs text-red-400 hover:text-red-500">
              Clear
            </button>
          )}
        </div>
      )}

      {/* Tag row */}
      <div className="flex gap-1.5 flex-wrap">
        {TAGS.map(t => {
          const c = TAG_COLORS[t]
          return (
            <button
              key={t}
              onClick={() => setTag(t)}
              className="text-[10px] px-2.5 py-1 rounded-full font-medium transition-all border"
              style={{
                background: tag === t ? c.bg : 'transparent',
                color: tag === t ? c.text : 'var(--text3)',
                borderColor: tag === t ? c.bg : 'var(--border)',
              }}
            >
              {t}
            </button>
          )
        })}
      </div>
    </div>
  )
}
