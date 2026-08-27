import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useProfile } from './hooks/useProfile'
import { useNotificationPermission, useReminderScheduler } from './hooks/useReminderScheduler'
import AddTask from './components/AddTask'
import TaskList from './components/TaskList'
import LibraryPanel from './components/LibraryPanel'
import DarkModeToggle from './components/DarkModeToggle'
import MyTasksPage from './pages/MyTasksPage'
import AIBreakdownPage from './pages/AIBreakdownPage'
import ProgressPage from './pages/ProgressPage'
import AchievementsPage from './pages/AchievementsPage'
import RemindersPage from './pages/RemindersPage'

const MESSAGES = {
  en: ["Progress, not perfection. Every task is a step forward.", "You've got this. One task at a time.", "Small wins build big momentum. Keep going!", "Done is better than perfect."],
  fr: ["Le progrès, pas la perfection. Chaque tâche est un pas en avant.", "Vous pouvez le faire. Une tâche à la fois."],
  es: ["Progreso, no perfección. Cada tarea es un paso adelante.", "¡Tú puedes! Una tarea a la vez."],
  yo: ["Ìgbésẹ̀ kọ̀ọ̀kan tí o ṣe mú ọ sún mọ ibi-afẹ́de rẹ.", "O le ṣe é. Ìṣẹ́ kan lẹ̀ẹ̀kan."],
  ig: ["Ọ dị mma ịga n'ihu. Ọrụ ọ bụla na-ebugharị gị n'ihu."],
  ha: ["Ci gaba, ba kamala ba. Kowane aiki mataki ne gaba."],
}
const MOODS = [
  { key: 'tired', emoji: '😴', label: 'Tired' },
  { key: 'focused', emoji: '😊', label: 'Focused' },
  { key: 'energised', emoji: '🔥', label: 'Energised' },
]
const NAV = [
  { icon: '⊞', label: 'Dashboard' },
  { icon: '✦', label: 'My Tasks' },
  { icon: '◎', label: 'AI Breakdown' },
  { icon: '▣', label: 'Progress' },
  { icon: '◆', label: 'Achievements' },
  { icon: '◷', label: 'Reminders' },
]

export default function TodoLanding() {
  const { user, signOut } = useAuth()
  const { tasks, loading, addTask, addTaskFromAI, toggleTask, deleteTask, editTask, toggleExpand, toggleSubtask } = useTasks(user?.id)
  const { profile, allAchievements, updateMood, updateLanguage } = useProfile(user?.id, tasks)

  // Lives here (not inside RemindersPage) so reminders keep firing no matter
  // which page the user is on, as long as the app is open in a tab.
  const { permission, requestPermission } = useNotificationPermission()
  useReminderScheduler(tasks, permission)

  const [page, setPage] = useState(() => localStorage.getItem('doit-page') || 'Dashboard')
  const [filter, setFilter] = useState('All')
  const [showLibrary, setShowLibrary] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiMessage, setAiMessage] = useState("Want AI to break down a complex task into steps? Head to the AI Breakdown page from the sidebar ◎")
  const [aiLoading, setAiLoading] = useState(false)

  const language = profile?.language || 'en'
  const mood = profile?.mood || 'focused'
  const moodEmoji = MOODS.find(m => m.key === mood)?.emoji || '😊'
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'
  const motivationalMsg = (MESSAGES[language] || MESSAGES.en)[new Date().getDay() % (MESSAGES[language] || MESSAGES.en).length]

  const doneTasks = tasks.filter(t => t.completed).length
  const activeTasks = tasks.filter(t => !t.completed).length
  const todayPct = tasks.length > 0 ? Math.round(doneTasks / tasks.length * 100) : 0
  const allSubs = tasks.flatMap(t => t.subtasks || [])
  const subtaskPct = allSubs.length > 0 ? Math.round(allSubs.filter(s => s.completed).length / allSubs.length * 100) : 0

  // Dashboard only shows: (1) incomplete tasks, (2) tasks completed TODAY
  // Anything completed before today is hidden from dashboard — lives in History
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  
  const dashboardTasks = tasks.filter(t => {
    if (!t.completed) return true // always show active tasks

    const completedAt = t.completed_at ? new Date(t.completed_at) : null
    if (!completedAt) return false

    // Use local-time day boundaries so a completion at 23:58 stays on today,
    // and moves to History after crossing local midnight (00:00).
    const completedLocal = new Date(
      completedAt.getFullYear(),
      completedAt.getMonth(),
      completedAt.getDate(),
      completedAt.getHours(),
      completedAt.getMinutes(),
      completedAt.getSeconds(),
      completedAt.getMilliseconds()
    )

    return completedLocal >= todayStart // only show if completed since local midnight
  })


  const filteredTasks = dashboardTasks.filter(t =>
    filter === 'Active' ? !t.completed : filter === 'Completed' ? t.completed : true
  )

  // Simple task add — no AI here. AI breakdown lives only on the AI Breakdown page
  const handleAddTask = async ({ text, tag, deadline }) => {
    await addTask({ text, tag, deadline })
  }

  const handleAiChip = (type) => {
    setAiLoading(true)
    const msgs = {
      reorder: 'Start with quick wins to build momentum, then tackle deep work at peak energy.',
      remind: 'Tap ⏰ when adding a task to set a deadline — it shows up in Reminders.',
      mood: mood === 'tired' ? 'You\'re tired — pick just 1 small task and call that a win today.' :
            mood === 'energised' ? 'You\'re on fire! 🔥 Tackle your hardest task first.' :
            'Focused mode is perfect for deep work. Lock in on your top priority.',
    }
    setTimeout(() => { setAiMessage(msgs[type]); setAiLoading(false) }, 800)
  }

  const greet = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  const navTo = (label) => {
    setPage(label)
    localStorage.setItem('doit-page', label)
    setSidebarOpen(false)
  }

  // Sidebar content reused on both mobile drawer + desktop
  const SidebarContent = () => (
    <>
      {NAV.map(item => (
        <button key={item.label} onClick={() => navTo(item.label)}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all w-full ${
            page === item.label ? 'bg-[#7c6af7]/25 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          }`}>
          <span>{item.icon}</span>{item.label}
        </button>
      ))}
      <div className="mt-2 pt-2 border-t border-white/10">
        <button onClick={() => { setShowLibrary(true); setSidebarOpen(false) }}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-all w-full text-left">
          <span>📚</span> History
        </button>
        <DarkModeToggle sidebar />
      </div>
      <div className="mt-auto bg-white/5 rounded-xl p-3 border border-white/10">
        <div className="text-[10px] text-white/30 uppercase tracking-widest mb-2">How are you feeling?</div>
        <p className="text-[10px] text-white/20 mb-2">This adjusts how AI breaks down your tasks</p>
        <div className="flex gap-1.5">
          {MOODS.map(m => (
            <button key={m.key} onClick={() => updateMood(m.key)} title={m.label}
              className={`flex-1 py-1.5 rounded-lg text-sm transition-all ${mood === m.key ? 'bg-[#7c6af7]' : 'bg-white/5 hover:bg-white/10'}`}>
              {m.emoji}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7c6af7] to-[#f7a26a] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-white/70 text-xs font-medium truncate">{user?.email?.split('@')[0]}</span>
          </div>
        </div>
        <button onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-300 text-xs transition-all">
          ↩ Sign out
        </button>
      </div>
    </>
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f7a26a]" />
          <span className="font-bold text-xl" style={{ color: 'var(--text)' }}>doit.</span>
        </div>
        <div className="flex gap-1">
          {[0,150,300].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-[#7c6af7] animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
        </div>
      </div>
    </div>
  )

  // Render the correct page
  const renderPage = () => {
    switch(page) {
      case 'My Tasks': return (
        <MyTasksPage tasks={tasks} onAdd={handleAddTask} onToggle={toggleTask} onDelete={deleteTask}
          onEdit={editTask} onToggleExpand={toggleExpand} onToggleSubtask={toggleSubtask} />
      )
      case 'AI Breakdown': return <AIBreakdownPage tasks={tasks} mood={mood} onSaveBreakdown={addTaskFromAI} />
      case 'Progress': return <ProgressPage tasks={tasks} profile={profile} />
      case 'Achievements': return <AchievementsPage allAchievements={allAchievements} tasks={tasks} profile={profile} />
      case 'Reminders': return <RemindersPage tasks={tasks} permission={permission} requestPermission={requestPermission} />
      default: return <DashboardPage />
    }
  }

  const DashboardPage = () => (
    <div style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-7 pt-6 pb-2">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            {greet()}, <span className="text-[#7c6af7]">{userName}</span>
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
            {activeTasks > 0 ? `${activeTasks} task${activeTasks > 1 ? 's' : ''} to tackle today` : 'All caught up! Great work 🎉'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs px-3 py-1.5 rounded-full whitespace-nowrap" style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', color: 'var(--text3)' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
          <select value={language} onChange={e => updateLanguage(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-full outline-none cursor-pointer"
            style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', color: 'var(--text2)' }}>
            <option value="en">EN</option><option value="fr">FR</option><option value="es">ES</option>
            <option value="yo">YO</option><option value="ig">IG</option><option value="ha">HA</option>
          </select>
        </div>
      </div>

      <div className="px-4 sm:px-7 pb-6 flex flex-col gap-4">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { val: doneTasks, label: 'Done Today', color: '#7c6af7' },
            { val: activeTasks, label: 'In Progress', color: '#f7a26a' },
            { val: `🔥 ${profile?.streak || 0}`, label: 'Day Streak', color: '#4ecba1' },
            { val: `${todayPct}%`, label: "Today's Goal", color: 'var(--text)' },
          ].map(card => (
            <div key={card.label} className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}>
              <div className="text-2xl font-bold" style={{ color: card.color }}>{card.val}</div>
              <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--text3)' }}>{card.label}</div>
              {card.label === "Today's Goal" && (
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                  <div className="h-full bg-[#7c6af7] rounded-full" style={{ width: `${todayPct}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Motivational banner */}
        <div className="rounded-xl px-4 py-2.5 flex items-center gap-2" style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}>
          <span className="text-[#7c6af7]">✦</span>
          <span className="text-sm text-[#7c6af7] italic flex-1">{motivationalMsg}</span>
          <span className="text-lg">{moodEmoji}</span>
        </div>

        {/* Two-column (stacks on mobile) */}
        <div className="flex flex-col lg:grid lg:gap-4 gap-4" style={{ gridTemplateColumns: '1fr 360px' }}>
          {/* Task panel */}
          <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm" style={{ color: 'var(--text)' }}>Tasks</h2>
              <div className="flex gap-1">
                {['All','Active','Completed'].map(tab => (
                  <button key={tab} onClick={() => setFilter(tab)}
                    className={`px-3 py-1 rounded-full text-xs transition-all ${filter === tab ? 'bg-[#7c6af7] text-white' : ''}`}
                    style={filter !== tab ? { color: 'var(--text2)' } : {}}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <AddTask onAdd={handleAddTask} />
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10" style={{ color: 'var(--text3)' }}>
                <div className="text-4xl mb-2">📋</div>
                <p className="text-sm">{filter === 'All' ? 'No tasks yet. Add one above!' : `No ${filter.toLowerCase()} tasks`}</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[50vh]">
                <TaskList tasks={filteredTasks} onToggle={toggleTask} onDelete={deleteTask}
                  onEdit={editTask} onToggleExpand={toggleExpand} onToggleSubtask={toggleSubtask} />
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* AI panel */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f6e] rounded-2xl p-5 text-white">
              <div className="font-bold text-sm mb-0.5">AI Execution Assistant</div>
              <div className="text-[11px] text-white/40 mb-3">Powered by adaptive planning</div>
              <div className={`bg-white/10 border-l-2 border-[#7c6af7] rounded-lg p-3 text-xs text-white/80 leading-relaxed ${aiLoading ? 'opacity-50' : ''}`}>
                {aiLoading
                  ? <span className="flex items-center gap-2"><span className="animate-pulse">◎</span> AI is thinking...</span>
                  : aiMessage}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[{key:'reorder',label:'Reorder for focus'},{key:'remind',label:'Set reminder'},{key:'mood',label:'Adjust for mood'}].map(chip => (
                  <button key={chip.key} onClick={() => handleAiChip(chip.key)}
                    className="px-3 py-1.5 rounded-full text-[11px] bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/10 transition-all">
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>Achievements</h3>
                <span className="text-[10px] bg-[#faeeda] text-[#633806] px-2 py-0.5 rounded-full font-medium">
                  {allAchievements.filter(a => a.earned).length} earned
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allAchievements.map(a => (
                  <div key={a.id} title={a.label}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all ${
                      a.earned ? 'bg-[#f0eeff] border-[rgba(124,106,247,0.3)] scale-105' : 'bg-[#f6f5ff] border-[rgba(124,106,247,0.1)] opacity-40 grayscale'
                    }`}>
                    {a.emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text)' }}>Today's Progress</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Tasks done', pct: todayPct, color: '#7c6af7' },
                  { label: 'Subtasks', pct: subtaskPct, color: '#4ecba1' },
                  { label: 'Streak', pct: Math.min((profile?.streak || 0) * 10, 100), color: '#f7a26a' },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-2">
                    <span className="text-xs w-20 flex-shrink-0" style={{ color: 'var(--text2)' }}>{row.label}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${row.pct}%`, background: row.color }} />
                    </div>
                    <span className="text-xs w-7 text-right" style={{ color: 'var(--text3)' }}>{row.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Mobile topbar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40" style={{ background: 'var(--sidebar-bg)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#f7a26a]" />
          <span className="font-bold text-lg text-white">doit.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg">{moodEmoji}</span>
          <button onClick={() => setSidebarOpen(true)} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect y="3" width="20" height="2" rx="1"/>
              <rect y="9" width="20" height="2" rx="1"/>
              <rect y="15" width="20" height="2" rx="1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 h-full flex flex-col p-4 z-10 overflow-y-auto" style={{ background: 'var(--sidebar-bg)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f7a26a]" />
                <span className="font-bold text-xl text-white">doit.</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-white p-1">✕</button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        <aside className="w-[220px] flex flex-col gap-1 p-4 flex-shrink-0 overflow-y-auto" style={{ background: 'var(--sidebar-bg)' }}>
          <div className="flex items-center gap-2 px-2 pb-5 pt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f7a26a]" />
            <span className="font-bold text-xl text-white tracking-tight">doit.</span>
          </div>
          <SidebarContent />
        </aside>
        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      </div>

      {/* Mobile content */}
      <div className="lg:hidden pb-8">{renderPage()}</div>

      {showLibrary && (
        <LibraryPanel
          isOpen={showLibrary}
          onClose={() => setShowLibrary(false)}
          taskHistory={tasks}
          onReAddTask={async (task) => {
            // Re-add history items by restoring them as active tasks.
            // App state/DB uses: completed + completed_at
            if (task?.completed) {
              await toggleTask(task.id)
              // If the toggle turns it back to completed (because it was already completed),
              // then toggle again. This makes the restore idempotent.
              // (toggleTask flips completed.)
              const restored = tasks.find(t => t.id === task.id)
              if (restored?.completed) await toggleTask(task.id)
              return
            }

            // If the DB supports `deleted`, the current codebase deletes tasks permanently via supabase delete().
            // There isn't an active “deleted” restore path implemented in useTasks.
            // For safety, we re-create the task as a new active task.
            if (task?.deleted) {
              await addTask({ text: task.text, tag: task.tag || 'General', deadline: task.deadline || null })
              return
            }

            // Active tasks in history: do nothing
          }}
          onPermanentDelete={async (taskId) => {
            // Permanently delete isn't supported by DB schema in this codebase.
            // We can still delete the task row from Supabase.
            await deleteTask(taskId)
          }}
          onClearAllDeleted={async () => {
            // Delete all tasks that are marked deleted (if any)
            const deletedTasks = tasks.filter(t => t.deleted)
            for (const t of deletedTasks) await deleteTask(t.id)
          }}
        />
      )}
    </div>
  )
}
