import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../state/AuthContext';
import api from '../utils/api';
import { FaEye, FaFilePdf, FaCode, FaExternalLinkAlt, FaTimes, FaSync } from 'react-icons/fa';

export default function ReportPreviewModal({ isOpen, onClose, previewData }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' or 'html'
  const [retryCount, setRetryCount] = useState(0);
  
  // Enhanced responsive state
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobile = screenSize.width <= 768;
  const isTablet = screenSize.width <= 1024;

  const previewUrls = useMemo(() => {
    const base = api.defaults.baseURL?.replace(/\/$/, '') || 'http://localhost:8000/api';
    const pdfUrl = `${base}/reports/template-preview-standalone/?format=pdf`;
    const htmlUrl = `${base}/reports/template-preview-standalone/?format=html`;
    
    return {
      pdf: token ? `${pdfUrl}&token=${token}` : pdfUrl,
      html: token ? `${htmlUrl}&token=${token}` : htmlUrl
    };
  }, [token]);

  const currentPreviewSrc = previewUrls[viewMode];

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setLoadError(false);
      setRetryCount(0);
    }
  }, [isOpen]);

  const handleRetry = () => {
    setLoading(true);
    setLoadError(false);
    setRetryCount(prev => prev + 1);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setLoading(true);
    setLoadError(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal fade show" 
      style={{ 
        display: 'block', 
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 1050
      }} 
      tabIndex="-1"
    >
      <div 
        className={`modal-dialog ${isMobile ? 'modal-fullscreen' : 'modal-xl'}`}
        style={{
          maxWidth: isMobile ? '100%' : '95vw',
          margin: isMobile ? 0 : '1.75rem auto'
        }}
      >
        <div 
          className="modal-content"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: isMobile ? 0 : 12,
            color: 'white',
            height: isMobile ? '100vh' : 'auto'
          }}
        >
          {/* Enhanced Header */}
          <div 
            className="modal-header"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none',
              borderRadius: isMobile ? 0 : '12px 12px 0 0',
              padding: isMobile ? '16px 20px' : '20px 24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FaEye size={20} />
              <h5 
                className="modal-title" 
                style={{ 
                  margin: 0, 
                  fontSize: isMobile ? 18 : 20,
                  fontWeight: 600
                }}
              >
                Report Template Preview
              </h5>
            </div>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                fontWeight: 500
              }}
            >
              <FaTimes size={14} />
              {!isMobile && 'Close'}
            </button>
          </div>
          
          {/* View Mode Selector */}
          <div 
            style={{
              padding: isMobile ? '12px 16px' : '16px 24px',
              borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
              background: 'rgba(15, 23, 42, 0.5)'
            }}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => handleViewModeChange('pdf')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  background: viewMode === 'pdf' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255, 255, 255, 0.1)',
                  border: viewMode === 'pdf' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaFilePdf size={14} />
                PDF View
              </button>
              <button
                onClick={() => handleViewModeChange('html')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  background: viewMode === 'html' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255, 255, 255, 0.1)',
                  border: viewMode === 'html' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaCode size={14} />
                HTML View
              </button>
            </div>
            <div style={{ 
              marginTop: 8, 
              fontSize: isMobile ? 11 : 12, 
              color: '#94a3b8',
              fontStyle: 'italic'
            }}>
              {viewMode === 'pdf' ? 'PDF format - Best for printing and final review' : 'HTML format - Faster loading, responsive design'}
            </div>
          </div>
          
          {/* Modal Body */}
          <div 
            className="modal-body"
            style={{
              padding: isMobile ? '16px' : '24px',
              height: isMobile ? 'calc(100vh - 200px)' : '75vh',
              overflow: 'hidden'
            }}
          >
            <div style={{ height: '100%', position: 'relative' }}>
              {loading && (
                <div 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: 8,
                    zIndex: 10
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div 
                      style={{
                        width: 40,
                        height: 40,
                        border: '3px solid rgba(34, 197, 94, 0.3)',
                        borderTop: '3px solid #22c55e',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 12px'
                      }}
                    />
                    <div style={{ color: '#94a3b8', fontSize: 14 }}>
                      Loading {viewMode.toUpperCase()} preview...
                    </div>
                    {retryCount > 0 && (
                      <div style={{ color: '#fbbf24', fontSize: 12, marginTop: 4 }}>
                        Retry attempt {retryCount}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {!loadError && (
                <iframe
                  key={`${viewMode}-${retryCount}`}
                  title={`Report Template Preview - ${viewMode.toUpperCase()}`}
                  src={currentPreviewSrc}
                  onLoad={() => setLoading(false)}
                  onError={() => { 
                    setLoading(false); 
                    setLoadError(true); 
                  }}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    border: '1px solid rgba(34, 197, 94, 0.3)', 
                    borderRadius: 8,
                    background: 'white'
                  }}
                />
              )}
              
              {loadError && (
                <div 
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 8,
                    padding: isMobile ? 16 : 24,
                    background: 'rgba(15, 23, 42, 0.5)',
                    textAlign: 'center'
                  }}
                >
                  <div 
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 8,
                      padding: '12px 16px',
                      marginBottom: 20,
                      width: '100%',
                      maxWidth: 400
                    }}
                  >
                    <div style={{ color: '#fca5a5', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                      ⚠️ Preview Load Failed
                    </div>
                    <div style={{ color: '#f87171', fontSize: 14 }}>
                      Unable to load the {viewMode.toUpperCase()} preview. This might be due to browser security settings or server issues.
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      onClick={handleRetry}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        border: 'none',
                        borderRadius: 8,
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      <FaSync size={14} />
                      Retry Preview
                    </button>
                    
                    <a 
                      href={currentPreviewSrc} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        border: 'none',
                        borderRadius: 8,
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 500,
                        textDecoration: 'none'
                      }}
                    >
                      <FaExternalLinkAlt size={14} />
                      Open in New Tab
                    </a>
                    
                    {viewMode === 'pdf' && (
                      <button
                        onClick={() => handleViewModeChange('html')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 16px',
                          background: 'rgba(139, 92, 246, 0.2)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: 8,
                          color: '#c4b5fd',
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        <FaCode size={14} />
                        Try HTML View
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Footer */}
          <div 
            className="modal-footer"
            style={{
              background: 'rgba(15, 23, 42, 0.5)',
              border: 'none',
              borderRadius: isMobile ? 0 : '0 0 12px 12px',
              padding: isMobile ? '16px 20px' : '16px 24px',
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'space-between'
            }}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a 
                href={previewUrls.pdf} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                <FaFilePdf size={14} />
                PDF in New Tab
              </a>
              
              <a 
                href={previewUrls.html} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                <FaCode size={14} />
                HTML in New Tab
              </a>
            </div>
            
            <button 
              type="button" 
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: 'rgba(107, 114, 128, 0.3)',
                border: '1px solid rgba(107, 114, 128, 0.5)',
                borderRadius: 8,
                color: '#d1d5db',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <FaTimes size={14} />
              Close
            </button>
          </div>
        </div>
      </div>
      
      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}