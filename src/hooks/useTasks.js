import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks(userId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    if (!userId) {
      console.warn('useTasks: no userId, skipping fetch')
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`*, subtasks(id, text, completed, position)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      const normalized = (data || []).map(task => ({
        ...task,
        subtasks: (task.subtasks || []).sort((a, b) => a.position - b.position),
        expanded: false,
      }))
      setTasks(normalized)
    } catch (err) {
      console.error('fetchTasks error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // datetime-local inputs give a naive string like "2026-08-04T13:11" with no
  // timezone info. `new Date(...)` parses that as local wall-clock time in the
  // browser, so .toISOString() gives the correct UTC instant to store. Without
  // this, Postgres was interpreting the naive string as UTC directly, silently
  // storing the wrong instant (correct digits, wrong meaning).
  const toUtcIso = (localDatetimeString) => {
    if (!localDatetimeString) return null
    const d = new Date(localDatetimeString)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }

  const addTask = async ({ text, tag = 'General', deadline = null }) => {
    if (!userId) {
      console.error('addTask FAILED: no userId. Check your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
      setError('Not logged in. Please refresh and sign in again.')
      return null
    }
    try {
      const utcDeadline = toUtcIso(deadline)
      console.log('Adding task:', { text, tag, deadline: utcDeadline, userId })
      const { data, error } = await supabase
        .from('tasks')
        .insert({ user_id: userId, text, tag, deadline: utcDeadline })
        .select(`*, subtasks(id, text, completed, position)`)
        .single()
      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }
      console.log('Task saved successfully:', data)
      setTasks(prev => [{ ...data, subtasks: [], expanded: false }, ...prev])
      return data.id
    } catch (err) {
      console.error('addTask error:', err.message)
      setError(err.message)
      return null
    }
  }

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const newCompleted = !task.completed
    const completedAt = newCompleted ? new Date().toISOString() : null
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: newCompleted, completed_at: completedAt } : t
    ))
    const { error } = await supabase.from('tasks')
      .update({ completed: newCompleted, completed_at: completedAt })
      .eq('id', taskId)
    if (error) {
      console.error('toggleTask error:', error)
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

  const editTask = async (taskId, newText, newDeadline = undefined) => {
    const utcDeadline = newDeadline === undefined ? undefined : toUtcIso(newDeadline)

    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, text: newText, ...(utcDeadline === undefined ? {} : { deadline: utcDeadline }) }
          : t
      )
    )

    const payload = { text: newText }
    // Only update deadline if caller provided it (prevents accidental overwrites)
    if (utcDeadline !== undefined) payload.deadline = utcDeadline

    const { error } = await supabase.from('tasks').update(payload).eq('id', taskId)
    if (error) console.error('editTask error:', error)
  }


  const toggleExpand = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, expanded: !t.expanded } : t))
  }

  const saveSubtasks = async (taskId, subtaskTexts) => {
    const rows = subtaskTexts.map((text, i) => ({ task_id: taskId, text, completed: false, position: i }))
    const { data, error } = await supabase.from('subtasks').insert(rows).select()
    if (error) { console.error('saveSubtasks error:', error); throw error }
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, subtasks: (data || []).sort((a, b) => a.position - b.position), expanded: true }
        : t
    ))
  }

  const toggleSubtask = async (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId)
    const sub = task?.subtasks?.find(s => s.id === subtaskId)
    if (!sub) return

    const newCompleted = !sub.completed

    // Optimistic UI update
    const nextSubtasks = task.subtasks.map(s => (s.id === subtaskId ? { ...s, completed: newCompleted } : s))
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, subtasks: nextSubtasks } : t))
    )

    // Persist subtask completion
    const { error } = await supabase.from('subtasks').update({ completed: newCompleted }).eq('id', subtaskId)
    if (error) {
      console.error('toggleSubtask error:', error)
      return
    }

    // If ALL subtasks are completed, also mark parent task completed.
    // Reverse behavior: if any subtask becomes incomplete, un-complete the parent.
    const allDone = nextSubtasks.length > 0 && nextSubtasks.every(s => s.completed)

    if (allDone && !task.completed) {
      const completedAt = new Date().toISOString()
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, completed: true, completed_at: completedAt } : t)))
      const { error: taskErr } = await supabase
        .from('tasks')
        .update({ completed: true, completed_at: completedAt })
        .eq('id', taskId)

      if (taskErr) {
        console.error('toggleSubtask -> set parent task completed error:', taskErr)
      }
    } else if (!allDone && task.completed) {
      // At least one subtask is incomplete now -> un-complete parent.
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, completed: false, completed_at: null } : t)))
      const { error: taskErr } = await supabase
        .from('tasks')
        .update({ completed: false, completed_at: null })
        .eq('id', taskId)

      if (taskErr) {
        console.error('toggleSubtask -> un-complete parent task error:', taskErr)
      }
    }

  }


  const addTaskFromAI = async ({ taskText, subtasks, tag = 'General', deadline = null }) => {
    if (!userId) throw new Error('Not logged in')

    const taskId = await addTask({ text: taskText, tag, deadline })
    if (!taskId) throw new Error('Failed to create AI task')

    await saveSubtasks(taskId, subtasks)
    await fetchTasks()
  }

  return {
    tasks, loading, error,
    addTask, addTaskFromAI, toggleTask, deleteTask, editTask,
    toggleExpand, saveSubtasks, toggleSubtask,
    refetch: fetchTasks
  }
}