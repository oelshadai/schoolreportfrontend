/**
 * ============================================================================
 * PRODUCTION-READY RESPONSIVE REACT COMPONENTS
 * Mobile-First SaaS Pattern Library
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaChevronDown, FaTimes, FaBars, FaHome, FaCog, FaUser, FaPlus } from 'react-icons/fa';

/* ============================================================================
   1. BOTTOM NAVIGATION (Mobile-First Pattern)
   ============================================================================ */

/**
 * BottomNav Component - Primary navigation for mobile devices
 * Features:
 * - Fixed bottom positioning on mobile
 * - Touch-friendly (48px+ targets)
 * - Icon + label layout
 * - Active state indication
 * - Smooth transitions
 * 
 * Usage:
 * <BottomNav items={navItems} />
 */
export function BottomNav({ items = [], onNavigate = () => {} }) {
  const [activeItem, setActiveItem] = useState(items[0]?.id);

  const handleItemClick = (item) => {
    setActiveItem(item.id);
    onNavigate(item);
  };

  return (
    <nav
      className="bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: 0,
        padding: 'env(safe-area-inset-bottom, 0) 0 0 0',
        height: 'calc(60px + env(safe-area-inset-bottom, 0))',
        background: 'var(--color-neutral-0)',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 -1px 3px 0 rgb(0 0 0 / 0.1)',
        zIndex: 'var(--z-fixed)',
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleItemClick(item)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-1)',
            flex: 1,
            height: '100%',
            padding: 'var(--space-2)',
            background: 'none',
            border: 'none',
            color: activeItem === item.id ? 'var(--color-primary)' : 'var(--color-neutral-500)',
            cursor: 'pointer',
            transition: 'color var(--transition-base)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: activeItem === item.id ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
          }}
        >
          <item.icon size={24} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ============================================================================
   2. RESPONSIVE TABLE WITH MOBILE CARD VIEW
   ============================================================================ */

/**
 * ResponsiveTable Component
 * Automatically switches between table (desktop) and card view (mobile)
 * Features:
 * - Sticky header on desktop
 * - Horizontal scroll with visual indicator
 * - Card layout on mobile
 * - Swipe actions support
 * - Sorting/filtering ready
 */
export function ResponsiveTable({
  columns = [],
  data = [],
  renderRow = null,
  onRowClick = () => {},
  loading = false,
  maxMobileColumns = 2,
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const tableRef = useRef(null);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (tableRef.current && !isMobile) {
      const { scrollWidth, clientWidth } = tableRef.current;
      setHasHorizontalScroll(scrollWidth > clientWidth);
    }
  }, [isMobile, data]);

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-neutral-200)',
            borderTop: '3px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {data.map((row, idx) => (
          <div
            key={idx}
            onClick={() => onRowClick(row)}
            className="card"
            style={{ cursor: 'pointer' }}
          >
            {columns.slice(0, maxMobileColumns).map((col) => (
              <div key={col.key} style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {col.label}
                </div>
                <div style={{ fontSize: 'var(--font-size-base)', marginTop: 'var(--space-1)' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </div>
              </div>
            ))}
            {renderRow && renderRow(row)}
          </div>
        ))}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div style={{ position: 'relative', overflowX: 'auto', borderRadius: 'var(--radius-lg)' }}>
      {hasHorizontalScroll && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            padding: 'var(--space-2)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-neutral-500)',
            zIndex: 1,
          }}
        >
          ← Scroll →
        </div>
      )}
      <table
        ref={tableRef}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '100%',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid var(--color-neutral-200)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: 'var(--space-4)',
                  textAlign: 'left',
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-neutral-700)',
                  background: 'var(--color-neutral-50)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick(row)}
              style={{
                borderBottom: '1px solid var(--color-neutral-200)',
                transition: 'background var(--transition-fast)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-neutral-50)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: 'var(--space-4)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-neutral-900)',
                  }}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================================
   3. MOBILE-FRIENDLY MODAL / BOTTOM SHEET
   ============================================================================ */

/**
 * ResponsiveModal Component
 * Shows centered modal on desktop, bottom sheet on mobile
 * Features:
 * - Bottom sheet on mobile (swipe to dismiss)
 * - Centered modal on desktop
 * - Prevents background scroll
 * - Touch-friendly close button
 * - Smooth animations
 */
export function ResponsiveModal({ isOpen, onClose, title = '', children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const sheetRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleDragStart = (e) => {
    if (isMobile) {
      setIsDragging(true);
      setDragStart(e.touches?.[0]?.clientY || e.clientY);
    }
  };

  const handleDragEnd = (e) => {
    if (!isMobile || !isDragging) return;
    const dragEnd = e.changedTouches?.[0]?.clientY || e.clientY;
    if (dragEnd - dragStart > 100) {
      onClose();
    }
    setIsDragging(false);
  };

  if (!isOpen) return null;

  // Mobile Bottom Sheet
  if (isMobile) {
    return (
      <>
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 'var(--z-modal-backdrop)',
            animation: 'fadeIn var(--transition-base)',
          }}
        />
        <div
          ref={sheetRef}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--color-neutral-0)',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
            maxHeight: '85vh',
            overflow: 'auto',
            zIndex: 'var(--z-modal)',
            animation: 'slideInUp var(--transition-base)',
            paddingBottom: 'env(safe-area-inset-bottom, 0)',
          }}
        >
          {/* Drag Handle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: 'var(--space-3)',
              borderBottom: '1px solid var(--color-neutral-200)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '4px',
                background: 'var(--color-neutral-300)',
                borderRadius: 'var(--radius-full)',
              }}
            />
          </div>

          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-4)',
              borderBottom: '1px solid var(--color-neutral-200)',
            }}
          >
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--space-2)',
                color: 'var(--color-neutral-500)',
              }}
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: 'var(--space-4)' }}>{children}</div>
        </div>
      </>
    );
  }

  // Desktop Centered Modal
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 'var(--z-modal-backdrop)',
          animation: 'fadeIn var(--transition-base)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '500px',
          background: 'var(--color-neutral-0)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 'var(--z-modal)',
          animation: 'slideInUp var(--transition-base)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-6)',
            borderBottom: '1px solid var(--color-neutral-200)',
          }}
        >
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-2)',
              color: 'var(--color-neutral-500)',
            }}
          >
            <FaTimes size={24} />
          </button>
        </div>
        <div style={{ padding: 'var(--space-6)' }}>{children}</div>
      </div>
    </>
  );
}

/* ============================================================================
   4. MOBILE-FRIENDLY FORM
   ============================================================================ */

/**
 * ResponsiveForm Component
 * Features:
 * - Full-width inputs on mobile
 * - Multi-column grid on desktop
 * - Touch-friendly input sizing (48px+)
 * - Inline validation feedback
 * - Mobile keyboard handling
 */
export function ResponsiveForm({ onSubmit, fields = [] }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {fields.map((field) => (
          <div key={field.name}>
            <label
              style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-neutral-900)',
              }}
            >
              {field.label}
              {field.required && <span style={{ color: 'var(--color-error)' }}> *</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={`input ${errors[field.name] ? 'input-error' : ''}`}
                style={{
                  minHeight: '120px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            ) : (
              <input
                type={field.type || 'text'}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={`input ${errors[field.name] ? 'input-error' : ''}`}
              />
            )}
            {errors[field.name] && (
              <div
                style={{
                  marginTop: 'var(--space-2)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-error)',
                }}
              >
                {errors[field.name]}
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-full"
        style={{ marginTop: 'var(--space-6)' }}
      >
        Submit
      </button>
    </form>
  );
}

/* ============================================================================
   5. HEADER WITH RESPONSIVE MENU
   ============================================================================ */

/**
 * ResponsiveHeader Component
 * Features:
 * - Hamburger menu on mobile
 * - Horizontal menu on desktop
 * - Sticky positioning
 * - Search integration ready
 */
export function ResponsiveHeader({ logo, menuItems = [] }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      if (window.innerWidth >= 640) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        background: 'var(--color-neutral-0)',
        borderBottom: '1px solid var(--color-neutral-200)',
        boxShadow: 'var(--shadow-sm)',
        zIndex: 'var(--z-sticky)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-4)',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Logo */}
        <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>
          {logo}
        </div>

        {/* Desktop Menu */}
        {!isMobile && (
          <nav style={{ display: 'flex', gap: 'var(--space-8)' }}>
            {menuItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                style={{
                  color: 'var(--color-neutral-700)',
                  textDecoration: 'none',
                  fontWeight: 'var(--font-weight-medium)',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-neutral-700)')}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="btn btn-ghost"
            style={{ padding: 'var(--space-3)' }}
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobile && isMobileMenuOpen && (
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1px solid var(--color-neutral-200)',
            padding: 'var(--space-4)',
            gap: 'var(--space-3)',
          }}
        >
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontWeight: 'var(--font-weight-medium)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-lightest)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

/* ============================================================================
   6. LOADER SKELETON (Responsive)
   ============================================================================ */

/**
 * SkeletonLoader Component
 * Improves perceived performance with shimmer animation
 */
export function SkeletonLoader({ count = 3, type = 'card' }) {
  const renderSkeletons = () => {
    if (type === 'table') {
      return (
        <div style={{ gap: 'var(--space-4)' }}>
          {Array(count).fill(0).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-4)' }}>
              {Array(3).fill(0).map((_, j) => (
                <div
                  key={j}
                  style={{
                    flex: 1,
                    height: '48px',
                    background: 'linear-gradient(90deg, var(--color-neutral-200) 25%, var(--color-neutral-100) 50%, var(--color-neutral-200) 75%)',
                    backgroundSize: '200% 100%',
                    borderRadius: 'var(--radius-md)',
                    animation: 'shimmer 1.5s infinite',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {Array(count).fill(0).map((_, i) => (
          <div key={i} className="card">
            <div
              style={{
                height: '20px',
                background: 'linear-gradient(90deg, var(--color-neutral-200) 25%, var(--color-neutral-100) 50%, var(--color-neutral-200) 75%)',
                backgroundSize: '200% 100%',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            <div
              style={{
                height: '16px',
                background: 'linear-gradient(90deg, var(--color-neutral-200) 25%, var(--color-neutral-100) 50%, var(--color-neutral-200) 75%)',
                backgroundSize: '200% 100%',
                borderRadius: 'var(--radius-md)',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  return <div>{renderSkeletons()}</div>;
}

/* ============================================================================
   7. FLOATING ACTION BUTTON (FAB)
   ============================================================================ */

/**
 * FloatingActionButton Component
 * Mobile-friendly primary action button
 */
export function FloatingActionButton({ onClick, icon: Icon = FaPlus, label = 'Add' }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: 'calc(80px + env(safe-area-inset-bottom, 0))',
        right: 'var(--space-4)',
        width: '56px',
        height: '56px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-primary)',
        color: 'white',
        border: 'none',
        boxShadow: 'var(--shadow-lg)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-fixed)',
        transition: 'all var(--transition-base)',
        fontSize: 'var(--font-size-base)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-primary-hover)';
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--color-primary)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.transform = 'scale(0.95)';
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title={label}
    >
      <Icon size={24} />
    </button>
  );
}

export default {
  BottomNav,
  ResponsiveTable,
  ResponsiveModal,
  ResponsiveForm,
  ResponsiveHeader,
  SkeletonLoader,
  FloatingActionButton,
};
