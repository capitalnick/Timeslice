import { ClockIcon } from '@/components/ui/Icons'

const ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

/** Shown when Firebase env vars are missing so the app fails helpfully. */
export function SetupNeededScreen() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-10">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
        <ClockIcon width={28} height={28} />
      </div>
      <h1 className="text-2xl font-extrabold text-white">Almost there</h1>
      <p className="mt-2 text-sm text-slate-400">
        TimeSlice needs a Firebase project to store your data. Add these environment variables (in a
        local <code className="rounded bg-slate-800 px-1 text-brand-200">.env</code> file, or in your
        Vercel project settings) and reload:
      </p>
      <ul className="mt-4 space-y-1.5 rounded-xl border border-slate-800 bg-slate-900/60 p-4 font-mono text-xs text-slate-300">
        {ENV_VARS.map((v) => (
          <li key={v}>{v}</li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-slate-500">
        See <span className="font-semibold text-slate-300">README.md</span> for step-by-step setup.
      </p>
    </div>
  )
}
