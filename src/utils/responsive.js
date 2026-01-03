import { useState, useEffect } from 'react'

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  })

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    width: screenSize.width,
    height: screenSize.height,
    isMobile: screenSize.width <= 768,
    isTablet: screenSize.width <= 1024 && screenSize.width > 768,
    isDesktop: screenSize.width > 1024,
    isSmallMobile: screenSize.width <= 480
  }
}

export const getResponsiveStyles = (isMobile, isTablet) => ({
  container: {
    padding: isMobile ? '20px 12px' : isTablet ? '24px 16px' : '32px 20px',
    paddingTop: isMobile ? '90px' : '24px',
    maxWidth: '100%',
    margin: '0 auto'
  },
  
  card: {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(16px)',
    borderRadius: isMobile ? '12px' : '16px',
    padding: isMobile ? '16px' : '20px',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: isMobile ? '16px' : '20px'
  },

  button: {
    padding: isMobile ? '12px 16px' : '14px 20px',
    fontSize: isMobile ? '14px' : '16px',
    borderRadius: '8px',
    minHeight: isMobile ? '44px' : '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    fontWeight: '600'
  },

  input: {
    width: '100%',
    padding: isMobile ? '12px 14px' : '12px 16px',
    fontSize: isMobile ? '16px' : '14px', // 16px prevents iOS zoom
    borderRadius: '8px',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    background: 'rgba(30, 41, 59, 0.8)',
    color: '#f8fafc',
    outline: 'none',
    transition: 'all 0.2s ease'
  },

  modal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: isMobile ? '0' : '24px'
  },

  modalContent: {
    background: 'rgba(15, 23, 42, 0.95)',
    borderRadius: isMobile ? '20px 20px 0 0' : '16px',
    padding: isMobile ? '20px' : '24px',
    maxWidth: isMobile ? '100%' : '600px',
    width: '100%',
    maxHeight: isMobile ? '90vh' : '80vh',
    overflowY: 'auto'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: isMobile ? '16px' : '20px'
  },

  flexRow: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '12px' : '16px',
    alignItems: isMobile ? 'stretch' : 'center'
  },

  pageHeader: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    gap: isMobile ? '16px' : '20px',
    marginBottom: '24px',
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    padding: isMobile ? '20px 16px' : '24px 20px',
    border: '1px solid rgba(71, 85, 105, 0.3)'
  },

  title: {
    fontSize: isMobile ? '24px' : '32px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0
  }
})

export default useResponsive