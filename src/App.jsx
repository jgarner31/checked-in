import { useState, useEffect } from 'react'

const DEFAULT_CONFIG = {
  emailAddress: 'jgarner31@gmail.com',
  medications: [
    {
      name: 'Metformin',
      doses: ['8:00 AM', '8:00 PM'],
      color: '#3498db'
    },
    {
      name: 'Lisinopril',
      doses: ['8:00 AM'],
      color: '#2ecc71'
    },
    {
      name: 'Atorvastatin',
      doses: ['8:00 PM'],
      color: '#9b59b6'
    },
    {
      name: 'Aspirin',
      doses: ['8:00 AM'],
      color: '#e74c3c'
    },
    {
      name: 'Vitamin D',
      doses: ['8:00 AM'],
      color: '#f39c12'
    }
  ]
}

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [takenDoses, setTakenDoses] = useState({})
  const [lastLoadedDate, setLastLoadedDate] = useState(null)

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const lastDate = currentDate

      // Check if date changed
      if (now.toDateString() !== lastDate.toDateString()) {
        setCurrentDate(now)
      } else {
        // Just update time
        setCurrentDate(new Date(now))
      }
    }, 60000)

    return () => clearInterval(timer)
  }, [currentDate])

  // Load doses from localStorage on mount and when date changes
  useEffect(() => {
    const dateString = currentDate.toISOString().split('T')[0]

    if (lastLoadedDate !== dateString) {
      const storageKey = `medtracker-${dateString}`
      const stored = localStorage.getItem(storageKey)
      const doses = stored ? JSON.parse(stored) : {}
      setTakenDoses(doses)
      setLastLoadedDate(dateString)
    }
  }, [currentDate, lastLoadedDate])

  // Save doses to localStorage whenever they change
  useEffect(() => {
    const dateString = currentDate.toISOString().split('T')[0]
    const storageKey = `medtracker-${dateString}`
    localStorage.setItem(storageKey, JSON.stringify(takenDoses))
  }, [takenDoses, currentDate])

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const getDoseKey = (medName, doseTime) => {
    return `${medName}-${doseTime}`
  }

  const toggleDose = (medName, doseTime) => {
    const key = getDoseKey(medName, doseTime)
    const isTaken = takenDoses[key]

    if (isTaken) {
      // Confirm before marking as not taken
      if (window.confirm(`Mark ${medName} at ${doseTime} as NOT taken?`)) {
        setTakenDoses(prev => {
          const updated = { ...prev }
          delete updated[key]
          return updated
        })
      }
    } else {
      // Mark as taken
      setTakenDoses(prev => ({
        ...prev,
        [key]: true
      }))
    }
  }

  const getTotalDoses = () => {
    let total = 0
    DEFAULT_CONFIG.medications.forEach(med => {
      total += med.doses.length
    })
    return total
  }

  const getTakenDosesCount = () => {
    return Object.keys(takenDoses).length
  }

  const generateEmailReport = () => {
    const dateString = formatDate(currentDate)
    const takenCount = getTakenDosesCount()
    const totalCount = getTotalDoses()

    let reportBody = `MedTracker Daily Report\nDate: ${dateString}\n\n`
    reportBody += `Summary: ${takenCount} of ${totalCount} doses taken\n\n`
    reportBody += '='.repeat(40) + '\n\n'

    DEFAULT_CONFIG.medications.forEach(med => {
      reportBody += `${med.name}:\n`
      med.doses.forEach(doseTime => {
        const key = getDoseKey(med.name, doseTime)
        const status = takenDoses[key] ? '✓ TAKEN' : '✗ MISSED'
        reportBody += `  ${doseTime}: ${status}\n`
      })
      reportBody += '\n'
    })

    const subject = `MedTracker Daily Report - ${dateString}`
    const mailtoLink = `mailto:${DEFAULT_CONFIG.emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(reportBody)}`
    window.location.href = mailtoLink
  }

  const containerStyle = {
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid #444',
    paddingBottom: '20px'
  }

  const titleStyle = {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '0 0 15px 0'
  }

  const dateTimeStyle = {
    fontSize: '16px',
    color: '#aaa',
    margin: '5px 0'
  }

  const progressStyle = {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#16213e',
    borderRadius: '10px'
  }

  const progressBarContainerStyle = {
    width: '100%',
    height: '30px',
    backgroundColor: '#444',
    borderRadius: '15px',
    overflow: 'hidden',
    marginBottom: '10px'
  }

  const progressBarFillStyle = {
    height: '100%',
    backgroundColor: '#2ecc71',
    width: `${getTotalDoses() > 0 ? (getTakenDosesCount() / getTotalDoses()) * 100 : 0}%`,
    transition: 'width 0.3s ease'
  }

  const progressTextStyle = {
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: 'bold'
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  }

  const cardStyle = {
    backgroundColor: '#16213e',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    borderLeft: '6px solid'
  }

  const cardTitleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '15px',
    marginTop: 0
  }

  const dosesContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  }

  const doseButtonStyle = (isTaken, medColor) => ({
    backgroundColor: isTaken ? '#2ecc71' : '#444',
    color: '#fff',
    border: `2px solid ${isTaken ? '#27ae60' : '#666'}`,
    borderRadius: '8px',
    padding: '15px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    touchAction: 'manipulation'
  })

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '30px',
    flexWrap: 'wrap'
  }

  const emailButtonStyle = {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '15px 30px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    touchAction: 'manipulation'
  }

  const emailButtonHoverStyle = {
    backgroundColor: '#2980b9'
  }

  const [emailButtonHover, setEmailButtonHover] = useState(false)

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>💊 MedTracker</h1>
        <div style={dateTimeStyle}>{formatDate(currentDate)}</div>
        <div style={dateTimeStyle}>{formatTime(currentDate)}</div>
      </div>

      <div style={progressStyle}>
        <div style={progressBarContainerStyle}>
          <div style={progressBarFillStyle}></div>
        </div>
        <div style={progressTextStyle}>
          {getTakenDosesCount()} of {getTotalDoses()} doses taken
        </div>
      </div>

      <div style={gridStyle}>
        {DEFAULT_CONFIG.medications.map(med => (
          <div key={med.name} style={{ ...cardStyle, borderLeftColor: med.color }}>
            <h2 style={cardTitleStyle}>💊 {med.name}</h2>
            <div style={dosesContainerStyle}>
              {med.doses.map(doseTime => {
                const key = getDoseKey(med.name, doseTime)
                const isTaken = takenDoses[key]
                return (
                  <button
                    key={key}
                    style={doseButtonStyle(isTaken, med.color)}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.02)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)'
                    }}
                    onClick={() => toggleDose(med.name, doseTime)}
                  >
                    <span>{isTaken ? '✅' : '💊'}</span>
                    <span>{doseTime}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={buttonContainerStyle}>
        <button
          style={{
            ...emailButtonStyle,
            ...(emailButtonHover ? emailButtonHoverStyle : {})
          }}
          onMouseEnter={() => setEmailButtonHover(true)}
          onMouseLeave={() => setEmailButtonHover(false)}
          onClick={generateEmailReport}
        >
          📧 Email Report
        </button>
      </div>
    </div>
  )
}
