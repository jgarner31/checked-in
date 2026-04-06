import { useState, useEffect } from 'react'

// ─── CONFIG ────────────────────────────────────────────────────────────────
// Edit this block to change medications and notification email
const DEFAULT_CONFIG = {
  emailAddress: 'jgarner31@gmail.com',
  parentName: 'Mom',
  medications: [
    { name: 'Metformin',    doses: ['8:00 AM', '8:00 PM'], color: '#3b82f6' },
    { name: 'Lisinopril',   doses: ['8:00 AM'],            color: '#22c55e' },
    { name: 'Atorvastatin', doses: ['8:00 PM'],            color: '#a855f7' },
    { name: 'Aspirin',      doses: ['8:00 AM'],            color: '#ef4444' },
    { name: 'Vitamin D',    doses: ['8:00 AM'],            color: '#f59e0b' },
  ],
}

// ─── NAV ITEMS ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'medications', label: 'Medications', icon: '💊', built: true  },
  { id: 'appointments', label: 'Appointments', icon: '📅', built: false },
  { id: 'reminders',    label: 'Reminders',    icon: '🔔', built: false },
  { id: 'bills',        label: 'Bills',         icon: '💳', built: false },
]

// ─── HELPERS ───────────────────────────────────────────────────────────────
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function getGreeting(date) {
  const h = date.getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function dateKey(date) {
  return date.toISOString().split('T')[0]
}

// ─── MEDICATIONS SCREEN ────────────────────────────────────────────────────
function MedicationsScreen({ config }) {
  const [now, setNow] = useState(new Date())
  const [takenDoses, setTakenDoses] = useState({})
  const [confirmKey, setConfirmKey] = useState(null)
  const [emailStatus, setEmailStatus] = useState('idle') // idle | sent

  // Clock tick every minute
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  // Load/reset doses when date changes
  useEffect(() => {
    const key = `checkedin-meds-${dateKey(now)}`
    const stored = localStorage.getItem(key)
    setTakenDoses(stored ? JSON.parse(stored) : {})
  }, [dateKey(now)])

  // Persist doses
  useEffect(() => {
    const key = `checkedin-meds-${dateKey(now)}`
    localStorage.setItem(key, JSON.stringify(takenDoses))
  }, [takenDoses])

  const getDoseKey = (medName, time) => `${medName}||${time}`

  const handleDoseTap = (medName, time) => {
    const key = getDoseKey(medName, time)
    if (takenDoses[key]) {
      // First tap on a taken dose → ask to confirm undo
      if (confirmKey === key) {
        setTakenDoses(prev => { const u = { ...prev }; delete u[key]; return u })
        setConfirmKey(null)
      } else {
        setConfirmKey(key)
        setTimeout(() => setConfirmKey(k => k === key ? null : k), 3000)
      }
    } else {
      // Mark taken immediately
      setTakenDoses(prev => ({ ...prev, [key]: true }))
      setConfirmKey(null)
    }
  }

  const totalDoses = config.medications.reduce((n, m) => n + m.doses.length, 0)
  const takenCount = Object.keys(takenDoses).length
  const allDone    = takenCount === totalDoses
  const progress   = totalDoses > 0 ? (takenCount / totalDoses) * 100 : 0

  const sendEmailReport = () => {
    const dateStr = formatDate(now)
    let body = `Checked In — Daily Medication Report\nDate: ${dateStr}\n\n`
    body += `Summary: ${takenCount} of ${totalDoses} doses taken\n\n`
    config.medications.forEach(med => {
      med.doses.forEach(time => {
        const taken = takenDoses[getDoseKey(med.name, time)]
        body += `${taken ? '✅' : '❌'} ${med.name} ${time}\n`
      })
    })
    const subject = `Checked In — ${config.parentName}'s Medications — ${dateStr}`
    window.location.href = `mailto:${config.emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setEmailStatus('sent')
  }

  return (
    <div style={s.screen}>
      {/* Progress bar */}
      <div style={s.progressWrap}>
        <div style={s.progressTrack}>
          <div style={{
            ...s.progressFill,
            width: `${progress}%`,
            background: allDone ? '#22c55e' : '#3b82f6',
          }} />
        </div>
        <div style={s.progressLabel}>
          <span style={{ color: allDone ? '#22c55e' : '#3b82f6', fontWeight: 700 }}>
            {takenCount} of {totalDoses}
          </span>
          <span style={{ color: '#94a3b8' }}> doses taken today</span>
        </div>
      </div>

      {/* All done banner */}
      {allDone && (
        <div style={s.allDoneBanner}>
          🎉 All done for today! Great job.
        </div>
      )}

      {/* Medication cards */}
      <div style={s.medGrid}>
        {config.medications.map(med => (
          <div key={med.name} style={{ ...s.medCard, borderTopColor: med.color }}>
            <div style={{ ...s.medCardTitle, color: med.color }}>{med.name}</div>
            <div style={s.doseList}>
              {med.doses.map(time => {
                const key = getDoseKey(med.name, time)
                const taken = !!takenDoses[key]
                const confirming = confirmKey === key
                return (
                  <button
                    key={key}
                    style={{
                      ...s.doseBtn,
                      background: taken
                        ? (confirming ? '#7f1d1d' : 'rgba(34,197,94,0.15)')
                        : 'rgba(255,255,255,0.05)',
                      border: taken
                        ? (confirming ? '2px solid #ef4444' : '2px solid rgba(34,197,94,0.5)')
                        : '2px solid rgba(255,255,255,0.1)',
                      color: taken ? (confirming ? '#fca5a5' : '#4ade80') : '#94a3b8',
                    }}
                    onClick={() => handleDoseTap(med.name, time)}
                  >
                    <span style={{ fontSize: 22 }}>
                      {taken ? (confirming ? '↩️' : '✅') : '⬜'}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{time}</span>
                    {confirming && (
                      <span style={{ fontSize: 11, color: '#fca5a5' }}>tap to undo</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Email report */}
      <div style={s.emailRow}>
        <button
          style={{ ...s.emailBtn, opacity: emailStatus === 'sent' ? 0.6 : 1 }}
          onClick={sendEmailReport}
          disabled={emailStatus === 'sent'}
        >
          {emailStatus === 'sent' ? '📬 Report Sent' : '📧 Send Today\'s Report'}
        </button>
        <div style={s.emailNote}>Resets automatically at midnight</div>
      </div>
    </div>
  )
}

// ─── COMING SOON SCREEN ────────────────────────────────────────────────────
function ComingSoonScreen({ icon, label }) {
  return (
    <div style={s.comingSoonWrap}>
      <div style={s.comingSoonIcon}>{icon}</div>
      <div style={s.comingSoonTitle}>{label}</div>
      <div style={s.comingSoonSub}>This section is coming in a future update.</div>
      <div style={s.comingSoonTag}>Phase 3</div>
    </div>
  )
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('medications')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const activeNav = NAV_ITEMS.find(n => n.id === activeTab)

  return (
    <div style={s.root}>
      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logoMark}>✅</div>
          <div>
            <div style={s.appName}>Checked In</div>
            <div style={s.tagline}>Has your family checked in today?</div>
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.clock}>{formatTime(now)}</div>
          <div style={s.headerDate}>{formatDate(now)}</div>
        </div>
      </header>

      {/* ── Greeting ── */}
      <div style={s.greeting}>
        {getGreeting(now)}, {DEFAULT_CONFIG.parentName} 👋
      </div>

      {/* ── Nav Tabs ── */}
      <nav style={s.nav}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            style={{
              ...s.navBtn,
              ...(activeTab === item.id ? s.navBtnActive : {}),
              ...(item.built ? {} : s.navBtnDim),
            }}
            onClick={() => setActiveTab(item.id)}
          >
            <span style={s.navIcon}>{item.icon}</span>
            <span style={s.navLabel}>{item.label}</span>
            {!item.built && <span style={s.navSoon}>Soon</span>}
          </button>
        ))}
      </nav>

      {/* ── Content ── */}
      <main style={s.main}>
        {activeTab === 'medications' && (
          <MedicationsScreen config={DEFAULT_CONFIG} />
        )}
        {activeTab !== 'medications' && (
          <ComingSoonScreen icon={activeNav.icon} label={activeNav.label} />
        )}
      </main>
    </div>
  )
}

// ─── STYLES ────────────────────────────────────────────────────────────────
const s = {
  root: {
    minHeight: '100vh',
    background: '#0f172a',
    color: '#f1f5f9',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(148,163,184,0.1)',
    background: 'rgba(15,23,42,0.8)',
    backdropFilter: 'blur(8px)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoMark: {
    fontSize: 32,
  },
  appName: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: '#f1f5f9',
  },
  tagline: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  headerRight: {
    textAlign: 'right',
  },
  clock: {
    fontSize: 28,
    fontWeight: 700,
    color: '#3b82f6',
    fontFamily: 'monospace',
    letterSpacing: '0.04em',
  },
  headerDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },

  // Greeting
  greeting: {
    padding: '12px 24px',
    fontSize: 18,
    fontWeight: 600,
    color: '#cbd5e1',
    borderBottom: '1px solid rgba(148,163,184,0.08)',
  },

  // Nav
  nav: {
    display: 'flex',
    gap: 8,
    padding: '12px 24px',
    borderBottom: '1px solid rgba(148,163,184,0.1)',
    background: 'rgba(15,23,42,0.5)',
    overflowX: 'auto',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 20px',
    borderRadius: 12,
    border: '1.5px solid rgba(148,163,184,0.15)',
    background: 'rgba(255,255,255,0.04)',
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
    touchAction: 'manipulation',
    position: 'relative',
  },
  navBtnActive: {
    background: 'rgba(59,130,246,0.15)',
    border: '1.5px solid rgba(59,130,246,0.4)',
    color: '#93c5fd',
  },
  navBtnDim: {
    opacity: 0.6,
  },
  navIcon: {
    fontSize: 18,
  },
  navLabel: {
    fontSize: 14,
  },
  navSoon: {
    fontSize: 10,
    fontWeight: 700,
    background: 'rgba(148,163,184,0.15)',
    color: '#64748b',
    padding: '2px 6px',
    borderRadius: 99,
    letterSpacing: '0.05em',
  },

  // Main content area
  main: {
    flex: 1,
    overflowY: 'auto',
  },

  // Medications screen
  screen: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  progressWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  progressTrack: {
    height: 10,
    background: 'rgba(148,163,184,0.15)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
    transition: 'width 0.4s ease, background 0.3s ease',
  },
  progressLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  allDoneBanner: {
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: 12,
    padding: '14px 20px',
    color: '#4ade80',
    fontSize: 16,
    fontWeight: 600,
    textAlign: 'center',
  },
  medGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 16,
  },
  medCard: {
    background: 'rgba(30,41,59,0.8)',
    borderRadius: 14,
    border: '1px solid rgba(148,163,184,0.1)',
    borderTop: '4px solid',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  medCardTitle: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  doseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  doseBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 500,
    transition: 'all 0.15s ease',
    touchAction: 'manipulation',
    textAlign: 'left',
    minHeight: 56,
  },
  emailRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
    borderTop: '1px solid rgba(148,163,184,0.1)',
  },
  emailBtn: {
    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '14px 36px',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    maxWidth: 360,
    touchAction: 'manipulation',
    transition: 'opacity 0.2s ease',
  },
  emailNote: {
    fontSize: 12,
    color: '#475569',
  },

  // Coming soon
  comingSoonWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    gap: 16,
    textAlign: 'center',
  },
  comingSoonIcon: {
    fontSize: 64,
    lineHeight: 1,
  },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#e2e8f0',
  },
  comingSoonSub: {
    fontSize: 16,
    color: '#64748b',
    maxWidth: 300,
    lineHeight: 1.5,
  },
  comingSoonTag: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: '#475569',
    background: 'rgba(148,163,184,0.1)',
    border: '1px solid rgba(148,163,184,0.15)',
    padding: '4px 12px',
    borderRadius: 99,
    marginTop: 8,
  },
}
