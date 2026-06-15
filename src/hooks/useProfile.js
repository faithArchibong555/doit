import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const ACHIEVEMENTS = [
  { id: 'first_task',    emoji: '🏆', label: 'First task done!',      condition: (p, tasks) => tasks.some(t => t.completed) },
  { id: 'streak_5',     emoji: '🔥', label: '5-day streak',           condition: (p) => p.streak >= 5 },
  { id: 'streak_10',    emoji: '💎', label: '10-day streak',           condition: (p) => p.streak >= 10 },
  { id: 'tasks_10',     emoji: '⚡', label: '10 tasks completed',      condition: (p, tasks) => tasks.filter(t => t.completed).length >= 10 },
  { id: 'tasks_50',     emoji: '🌟', label: '50 tasks completed',      condition: (p, tasks) => tasks.filter(t => t.completed).length >= 50 },
  { id: 'ai_user',      emoji: '🤖', label: 'Used AI breakdown',       condition: (p, tasks) => tasks.some(t => t.subtasks?.length > 0) },
  { id: 'goal_crusher', emoji: '🎯', label: '100% day completed',      condition: (p, tasks) => {
    const total = tasks.length
    const done = tasks.filter(t => t.completed).length
    return total > 0 && done === total
  }},
  { id: 'streak_30',    emoji: '🦁', label: '30-day streak',           condition: (p) => p.streak >= 30 },
]

export function useProfile(userId, tasks = []) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!error && data) {
      setProfile(data)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  // Update streak on each session
  useEffect(() => {
    if (!profile || !userId) return
    const today = new Date().toISOString().split('T')[0]
    const lastActive = profile.last_active

    if (lastActive === today) return // already updated today

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const newStreak = lastActive === yesterday ? profile.streak + 1 : 1

    const updated = { ...profile, streak: newStreak, last_active: today }
    setProfile(updated)
    supabase.from('user_profiles').update({ streak: newStreak, last_active: today }).eq('user_id', userId)
  }, [profile, userId])

  // Check and unlock achievements
  useEffect(() => {
    if (!profile || !tasks.length) return
    const earned = profile.achievements || []
    const newlyEarned = ACHIEVEMENTS.filter(a =>
      !earned.includes(a.id) && a.condition(profile, tasks)
    ).map(a => a.id)

    if (newlyEarned.length === 0) return
    const updated = [...earned, ...newlyEarned]
    setProfile(prev => ({ ...prev, achievements: updated }))
    supabase.from('user_profiles').update({ achievements: updated }).eq('user_id', userId)
  }, [tasks, profile, userId])

  const updateMood = async (mood) => {
    setProfile(prev => ({ ...prev, mood }))
    await supabase.from('user_profiles').update({ mood }).eq('user_id', userId)
  }

  const updateTheme = async (theme) => {
    setProfile(prev => ({ ...prev, theme }))
    await supabase.from('user_profiles').update({ theme }).eq('user_id', userId)
    // Apply to DOM
    document.documentElement.setAttribute('data-theme', theme)
  }

  const updateLanguage = async (language) => {
    setProfile(prev => ({ ...prev, language }))
    await supabase.from('user_profiles').update({ language }).eq('user_id', userId)
  }

  // Return all achievement definitions with earned status
  const allAchievements = ACHIEVEMENTS.map(a => ({
    ...a, earned: (profile?.achievements || []).includes(a.id)
  }))

  return {
    profile, loading, allAchievements,
    updateMood, updateTheme, updateLanguage,
    refetch: fetchProfile
  }
}