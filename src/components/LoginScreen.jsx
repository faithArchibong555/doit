import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

// Eye icon components
const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
    <circle cx="8" cy="8" r="2"/>
  </svg>
)
const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2l12 12M6.5 6.6A2 2 0 0010.4 10M4.5 4.6C2.8 5.7 1.5 7.5 1.5 8s2.3 4.5 6.5 4.5c1.3 0 2.4-.3 3.3-.8M7 3.6C7.3 3.5 7.7 3.5 8 3.5c4.2 0 6.5 4.5 6.5 4.5s-.5 1.1-1.5 2.2"/>
  </svg>
)

// Friendly error messages — no raw Supabase errors shown to users
const friendlyError = (msg) => {
  if (!msg) return 'Something went wrong. Please try again.'
  const m = msg.toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid credentials') || m.includes('wrong password'))
    return 'Incorrect email or password. Please try again.'
  if (m.includes('email not confirmed'))
    return 'Please confirm your email first. Check your inbox.'
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'An account with this email already exists. Try signing in instead.'
  if (m.includes('password') && m.includes('short'))
    return 'Password must be at least 6 characters.'
  if (m.includes('valid email') || m.includes('invalid email'))
    return 'Please enter a valid email address.'
  if (m.includes('network') || m.includes('fetch'))
    return 'Connection error. Check your internet and try again.'
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Too many attempts. Please wait a moment and try again.'
  return 'Something went wrong. Please try again.'
}

export default function LoginScreen() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    // Basic client-side validation before hitting Supabase
    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (!password) { setError('Please enter your password.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email.trim(), password)
        setSuccessMsg('Account created! Check your email to confirm your account before signing in.')
        setPassword('')
      } else {
        await signInWithEmail(email.trim(), password)
        // If sign in succeeds, App.jsx will switch to the dashboard automatically
      }
    } catch (err) {
      // Always show friendly message — never expose raw Supabase errors
      setError(friendlyError(err.message))
      // Don't clear the form — let user correct their input
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setError('')
    setSuccessMsg('')
    // Keep email filled in — user might just be switching mode by mistake
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-[#f7a26a]" />
            <span className="font-bold text-3xl text-white tracking-tight" style={{ fontFamily: 'system-ui' }}>
              doit.
            </span>
          </div>
          <p className="text-[#a0a0bc] text-sm">Your AI-powered execution assistant</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-white font-semibold text-lg mb-6">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>

          {/* Google */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 rounded-xl py-3 px-4 font-medium text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[#6b6b8a] text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              autoComplete="email"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#6b6b8a] outline-none focus:border-[#7c6af7] transition-colors"
            />

            {/* Password with eye toggle */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder:text-[#6b6b8a] outline-none focus:border-[#7c6af7] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b8a] hover:text-white transition-colors p-1"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOpen /> : <EyeClosed />}
              </button>
            </div>

            {/* Error — friendly, never raw */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <span className="text-red-400 text-sm flex-shrink-0 mt-0.5">⚠</span>
                <p className="text-red-300 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {/* Success */}
            {successMsg && (
              <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5">
                <span className="text-green-400 text-sm flex-shrink-0 mt-0.5">✓</span>
                <p className="text-green-300 text-xs leading-relaxed">{successMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#7c6af7] hover:bg-[#6a58e5] disabled:opacity-50 text-white rounded-xl py-3 font-medium text-sm transition-colors mt-1"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Please wait...
                  </span>
                : mode === 'login' ? 'Sign in' : 'Create account'
              }
            </button>
          </form>

          <p className="text-center text-[#6b6b8a] text-xs mt-5">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={switchMode} className="text-[#7c6af7] hover:underline">
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
