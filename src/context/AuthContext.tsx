import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
  type User,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '@/firebase'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

/**
 * Installed PWAs run in a standalone context where auth popups can't hand their
 * result back to the app — so we use the redirect flow there instead of popups.
 */
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true
  return window.matchMedia?.('(display-mode: standalone)').matches || iosStandalone
}

function messageForCode(code: string): string {
  switch (code) {
    case 'auth/unauthorized-domain':
      return 'This site isn’t authorised in Firebase. Add its domain under Authentication → Settings → Authorized domains.'
    case 'auth/operation-not-allowed':
      return 'Google sign-in isn’t enabled for this Firebase project.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    default:
      return 'Sign-in failed. Please try again.'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }
    // Complete any redirect-based sign-in that's coming back to the app.
    getRedirectResult(auth).catch((err) => {
      const code = (err as { code?: string }).code ?? ''
      setError(messageForCode(code))
    })
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const signIn = useCallback(async () => {
    setError(null)
    try {
      await setPersistence(auth, browserLocalPersistence)
    } catch {
      // Non-fatal — fall through and let the sign-in attempt surface real errors.
    }

    // Installed app → redirect (popups don't work in standalone mode).
    if (isStandalone()) {
      try {
        await signInWithRedirect(auth, googleProvider)
      } catch (err) {
        setError(messageForCode((err as { code?: string }).code ?? ''))
      }
      return
    }

    // Browser tab → try a popup, fall back to redirect if it can't open.
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/operation-not-supported-in-this-environment'
      ) {
        try {
          await signInWithRedirect(auth, googleProvider)
        } catch (redirectErr) {
          setError(messageForCode((redirectErr as { code?: string }).code ?? ''))
        }
        return
      }
      setError(messageForCode(code))
    }
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
  }, [])

  const value = useMemo<AuthState>(
    () => ({ user, loading, error, signIn, signOut }),
    [user, loading, error, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
