import { FaEye, FaDownload } from 'react-icons/fa'

export default function StudentReports() {
  const isMobile = window.innerWidth <= 768

  const reports = [
    { id: 1, title: 'Term 1 Report', term: 'Term 1', date: new Date(), status: 'Available' },
    { id: 2, title: 'Mid-term Report', term: 'Mid-term', date: new Date(), status: 'Available' },
    { id: 3, title: 'Term 2 Report', term: 'Term 2', date: new Date(), status: 'Available' }
  ]

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.9)',
      borderRadius: '16px',
      padding: isMobile ? '16px' : '20px',
      border: '1px solid rgba(71, 85, 105, 0.3)'
    }}>
      <h3 style={{
        margin: '0 0 20px 0',
        color: 'white',
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: '700'
      }}>
        My Reports
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reports.map(report => (
          <div key={report.id} style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            padding: isMobile ? '14px' : '16px',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '12px' : '0'
            }}>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  margin: '0 0 4px 0',
                  color: 'white',
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '600'
                }}>
                  {report.title}
                </h4>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: '#a78bfa',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {report.term}
                  </span>
                  <span style={{
                    color: '#64748b',
                    fontSize: '12px'
                  }}>
                    {new Date(report.date).toLocaleDateString()}
                  </span>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {report.status}
                  </span>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '8px',
                alignSelf: isMobile ? 'stretch' : 'flex-start'
              }}>
                <button style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#60a5fa',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  <FaEye size={10} style={{ marginRight: '4px' }} />
                  View
                </button>
                <button style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  <FaDownload size={10} style={{ marginRight: '4px' }} />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}