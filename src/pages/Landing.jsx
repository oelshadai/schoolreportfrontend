import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  FaRocket, FaUserShield, FaCheckCircle, FaCloud, FaSchool, 
  FaChartLine, FaUsers, FaFileAlt, FaCog, FaShieldAlt,
  FaArrowRight, FaStar, FaGraduationCap, FaTrophy, FaAward,
  FaBookOpen, FaClipboardList, FaUserGraduate, FaChalkboardTeacher, FaBars, FaTimes
} from 'react-icons/fa'

export default function Landing() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const features = [
    {
      icon: FaCloud,
      title: 'Cloud-Based Platform',
      description: 'Access your school data anywhere, anytime with our secure cloud infrastructure',
      color: '#10b981'
    },
    {
      icon: FaUsers,
      title: 'Multi-User Management',
      description: 'Seamlessly manage teachers, students, and administrators with role-based access',
      color: '#3b82f6'
    },
    {
      icon: FaChartLine,
      title: 'Advanced Analytics',
      description: 'Get insights into student performance with comprehensive reporting and analytics',
      color: '#8b5cf6'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with data encryption and privacy compliance',
      color: '#f59e0b'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Create School Account',
      description: 'Set up your school profile and configure basic settings in minutes',
      color: '#10b981'
    },
    {
      number: '02', 
      title: 'Add Teachers & Students',
      description: 'Invite staff and upload student data via Excel or manual entry',
      color: '#3b82f6'
    },
    {
      number: '03',
      title: 'Enter Scores & Data',
      description: 'Teachers input assessments, attendance, and behavioral records',
      color: '#8b5cf6'
    },
    {
      number: '04',
      title: 'Generate Reports',
      description: 'Create beautiful, branded PDF report cards with one click',
      color: '#f59e0b'
    }
  ]

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', minHeight: '100vh' }}>

      {/* Hero Section */}
      <section style={{
        padding: isMobile ? '20px 0 30px' : '60px 0 80px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ maxWidth: '1280px', position: 'relative', zIndex: 1, margin: '0 auto', padding: '0 16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 20 : 60,
            alignItems: 'center'
          }}>
            <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                padding: isMobile ? '6px 12px' : '8px 16px',
                borderRadius: 20,
                fontSize: isMobile ? 10 : 12,
                fontWeight: 600,
                marginBottom: isMobile ? 12 : 16,
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <FaStar size={isMobile ? 12 : 14} />
                Modern School Management
              </div>
              
              <h1 style={{
                fontSize: isMobile ? (window.innerWidth < 400 ? 22 : 28) : 48,
                fontWeight: 800,
                lineHeight: 1.2,
                color: 'white',
                margin: isMobile ? '0 0 12px' : '0 0 24px',
                letterSpacing: '-0.02em'
              }}>
                Transform Your School's
                <span style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'block'
                }}>
                  Report Generation
                </span>
              </h1>
              
              <p style={{
                fontSize: isMobile ? (window.innerWidth < 400 ? 14 : 16) : 18,
                color: '#94a3b8',
                lineHeight: 1.6,
                margin: isMobile ? '0 0 20px' : '0 0 32px',
                maxWidth: '100%'
              }}>
                Streamline your academic reporting with our comprehensive SaaS platform. 
                Generate professional report cards, track student progress, and manage 
                school data with ease.
              </p>
              
              <div style={{
                display: 'flex',
                gap: isMobile ? 12 : 16,
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'stretch'
              }}>
                <Link 
                  to="/register-school" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    fontWeight: 700,
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  <FaRocket size={isMobile ? 14 : 16} />
                  Start Free Trial
                  <FaArrowRight size={12} />
                </Link>
                <Link 
                  to="/login" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#10b981',
                    fontWeight: 700,
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  <FaChalkboardTeacher size={isMobile ? 14 : 16} />
                  Staff Login
                </Link>
              </div>
            </div>
            
            <div style={{
              display: isMobile ? 'none' : 'flex',
              flexDirection: 'column',
              gap: 16
            }}>
              <Link 
                to="/student-portal" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  fontWeight: 700,
                }}
              >
                <FaUserGraduate size={20} />
                Student Portal
                <FaArrowRight size={16} />
              </Link>
              
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                padding: 24,
                borderRadius: 16,
                border: '1px solid rgba(71, 85, 105, 0.3)',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)'
              }}>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'white',
                  margin: '0 0 12px'
                }}>
                  Quick Access
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#94a3b8',
                    fontSize: 14
                  }}>
                    <FaCheckCircle size={14} style={{ color: '#10b981' }} />
                    Generate Reports Instantly
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#94a3b8',
                    fontSize: 14
                  }}>
                    <FaCheckCircle size={14} style={{ color: '#10b981' }} />
                    Track Student Progress
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#94a3b8',
                    fontSize: 14
                  }}>
                    <FaCheckCircle size={14} style={{ color: '#10b981' }} />
                    Secure Cloud Storage
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: isMobile ? '20px 0' : '30px 0', background: 'rgba(30, 41, 59, 0.5)' }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 40 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              padding: isMobile ? '6px 16px' : '8px 20px',
              borderRadius: 25,
              fontSize: isMobile ? 10 : 12,
              fontWeight: 700,
              marginBottom: 16,
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <FaTrophy size={isMobile ? 12 : 14} />
              Trusted by Schools Worldwide
            </div>
            <h2 style={{
              fontSize: isMobile ? (window.innerWidth < 400 ? 20 : 24) : 24,
              fontWeight: 900,
              color: 'white',
              margin: '0 0 8px',
              letterSpacing: '-0.02em'
            }}>
              Platform Statistics
            </h2>
            <p style={{
              fontSize: isMobile ? 14 : 12,
              color: '#94a3b8',
              maxWidth: '400px',
              margin: '0 auto',
              lineHeight: 1.5
            }}>
              Real numbers from schools using our platform every day
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: isMobile ? (window.innerWidth < 400 ? 12 : 16) : 12
          }}>
            {[
              { icon: FaSchool, number: '500+', label: 'Schools', color: '#10b981' },
              { icon: FaUserGraduate, number: '125K+', label: 'Students', color: '#3b82f6' },
              { icon: FaChalkboardTeacher, number: '8,500+', label: 'Teachers', color: '#8b5cf6' },
              { icon: FaFileAlt, number: '2.5M+', label: 'Reports', color: '#f59e0b' }
            ].map((stat, index) => (
              <div key={index} style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: isMobile ? (window.innerWidth < 400 ? 16 : 20) : 16,
                borderRadius: 12,
                textAlign: 'center',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: isMobile ? (window.innerWidth < 400 ? 32 : 40) : 36,
                  height: isMobile ? (window.innerWidth < 400 ? 32 : 40) : 36,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: `0 auto ${isMobile ? 10 : 12}px`,
                  boxShadow: `0 4px 16px ${stat.color}40`,
                  position: 'relative',
                  zIndex: 1
                }}>
                  <stat.icon size={isMobile ? (window.innerWidth < 400 ? 14 : 16) : 16} style={{ color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                </div>
                <div style={{
                  fontSize: isMobile ? (window.innerWidth < 400 ? 16 : 20) : 20,
                  fontWeight: 900,
                  color: 'white',
                  marginBottom: 4,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize: isMobile ? (window.innerWidth < 400 ? 10 : 12) : 12,
                  color: '#94a3b8',
                  fontWeight: 600,
                  letterSpacing: '0.025em'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: isMobile ? '20px 0' : '30px 0', background: 'rgba(15, 23, 42, 0.8)' }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 16 : 40 }}>
            <h2 style={{
              fontSize: isMobile ? 18 : 28,
              fontWeight: 800,
              color: 'white',
              margin: isMobile ? '0 0 8px' : '0 0 12px',
              letterSpacing: '-0.02em'
            }}>
              Everything you need to manage your school
            </h2>
            <p style={{
              fontSize: isMobile ? 13 : 14,
              color: '#94a3b8',
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: isMobile ? 1.4 : 1.5
            }}>
              Comprehensive tools designed specifically for modern educational institutions
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? 12 : 24
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{
                background: 'rgba(30, 41, 59, 0.8)',
                padding: isMobile ? 12 : 24,
                borderRadius: isMobile ? 8 : 16,
                border: '1px solid rgba(71, 85, 105, 0.3)',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: isMobile ? 32 : 48,
                  height: isMobile ? 32 : 48,
                  borderRadius: isMobile ? 8 : 12,
                  background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: isMobile ? 8 : 16,
                  boxShadow: `0 4px 16px ${feature.color}30`,
                  position: 'relative',
                  zIndex: 1
                }}>
                  <feature.icon size={isMobile ? 14 : 20} style={{ color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                </div>
                <h3 style={{
                  fontSize: isMobile ? 14 : 18,
                  fontWeight: 800,
                  color: 'white',
                  margin: isMobile ? '0 0 6px' : '0 0 8px'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: isMobile ? 12 : 14,
                  color: '#94a3b8',
                  lineHeight: isMobile ? 1.4 : 1.5,
                  margin: 0
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section style={{
        padding: isMobile ? '20px 0' : '30px 0',
        background: 'rgba(30, 41, 59, 0.5)'
      }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 16 : 40 }}>
            <h2 style={{
              fontSize: isMobile ? 18 : 28,
              fontWeight: 800,
              color: 'white',
              margin: isMobile ? '0 0 8px' : '0 0 12px',
              letterSpacing: '-0.02em'
            }}>
              Get started in 4 simple steps
            </h2>
            <p style={{
              fontSize: isMobile ? 13 : 14,
              color: '#94a3b8',
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: isMobile ? 1.4 : 1.5
            }}>
              From setup to report generation in minutes, not hours
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? 12 : 24
          }}>
            {steps.map((step, index) => (
              <div key={index} style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: isMobile ? 12 : 24,
                borderRadius: isMobile ? 8 : 12,
                border: '1px solid rgba(71, 85, 105, 0.3)',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}>
                <div style={{
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: `0 auto ${isMobile ? 8 : 16}px`,
                  color: 'white',
                  fontSize: isMobile ? 14 : 16,
                  fontWeight: 800,
                  boxShadow: `0 4px 16px ${step.color}40`
                }}>
                  {step.number}
                </div>
                <h3 style={{
                  fontSize: isMobile ? 13 : 16,
                  fontWeight: 700,
                  color: 'white',
                  margin: isMobile ? '0 0 6px' : '0 0 8px'
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: isMobile ? 11 : 12,
                  color: '#94a3b8',
                  lineHeight: isMobile ? 1.3 : 1.4,
                  margin: 0
                }}>
                  {step.description}
                </p>
                
                {index < steps.length - 1 && !isMobile && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: -12,
                    transform: 'translateY(-50%)',
                    color: '#475569'
                  }}>
                    <FaArrowRight size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: isMobile ? '40px 0' : '50px 0',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
          <h2 style={{
            fontSize: isMobile ? 28 : 30,
            fontWeight: 800,
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            Ready to transform your school's reporting?
          </h2>
          <p style={{
            fontSize: isMobile ? 16 : 14,
            opacity: 0.9,
            margin: '0 0 32px',
            lineHeight: 1.6,
            maxWidth: isMobile ? '100%' : '80%',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Join hundreds of schools already using our platform to streamline 
            their academic reporting and improve student outcomes.
          </p>
          <Link 
            to="/register-school" 
            style={{
              background: 'white',
              color: '#10b981',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: isMobile ? (window.innerWidth < 400 ? '16px 24px' : '18px 32px') : '12px 24px',
              borderRadius: isMobile ? '14px' : '12px',
              textDecoration: 'none',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease',
              fontSize: isMobile ? (window.innerWidth < 400 ? 16 : 18) : 16,
              minWidth: isMobile ? (window.innerWidth < 400 ? '200px' : '240px') : 'auto'
            }}
          >
            <FaRocket size={isMobile ? 14 : 16} />
            Start Your Free Trial
            <FaArrowRight size={12} />
          </Link>
        </div>
      </section>

      {/* Mobile Navigation Footer */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(15, 23, 42, 0.98)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(71, 85, 105, 0.3)',
          padding: window.innerWidth < 400 ? '8px 12px' : '10px 16px',
          zIndex: 50,
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: window.innerWidth < 400 ? 4 : 6,
            maxWidth: window.innerWidth < 400 ? '320px' : '380px',
            margin: '0 auto'
          }}>
            <Link 
              to="/student-login" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: window.innerWidth < 400 ? 2 : 3,
                padding: window.innerWidth < 400 ? '6px 2px' : '8px 4px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#10b981',
                fontSize: window.innerWidth < 400 ? '8px' : '9px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              <FaUserGraduate size={window.innerWidth < 400 ? 16 : 18} />
              <span>Student</span>
            </Link>
            <Link 
              to="/login" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: window.innerWidth < 400 ? 2 : 3,
                padding: window.innerWidth < 400 ? '6px 2px' : '8px 4px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#3b82f6',
                fontSize: window.innerWidth < 400 ? '8px' : '9px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              <FaChalkboardTeacher size={window.innerWidth < 400 ? 16 : 18} />
              <span>Staff</span>
            </Link>
            <Link 
              to="/register-school" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: window.innerWidth < 400 ? 2 : 3,
                padding: window.innerWidth < 400 ? '6px 2px' : '8px 4px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#8b5cf6',
                fontSize: window.innerWidth < 400 ? '8px' : '9px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              <FaRocket size={window.innerWidth < 400 ? 16 : 18} />
              <span>Start</span>
            </Link>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: window.innerWidth < 400 ? 2 : 3,
              padding: window.innerWidth < 400 ? '6px 2px' : '8px 4px',
              color: '#94a3b8',
              fontSize: window.innerWidth < 400 ? '8px' : '9px',
              fontWeight: '600'
            }}>
              <FaSchool size={window.innerWidth < 400 ? 16 : 18} />
              <span>Home</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        padding: isMobile ? '24px 0 80px' : '30px 0',
        background: '#0f172a',
        color: '#94a3b8',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? 8 : 12,
            marginBottom: isMobile ? 8 : 16,
            flexDirection: isMobile ? 'row' : 'row'
          }}>
            <div style={{
              width: isMobile ? (window.innerWidth < 400 ? 32 : 40) : 32,
              height: isMobile ? (window.innerWidth < 400 ? 32 : 40) : 32,
              borderRadius: isMobile ? (window.innerWidth < 400 ? 8 : 12) : 8,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FaSchool size={isMobile ? (window.innerWidth < 400 ? 14 : 18) : 16} />
            </div>
            <span style={{ fontSize: isMobile ? (window.innerWidth < 400 ? 16 : 20) : 18, fontWeight: 600, color: 'white' }}>
              School Report SaaS
            </span>
          </div>
          <p style={{ margin: 0, fontSize: isMobile ? (window.innerWidth < 400 ? 12 : 14) : 14 }}>
            © {new Date().getFullYear()} School Report SaaS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
