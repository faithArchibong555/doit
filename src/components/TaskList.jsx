import { useState } from 'react'

const TAG_COLORS = {
  General:  { bg: '#f0eeff', text: '#3C3489' },
  Work:     { bg: '#E6F1FB', text: '#0C447C' },
  Health:   { bg: '#E1F5EE', text: '#085041' },
  Personal: { bg: '#F8EEFF', text: '#5C1A7E' },
  Finance:  { bg: '#FAEEDA', text: '#633806' },
  Learning: { bg: '#FAECE7', text: '#712B13' },
}

export default function TaskList({ tasks, onToggle, onDelete, onEdit, onToggleExpand, onToggleSubtask }) {
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const startEdit = (task) => {
    setEditingId(task.id)
    setEditText(task.text)
  }

  const saveEdit = (id) => {
    if (editText.trim()) onEdit(id, editText.trim())
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map(task => {
        const colors = TAG_COLORS[task.tag] || TAG_COLORS.General
        const subtasks = task.subtasks || []
        const doneSubtasks = subtasks.filter(s => s.completed).length
        const isEditing = editingId === task.id

        return (
          <div key={task.id} className={`border rounded-xl transition-all ${task.completed ? 'opacity-60' : ''} ${task.expanded ? 'border-[rgba(124,106,247,0.3)] bg-[#faf9ff]' : 'border-[rgba(124,106,247,0.12)] bg-white hover:border-[rgba(124,106,247,0.25)]'}`}>
            {/* Main task row */}
            <div className="flex items-center gap-2.5 p-3">
              {/* Checkbox */}
              <button
                onClick={() => onToggle(task.id)}
                className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                  task.completed ? 'bg-[#4ecba1] border-[#4ecba1]' : 'border-[rgba(124,106,247,0.3)] hover:border-[#7c6af7]'
                }`}
                style={{ width: 18, height: 18 }}
              >
                {task.completed && (
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <polyline points="1,5 4,8 9,2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </button>

              {/* Task text */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    autoFocus
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(task.id); if (e.key === 'Escape') setEditingId(null) }}
                    className="w-full text-sm bg-transparent border-b border-[#7c6af7] outline-none text-[#1a1a2e] py-0"
                  />
                ) : (
                  <span className={`text-sm ${task.completed ? 'line-through text-[#a0a0bc]' : 'text-[#1a1a2e]'}`}>
                    {task.text}
                  </span>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: colors.bg, color: colors.text }}>
                    {task.tag || 'General'}
                  </span>
                  {subtasks.length > 0 && (
                    <span className="text-[10px] text-[#a0a0bc]">{doneSubtasks}/{subtasks.length} steps</span>
                  )}
                  {task.deadline && (
                    <span className="text-[10px] text-[#a0a0bc]">⏰ {new Date(task.deadline).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {isEditing ? (
                  <button onClick={() => saveEdit(task.id)} className="p-1.5 text-[#4ecba1] hover:bg-[#e1f5ee] rounded-lg transition-colors">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1,7 5,11 13,3" />
                    </svg>
                  </button>
                ) : (
                  <button onClick={() => startEdit(task)} className="p-1.5 text-[#a0a0bc] hover:text-[#7c6af7] hover:bg-[#f0eeff] rounded-lg transition-colors">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8.5 1.5l2 2L3 11H1V9L8.5 1.5z" />
                    </svg>
                  </button>
                )}
                <button onClick={() => onDelete(task.id)} className="p-1.5 text-[#a0a0bc] hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 3h10M4 3V2h4v1M5 5.5v3M7 5.5v3M2 3l.7 7.5A1 1 0 003.7 11h4.6a1 1 0 001-.9L10 3" />
                  </svg>
                </button>
                {subtasks.length > 0 && (
                  <button
                    onClick={() => onToggleExpand(task.id)}
                    className="p-1.5 text-[#a0a0bc] hover:text-[#7c6af7] hover:bg-[#f0eeff] rounded-lg transition-colors text-[10px]"
                  >
                    {task.expanded ? '▲' : '▼'}
                  </button>
                )}
              </div>
            </div>

            {/* Subtasks */}
            {task.expanded && subtasks.length > 0 && (
              <div className="px-3 pb-3 flex flex-col gap-1.5 border-t border-[rgba(124,106,247,0.1)] pt-2 mt-0">
                {subtasks.map(sub => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white border border-[rgba(124,106,247,0.1)] cursor-pointer hover:border-[rgba(124,106,247,0.25)] transition-colors"
                    onClick={() => onToggleSubtask(task.id, sub.id)}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${sub.completed ? 'bg-[#4ecba1]' : 'bg-[#7c6af7]'}`} />
                    <span className={`text-xs ${sub.completed ? 'line-through text-[#a0a0bc]' : 'text-[#6b6b8a]'}`}>
                      {sub.text}
                    </span>
                  </div>
                ))}
                {/* Subtask progress bar */}
                <div className="h-1 bg-[#f0eeff] rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-[#7c6af7] rounded-full transition-all"
                    style={{ width: `${subtasks.length > 0 ? (doneSubtasks / subtasks.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
