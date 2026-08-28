import { useEffect, useState } from 'react'
 
// setTimeout delays are capped at ~24.8 days (2^31-1 ms) in browsers.
// Anything longer overflows and fires immediately instead of waiting — guard against that.
const MAX_TIMEOUT = 2147483647
 
// Once a service worker is registered (true for this app, since it's a PWA),
// some browsers — notably Android Chrome — refuse to run `new Notification(...)`
// directly and throw instead. They require going through
// ServiceWorkerRegistration.showNotification(). Desktop browsers tolerate
// either, so this bug only shows up on Android, which is why it can look like
// notifications "work" while testing on desktop and then silently fail on phones.
export async function showNotification(title, options) {
  if (typeof Notification === 'undefined') return
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      if (registration && registration.showNotification) {
        return registration.showNotification(title, options)
      }
    } catch {
      // fall through to the plain constructor below
    }
  }
  return new Notification(title, options)
}
 
export function useNotificationPermission() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
 
  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setPermission(result)
  }
 
  return { permission, requestPermission }
}
 
// Schedules browser notifications for task deadlines.
// IMPORTANT: this must be called from a component that stays mounted for the
// whole session (e.g. the app shell), not from a single page. It used to live
// inside RemindersPage, which meant navigating to any other page unmounted it
// and cancelled every pending reminder via the cleanup function.
// Note: this still only fires while the tab is open — closed tabs / locked
// phones / backgrounded browsers (esp. iOS Safari) won't trigger it. That
// needs real push notifications (service worker + Web Push), tracked separately.
export function useReminderScheduler(tasks, permission) {
  useEffect(() => {
    if (permission !== 'granted') return
    if (typeof Notification === 'undefined') return
 
    const timers = []
    tasks.forEach(task => {
      if (!task.deadline || task.completed) return
      const diff = new Date(task.deadline) - new Date()
      if (diff <= 0 || diff > MAX_TIMEOUT) return // already overdue, or too far out to schedule safely
      const id = setTimeout(() => {
        showNotification(`Doit reminder ⏰`, {
          body: task.text,
          icon: '/icons/icon-192x192.png',
        })
      }, diff)
      timers.push(id)
    })
 
    return () => timers.forEach(clearTimeout)
  }, [tasks, permission])
} 