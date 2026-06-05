import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks(userId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks((data || []).map(task => ({ ...task, subtasks: [], expanded: false })))
    } catch (err) {
      console.error('fetchTasks error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const addTask = async ({ text, tag = 'General', deadline = null }) => {
    if (!userId) {
      console.error('No userId — user is not logged in')
      return null
    }
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ user_id: userId, text, tag, deadline })
        .select()
        .single()

      if (error) throw error

      // Add to top of list with empty subtasks
      setTasks(prev => [{ ...data, subtasks: [], expanded: false }, ...prev])
      return data.id
    } catch (err) {
      console.error('addTask error:', err.message, err)
      setError(err.message)
      return null
    }
  }

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const newCompleted = !task.completed
    const completedAt = newCompleted ? new Date().toISOString() : null

    // Update UI immediately
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: newCompleted, completed_at: completedAt } : t
    ))

    const { error } = await supabase
      .from('tasks')
      .update({ completed: newCompleted, completed_at: completedAt })
      .eq('id', taskId)

    if (error) {
      console.error('toggleTask error:', error)
      // Rollback
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed: task.completed, completed_at: task.completed_at } : t
      ))
    }
  }

  const deleteTask = async (taskId) => {
    const backup = tasks.find(t => t.id === taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) {
      console.error('deleteTask error:', error)
      setTasks(prev => [backup, ...prev])
    }
  }

  const editTask = async (taskId, newText) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, text: newText } : t))
    const { error } = await supabase
      .from('tasks')
      .update({ text: newText })
      .eq('id', taskId)
    if (error) console.error('editTask error:', error)
  }

  // Only used when AI breakdown runs — not on normal task add
  const saveSubtasks = async (taskId, subtaskTexts) => {
    const rows = subtaskTexts.map((text, i) => ({
      task_id: taskId, text, completed: false, position: i
    }))
    const { data, error } = await supabase
      .from('subtasks')
      .insert(rows)
      .select()
    if (error) throw error
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, subtasks: (data || []).sort((a, b) => a.position - b.position), expanded: true }
        : t
    ))
  }

  const toggleExpand = (taskId) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, expanded: !t.expanded } : t
    ))
  }

  const toggleSubtask = async (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId)
    const sub = task?.subtasks?.find(s => s.id === subtaskId)
    if (!sub) return
    const newCompleted = !sub.completed
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: newCompleted } : s) }
        : t
    ))
    await supabase.from('subtasks').update({ completed: newCompleted }).eq('id', subtaskId)
  }

  return {
    tasks, loading, error,
    addTask, toggleTask, deleteTask, editTask,
    saveSubtasks, toggleExpand, toggleSubtask,
    refetch: fetchTasks
  }
}