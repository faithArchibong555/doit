Doit

An AI-powered execution assistant "If there's a 1% chance it will work — doit."

🔗 Live app: do-it-sandy.vercel.app
📦 Repo: github.com/faithArchibong555/doit


Why Doit exists

Most to-do apps stop at organisation; lists, labels, due dates and leave the hardest part, actually doing the thing, entirely up to you. Doit is built around a different bet: that people don't get stuck because they're disorganised, they get stuck because they're overwhelmed, and overwhelm needs adaptive, mood-aware guidance, not another list.

Doit breaks tasks down into doable steps, reads how you're feeling about the work, and adjusts its guidance accordingly , nudging you from "I don't know where to start" to "done."

Features


🧠 AI task breakdown — turns a vague, intimidating task into 4–6 clear, actionable sub-steps, powered by the Anthropic Claude API
🎭 Mood-aware adaptive guidance — tell Doit whether you're tired, focused, or energised, and the AI adjusts how small or ambitious the steps are
⏱️ Smart reminders with live countdowns — see exactly how much time you have left, not just a due date
📈 Progress tracking & achievements — visible momentum to keep you going
🌍 Multilingual motivational messages
🌓 Theme / dark mode support
🔐 Full authentication & persistence — accounts and data backed by Supabase, so your tasks follow you across devices
📱 Installable PWA — add Doit to your home screen and use it like a native app


Tech stack

LayerTechFrontendReact 19, Vite 7, Tailwind CSSAuth & DatabaseSupabaseHosting / ServerlessVercelAIAnthropic Claude API (via a Vercel serverless function)AnalyticsVercel Analytics

Getting started

Prerequisites


Node.js (LTS recommended)
A Supabase project (URL + anon key)
An Anthropic API key for the AI breakdown feature


Installation

bashgit clone https://github.com/faithArchibong555/doit.git
cd doit
npm install

Environment variables

envVITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

The Anthropic API key used by the AI breakdown feature is only needed server-side, for the Vercel serverless function:

envANTHROPIC_API_KEY=your_anthropic_api_key

Run locally

bashnpm run dev

Then open the app in your browser at the local address Vite prints (open it directly in the browser rather than an in-editor preview — some editor previews don't render Vite dev servers reliably).

Build for production

bashnpm run build
npm run preview

Deployment

Doit deploys to Vercel from the main branch. Serverless functions (including the AI breakdown endpoint) live under api/ and deploy automatically alongside the frontend.

Project structure

doit/
├── api/
│   └── breakdown.js         # Serverless function — calls Claude to break a task into steps
├── public/
│   ├── icons/                # PWA icons
│   ├── screenshots/           # PWA screenshots
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/            # AddTask, TaskList, Navbar, LoginScreen, DarkModeToggle, LibraryPanel, FilterTabs
│   ├── hooks/                  # useAuth, useTasks, useProfile, useLocalStorage
│   ├── lib/
│   │   └── supabase.js          # Supabase client setup
│   ├── pages/                   # MyTasksPage, AIBreakdownPage, RemindersPage, ProgressPage, AchievementsPage
│   ├── App.jsx
│   └── main.jsx
└── package.json

Status

Doit is under active development and being built in public. Current focus areas include continued feature polish, More tester recruitment, and pitch preparation. Follow along on LinkedIn and X for build-in-public updates.

Contributing

This project is currently maintained solo. Issues and suggestions are welcome — feel free to open an issue on GitHub.
Built by Faith Archibong.


Built by Faith Archibong.
