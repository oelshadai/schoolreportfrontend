import { useState, useEffect } from 'react'

// Enhanced responsive breakpoints
export const BREAKPOINTS = {
  xs: 320,    // Extra small phones
  sm: 480,    // Small phones
  md: 768,    // Tablets
  lg: 1024,   // Small laptops
  xl: 1280,   // Large laptops
  xxl: 1536   // Desktop
}

export const useEnhancedResponsive = () => {
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

    const handleOrientationChange = () => {
      // Delay to ensure orientation change is complete
      setTimeout(() => {
        setScreenSize({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }, 100)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('orientationchange', handleOrientationChange)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return {
    width: screenSize.width,
    height: screenSize.height,
    // Device type detection
    isXs: screenSize.width <= BREAKPOINTS.xs,
    isSm: screenSize.width <= BREAKPOINTS.sm,
    isMd: screenSize.width <= BREAKPOINTS.md,
    isLg: screenSize.width <= BREAKPOINTS.lg,
    isXl: screenSize.width <= BREAKPOINTS.xl,
    
    // Semantic breakpoints
    isMobile: screenSize.width <= BREAKPOINTS.md,
    isTablet: screenSize.width > BREAKPOINTS.md && screenSize.width <= BREAKPOINTS.lg,
    isDesktop: screenSize.width > BREAKPOINTS.lg,
    
    // Specific mobile sizes
    isSmallMobile: screenSize.width <= BREAKPOINTS.sm,
    isTinyMobile: screenSize.width <= BREAKPOINTS.xs,
    
    // Orientation
    isLandscape: screenSize.width > screenSize.height,
    isPortrait: screenSize.width <= screenSize.height,
    
    // Viewport dimensions
    vh: screenSize.height,
    vw: screenSize.width
  }
}

// Enhanced responsive styles generator
export const getEnhancedResponsiveStyles = (responsive) => {
  const { isMobile, isTablet, isDesktop, isSmallMobile, isTinyMobile } = responsive

  return {
    // Container styles
    container: {
      padding: isTinyMobile ? '16px 8px' : isSmallMobile ? '20px 12px' : isMobile ? '24px 16px' : isTablet ? '28px 20px' : '32px 24px',
      paddingTop: isTinyMobile ? '70px' : isSmallMobile ? '80px' : isMobile ? '90px' : '120px',
      maxWidth: '100%',
      margin: '0 auto',
      minHeight: '100vh',
      boxSizing: 'border-box'
    },
    
    // Page header styles
    pageHeader: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isTinyMobile ? 12 : isSmallMobile ? 16 : isMobile ? 20 : 24,
      marginBottom: isTinyMobile ? 16 : isSmallMobile ? 20 : isMobile ? 24 : 32,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(16px)',
      borderRadius: isMobile ? 12 : 16,
      padding: isTinyMobile ? '16px 12px' : isSmallMobile ? '20px 16px' : isMobile ? '24px 20px' : '28px 24px',
      border: '1px solid rgba(71, 85, 105, 0.3)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    },

    // Card styles
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(16px)',
      borderRadius: isMobile ? 12 : 16,
      padding: isTinyMobile ? '16px 12px' : isSmallMobile ? '20px 16px' : isMobile ? '24px 20px' : '28px 24px',
      border: '1px solid rgba(71, 85, 105, 0.3)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      marginBottom: isTinyMobile ? 12 : isSmallMobile ? 16 : isMobile ? 20 : 24
    },

    // Button styles
    button: {
      padding: isTinyMobile ? '14px 16px' : isSmallMobile ? '16px 18px' : isMobile ? '16px 20px' : '14px 20px',
      fontSize: isTinyMobile ? 14 : isSmallMobile ? 15 : isMobile ? 16 : 16,
      borderRadius: isMobile ? 10 : 8,
      minHeight: isTinyMobile ? 48 : isSmallMobile ? 50 : isMobile ? 52 : 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isMobile ? 8 : 6,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      fontWeight: 600,
      width: isMobile ? '100%' : 'auto',
      boxSizing: 'border-box'
    },

    // Input styles
    input: {
      width: '100%',
      padding: isTinyMobile ? '14px 16px' : isSmallMobile ? '16px 18px' : isMobile ? '16px 20px' : '12px 16px',
      fontSize: isMobile ? 16 : 14, // 16px prevents iOS zoom
      borderRadius: isMobile ? 10 : 8,
      border: '1px solid rgba(71, 85, 105, 0.3)',
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#1f2937',
      outline: 'none',
      transition: 'all 0.2s ease',
      minHeight: isTinyMobile ? 48 : isSmallMobile ? 50 : isMobile ? 52 : 44,
      boxSizing: 'border-box'
    },

    // Modal styles
    modal: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '0' : '20px',
      backdropFilter: 'blur(8px)'
    },

    modalContent: {
      background: 'rgba(15, 23, 42, 0.95)',
      borderRadius: isMobile ? '20px 20px 0 0' : 16,
      padding: isTinyMobile ? '20px 16px' : isSmallMobile ? '24px 20px' : isMobile ? '28px 24px' : '32px',
      maxWidth: isMobile ? '100%' : '90%',
      width: isMobile ? '100vw' : 'auto',
      maxHeight: isMobile ? '90vh' : '85vh',
      overflowY: 'auto',
      color: 'white',
      border: isMobile ? 'none' : '1px solid rgba(71, 85, 105, 0.3)',
      backdropFilter: 'blur(20px)'
    },

    // Grid styles
    grid: {
      display: 'grid',
      gridTemplateColumns: isTinyMobile ? '1fr' : isSmallMobile ? '1fr' : isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: isTinyMobile ? 12 : isSmallMobile ? 16 : isMobile ? 20 : 24
    },

    // Flex row styles
    flexRow: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isTinyMobile ? 8 : isSmallMobile ? 12 : isMobile ? 16 : 20,
      alignItems: isMobile ? 'stretch' : 'center'
    },

    // Typography styles
    title: {
      fontSize: isTinyMobile ? 20 : isSmallMobile ? 24 : isMobile ? 28 : isTablet ? 32 : 36,
      fontWeight: 700,
      lineHeight: 1.2,
      margin: 0
    },

    subtitle: {
      fontSize: isTinyMobile ? 14 : isSmallMobile ? 16 : isMobile ? 18 : 20,
      fontWeight: 500,
      lineHeight: 1.4,
      margin: 0
    },

    body: {
      fontSize: isTinyMobile ? 13 : isSmallMobile ? 14 : isMobile ? 15 : 16,
      lineHeight: 1.5,
      margin: 0
    },

    // Navigation styles
    navbar: {
      height: isTinyMobile ? 56 : isSmallMobile ? 60 : isMobile ? 64 : 72,
      padding: isTinyMobile ? '0 12px' : isSmallMobile ? '0 16px' : '0 20px'
    },

    // Table styles (mobile cards)
    tableCard: {
      display: isMobile ? 'block' : 'none',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 12,
      padding: isTinyMobile ? '16px 12px' : '20px 16px',
      marginBottom: 12,
      border: '1px solid rgba(71, 85, 105, 0.2)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },

    // Desktop table
    table: {
      display: isMobile ? 'none' : 'table',
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0
    }
  }
}

// CSS-in-JS media queries
export const mediaQueries = {
  xs: `@media (max-width: ${BREAKPOINTS.xs}px)`,
  sm: `@media (max-width: ${BREAKPOINTS.sm}px)`,
  md: `@media (max-width: ${BREAKPOINTS.md}px)`,
  lg: `@media (max-width: ${BREAKPOINTS.lg}px)`,
  xl: `@media (max-width: ${BREAKPOINTS.xl}px)`,
  
  // Min-width queries
  minSm: `@media (min-width: ${BREAKPOINTS.sm + 1}px)`,
  minMd: `@media (min-width: ${BREAKPOINTS.md + 1}px)`,
  minLg: `@media (min-width: ${BREAKPOINTS.lg + 1}px)`,
  minXl: `@media (min-width: ${BREAKPOINTS.xl + 1}px)`,
  
  // Range queries
  smToMd: `@media (min-width: ${BREAKPOINTS.sm + 1}px) and (max-width: ${BREAKPOINTS.md}px)`,
  mdToLg: `@media (min-width: ${BREAKPOINTS.md + 1}px) and (max-width: ${BREAKPOINTS.lg}px)`,
  
  // Orientation
  landscape: '@media (orientation: landscape)',
  portrait: '@media (orientation: portrait)',
  
  // High DPI
  retina: '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'
}

// Global mobile styles
export const globalMobileStyles = `
  /* Reset and base styles */
  * {
    box-sizing: border-box;
  }
  
  html {
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Mobile-specific styles */
  ${mediaQueries.md} {
    .container {
      padding: 20px 12px !important;
      padding-top: 90px !important;
    }
    
    .page-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 16px !important;
    }
    
    .btn {
      width: 100% !important;
      min-height: 48px !important;
      font-size: 16px !important;
    }
    
    .modal-content {
      border-radius: 20px 20px 0 0 !important;
      max-height: 90vh !important;
      width: 100vw !important;
    }
    
    .table {
      display: none !important;
    }
    
    .mobile-cards {
      display: block !important;
    }
  }
  
  ${mediaQueries.sm} {
    .container {
      padding: 16px 8px !important;
      padding-top: 80px !important;
    }
    
    .page-header {
      padding: 16px 12px !important;
      gap: 12px !important;
    }
    
    .btn {
      min-height: 50px !important;
      font-size: 15px !important;
    }
  }
  
  ${mediaQueries.xs} {
    .container {
      padding: 12px 6px !important;
      padding-top: 70px !important;
    }
    
    .page-header {
      padding: 12px 8px !important;
      gap: 8px !important;
    }
    
    .btn {
      min-height: 48px !important;
      font-size: 14px !important;
    }
  }
  
  /* Touch targets */
  button, a, input, select, textarea {
    min-height: 44px;
  }
  
  ${mediaQueries.md} {
    button, a, input, select, textarea {
      min-height: 48px;
    }
  }
  
  /* Prevent zoom on iOS */
  input, select, textarea {
    font-size: 16px;
  }
  
  /* Safe area handling */
  .safe-area-top {
    padding-top: env(safe-area-inset-top);
  }
  
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
  }
  
  /* Focus styles for accessibility */
  button:focus, a:focus, input:focus, select:focus, textarea:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`

export default useEnhancedResponsive