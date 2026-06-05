import { useState } from 'react'
import AddTask from '../components/AddTask'
import TaskList from '../components/TaskList'

const TAG_COLORS = {
  General:  { bg: '#f0eeff', text: '#3C3489' },
  Work:     { bg: '#E6F1FB', text: '#0C447C' },
  Health:   { bg: '#E1F5EE', text: '#085041' },
  Personal: { bg: '#F8EEFF', text: '#5C1A7E' },
  Finance:  { bg: '#FAEEDA', text: '#633806' },
  Learning: { bg: '#FAECE7', text: '#712B13' },
}

export default function MyTasksPage({ tasks, onAdd, onToggle, onDelete, onEdit, onToggleExpand, onToggleSubtask }) {
  const [filter, setFilter] = useState('All')
  const [tagFilter, setTagFilter] = useState('All')
  const tags = ['All', ...Object.keys(TAG_COLORS)]

  const filtered = tasks.filter(t => {
    const statusMatch = filter === 'All' ? true : filter === 'Active' ? !t.completed : t.completed
    const tagMatch = tagFilter === 'All' ? true : t.tag === tagFilter
    return statusMatch && tagMatch
  })

  const done = tasks.filter(t => t.completed).length
  const active = tasks.filter(t => !t.completed).length

  return (
    <div className="flex flex-col gap-5 p-6 max-w-3xl mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold text-[#1a1a2e] dark:text-white">My Tasks</h1>
        <p className="text-sm text-[#6b6b8a] mt-0.5">{active} active · {done} completed · {tasks.length} total</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', val: tasks.length, color: '#7c6af7' },
          { label: 'Active', val: active, color: '#f7a26a' },
          { label: 'Done', val: done, color: '#4ecba1' },
        ].map(c => (
          <div key={c.label} className="bg-white dark:bg-[#1e1e3a] border border-[rgba(124,106,247,0.12)] rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: c.color }}>{c.val}</div>
            <div className="text-[11px] text-[#a0a0bc] uppercase tracking-wider mt-1">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-[#1e1e3a] border border-[rgba(124,106,247,0.12)] rounded-2xl p-5">
        <h2 className="text-sm font-bold text-[#1a1a2e] dark:text-white mb-3">Add a task</h2>
        <AddTask onAdd={onAdd} />
      </div>
      <div className="flex gap-2 flex-wrap">
        {['All', 'Active', 'Completed'].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === tab ? 'bg-[#7c6af7] text-white' : 'bg-white dark:bg-[#1e1e3a] text-[#6b6b8a] border border-[rgba(124,106,247,0.15)]'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {tags.map(tag => {
          const c = TAG_COLORS[tag]
          return (
            <button key={tag} onClick={() => setTagFilter(tag)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
              style={{ background: tagFilter === tag ? (c?.bg || '#f0eeff') : 'white', color: tagFilter === tag ? (c?.text || '#3C3489') : '#a0a0bc', borderColor: tagFilter === tag ? (c?.bg || '#f0eeff') : 'rgba(124,106,247,0.12)' }}>
              {tag}
            </button>
          )
        })}
      </div>
      <div className="bg-white dark:bg-[#1e1e3a] border border-[rgba(124,106,247,0.12)] rounded-2xl p-5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#a0a0bc]">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-sm">No tasks here. {filter === 'All' && tagFilter === 'All' ? 'Add one above!' : 'Try changing filters.'}</p>
          </div>
        ) : (
          <TaskList tasks={filtered} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} onToggleExpand={onToggleExpand} onToggleSubtask={onToggleSubtask} />
        )}
      </div>
    </div>
  )
}
