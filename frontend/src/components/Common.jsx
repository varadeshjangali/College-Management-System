import { CheckCircle2 } from 'lucide-react'

export function FullPageState({ icon, message }) {
  return (
    <div className="full-page-state">
      {icon}
      <p>{message}</p>
    </div>
  )
}

export function EmptyState({ message }) {
  return (
    <div className="empty-state">
      {message}
    </div>
  )
}

export function Stat({ label, value, note, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">
          {icon}
        </span>
      </div>

      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  )
}

export function ActionPanel({
  eyebrow,
  title,
  description,
  children
}) {
  return (
    <section className="action-panel">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="action-description">
        {description}
      </p>

      <div className="action-form">
        {children}
      </div>
    </section>
  )
}

export function ActionButton({ children, ...props }) {
  return (
    <button
      className="login-button action-button"
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}

export function SuccessMessage({ text }) {
  return (
    <div className="success-message">
      <CheckCircle2 size={16} />
      {text}
    </div>
  )
}