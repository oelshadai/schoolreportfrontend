import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaRocket, FaChartLine, FaUsers, FaShieldAlt, FaGraduationCap, FaChalkboardTeacher, FaSchool, FaStar, FaQuoteLeft, FaArrowRight, FaCheck, FaPlay, FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa'

export default function Landing() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const features = [
    {
      icon: <FaGraduationCap size={20} />,
      title: 'Student Management',
      description: 'Comprehensive student profiles with academic history, attendance tracking, and performance analytics.'
    },
    {
      icon: <FaChartLine size={20} />,
      title: 'Advanced Analytics',
      description: 'Real-time insights into student performance, class trends, and institutional metrics.'
    },
    {
      icon: <FaUsers size={20} />,
      title: 'Multi-Role Access',
      description: 'Secure role-based access for administrators, teachers, students, and parents.'
    },
    {
      icon: <FaShieldAlt size={20} />,
      title: 'Data Security',
      description: 'Enterprise-grade security with encrypted data storage and secure authentication.'
    },
    {
      icon: <FaChalkboardTeacher size={20} />,
      title: 'Virtual Classroom',
      description: 'Interactive online learning environment with assignment management and grading tools.'
    },
    {
      icon: <FaSchool size={20} />,
      title: 'Multi-School Support',
      description: 'Manage multiple schools and campuses from a single, unified dashboard.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Principal, Greenwood High School',
      content: 'This platform has revolutionized how we manage student data and generate reports. The time savings are incredible.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'IT Director, Metro School District',
      content: 'The security features and ease of use make this the perfect solution for our district-wide implementation.',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Teacher, Riverside Elementary',
      content: 'Finally, a system that makes sense! Creating report cards is now a breeze instead of a headache.',
      rating: 5,
      avatar: 'ER'
    }
  ]

  return (
    <div style={{
      background: '#0a0a0a',
      color: 'white',
      minHeight: '100vh'
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaSchool size={16} color="white" />
            </div>
            <span style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'white'
            }}>EduReport</span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            {!isMobile && (
              <>
                <a href="#features" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Features</a>
                <a href="#testimonials" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Testimonials</a>
              </>
            )}
            <Link 
              to="/login" 
              style={{
                color: '#a1a1aa',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              Sign in
            </Link>
            <Link 
              to="/register-school" 
              style={{
                background: '#3ecf8e',
                color: '#0a0a0a',
                padding: '8px 16px',
                borderRadius: 6,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
            >
              Start project
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: isMobile ? '120px 20px 80px' : '160px 20px 120px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Grid Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)'
        }} />
        
        {/* Gradient Orbs */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(62, 207, 142, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          top: '40%',
          right: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(62, 207, 142, 0.1)',
            border: '1px solid rgba(62, 207, 142, 0.2)',
            borderRadius: 20,
            padding: '6px 16px',
            marginBottom: 32,
            fontSize: 13,
            fontWeight: 500,
            color: '#3ecf8e'
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#3ecf8e'
            }} />
            Now in public beta
          </div>

          <h1 style={{
            fontSize: isMobile ? 48 : 80,
            fontWeight: 700,
            margin: '0 0 24px',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Build the future of
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #3ecf8e 0%, #2dd4bf 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>education</span>
          </h1>
          
          <p style={{
            fontSize: isMobile ? 18 : 20,
            color: '#a1a1aa',
            maxWidth: '600px',
            margin: '0 auto 48px',
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            The open source school management platform. Create professional report cards, 
            track student progress, and streamline academic operations.
          </p>
          
          <div style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            maxWidth: isMobile ? '300px' : 'none',
            margin: '0 auto 64px'
          }}>
            <Link 
              to="/register-school" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#3ecf8e',
                color: '#0a0a0a',
                padding: '14px 24px',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 15,
                transition: 'all 0.2s ease',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center'
              }}
            >
              Start your project
              <FaArrowRight size={14} />
            </Link>
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                padding: '14px 24px',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <FaPlay size={12} />
              Watch demo
            </button>
          </div>

          {/* Dashboard Preview */}
          <div style={{
            position: 'relative',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: 24,
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16
              }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28ca42' }} />
              </div>
              <div style={{
                background: 'rgba(10, 10, 10, 0.8)',
                borderRadius: 8,
                padding: 20,
                textAlign: 'left'
              }}>
                <div style={{ fontSize: 14, color: '#3ecf8e', marginBottom: 8 }}>$ npm create edureport-app</div>
                <div style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 4 }}>✓ Creating new school project...</div>
                <div style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 4 }}>✓ Setting up database...</div>
                <div style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 4 }}>✓ Configuring authentication...</div>
                <div style={{ fontSize: 14, color: '#3ecf8e' }}>✓ Ready! Your school management system is live.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: isMobile ? '80px 20px' : '120px 20px',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{
              fontSize: isMobile ? 32 : 48,
              fontWeight: 700,
              color: 'white',
              margin: '0 0 16px',
              letterSpacing: '-0.02em'
            }}>
              Everything you need to manage your school
            </h2>
            <p style={{
              fontSize: 18,
              color: '#a1a1aa',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Powerful features designed specifically for educational institutions of all sizes
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 24
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: 24,
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(62, 207, 142, 0.2)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: 'rgba(62, 207, 142, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  color: '#3ecf8e'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'white',
                  margin: '0 0 8px'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: 14,
                  color: '#a1a1aa',
                  lineHeight: 1.5,
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
        padding: isMobile ? '80px 20px' : '120px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{
              fontSize: isMobile ? 32 : 48,
              fontWeight: 700,
              color: 'white',
              margin: '0 0 16px',
              letterSpacing: '-0.02em'
            }}>
              Loved by educators worldwide
            </h2>
            <p style={{
              fontSize: 18,
              color: '#a1a1aa',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              See what school administrators and teachers are saying about EduReport
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 24
          }}>
            {testimonials.map((testimonial, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: 24,
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginBottom: 16
                }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} size={14} color="#3ecf8e" />
                  ))}
                </div>
                <p style={{
                  fontSize: 15,
                  color: '#e4e4e7',
                  lineHeight: 1.6,
                  margin: '0 0 20px'
                }}>
                  "{testimonial.content}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0a0a0a'
                  }}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'white',
                      marginBottom: 2
                    }}>
                      {testimonial.name}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: '#a1a1aa'
                    }}>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: isMobile ? '80px 20px' : '120px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(62, 207, 142, 0.1) 0%, rgba(45, 212, 191, 0.1) 100%)'
        }} />
        
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <h2 style={{
            fontSize: isMobile ? 32 : 48,
            fontWeight: 700,
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
            color: 'white'
          }}>
            Start building today
          </h2>
          <p style={{
            fontSize: 18,
            color: '#a1a1aa',
            margin: '0 0 40px',
            lineHeight: 1.6
          }}>
            Join hundreds of schools already using EduReport to streamline 
            their academic operations and improve student outcomes.
          </p>
          <div style={{
            display: 'flex',
            gap: 12,
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
                gap: 8,
                background: '#3ecf8e',
                color: '#0a0a0a',
                padding: '16px 32px',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 16,
                transition: 'all 0.2s ease',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center'
              }}
            >
              Start your project
              <FaArrowRight size={14} />
            </Link>
            <Link 
              to="/login" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 16,
                transition: 'all 0.2s ease',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center'
              }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: isMobile ? '60px 20px 40px' : '80px 20px 40px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
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
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaSchool size={16} color="white" />
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>EduReport</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 20px', color: '#a1a1aa' }}>
                The open source school management platform built for the modern classroom.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <a href="#" style={{ color: '#a1a1aa', fontSize: 18 }}><FaGithub /></a>
                <a href="#" style={{ color: '#a1a1aa', fontSize: 18 }}><FaTwitter /></a>
                <a href="#" style={{ color: '#a1a1aa', fontSize: 18 }}><FaLinkedin /></a>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#features" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Features</a>
                <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Pricing</a>
                <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Changelog</a>
                <Link to="/register-school" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Get Started</Link>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Access</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/login" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Staff Login</Link>
                <Link to="/student-portal" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Student Portal</Link>
                <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>API Docs</a>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Documentation</a>
                <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Community</a>
                <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Contact</a>
                <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Privacy Policy</a>
              </div>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: 32,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 16
          }}>
            <p style={{ margin: 0, fontSize: 14, color: '#a1a1aa' }}>
              © {new Date().getFullYear()} EduReport. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: 24 }}>
              <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Terms</a>
              <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Privacy</a>
              <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 