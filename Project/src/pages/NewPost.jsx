import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './NewPost.css'

const categories = [
  { id: 'structural', label: 'structural' },
  { id: 'electrical', label: 'electrical' },
  { id: 'plumbing', label: 'plumbing' },
  { id: 'hvac', label: 'HVAC' },
  { id: 'roofing', label: 'roofing' },
  { id: 'fire', label: 'fire & life safety' },
  { id: 'ada', label: 'ADA / code compliance' },
  { id: 'env', label: 'environmental/health' },
  { id: 'site', label: 'drainage & site conditions' },
  { id: 'maint', label: 'maintenance / wear' },
]

function Icon({ name }) {
  switch (name) {
    case 'back':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="np-icon">
          <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'pin':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="np-icon">
          <path
            d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" fill="currentColor" opacity="0.25" />
        </svg>
      )
    case 'home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="np-icon">
          <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="np-icon">
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
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="np-icon">
          <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'search':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="np-icon">
          <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M16.5 16.5 21 21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

function NewPost() {
  const navigate = useNavigate()
  const [caption, setCaption] = useState('')
  const [severity, setSeverity] = useState(5)
  const [selected, setSelected] = useState(() => new Set(['structural']))
  const [locationQuery, setLocationQuery] = useState('11150 SW 14th St, Miami, FL 33199')
  const [cameraStatus, setCameraStatus] = useState('idle') // idle | ready | denied | error
  const [capturedUrl, setCapturedUrl] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const selectedList = useMemo(() => Array.from(selected), [selected])

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    const start = async () => {
      try {
        setCameraStatus('idle')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play()
        }
        setCameraStatus('ready')
      } catch (err) {
        if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
          setCameraStatus('denied')
        } else {
          setCameraStatus('error')
        }
      }
    }

    start()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [])

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    const w = video.videoWidth || 0
    const h = video.videoHeight || 0
    if (!w || !h) return

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, w, h)
    const url = canvas.toDataURL('image/jpeg', 0.92)
    setCapturedUrl(url)
  }

  return (
    <div className="np">
      <header className="np-topbar">
        <button className="np-back" type="button" aria-label="Back" onClick={() => navigate(-1)}>
          <Icon name="back" />
        </button>
        <div className="np-title">New post</div>
        <div className="np-spacer" />
      </header>

      <main className="np-content">
        <section className="np-card np-photo">
          <div className="np-photo-frame" aria-label="Selected photo preview">
            {capturedUrl ? (
              <img src={capturedUrl} alt="Captured damage photo" />
            ) : (
              <video ref={videoRef} className="np-video" playsInline muted />
            )}
          </div>

          <div className="np-camera-row">
            {capturedUrl ? (
              <button className="np-camera-btn np-camera-btn-secondary" type="button" onClick={() => setCapturedUrl('')}>
                Retake
              </button>
            ) : (
              <button
                className="np-camera-btn np-camera-btn-primary"
                type="button"
                onClick={capture}
                disabled={cameraStatus !== 'ready'}
              >
                Take photo
              </button>
            )}
            {cameraStatus === 'denied' ? (
              <div className="np-camera-hint">Camera permission blocked in browser.</div>
            ) : cameraStatus === 'error' ? (
              <div className="np-camera-hint">Couldn’t access camera on this device.</div>
            ) : (
              <div className="np-camera-hint">Photo must be taken now.</div>
            )}
          </div>

          <label className="np-caption">
            <span className="np-caption-label">Add a caption…</span>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption…"
              rows={3}
            />
          </label>

          <div className="np-chips" aria-label="Categories">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`np-chip ${selected.has(c.id) ? 'is-active' : ''}`}
                onClick={() => toggle(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="np-severity" aria-label="Severity">
            <span className="np-severity-label">Severity</span>
            <div className="np-severity-row">
              <input
                type="range"
                min={1}
                max={10}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="np-severity-slider"
              />
              <span className="np-severity-value">{severity}</span>
            </div>
          </div>

          <div className="np-selected" aria-label="Selected categories">
            {selectedList.length ? selectedList.join(', ') : 'No categories selected'}
          </div>
        </section>

        <section className="np-map" aria-label="Location">
          <div className="np-map-search">
            <Icon name="search" />
            <input
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Search location"
              aria-label="Search location"
            />
          </div>

          <div className="np-map-surface" role="img" aria-label="Map preview">
            <div className="np-map-grid" />
            <div className="np-map-label">Ryder Business Bldg</div>
            <div className="np-map-pin" aria-label="Selected location pin">
              <Icon name="pin" />
            </div>
            <div className="np-map-footer">
              <div className="np-map-place">Steven J. Green School International and…</div>
              <div className="np-map-badge" aria-hidden="true">
                <span className="np-map-badge-dot" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <nav className="np-nav" aria-label="Bottom navigation">
        <button className="np-nav-btn" type="button" aria-label="Home" onClick={() => navigate('/home')}>
          <Icon name="home" />
        </button>
        <button className="np-nav-btn" type="button" aria-label="Notifications">
          <Icon name="bell" />
        </button>
        <button className="np-nav-btn np-nav-btn-primary" type="button" aria-label="Create">
          <span className="np-fab">
            <Icon name="plus" />
          </span>
        </button>
        <button className="np-nav-btn" type="button" aria-label="Search">
          <Icon name="search" />
        </button>
      </nav>
    </div>
  )
}

export default NewPost

