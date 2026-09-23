import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Users
} from 'lucide-react'

import { EmptyState, Stat } from './Common'

export function DashboardOverview({ data, teacher }) {
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">This semester</p>
          <h3>At a glance</h3>
        </div>

        <button className="text-button">
          View reports <span>→</span>
        </button>
      </div>

      <section className="stats-grid">
        <Stat
          label="Subjects"
          value={data.summary?.subjects ?? 0}
          note={teacher ? 'Assigned to you' : 'Enrolled this term'}
          icon={<BookOpen />}
        />

        <Stat
          label={teacher ? 'Students' : 'Attendance'}
          value={
            teacher
              ? data.summary?.students ?? 0
              : `${data.summary?.attendance_rate ?? 0}%`
          }
          note={teacher ? 'Across all classes' : 'Live attendance rate'}
          icon={teacher ? <Users /> : <ClipboardCheck />}
        />

        <Stat
          label={teacher ? 'Attendance' : 'Assignments'}
          value={
            teacher
              ? `${data.summary?.attendance_rate ?? 0}%`
              : data.summary?.pending_assignments ?? 0
          }
          note={teacher ? 'Class average' : 'Due this week'}
          icon={teacher ? <ClipboardCheck /> : <CalendarDays />}
        />
      </section>

      <section className="profile-panel panel">
        <div>
          <p className="eyebrow">Profile</p>
          <h3>{data.profile?.name || data.user?.name || data.user?.username}</h3>
        </div>

        <div className="profile-details">
          <span>
            <small>{teacher ? 'Employee ID' : 'Student ID'}</small>
            <strong>{data.profile?.[teacher ? 'employee_id' : 'student_id']}</strong>
          </span>
          <span>
            <small>{teacher ? 'Department' : 'Program'}</small>
            <strong>{teacher ? data.profile?.department : data.profile?.program}</strong>
          </span>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel performance">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Academic pulse</p>
              <h3>
                {teacher ? 'Class performance' : 'Performance overview'}
              </h3>
            </div>

            <span className="trend">
              <CheckCircle2 size={14} /> Live data
            </span>
          </div>

          {data.performance?.length ? (
            <PerformanceChart performance={data.performance} />
          ) : (
            <EmptyState message="No grades have been recorded yet." />
          )}
        </div>

        <Announcements items={data.announcements || []} />
      </section>
    </>
  )
}

function PerformanceChart({ performance }) {
  return (
    <div className="chart">
      <div className="chart-y">
        <span>100</span>
        <span>75</span>
        <span>50</span>
        <span>25</span>
        <span>0</span>
      </div>

      <div className="bars">
        {performance.map((item, index) => (
          <div
            className="bar-group"
            key={item.subject__code || index}
          >
            <div
              className="bar"
              style={{
                height: `${Math.max(20, item.average || 0)}%`
              }}
            >
              <span>{Math.round(item.average || 0)}%</span>
            </div>

            <small>
              {item.subject__code || `Subject ${index + 1}`}
            </small>
          </div>
        ))}
      </div>
    </div>
  )
}

function Announcements({ items }) {
  return (
    <div className="panel announcements">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Latest updates</p>
          <h3>Announcements</h3>
        </div>

        <button
          className="more-button"
          aria-label="More announcements"
        >
          •••
        </button>
      </div>

      {items.length ? (
        items.map((item) => (
          <article
            className="announcement"
            key={item.id}
          >
            <div className="announcement-icon">
              <Bell size={16} />
            </div>

            <div>
              <h4>{item.title}</h4>
              <p>{item.message}</p>
              <small>
                {new Date(item.published_at).toLocaleDateString()}
              </small>
            </div>
          </article>
        ))
      ) : (
        <EmptyState message="No announcements yet." />
      )}
    </div>
  )
}