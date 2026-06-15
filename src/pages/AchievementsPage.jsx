export default function AchievementsPage({ allAchievements, tasks, profile }) {
  const earned = allAchievements.filter(a => a.earned)
  const locked = allAchievements.filter(a => !a.earned)

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">

      <div>
        <h1 className="text-xl font-bold text-[#1a1a2e] dark:text-white">Achievements</h1>
        <p className="text-sm text-[#6b6b8a] mt-0.5">{earned.length} earned · {locked.length} locked</p>
      </div>

      {/* Progress ring summary */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1f6e] rounded-2xl p-6 text-white text-center">
        <div className="text-5xl font-bold mb-1">{earned.length}<span className="text-2xl text-white/40">/{allAchievements.length}</span></div>
        <div className="text-white/60 text-sm mb-4">Achievements unlocked</div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#7c6af7] rounded-full transition-all duration-700"
            style={{ width: `${allAchievements.length > 0 ? Math.round(earned.length / allAchievements.length * 100) : 0}%` }} />
        </div>
        <div className="text-white/40 text-xs mt-2">
          {allAchievements.length - earned.length} more to unlock
        </div>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[#1a1a2e] dark:text-white mb-3">Earned ✓</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {earned.map(a => (
              <div key={a.id} className="bg-white dark:bg-[#1e1e3a] border border-[rgba(124,106,247,0.2)] rounded-2xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#f0eeff] flex items-center justify-center text-3xl flex-shrink-0">
                  {a.emoji}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1a1a2e] dark:text-white">{a.label}</div>
                  <div className="text-xs text-[#4ecba1] mt-0.5">✓ Unlocked</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[#1a1a2e] dark:text-white mb-3">Locked 🔒</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {locked.map(a => (
              <div key={a.id} className="bg-white dark:bg-[#1e1e3a] border border-[rgba(124,106,247,0.08)] rounded-2xl p-4 flex items-center gap-4 opacity-50">
                <div className="w-14 h-14 rounded-2xl bg-[#f6f5ff] flex items-center justify-center text-3xl flex-shrink-0 grayscale">
                  {a.emoji}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1a1a2e] dark:text-white">{a.label}</div>
                  <div className="text-xs text-[#a0a0bc] mt-0.5">Keep going to unlock</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {earned.length === 0 && (
        <div className="text-center py-8 text-[#a0a0bc]">
          <div className="text-5xl mb-3">🏆</div>
          <p className="text-sm font-medium">No achievements yet</p>
          <p className="text-xs mt-1">Complete your first task to start earning badges!</p>
        </div>
      )}
    </div>
  )
}
