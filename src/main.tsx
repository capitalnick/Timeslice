import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App'
import { AuthProvider } from '@/context/AuthContext'
import { isFirebaseConfigured } from '@/firebase'
import { SetupNeededScreen } from '@/screens/SetupNeededScreen'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    {isFirebaseConfigured ? (
      <AuthProvider>
        <App />
      </AuthProvider>
    ) : (
      <SetupNeededScreen />
    )}
  </StrictMode>,
)
