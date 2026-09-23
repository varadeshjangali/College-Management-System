import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Users
} from 'lucide-react'

const studentNavigation = [
  ['Overview', LayoutDashboard],
  ['My subjects', BookOpen],
  ['Attendance', ClipboardCheck],
  ['Timetable', CalendarDays],
  ['Announcements', Bell]
]

const teacherNavigation = [
  ['Overview', LayoutDashboard],
  ['Subjects', BookOpen],
  ['Students', Users],
  ['Attendance', ClipboardCheck],
  ['Announcements', Bell]
]

export function PortalShell({
  session,
  active,
  setActive,
  onSignOut,
  children
}) {
  const teacher = session.role === 'teacher'
  const navigation = teacher ? teacherNavigation : studentNavigation
  const initials = (session.name || session.username)
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <GraduationCap size={21} />
          </span>

          <span>
            InnovateX<span className="brand-dot">.</span>
          </span>
        </div>

        <div className="portal-label">
          {teacher ? 'Faculty portal' : 'Student portal'}
        </div>

        <nav>
          {navigation.map(([label, Icon]) => (
            <button
              className={
                active === label ? 'nav-item active' : 'nav-item'
              }
              onClick={() => setActive(label)}
              key={label}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item" onClick={onSignOut}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>

            <h1>
              Hi, {session.name?.split(' ')[0] || session.username}.
            </h1>
          </div>

          <div className="top-actions">
            <button
              className="icon-button"
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={19} />
            </button>

            <button
              className="icon-button"
              aria-label="Sign out"
              title="Sign out"
              onClick={onSignOut}
            >
              <LogOut size={19} />
            </button>

            <div className="avatar">
              {initials}
            </div>
          </div>
        </header>

        <section className="hero">
          <div>
            <span className="status-pill">
              ● Live academic record
            </span>

            <h2>
              {teacher
                ? 'Your classes at a glance.'
                : 'Your academic journey, in one place.'}
            </h2>

            <p>
              {teacher
                ? 'Keep your classes moving forward with a clear view of today’s priorities.'
                : 'Stay on top of attendance, coursework and everything that makes this semester count.'}
            </p>
          </div>

          <div className="hero-grid" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </section>

        {children}
      </main>
    </div>
  )
}