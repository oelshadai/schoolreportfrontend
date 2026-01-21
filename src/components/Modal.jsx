import React, { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { FaTimes } from 'react-icons/fa'

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
  maxHeight = '90vh'
}) => {
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)

  // Handle escape key
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape' && isOpen) {
      onClose()
    }
  }, [isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }, [closeOnBackdrop, onClose])

  // Focus management and body scroll lock
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement
      modalRef.current?.focus()
      document.addEventListener('keydown', handleEscape)
      
      // Lock body scroll
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = originalStyle
        previousFocusRef.current?.focus()
      }
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  const sizeClasses = {
    sm: { maxWidth: '400px', width: '90%' },
    md: { maxWidth: '600px', width: '90%' },
    lg: { maxWidth: '800px', width: '95%' },
    xl: { maxWidth: '1200px', width: '95%' },
    full: { maxWidth: 'none', width: '100%', height: '100%' }
  }

  const isMobile = window.innerWidth <= 768

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px)',
    padding: isMobile ? '0' : '16px',
    animation: 'fadeIn 0.2s ease-out'
  }

  const contentStyles = {
    ...sizeClasses[size],
    maxHeight: isMobile ? '95vh' : maxHeight,
    background: '#ffffff',
    borderRadius: isMobile ? '20px 20px 0 0' : '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: isMobile ? 'modalSlideUp 0.3s ease-out' : 'modalSlideIn 0.3s ease-out',
    outline: 'none',
    margin: isMobile ? '0' : 'auto'
  }

  // Mobile full-screen adjustments
  if (isMobile && size === 'full') {
    contentStyles.width = '100%'
    contentStyles.height = '100%'
    contentStyles.maxHeight = '100%'
    contentStyles.borderRadius = '0'
  }

  const modalContent = (
    <div
      style={overlayStyles}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        style={contentStyles}
        className={className}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid #e5e7eb',
            flexShrink: 0,
            background: '#ffffff',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            {title && (
              <h2 
                id="modal-title"
                style={{
                  margin: 0,
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  color: '#6b7280',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: isMobile ? '44px' : '36px',
                  minWidth: isMobile ? '44px' : '36px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e5e7eb'
                  e.target.style.color = '#374151'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f3f4f6'
                  e.target.style.color = '#6b7280'
                }}
                aria-label="Close modal"
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: (title || showCloseButton) ? '0' : '24px',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes modalSlideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        /* Prevent body scroll when modal is open */
        body.modal-open {
          overflow: hidden !important;
        }
      `}</style>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default Modal