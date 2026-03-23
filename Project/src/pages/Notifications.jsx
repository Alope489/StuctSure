import './Notifications.css'
import { useNavigate } from 'react-router-dom'

const demoNotifications = [
  { id: 'n1', name: 'Jane Cooper', message: 'OMG! 😱 ...', time: '24m', unread: true },
  { id: 'n2', name: 'Jenny Wilson', message: 'Upvoted your post', time: '2h', unread: true },
  { id: 'n3', name: 'Esther Howard', message: 'Upvoted your post', time: '8h', unread: false },
  { id: 'n4', name: 'Leslie Alexander', message: 'Upvoted your post', time: '2h ago', unread: false },
  { id: 'n5', name: 'Savannah Nguyen', message: 'Upvoted your post', time: '2d', unread: false },
  { id: 'n6', name: 'Darlene Robertson', message: 'I walked by just the other...', time: '2d', unread: false },
  { id: 'n7', name: 'Marvin McKinney', message: 'Upvoted your post', time: '2w', unread: false },
  { id: 'n8', name: 'Kathryn Murphy', message: 'They need to fix it soon!...', time: '2w', unread: false },
]

function Icon({ name, filled }) {
  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="notif-icon">
          <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={`notif-icon ${filled ? 'notif-icon-filled' : ''}`}>
          <path
            d="M18 16H6c1.2-1.3 2-2.7 2-6a4 4 0 0 1 8 0c0 3.3.8 4.7 2 6Z"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M10 18a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="notif-icon">
          <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'search':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="notif-icon">
          <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M16.5 16.5 21 21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'user':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="notif-icon">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

function NotificationItem({ item, index }) {
  const initial = (item.name || '?').trim().slice(0, 1).toUpperCase()

  return (
    <div className="notif-item" role="button" tabIndex={0} style={{ animationDelay: `${index * 40}ms` }}>
      <div className="notif-avatar" aria-hidden="true">
        <span>{initial}</span>
      </div>
      <div className="notif-content">
        <span className="notif-name">{item.name}</span>
        <span className="notif-message">{item.message}</span>
        <span className="notif-time">{item.time}</span>
      </div>
      {item.unread && <span className="notif-dot" aria-label="Unread" />}
    </div>
  )
}

const DEFAULT_USER = { photo: null }

function Notifications() {
  const navigate = useNavigate()

  return (
    <div className="notif-page">
      <header className="notif-topbar">
        <div className="notif-brand">
          <img className="notif-brand-logo" src="/logo.png" alt="StructSure" />
          <span className="notif-brand-name">StructSure</span>
        </div>
        <button className="notif-profile-btn" type="button" aria-label="Profile">
          {DEFAULT_USER.photo ? (
            <img src={DEFAULT_USER.photo} alt="" className="notif-profile-pic" />
          ) : (
            <span className="notif-profile-placeholder" aria-hidden="true">
              <Icon name="user" />
            </span>
          )}
        </button>
      </header>

      <main className="notif-list" aria-label="Notifications">
        {demoNotifications.map((item, index) => (
          <NotificationItem key={item.id} item={item} index={index} />
        ))}
      </main>

      <nav className="notif-nav" aria-label="Bottom navigation">
        <button className="notif-nav-btn" type="button" aria-label="Home" onClick={() => navigate('/home')}>
          <Icon name="home" />
        </button>
        <button className="notif-nav-btn" type="button" aria-label="Search">
          <Icon name="search" />
        </button>
        <button className="notif-nav-btn notif-nav-btn-primary" type="button" aria-label="Create" onClick={() => navigate('/post/new')}>
          <span className="notif-fab">
            <Icon name="plus" />
          </span>
        </button>
        <button className="notif-nav-btn is-active" type="button" aria-label="Notifications" aria-current="page">
          <Icon name="bell" filled />
        </button>
        <button className="notif-nav-btn" type="button" aria-label="Profile">
          <Icon name="user" />
        </button>
      </nav>
    </div>
  )
}

export default Notifications
