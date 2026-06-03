import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useProfile } from './hooks/useProfile'
import AddTask from './components/AddTask'
import TaskList from './components/TaskList'
import LibraryPanel from './components/LibraryPanel'
import DarkModeToggle from './components/DarkModeToggle'

// Motivational messages per language
const MESSAGES = {
  en: [
    "Progress, not perfection. Every task is a step forward.",
    "You've got this. One task at a time.",
    "Small wins build big momentum. Keep going!",
    "The best time to start was yesterday. The next best time is now.",
    "Done is better than perfect.",
  ],
  fr: [
    "Le progrès, pas la perfection. Chaque tâche est un pas en avant.",
    "Vous pouvez le faire. Une tâche à la fois.",
    "Les petites victoires construisent de grands élans.",
  ],
  es: [
    "Progreso, no perfección. Cada tarea es un paso adelante.",
    "¡Tú puedes! Una tarea a la vez.",
    "Las pequeñas victorias construyen grandes momentos.",
  ],
  yo: [
    "Ìgbésẹ̀ kọ̀ọ̀kan tí o ṣe mú ọ sún mọ ibi-afẹ́de rẹ.",
    "O le ṣe é. Ìṣẹ́ kan lẹ̀ẹ̀kan.",
  ],
  ig: [
    "Ọ dị mma ịga n'ihu. Ọrụ ọ bụla na-ebugharị gị n'ihu.",
    "Ị nwere ike ime ya. Ọrụ otu n'otu.",
  ],
  ha: [
    "Ci gaba, ba kamala ba. Kowane aiki mataki ne gaba.",
    "Kuna iya yin shi. Aiki ɗaya a lokaci ɗaya.",
  ],
}

const MOODS = [
  { key: 'tired',     emoji: '😴', label: 'Tired' },
  { key: 'focused',   emoji: '😊', label: 'Focused' },
  { key: 'energised', emoji: '🔥', label: 'Energised' },
]

const NAV_ITEMS = [
  { icon: '⊞', label: 'Dashboard' },
  { icon: '✦', label: 'My Tasks' },
  { icon: '◎', label: 'AI Breakdown' },
  { icon: '▣', label: 'Progress' },
  { icon: '◆', label: 'Achievements' },
  { icon: '◷', label: 'Reminders' },
]

export default function TodoLanding() {
  const { user, signOut } = useAuth()
  const { tasks, loading, addTask, toggleTask, deleteTask, editTask, toggleExpand, saveSubtasks, toggleSubtask } = useTasks(user?.id)
  const { profile, allAchievements, updateMood, updateTheme, updateLanguage } = useProfile(user?.id, tasks)

  const [filter, setFilter] = useState('All')
  const [showLibrary, setShowLibrary] = useState(false)
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [aiMessage, setAiMessage] = useState("Tell me what you want to accomplish today and I'll break it down into steps for you. Just add a task above!")
  const [aiLoading, setAiLoading] = useState(false)
  const [isBreakingDown, setIsBreakingDown] = useState(false)

  const language = profile?.language || 'en'
  const mood = profile?.mood || 'focused'
  const moodEmoji = MOODS.find(m => m.key === mood)?.emoji || '😊'
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'
  const messages = MESSAGES[language] || MESSAGES.en
  const motivationalMsg = messages[new Date().getDay() % messages.length]

  // Stats
  const doneTasks = tasks.filter(t => t.completed).length
  const activeTasks = tasks.filter(t => !t.completed).length
  const todayTotal = tasks.length
  const todayPct = todayTotal > 0 ? Math.round((doneTasks / todayTotal) * 100) : 0

  const filteredTasks = tasks.filter(t => {
    if (filter === 'Active') return !t.completed
    if (filter === 'Completed') return t.completed
    return true
  })

  // Called from AddTask — handles optimistic add + AI breakdown
  const handleAddTask = async ({ text, tag, deadline }) => {
    const taskId = await addTask({ text, tag, deadline })
    if (!taskId) return

    setIsBreakingDown(true)
    setAiMessage(`Breaking down "${text}" into clear steps...`)

    try {
      const res = await fetch('/api/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: text, mood })
      })
      const { subtasks, error } = await res.json()
      if (error || !subtasks) throw new Error(error || 'No subtasks returned')

      await saveSubtasks(taskId, subtasks)
      setAiMessage(`Done! I've broken "${text}" into ${subtasks.length} clear steps. Expand the task to see them. You've got this!`)
    } catch (err) {
      console.error('AI breakdown failed:', err)
      setAiMessage(`Task added! AI breakdown isn't available right now, but you can add steps manually.`)
    } finally {
      setIsBreakingDown(false)
    }
  }

  const handleAiChip = async (type) => {
    setAiLoading(true)
    const prompts = {
      reorder: 'Based on cognitive load, I\'d suggest starting with quick wins first, then tackling deep work during your peak hours (usually mid-morning). Want me to break down any specific task further?',
      remind:  'Great idea! When adding a task, use the ⏰ icon to set a deadline. I\'ll make sure you get reminded at the right time.',
      mood:    mood === 'tired'
        ? 'Since you\'re tired, I\'ve noted that. Try to tackle just 1–2 small tasks today. Rest is productive too.'
        : mood === 'energised'
        ? 'You\'re energised — perfect time to tackle your hardest task first while your energy is high!'
        : 'You\'re focused — that\'s the best state for deep work. Pick your most important task and go!',
    }
    setTimeout(() => {
      setAiMessage(prompts[type] || 'How can I help you execute today?')
      setAiLoading(false)
    }, 800)
  }

  const greetingTime = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f5ff] flex items-center justify-center">
        <div className="text-[#7c6af7] text-sm">Loading your tasks...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f5ff]" style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* ── SIDEBAR ── */}
      <aside className="w-[220px] bg-[#1a1a2e] flex flex-col gap-1 p-4 flex-shrink-0">
        <div className="flex items-center gap-2 px-2 pb-5 pt-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f7a26a]" />
          <span className="font-bold text-xl text-white tracking-tight">doit.</span>
        </div>

        {NAV_ITEMS.map(item => (
          <button
            key={item.label}
            onClick={() => setActiveNav(item.label)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
              activeNav === item.label
                ? 'bg-[#7c6af7]/25 text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <span className="text-sm">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="mt-2 pt-2 border-t border-white/10">
          <button
            onClick={() => setShowLibrary(true)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-all w-full text-left"
          >
            <span>📚</span> History
          </button>
          <DarkModeToggle sidebar />
        </div>

        {/* Mood selector */}
        <div className="mt-auto bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-[10px] text-white/30 uppercase tracking-widest mb-2">How are you feeling?</div>
          <div className="flex gap-1.5">
            {MOODS.map(m => (
              <button
                key={m.key}
                onClick={() => updateMood(m.key)}
                title={m.label}
                className={`flex-1 py-1 rounded-lg text-sm transition-all ${
                  mood === m.key ? 'bg-[#7c6af7] scale-105' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* User + sign out */}
        <div className="flex items-center gap-2 mt-2 px-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7c6af7] to-[#f7a26a] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {userName[0]?.toUpperCase()}
          </div>
          <span className="text-white/50 text-xs truncate flex-1">{userName}</span>
          <button onClick={signOut} title="Sign out" className="text-white/30 hover:text-white/60 text-xs transition-colors">↩</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-2 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-[#1a1a2e]">
              {greetingTime()}, <span className="text-[#7c6af7]">{userName}</span> ✦
            </h1>
            <p className="text-xs text-[#6b6b8a] mt-0.5">
              {activeTasks > 0 ? `You have ${activeTasks} task${activeTasks > 1 ? 's' : ''} to tackle today` : 'All caught up! Great work 🎉'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-[#a0a0bc] bg-white border border-[rgba(124,106,247,0.15)] px-3 py-1.5 rounded-full">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            {/* Language picker */}
            <select
              value={language}
              onChange={e => updateLanguage(e.target.value)}
              className="text-xs bg-white border border-[rgba(124,106,247,0.15)] text-[#6b6b8a] px-2 py-1.5 rounded-full outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
              <option value="yo">YO</option>
              <option value="ig">IG</option>
              <option value="ha">HA</option>
            </select>
          </div>
        </div>

        <div className="px-7 pb-6 flex flex-col gap-4 flex-1">

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { val: doneTasks,              label: 'Done Today',   color: 'text-[#7c6af7]' },
              { val: activeTasks,            label: 'In Progress',  color: 'text-[#f7a26a]' },
              { val: `🔥 ${profile?.streak || 0}`, label: 'Day Streak', color: 'text-[#4ecba1]' },
              { val: `${todayPct}%`,         label: "Today's Goal", color: 'text-[#1a1a2e]' },
            ].map(card => (
              <div key={card.label} className="bg-white border border-[rgba(124,106,247,0.12)] rounded-2xl p-4">
                <div className={`text-2xl font-bold ${card.color}`}>{card.val}</div>
                <div className="text-[10px] text-[#a0a0bc] uppercase tracking-wider mt-1">{card.label}</div>
                {card.label === "Today's Goal" && (
                  <div className="mt-2 h-1 bg-[#f0eeff] rounded-full overflow-hidden">
                    <div className="h-full bg-[#7c6af7] rounded-full transition-all duration-500" style={{ width: `${todayPct}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Motivational banner */}
          <div className="bg-white border border-[rgba(124,106,247,0.15)] rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-[#7c6af7]">✦</span>
            <span className="text-sm text-[#7c6af7] italic flex-1">{motivationalMsg}</span>
            <span className="text-lg">{moodEmoji}</span>
          </div>

          {/* Two-column layout */}
          <div className="grid gap-4 flex-1" style={{ gridTemplateColumns: '1fr 360px' }}>

            {/* Task panel */}
            <div className="bg-white border border-[rgba(124,106,247,0.12)] rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#1a1a2e] text-sm">Tasks</h2>
                <div className="flex gap-1">
                  {['All', 'Active', 'Completed'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setFilter(tab)}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        filter === tab ? 'bg-[#7c6af7] text-white' : 'text-[#6b6b8a] hover:bg-[#f0eeff]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <AddTask onAdd={handleAddTask} isBreakingDown={isBreakingDown} />

              <div className="flex-1 overflow-y-auto">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-10 text-[#a0a0bc]">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-sm">{filter === 'All' ? 'No tasks yet. Add one above!' : `No ${filter.toLowerCase()} tasks`}</p>
                  </div>
                ) : (
                  <TaskList
                    tasks={filteredTasks}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onEdit={editTask}
                    onToggleExpand={toggleExpand}
                    onToggleSubtask={toggleSubtask}
                  />
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">

              {/* AI Assistant Panel */}
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f6e] rounded-2xl p-5 text-white">
                <div className="font-bold text-sm mb-0.5">AI Execution Assistant</div>
                <div className="text-[11px] text-white/40 mb-4">Powered by adaptive planning</div>
                <div className={`bg-white/8 border-l-2 border-[#7c6af7] rounded-lg p-3 text-xs text-white/80 leading-relaxed transition-opacity ${aiLoading || isBreakingDown ? 'opacity-50' : 'opacity-100'}`}>
                  {aiLoading || isBreakingDown
                    ? <span className="flex items-center gap-2"><span className="animate-pulse">◎</span> AI is thinking...</span>
                    : aiMessage
                  }
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[
                    { key: 'reorder', label: 'Reorder for focus' },
                    { key: 'remind',  label: 'Set reminder' },
                    { key: 'mood',    label: 'Adjust for mood' },
                  ].map(chip => (
                    <button
                      key={chip.key}
                      onClick={() => handleAiChip(chip.key)}
                      className="px-3 py-1.5 rounded-full text-[11px] bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/10 transition-all"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white border border-[rgba(124,106,247,0.12)] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-[#1a1a2e]">Achievements</h3>
                  <span className="text-[10px] bg-[#faeeda] text-[#633806] px-2 py-0.5 rounded-full font-medium">
                    {allAchievements.filter(a => a.earned).length} earned
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allAchievements.map(a => (
                    <div
                      key={a.id}
                      title={a.label}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg cursor-default border transition-all ${
                        a.earned
                          ? 'bg-[#f0eeff] border-[rgba(124,106,247,0.3)] scale-105'
                          : 'bg-[#f6f5ff] border-[rgba(124,106,247,0.1)] opacity-40 grayscale'
                      }`}
                    >
                      {a.emoji}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="bg-white border border-[rgba(124,106,247,0.12)] rounded-2xl p-4">
                <h3 className="font-bold text-sm text-[#1a1a2e] mb-3">Today's Progress</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Tasks done',   pct: todayPct,                              color: '#7c6af7' },
                    { label: 'Subtasks',     pct: (() => {
                      const allSubs = tasks.flatMap(t => t.subtasks || [])
                      if (!allSubs.length) return 0
                      return Math.round(allSubs.filter(s => s.completed).length / allSubs.length * 100)
                    })(),                                                                  color: '#4ecba1' },
                    { label: 'Streak',       pct: Math.min((profile?.streak || 0) * 10, 100), color: '#f7a26a' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-2">
                      <span className="text-xs text-[#6b6b8a] w-20 flex-shrink-0">{row.label}</span>
                      <div className="flex-1 h-1.5 bg-[#f0eeff] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${row.pct}%`, background: row.color }} />
                      </div>
                      <span className="text-[11px] text-[#a0a0bc] w-7 text-right">{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {showLibrary && (
        <LibraryPanel
          isOpen={showLibrary}
          onClose={() => setShowLibrary(false)}
          taskHistory={tasks}
          setTaskHistory={() => {}}
          setCurrentTasks={() => {}}
        />
      )}
    </div>
  )
}
