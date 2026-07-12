import { useAuth } from '@/context/AuthContext'
import { SignInScreen } from '@/screens/SignInScreen'
import { AuthedApp } from '@/AuthedApp'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-brand-400" />
      </div>
    )
  }

  if (!user) return <SignInScreen />

  return <AuthedApp uid={user.uid} />
}
