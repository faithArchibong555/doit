import { useState, useRef } from 'react'

const TAGS = ['General', 'Work', 'Health', 'Personal', 'Finance', 'Learning']

const TAG_COLORS = {
  General:  { bg: '#f0eeff', text: '#3C3489' },
  Work:     { bg: '#E6F1FB', text: '#0C447C' },
  Health:   { bg: '#E1F5EE', text: '#085041' },
  Personal: { bg: '#F8EEFF', text: '#5C1A7E' },
  Finance:  { bg: '#FAEEDA', text: '#633806' },
  Learning: { bg: '#FAECE7', text: '#712B13' },
}

export default function AddTask({ onAdd, isBreakingDown }) {
  const [input, setInput] = useState('')
  const [tag, setTag] = useState('General')
  const [deadline, setDeadline] = useState('')
  const [showTags, setShowTags] = useState(false)

  const handleAdd = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setDeadline('')
    await onAdd({ text, tag, deadline: deadline || null })
  }

  const colors = TAG_COLORS[tag]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a task — AI will break it down for you..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="flex-1 px-3 py-2.5 text-sm border border-[rgba(124,106,247,0.2)] rounded-xl bg-[#f8f7ff] text-[#1a1a2e] placeholder:text-[#a0a0bc] outline-none focus:border-[#7c6af7] transition-colors"
        />
        <div className="relative">
          <input
            type="datetime-local"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
          <div className="w-10 h-10 flex items-center justify-center border border-[rgba(124,106,247,0.2)] rounded-xl bg-[#f8f7ff] text-base">⏰</div>
        </div>
        <button
          onClick={handleAdd}
          disabled={isBreakingDown || !input.trim()}
          className="px-4 py-2 bg-[#7c6af7] hover:bg-[#6a58e5] disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-all"
        >
          {isBreakingDown ? '...' : '+ Add'}
        </button>
      </div>

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
                color: tag === t ? c.text : '#a0a0bc',
                borderColor: tag === t ? c.bg : 'rgba(124,106,247,0.12)'
              }}
            >
              {t}
            </button>
          )
        })}
      </div>

      {isBreakingDown && (
        <div className="flex items-center gap-2 text-[11px] text-[#7c6af7]">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#7c6af7] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#7c6af7] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#7c6af7] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          AI is generating your step-by-step plan...
        </div>
      )}
    </div>
  )
}
