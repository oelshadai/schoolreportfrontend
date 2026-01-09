import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar-mobile-first';
import BottomNavigation from './BottomNavigation';
import '../styles/responsive-layout.css';

/**
 * ResponsiveLayout Component
 * 
 * Handles responsive layout for mobile-first design system
 * - Desktop: Top navbar + sidebar
 * - Tablet: Top navbar + collapsible sidebar
 * - Mobile: Top navbar + bottom navigation
 */
const ResponsiveLayout = ({ children, showNavigation = true }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
  });
  const location = useLocation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Determine breakpoint
  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  const isDesktop = windowSize.width >= 1024;

  // Check if current page should hide navigation
  const hideNavPaths = ['/login', '/register', '/forgot-password', '/password-reset'];
  const shouldShowNav = showNavigation && !hideNavPaths.includes(location.pathname);

  return (
    <div className="responsive-layout">
      {/* Navigation - Always on top for all screen sizes */}
      {shouldShowNav && <Navbar />}

      {/* Main Content - Adjust for navigation */}
      <main
        className={`responsive-main ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}
      >
        <div className="responsive-content-wrapper">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Only on mobile */}
      {shouldShowNav && isMobile && <BottomNavigation />}
    </div>
  );
};

export default ResponsiveLayout;
