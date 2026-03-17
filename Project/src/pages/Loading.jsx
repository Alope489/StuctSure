import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Loading.css'

function Loading() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/login', { replace: true }), 2200)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="loading-page">
      <span className="loading-label">loading</span>
      <div className="loading-logo-wrap">
        <img src="/logo.png" alt="StructSure" className="loading-logo" />
      </div>
    </div>
  )
}

export default Loading
