import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { GoogleIcon, ClockIcon } from '@/components/ui/Icons'

export function SignInScreen() {
  const { signIn, error } = useAuth()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 pb-safe pt-safe">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/30">
          <ClockIcon width={40} height={40} />
        </div>
        <h1 className="text-3xl font-extrabold text-white">TimeSlice</h1>
        <p className="mt-2 text-balance text-sm text-slate-400">
          Track your day in 15-minute slices. Organise time across three levels of categories, and
          see where your week goes.
        </p>

        <div className="mt-8">
          <Button block size="lg" variant="subtle" onClick={() => void signIn()}>
            <GoogleIcon />
            Continue with Google
          </Button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>

        <p className="mt-6 text-xs text-slate-600">
          Your data syncs privately to your account across devices.
        </p>
      </div>
    </div>
  )
}
