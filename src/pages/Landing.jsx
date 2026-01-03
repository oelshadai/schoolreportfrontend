import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  FaRocket, FaCheckCircle, FaCloud, FaSchool, 
  FaChartLine, FaUsers, FaFileAlt, FaShieldAlt,
  FaArrowRight, FaStar, FaGraduationCap, FaChalkboardTeacher, 
  FaUserGraduate, FaBars, FaTimes, FaPlay, FaQuoteLeft
} from 'react-icons/fa'

export default function Landing() {
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
      description: 'Access your school data anywhere, anytime with our secure cloud infrastructure'
    },
    {
      icon: FaUsers,
      title: 'Multi-User Management',
      description: 'Seamlessly manage teachers, students, and administrators with role-based access'
    },
    {
      icon: FaChartLine,
      title: 'Advanced Analytics',
      description: 'Get insights into student performance with comprehensive reporting and analytics'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with data encryption and privacy compliance'
    }
  ]

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Principal, Greenwood Academy',
      content: 'This platform has revolutionized how we handle student reports. What used to take weeks now takes minutes.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'IT Director, Riverside School',
      content: 'The security and reliability of this system gives us complete peace of mind. Highly recommended.',
      rating: 5
    },
    {
      name: 'Emma Williams',
      role: 'Vice Principal, Oak Hill High',
      content: 'Our teachers love how easy it is to input grades and generate professional reports instantly.',
      rating: 5
    }
  ]

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 1000,
        padding: '0 20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaSchool size={20} color="white" />
            </div>
            <span style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1f2937'
            }}>
              EduReport
            </span>
          </div>

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              <a href="#features" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>Features</a>
              <a href="#testimonials" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>Testimonials</a>
              <a href="#pricing" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>Pricing</a>
              <Link to="/login" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>Login</Link>
              <Link 
                to="/register-school" 
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}
              >
                Get Started
              </Link>
            </div>
          )}

          {isMobile && (
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#1f2937',
                fontSize: 24,
                cursor: 'pointer'
              }}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            borderBottom: '1px solid #e5e7eb',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <a href="#features" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>Features</a>
              <a href="#testimonials" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>Testimonials</a>
              <Link to="/login" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>Login</Link>
              <Link 
                to="/register-school" 
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: isMobile ? '100px 20px 60px' : '140px 20px 100px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#dbeafe',
            color: '#1d4ed8',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 32
          }}>
            <FaStar size={14} />
            Trusted by 500+ Schools Worldwide
          </div>
          
          <h1 style={{
            fontSize: isMobile ? 36 : 64,
            fontWeight: 800,
            lineHeight: 1.1,
            color: '#1f2937',
            margin: '0 0 24px',
            letterSpacing: '-0.02em'
          }}>
            Modern School
            <span style={{ color: '#3b82f6' }}> Report Cards</span>
            <br />Made Simple
          </h1>
          
          <p style={{
            fontSize: isMobile ? 18 : 22,
            color: '#6b7280',
            lineHeight: 1.6,
            margin: '0 0 48px',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Generate professional report cards in minutes, not hours. 
            Streamline your school's academic reporting with our intuitive platform.
          </p>
          
          <div style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            maxWidth: isMobile ? '300px' : 'none',
            margin: '0 auto'
          }}>
            <Link 
              to="/register-school" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 18,
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center'
              }}
            >
              <FaRocket size={18} />
              Start Free Trial
            </Link>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'white',
              color: '#374151',
              padding: '16px 32px',
              borderRadius: 12,
              border: '2px solid #e5e7eb',
              fontWeight: 600,
              fontSize: 18,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center'
            }}>
              <FaPlay size={16} />
              Watch Demo
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 32,
            marginTop: 64,
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1f2937' }}>500+</div>
              <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>Schools</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1f2937' }}>125K+</div>
              <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>Students</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1f2937' }}>2.5M+</div>
              <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>Reports Generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: isMobile ? '60px 20px' : '100px 20px',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{
              fontSize: isMobile ? 32 : 48,
              fontWeight: 800,
              color: '#1f2937',
              margin: '0 0 16px',
              letterSpacing: '-0.02em'
            }}>
              Everything you need to succeed
            </h2>
            <p style={{
              fontSize: 20,
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Comprehensive tools designed specifically for modern educational institutions
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 40
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{
                background: '#f8fafc',
                padding: 40,
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 24
                }}>
                  <feature.icon size={28} color="white" />
                </div>
                <h3 style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1f2937',
                  margin: '0 0 12px'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: 16,
                  color: '#6b7280',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" style={{
        padding: isMobile ? '60px 20px' : '100px 20px',
        background: '#f8fafc'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{
              fontSize: isMobile ? 32 : 48,
              fontWeight: 800,
              color: '#1f2937',
              margin: '0 0 16px',
              letterSpacing: '-0.02em'
            }}>
              Loved by educators worldwide
            </h2>
            <p style={{
              fontSize: 20,
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              See what school administrators and teachers are saying about our platform
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 32
          }}>
            {testimonials.map((testimonial, index) => (
              <div key={index} style={{
                background: 'white',
                padding: 32,
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginBottom: 16
                }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} size={16} color="#fbbf24" />
                  ))}
                </div>
                <FaQuoteLeft size={24} color="#e5e7eb" style={{ marginBottom: 16 }} />
                <p style={{
                  fontSize: 16,
                  color: '#374151',
                  lineHeight: 1.6,
                  margin: '0 0 24px',
                  fontStyle: 'italic'
                }}>
                  "{testimonial.content}"
                </p>
                <div>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1f2937',
                    marginBottom: 4
                  }}>
                    {testimonial.name}
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: '#6b7280'
                  }}>
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: isMobile ? '60px 20px' : '100px 20px',
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? 32 : 48,
            fontWeight: 800,
            margin: '0 0 24px',
            letterSpacing: '-0.02em'
          }}>
            Ready to transform your school?
          </h2>
          <p style={{
            fontSize: 20,
            opacity: 0.9,
            margin: '0 0 48px',
            lineHeight: 1.6
          }}>
            Join hundreds of schools already using our platform to streamline 
            their academic reporting and improve student outcomes.
          </p>
          <div style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            maxWidth: isMobile ? '300px' : 'none',
            margin: '0 auto'
          }}>
            <Link 
              to="/register-school" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'white',
                color: '#3b82f6',
                padding: '16px 32px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 18,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center'
              }}
            >
              <FaRocket size={18} />
              Start Free Trial
            </Link>
            <Link 
              to="/login" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: 12,
                border: '2px solid rgba(255, 255, 255, 0.2)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 18,
                transition: 'all 0.3s ease',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center'
              }}
            >
              <FaChalkboardTeacher size={18} />
              Staff Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: isMobile ? '40px 20px' : '60px 20px',
        background: '#1f2937',
        color: '#9ca3af'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: 40,
            marginBottom: 40
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaSchool size={16} color="white" />
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>EduReport</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Modern school report card generation made simple and professional.
              </p>
            </div>
            
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 16 }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#features" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Features</a>
                <a href="#pricing" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Pricing</a>
                <Link to="/register-school" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Get Started</Link>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 16 }}>Access</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Staff Login</Link>
                <Link to="/student-login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Student Portal</Link>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 16 }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Help Center</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Contact Us</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Privacy Policy</a>
              </div>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: 32,
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: 14 }}>
              © {new Date().getFullYear()} EduReport. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}