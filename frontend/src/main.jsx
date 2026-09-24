import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { LoaderCircle } from 'lucide-react'
import { apiRequest } from './api'
import { Login, Signup } from './auth/AuthPages'
import { DashboardOverview } from './components/DashboardOverview'
import { FullPageState } from './components/Common'
import { PortalShell } from './components/PortalShell'
import { StudentDashboard } from './student/StudentDashboard'
import { TeacherWorkspace } from './teacher/TeacherWorkspace'
import './styles.css'

function App() {
  const [session, setSession] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [active, setActive] = useState('Overview')
  const [authPage, setAuthPage] = useState('login')

  useEffect(() => {
    apiRequest('/api/auth/me/')
      .then(({ user }) => setSession(user))
      .catch(() => setSession(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!session) return undefined

    let cancelled = false

    const loadDashboard = async () => {
      setError('')

      try {
        const dashboard = await apiRequest(
          `/api/${session.role}/dashboard/`
        )

        if (!cancelled) {
          setData({
            ...dashboard,
            user: session
          })
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message)
        }
      }
    }

    loadDashboard()

    const refreshTimer = window.setInterval(
      loadDashboard,
      30000
    )

    return () => {
      cancelled = true
      window.clearInterval(refreshTimer)
    }
  }, [session])

  if (loading) {
    return (
      <FullPageState
        icon={<LoaderCircle className="spin" />}
        message="Checking your session..."
      />
    )
  }

  if (!session) {
    return authPage === 'signup' ? (
      <Signup
        onSignup={setSession}
        onBack={() => setAuthPage('login')}
      />
    ) : (
      <Login
        onLogin={setSession}
        onSignup={() => setAuthPage('signup')}
      />
    )
  }

  const teacher = session.role === 'teacher'

  const signOut = async () => {
    await apiRequest('/api/auth/logout/', {
      method: 'POST'
    }).catch(() => {})

    setSession(null)
    setData(null)
    setAuthPage('login')
  }

  const content = !data ? (
    <FullPageState
      icon={<LoaderCircle className="spin" />}
      message="Loading your academic record..."
    />
  ) : teacher && active !== 'Overview' ? (
    <TeacherWorkspace
      active={active}
      subjects={data.subjects || []}
      onChanged={() => window.location.reload()}
    />
  ) : teacher ? (
    <DashboardOverview
      data={data}
      teacher
    />
  ) : (
    <StudentDashboard data={data} active={active} />
  )

  return (
    <PortalShell
      session={session}
      active={active}
      setActive={setActive}
      onSignOut={signOut}
    >
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {content}
    </PortalShell>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)