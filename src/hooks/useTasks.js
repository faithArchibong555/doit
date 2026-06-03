import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks(userId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all tasks + their subtasks for this user
  const fetchTasks = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          subtasks (
            id, text, completed, position
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Sort subtasks by position
      const normalized = data.map(task => ({
        ...task,
        subtasks: (task.subtasks || []).sort((a, b) => a.position - b.position),
        expanded: false,
      }))
      setTasks(normalized)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // Add a task (optimistic — adds locally first, then saves)
  const addTask = async ({ text, tag = 'General', deadline = null }) => {
    const tempId = `temp-${Date.now()}`
    const optimistic = {
      id: tempId, user_id: userId, text, tag,
      completed: false, deadline, subtasks: [], expanded: false,
      created_at: new Date().toISOString(), completed_at: null
    }
    setTasks(prev => [optimistic, ...prev])

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ user_id: userId, text, tag, deadline })
        .select()
        .single()
      if (error) throw error

      // Replace temp with real
      setTasks(prev => prev.map(t =>
        t.id === tempId ? { ...data, subtasks: [], expanded: false } : t
      ))
      return data.id
    } catch (err) {
      // Rollback
      setTasks(prev => prev.filter(t => t.id !== tempId))
      throw err
    }
  }

  // Toggle task complete/incomplete
  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const newCompleted = !task.completed
    const completedAt = newCompleted ? new Date().toISOString() : null

    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: newCompleted, completed_at: completedAt } : t
    ))

    const { error } = await supabase
      .from('tasks')
      .update({ completed: newCompleted, completed_at: completedAt })
      .eq('id', taskId)

    if (error) {
      // Rollback
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed: task.completed, completed_at: task.completed_at } : t
      ))
    }
  }

  // Delete a task
  const deleteTask = async (taskId) => {
    const backup = tasks.find(t => t.id === taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))

    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) setTasks(prev => [backup, ...prev])
  }

  // Edit task text
  const editTask = async (taskId, newText) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, text: newText } : t))
    await supabase.from('tasks').update({ text: newText }).eq('id', taskId)
  }

  // Expand/collapse subtasks
  const toggleExpand = (taskId) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, expanded: !t.expanded } : t
    ))
  }

  // Save AI-generated subtasks for a task
  const saveSubtasks = async (taskId, subtaskTexts) => {
    // Upsert all subtasks
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
        ? { ...t, subtasks: data.sort((a, b) => a.position - b.position), expanded: true }
        : t
    ))
  }

  // Toggle a subtask's completed state
  const toggleSubtask = async (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId)
    const sub = task?.subtasks.find(s => s.id === subtaskId)
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
    toggleExpand, saveSubtasks, toggleSubtask,
    refetch: fetchTasks
  }
}