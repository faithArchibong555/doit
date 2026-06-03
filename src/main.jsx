import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './hooks/useAuth'
import './index.css'

// Apply saved theme on load
const savedTheme = localStorage.getItem('doit-theme') || 'default'
document.documentElement.setAttribute('data-theme', savedTheme)

// Apply dark mode if saved
if (localStorage.getItem('darkMode') === 'true') {
  document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}
