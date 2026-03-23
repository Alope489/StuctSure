import './Home.css'
import { useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const demoPosts = [
  {
    id: 'p1',
    author: 'Mia Chen',
    time: '1 hour ago ? 11:53 AM',
    title: 'Exterior foundation crack at Riverside Plaza',
    body:
      'Location: Riverside Plaza (North entrance, by the loading zone)\nAddress: 214 W Pine St\nVisited: Today around 11:30 AM\n\nThere?s a visible separation where the wall meets the slab, and the crack line looks like it?s spreading along the corner. Pieces of material are flaking off around it.\n\nNot sure if this is settling or water-related, but it doesn?t look cosmetic. Posting in case building management needs to inspect before it gets worse.',
    likes: 292,
    comments: 598,
    images: [
      {
        alt: 'Concrete foundation crack',
        url: 'https://images.unsplash.com/photo-1740921303129-126a783b9c6c?auto=format&fit=crop&w=1400&q=70',
      },
      {
        alt: 'Closeup of cracked wall corner',
        url: 'https://images.unsplash.com/photo-1740921303048-6b8f232a91ff?auto=format&fit=crop&w=1400&q=70',
      },
    ],
  },
  {
    id: 'p2',
    author: 'Jordan Rivera',
    time: '4 hours ago ? 8:22 AM',
    title: 'Cracked window at Cityline Bus Terminal',
    body:
      'Location: Cityline Bus Terminal (Gate 4 waiting area)\nVisited: Today around 8:00 AM\n\nA window pane has a spiderweb crack starting near the corner. It?s not taped off and people are leaning bags against it.\n\nFlagging this as a safety issue?seems like it could shatter further with vibration or impact.',
    likes: 84,
    comments: 31,
    images: [
      {
        alt: 'Hairline crack by window',
        url: 'https://images.unsplash.com/photo-1646310585298-8a9b8ada20c5?auto=format&fit=crop&w=1400&q=70',
      },
    ],
  },
  {
    id: 'p3',
    author: 'Ayesha Patel',
    time: 'Yesterday ? 6:41 PM',
    title: 'Water damage/mold smell in parking garage stairwell',
    body:
      'Location: Metro Center Garage (Stairwell B, Level P2)\nVisited: Yesterday around 6:30 PM\n\nThe lower wall has dark damp patches and the stairwell smells musty. No standing water, but it feels humid and looks like repeated moisture exposure.\n\nIf this is seepage, it may need remediation?posting so the garage operator can check drainage/ventilation.',
    likes: 137,
    comments: 62,
    images: [
      {
        alt: 'Damp concrete wall',
        url: 'https://images.unsplash.com/photo-1724230442705-646dc7c86943?auto=format&fit=crop&w=1400&q=70',
      },
      {
        alt: 'Moisture line along basement wall',
        url: 'https://images.unsplash.com/photo-1768573264138-6a67ddce05cd?auto=format&fit=crop&w=1400&q=70',
      },
      {
        alt: 'Closer look at discoloration',
        url: 'https://images.unsplash.com/photo-1768573264138-6a67ddce05cd?auto=format&fit=crop&w=1400&q=70',
      },
    ],
  },
  {
    id: 'p4',
    author: 'Noah Williams',
    time: '2 days ago ? 3:10 PM',
    title: 'Cracked concrete walkway outside Greenway Market',
    body:
      'Location: Greenway Market (front entrance sidewalk)\nVisited: 2 days ago\n\nThere?s a widening crack in the concrete with branching lines. It?s uneven enough that it looks like a trip hazard?especially for carts/strollers.\n\nNot sure who maintains this section (store vs property management), but it should be patched/leveled soon.',
    likes: 55,
    comments: 19,
    images: [
      {
        alt: 'Cracked driveway concrete',
        url: 'https://images.unsplash.com/photo-1642799288307-18f77cc56cf4?auto=format&fit=crop&w=1400&q=70',
      },
    ],
  },
  {
    id: 'p5',
    author: 'Jordan Rivera',
    time: '3 days ago ? 9:02 AM',
    title: 'Ceiling damage above table area at Brew & Bean Caf?',
    body:
      'Location: Brew & Bean Caf? (back seating)\nVisited: 3 days ago\n\nThere?s a long crack / damaged seam in the ceiling above the tables. It looks like previous patching is failing, and the area has staining.\n\nPosting two angles?worth checking before anything loosens or falls.',
    likes: 41,
    comments: 12,
    images: [
      {
        alt: 'Ceiling crack angle 1',
        url: 'https://images.unsplash.com/photo-1737739973200-61c2ae4d1272?auto=format&fit=crop&w=1400&q=70',
      },
      {
        alt: 'Ceiling crack angle 2',
        url: 'https://images.unsplash.com/photo-1691465576659-938b08b99959?auto=format&fit=crop&w=1400&q=70',
      },
    ],
  },
]

function PostGallery({ images, postId }) {
  const safeImages = Array.isArray(images) ? images : []
  const galleryId = useId()
  const scrollerRef = useRef(null)

  if (safeImages.length === 0) return null

  const scrollBySlide = (dir) => {
    const el = scrollerRef.current
    if (!el) return
    const slideWidth = el.clientWidth || 0
    el.scrollBy({ left: dir * slideWidth, behavior: 'smooth' })
  }

  return (
    <div className="post-media">
      <div className="post-gallery-wrap">
        <div className="post-gallery" ref={scrollerRef} id={galleryId} aria-label="Post photos">
        {safeImages.map((img, idx) => (
          <div className="post-gallery-slide" key={`${postId}-${idx}`}>
            <img src={img.url} alt={img.alt || 'Post photo'} loading="lazy" />
          </div>
        ))}
        </div>
        {safeImages.length > 1 ? (
          <>
            <button
              className="post-gallery-arrow post-gallery-arrow-left"
              type="button"
              aria-label="Previous photo"
              aria-controls={galleryId}
              onClick={() => scrollBySlide(-1)}
            >
              ?
            </button>
            <button
              className="post-gallery-arrow post-gallery-arrow-right"
              type="button"
              aria-label="Next photo"
              aria-controls={galleryId}
              onClick={() => scrollBySlide(1)}
            >
              ?
            </button>
          </>
        ) : null}
      </div>
      {safeImages.length > 1 ? (
        <div className="post-gallery-dots" aria-hidden="true">
          {safeImages.map((_, idx) => (
            <span className="post-gallery-dot" key={`${postId}-dot-${idx}`} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function StatItem({ icon, value }) {
  return (
    <div className="home-stat">
      <span className="home-stat-icon" aria-hidden="true">
        <Icon name={icon} />
      </span>
      <span className="home-stat-value">{value}</span>
    </div>
  )
}

function Icon({ name }) {
  switch (name) {
    case 'back':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
          <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'menu':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
          <path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'dots':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
          <path
            d="M6.5 12a1.5 1.5 0 1 0 0 .001V12Zm5.5 0a1.5 1.5 0 1 0 0 .001V12Zm5.5 0a1.5 1.5 0 1 0 0 .001V12Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
          <path
            d="M12 21s-7-4.7-9.2-9C1 8.1 3.2 5 6.7 5c1.8 0 3.2.9 4.1 2.1C11.7 5.9 13.2 5 15 5c3.5 0 5.7 3.1 3.9 7-2.2 4.3-9 9-9 9Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'comment':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
          <path
            d="M20 14a6 6 0 0 1-6 6H8l-4 3V8a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v6Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'bookmark':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
          <path
            d="M7 3h10a1 1 0 0 1 1 1v18l-6-3-6 3V4a1 1 0 0 1 1-1Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'share':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
          <path
            d="M15 8a3 3 0 1 0-2.83-4H12a3 3 0 0 0 0 6c.53 0 1.03-.14 1.46-.39l5.2 3.02a3.02 3.02 0 0 0 0 1.74l-5.2 3.02A3 3 0 1 0 12 20a3 3 0 0 0 2.17-5.07l5.2-3.02A3 3 0 1 0 15 8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
          <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'search':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
          <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M16.5 16.5 21 21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
          <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
          <path
            d="M18 16H6c1.2-1.3 2-2.7 2-6a4 4 0 0 1 8 0c0 3.3.8 4.7 2 6Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M10 18a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'user':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

function Post({ post }) {
  const initial = (post.author || '?').trim().slice(0, 1).toUpperCase()

  return (
    <article className="post">
      <header className="post-header">
        <div className="post-meta">
          <div className="post-avatar" aria-hidden="true">
            <span>{initial}</span>
          </div>
          <div className="post-meta-text">
            <div className="post-author">{post.author}</div>
            <div className="post-time">{post.time}</div>
          </div>
        </div>
        <button className="icon-btn" type="button" aria-label="More">
          <Icon name="dots" />
        </button>
      </header>

      <h2 className="post-title">{post.title}</h2>
      <p className="post-body">{post.body}</p>

      <PostGallery images={post.images} postId={post.id} />

      <footer className="post-actions">
        <button className="post-action" type="button" aria-label="Like">
          <Icon name="heart" />
          <span>{post.likes}</span>
        </button>
        <button className="post-action" type="button" aria-label="Comment">
          <Icon name="comment" />
          <span>{post.comments}</span>
        </button>
        <div className="post-actions-spacer" />
        <button className="post-action post-action-icon" type="button" aria-label="Bookmark">
          <Icon name="bookmark" />
        </button>
        <button className="post-action post-action-icon" type="button" aria-label="Share">
          <Icon name="share" />
        </button>
      </footer>
    </article>
  )
}

const DEFAULT_USER = { photo: null, username: 'johndoe', email: 'user@domain.com' }

function Home() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [user, setUser] = useState(DEFAULT_USER)

  const handleEditPicture = () => {
    fileInputRef.current?.click()
  }
  const onProfilePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setUser((u) => ({ ...u, photo: reader.result }))
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="home">
      <header className="home-topbar">
        <div className="home-brand">
          <img className="home-brand-logo" src="/logo.png" alt="StructSure" />
          <span className="home-brand-name">StructSure</span>
        </div>
        <button className="home-profile-btn" type="button" aria-label="Profile" onClick={() => setProfileOpen(true)}>
          {user.photo ? (
            <img src={user.photo} alt="" className="home-profile-pic" />
          ) : (
            <span className="home-profile-placeholder" aria-hidden="true">
              <Icon name="user" />
            </span>
          )}
        </button>
      </header>

      <div className="home-stats" aria-label="Quick stats">
        <StatItem icon="home" value="52" />
        <StatItem icon="comment" value="35" />
        <div className="home-stats-spacer" />
        <button className="icon-btn home-stats-more" type="button" aria-label="More">
          <Icon name="dots" />
        </button>
      </div>

      <main className="home-feed" aria-label="Feed">
        {demoPosts.map((p) => (
          <Post key={p.id} post={p} />
        ))}
      </main>

      <nav className="home-nav" aria-label="Bottom navigation">
        <button className="nav-btn is-active" type="button" aria-label="Home">
          <Icon name="home" />
        </button>
        <button className="nav-btn" type="button" aria-label="Search">
          <Icon name="search" />
        </button>
        <button className="nav-btn nav-btn-primary" type="button" aria-label="Create" onClick={() => navigate('/post/new')}>
          <span className="nav-fab">
            <Icon name="plus" />
          </span>
        </button>
        <button className="nav-btn" type="button" aria-label="Notifications" onClick={() => navigate('/notifications')}>
          <Icon name="bell" />
        </button>
        <button className="nav-btn" type="button" aria-label="Profile">
          <Icon name="user" />
        </button>
      </nav>

      {profileOpen && (
        <>
          <div className="home-profile-backdrop" onClick={() => setProfileOpen(false)} aria-hidden="true" />
          <aside className="home-profile-panel">
            <button className="home-profile-back" type="button" aria-label="Back" onClick={() => setProfileOpen(false)}>
              <Icon name="back" />
            </button>
            <div className="home-profile-content">
              <div className="home-profile-pic-large">
                {user.photo ? <img src={user.photo} alt="" /> : <Icon name="user" />}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="home-profile-file-input"
                onChange={onProfilePhotoChange}
                aria-hidden="true"
              />
              <button type="button" className="home-profile-edit-pic" onClick={handleEditPicture}>Edit picture</button>
              <label className="home-profile-label">Username</label>
              <input
                type="text"
                className="home-profile-input"
                value={user.username}
                onChange={(e) => setUser((u) => ({ ...u, username: e.target.value }))}
              />
              <label className="home-profile-label">Email</label>
              <input
                type="email"
                className="home-profile-input"
                value={user.email}
                onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
              />
              <button type="button" className="home-profile-btn-primary" onClick={() => setProfileOpen(false)}>
                Posts status
              </button>
              <button type="button" className="home-profile-btn-outline" onClick={() => { setProfileOpen(false); navigate('/login'); }}>
                Log out
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

export default Home

