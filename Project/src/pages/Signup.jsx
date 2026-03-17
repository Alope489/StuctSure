import { Link } from 'react-router-dom'
import './Auth.css'

function Signup() {
  return (
    <div className="auth-page">
      <span className="auth-label">signup</span>
      <div className="auth-content">
        <img src="/logo.png" alt="StructSure" className="auth-logo" />
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <label className="auth-field">
            <span className="auth-field-label">Username</span>
            <input type="text" placeholder="Username" autoComplete="username" className="auth-input" />
          </label>
          <label className="auth-field">
            <span className="auth-field-label">Email</span>
            <input type="email" placeholder="user@domain.com" autoComplete="email" className="auth-input" />
          </label>
          <label className="auth-field">
            <span className="auth-field-label">Password</span>
            <input type="password" placeholder="••••••••" autoComplete="new-password" className="auth-input" />
          </label>
          <label className="auth-field">
            <span className="auth-field-label">Confirm password</span>
            <input type="password" placeholder="••••••••" autoComplete="new-password" className="auth-input" />
          </label>
          <button type="submit" className="auth-btn auth-btn-primary">Signup</button>
          <p className="auth-divider">Or signup with</p>
          <button type="button" className="auth-btn auth-btn-google">Google</button>
        </form>
        <p className="auth-footer">
          Already have an account! <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
