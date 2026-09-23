import { useState } from 'react'
import { GraduationCap, Users } from 'lucide-react'
import { apiRequest } from '../api'

export function Login({ onLogin, onSignup }) {
  const [accountType, setAccountType] = useState('student')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submit = async (event) => { event.preventDefault(); setSubmitting(true); setError(''); try { const { user } = await apiRequest('/api/auth/login/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, account_type: accountType }) }); onLogin(user) } catch (requestError) { setError(requestError.message) } finally { setSubmitting(false) } }
  return <div className="login-page"><div className="login-card"><Brand /><p className="eyebrow">College portal</p><h1>{accountType === 'student' ? 'Student sign in.' : 'Teacher sign in.'}</h1><p className="login-copy">Choose your account type, then sign in to access your live academic workspace.</p><div className="account-switcher" role="tablist" aria-label="Choose account type"><button type="button" className={accountType === 'student' ? 'account-option selected' : 'account-option'} onClick={() => { setAccountType('student'); setError('') }}><GraduationCap size={18} /><span><strong>Student</strong><small>Academic record</small></span></button><button type="button" className={accountType === 'teacher' ? 'account-option selected' : 'account-option'} onClick={() => { setAccountType('teacher'); setError('') }}><Users size={18} /><span><strong>Teacher</strong><small>Faculty workspace</small></span></button></div><form onSubmit={submit}><label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="username" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>{error && <div className="form-error">{error}</div>}<button className="login-button" disabled={submitting}>{submitting ? 'Signing in...' : `Sign in as ${accountType}`}</button></form>{accountType === 'student' && <button className="link-button" onClick={onSignup}>New student? Create an account</button>}</div></div>
}

export function Signup({ onSignup, onBack }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', username: '', email: '', student_id: '', program: '', semester: '1', password: '', password_confirm: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = async (event) => { event.preventDefault(); setSubmitting(true); setError(''); try { const { user } = await apiRequest('/api/auth/student-signup/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); onSignup(user) } catch (requestError) { setError(requestError.message) } finally { setSubmitting(false) } }
  return <div className="login-page"><div className="login-card signup-card"><Brand /><p className="eyebrow">Student registration</p><h1>Create your account.</h1><p className="login-copy">Register once to access your live academic record. Teacher accounts are created by the super admin.</p><form onSubmit={submit}><div className="form-row"><label>First name<input name="first_name" value={form.first_name} onChange={update} required /></label><label>Last name<input name="last_name" value={form.last_name} onChange={update} required /></label></div><div className="form-row"><label>Username<input name="username" value={form.username} onChange={update} required autoComplete="username" /></label><label>Student ID<input name="student_id" value={form.student_id} onChange={update} required /></label></div><label>Email<input type="email" name="email" value={form.email} onChange={update} required /></label><label>Program<input name="program" value={form.program} onChange={update} placeholder="BSc Computer Science" required /></label><label>Semester<input type="number" name="semester" min="1" max="12" value={form.semester} onChange={update} required /></label><div className="form-row"><label>Password<input type="password" name="password" value={form.password} onChange={update} required autoComplete="new-password" /></label><label>Confirm password<input type="password" name="password_confirm" value={form.password_confirm} onChange={update} required autoComplete="new-password" /></label></div>{error && <div className="form-error">{error}</div>}<button className="login-button" disabled={submitting}>{submitting ? 'Creating account...' : 'Create student account'}</button></form><button className="link-button" onClick={onBack}>Back to sign in</button></div></div>
}

function Brand() {
  return <div className="brand login-brand"><span className="brand-mark"><GraduationCap size={21} /></span><span>northstar<span className="brand-dot">.</span></span></div>
}
