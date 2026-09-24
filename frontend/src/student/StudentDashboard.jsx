import { DashboardOverview } from '../components/DashboardOverview'
import { EmptyState } from '../components/Common'

export function StudentDashboard({ data, active }) {
  if (active === 'My subjects') {
    return <SubjectsView subjects={data.subjects || []} />
  }

  if (active === 'Attendance') {
    return <AttendanceView attendance={data.attendance || []} />
  }

  if (active === 'Timetable') {
    return <TimetableView timetable={data.timetable || []} />
  }

  if (active === 'Assignments') {
    return <AssignmentsView assignments={data.assignments || []} />
  }

  if (active === 'Announcements') {
    return <AnnouncementsView announcements={data.announcements || []} />
  }

  return <DashboardOverview data={data} teacher={false} />
}

function SubjectsView({ subjects }) {
  return (
    <section className="panel student-page-panel">
      <p className="eyebrow">Academic record</p>
      <h3>My subjects</h3>
      {subjects.length ? (
        <div className="student-table">
          {subjects.map((subject) => (
            <div className="student-table-row" key={subject.id}>
              <div><strong>{subject.code}</strong><small>{subject.name}</small></div>
              <span>{subject.credits} credits</span>
              <span>{subject.academic_year}</span>
            </div>
          ))}
        </div>
      ) : <EmptyState message="You are not enrolled in any subjects yet." />}
    </section>
  )
}

function AttendanceView({ attendance }) {
  return (
    <section className="panel student-page-panel">
      <p className="eyebrow">Daily records</p>
      <h3>Attendance</h3>
      {attendance.length ? (
        <div className="student-table">
          {attendance.map((record) => (
            <div className="student-table-row" key={record.id}>
              <div><strong>{record.subject}</strong><small>{record.date}</small></div>
              <span className={record.present ? 'attendance-present' : 'attendance-absent'}>{record.present ? 'Present' : 'Absent'}</span>
            </div>
          ))}
        </div>
      ) : <EmptyState message="No attendance records have been recorded yet." />}
    </section>
  )
}

function TimetableView({ timetable }) {
  return (
    <section className="panel student-page-panel">
      <p className="eyebrow">Weekly schedule</p>
      <h3>Timetable</h3>
      {timetable.length ? (
        <div className="student-table">
          {timetable.map((entry) => (
            <div className="student-table-row" key={entry.id}>
              <div><strong>{entry.weekday}</strong><small>{entry.subject} · {entry.subject_name}</small></div>
              <span>{entry.start_time} - {entry.end_time}</span>
              <span>{entry.room}</span>
            </div>
          ))}
        </div>
      ) : <EmptyState message="No timetable entries have been added yet." />}
    </section>
  )
}

function AssignmentsView({ assignments }) {
  return (
    <section className="panel student-page-panel">
      <p className="eyebrow">Coursework</p>
      <h3>Assignments</h3>
      {assignments.length ? (
        <div className="student-table">
          {assignments.map((assignment) => (
            <div className="student-table-row" key={assignment.id}>
              <div>
                <strong>{assignment.title}</strong>
                <small>{assignment.subject}{assignment.description ? ` · ${assignment.description}` : ''}</small>
              </div>
              <span>Due {new Date(assignment.due_date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      ) : <EmptyState message="No assignments have been published yet." />}
    </section>
  )
}

function AnnouncementsView({ announcements }) {
  return (
    <section className="panel student-page-panel">
      <p className="eyebrow">Course updates</p>
      <h3>Announcements</h3>
      {announcements.length ? (
        <div className="student-table">
          {announcements.map((announcement) => (
            <div className="student-table-row" key={announcement.id}>
              <div>
                <strong>{announcement.title}</strong>
                <small>{announcement.subject} · {announcement.message}</small>
              </div>
              <span>{new Date(announcement.published_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      ) : <EmptyState message="No announcements have been published yet." />}
    </section>
  )
}
