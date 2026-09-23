import { useEffect, useState } from 'react'
import { apiRequest } from '../api'
import {
  ActionButton,
  ActionPanel,
  EmptyState,
  SuccessMessage
} from '../components/Common'

export function TeacherWorkspace({
  active,
  subjects,
  onChanged
}) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '')

  const subject = subjects.find(
    (item) => String(item.id) === String(subjectId)
  )

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [attendance, setAttendance] = useState({})
  const [assignment, setAssignment] = useState({
    title: '',
    description: '',
    due_date: ''
  })
  const [announcement, setAnnouncement] = useState({
    title: '',
    message: '',
    subject_id: subjects[0]?.id || ''
  })
  const [enrollmentStudent, setEnrollmentStudent] = useState('')
  const [academicYear, setAcademicYear] = useState(
    `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  )

  useEffect(() => {
    const initialAttendance = {}

    subject?.student_list?.forEach((student) => {
      initialAttendance[student.id] = false
    })

    setAttendance(initialAttendance)
  }, [subjectId, subject])

  const submit = async (url, body) => {
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const result = await apiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      setMessage(result.detail)
      window.setTimeout(onChanged, 700)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (active === 'Attendance') {
    return (
      <AttendanceForm
        subject={subject}
        subjects={subjects}
        subjectId={subjectId}
        setSubjectId={setSubjectId}
        date={date}
        setDate={setDate}
        attendance={attendance}
        setAttendance={setAttendance}
        submitting={submitting}
        submit={submit}
        message={message}
        error={error}
      />
    )
  }

  if (active === 'Subjects') {
    return <SubjectsView subjects={subjects} />
  }

  if (active === 'Students') {
    return (
      <EnrollmentForm
        subject={subject}
        subjects={subjects}
        subjectId={subjectId}
        setSubjectId={setSubjectId}
        enrollmentStudent={enrollmentStudent}
        setEnrollmentStudent={setEnrollmentStudent}
        academicYear={academicYear}
        setAcademicYear={setAcademicYear}
        submitting={submitting}
        submit={submit}
        message={message}
        error={error}
      />
    )
  }

  return (
    <PublishForm
      subjects={subjects}
      subjectId={subjectId}
      setSubjectId={setSubjectId}
      announcement={announcement}
      setAnnouncement={setAnnouncement}
      assignment={assignment}
      setAssignment={setAssignment}
      submitting={submitting}
      submit={submit}
      message={message}
      error={error}
    />
  )
}

function SubjectSelect({ subjects, value, onChange }) {
  return (
    <label>
      Subject
      <select value={value} onChange={onChange}>
        {subjects.map((item) => (
          <option value={item.id} key={item.id}>
            {item.code} · {item.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function Feedback({ message, error }) {
  return (
    <>
      {message && <SuccessMessage text={message} />}
      {error && <div className="form-error">{error}</div>}
    </>
  )
}

function AttendanceForm({
  subject,
  subjects,
  subjectId,
  setSubjectId,
  date,
  setDate,
  attendance,
  setAttendance,
  submitting,
  submit,
  message,
  error
}) {
  return (
    <ActionPanel
      eyebrow="Teacher tools"
      title="Record attendance"
      description="Mark attendance for students in one of your assigned subjects."
    >
      <SubjectSelect
        subjects={subjects}
        value={subjectId}
        onChange={(event) => setSubjectId(event.target.value)}
      />

      <label>
        Date
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>

      <div className="student-list">
        {subject?.student_list?.length ? (
          subject.student_list.map((student) => (
            <label
              className="attendance-row"
              key={student.id}
            >
              <span>
                <strong>{student.name}</strong>
                <small>{student.student_id}</small>
              </span>

              <input
                type="checkbox"
                checked={Boolean(attendance[student.id])}
                onChange={(event) =>
                  setAttendance({
                    ...attendance,
                    [student.id]: event.target.checked
                  })
                }
              />

              <em>Present</em>
            </label>
          ))
        ) : (
          <EmptyState message="No students are enrolled in this subject yet." />
        )}
      </div>

      <ActionButton
        disabled={
          submitting || !subject?.student_list?.length
        }
        onClick={() =>
          submit('/api/teacher/attendance/', {
            subject_id: subjectId,
            date,
            records: subject.student_list.map((student) => ({
              student_id: student.id,
              present: Boolean(attendance[student.id])
            }))
          })
        }
      >
        {submitting ? 'Saving...' : 'Save attendance'}
      </ActionButton>

      <Feedback
        message={message}
        error={error}
      />
    </ActionPanel>
  )
}

function SubjectsView({ subjects }) {
  return (
    <ActionPanel
      eyebrow="Live teaching data"
      title="Assigned subjects"
      description="This list comes directly from your assigned subjects and current enrollments."
    >
      {subjects.length ? (
        subjects.map((item) => (
          <article
            className="subject-row"
            key={item.id}
          >
            <div>
              <strong>
                {item.code} · {item.name}
              </strong>

              <small>
                {item.students} enrolled students
              </small>
            </div>

            <span>
              {item.students} students
            </span>
          </article>
        ))
      ) : (
        <EmptyState message="No subjects have been assigned to you." />
      )}
    </ActionPanel>
  )
}

function EnrollmentForm({
  subject,
  subjects,
  subjectId,
  setSubjectId,
  enrollmentStudent,
  setEnrollmentStudent,
  academicYear,
  setAcademicYear,
  submitting,
  submit,
  message,
  error
}) {
  return (
    <ActionPanel
      eyebrow="Student enrollment"
      title="Enroll students"
      description="Add a student to one of your assigned subjects for the current academic year."
    >
      <SubjectSelect
        subjects={subjects}
        value={subjectId}
        onChange={(event) => {
          setSubjectId(event.target.value)
          setEnrollmentStudent('')
        }}
      />

      <label>
        Academic year
        <input
          value={academicYear}
          onChange={(event) =>
            setAcademicYear(event.target.value)
          }
          placeholder="2026-2027"
        />
      </label>

      <label>
        Student
        <select
          value={enrollmentStudent}
          onChange={(event) =>
            setEnrollmentStudent(event.target.value)
          }
        >
          <option value="">Select a student</option>

          {subject?.available_students?.map((student) => (
            <option
              value={student.id}
              key={student.id}
            >
              {student.student_id} · {student.name}
            </option>
          ))}
        </select>
      </label>

      <ActionButton
        disabled={
          submitting ||
          !enrollmentStudent ||
          !subjectId
        }
        onClick={() =>
          submit('/api/teacher/enrollments/', {
            subject_id: subjectId,
            student_id: enrollmentStudent,
            academic_year: academicYear
          })
        }
      >
        {submitting ? 'Enrolling...' : 'Enroll student'}
      </ActionButton>

      <Feedback
        message={message}
        error={error}
      />

      <hr />

      <h3>
        {subject?.code} enrolled students
      </h3>

      {subject?.student_list?.length ? (
        subject.student_list.map((student) => (
          <article
            className="subject-row"
            key={student.id}
          >
            <div>
              <strong>{student.name}</strong>
              <small>{student.student_id}</small>
            </div>

            <span>Enrolled</span>
          </article>
        ))
      ) : (
        <EmptyState message="No students are enrolled in this subject yet." />
      )}
    </ActionPanel>
  )
}

function PublishForm({
  subjects,
  subjectId,
  setSubjectId,
  announcement,
  setAnnouncement,
  assignment,
  setAssignment,
  submitting,
  submit,
  message,
  error
}) {
  return (
    <ActionPanel
      eyebrow="Teacher tools"
      title="Publish announcement"
      description="Send an update to every student in one of your subjects."
    >
      <SubjectSelect
        subjects={subjects}
        value={announcement.subject_id}
        onChange={(event) =>
          setAnnouncement({
            ...announcement,
            subject_id: event.target.value
          })
        }
      />

      <label>
        Title
        <input
          value={announcement.title}
          onChange={(event) =>
            setAnnouncement({
              ...announcement,
              title: event.target.value
            })
          }
          required
        />
      </label>

      <label>
        Message
        <textarea
          value={announcement.message}
          onChange={(event) =>
            setAnnouncement({
              ...announcement,
              message: event.target.value
            })
          }
          rows="5"
          required
        />
      </label>

      <ActionButton
        disabled={submitting}
        onClick={() =>
          submit(
            '/api/teacher/announcements/',
            announcement
          )
        }
      >
        {submitting
          ? 'Publishing...'
          : 'Publish announcement'}
      </ActionButton>

      <Feedback
        message={message}
        error={error}
      />

      <hr />

      <h3>Publish assignment</h3>

      <SubjectSelect
        subjects={subjects}
        value={subjectId}
        onChange={(event) =>
          setSubjectId(event.target.value)
        }
      />

      <label>
        Title
        <input
          value={assignment.title}
          onChange={(event) =>
            setAssignment({
              ...assignment,
              title: event.target.value
            })
          }
          required
        />
      </label>

      <label>
        Description
        <textarea
          value={assignment.description}
          onChange={(event) =>
            setAssignment({
              ...assignment,
              description: event.target.value
            })
          }
          rows="4"
        />
      </label>

      <label>
        Due date and time
        <input
          type="datetime-local"
          value={assignment.due_date}
          onChange={(event) =>
            setAssignment({
              ...assignment,
              due_date: event.target.value
            })
          }
          required
        />
      </label>

      <ActionButton
        disabled={submitting}
        onClick={() =>
          submit('/api/teacher/assignments/', {
            ...assignment,
            subject_id: subjectId
          })
        }
      >
        {submitting
          ? 'Publishing...'
          : 'Publish assignment'}
      </ActionButton>
    </ActionPanel>
  )
}