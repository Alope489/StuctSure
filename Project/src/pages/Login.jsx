import { Link } from 'react-router-dom'
import './Auth.css'

function Login() {
  return (
    <div className="auth-page">
      <span className="auth-label">login</span>
      <div className="auth-content">
        <img src="/logo.png" alt="StructSure" className="auth-logo" />
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <label className="auth-field">
            <span className="auth-field-label">Email or Username</span>
            <input type="text" placeholder="mathurshivanshu" autoComplete="username" className="auth-input" />
          </label>
          <label className="auth-field">
            <span className="auth-field-label">Password</span>
            <input type="password" placeholder="••••••••" autoComplete="current-password" className="auth-input" />
          </label>
          <button type="submit" className="auth-btn auth-btn-primary">Login</button>
          <p className="auth-divider">Or login with</p>
          <button type="button" className="auth-btn auth-btn-google">Google</button>
        </form>
        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Signup</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
