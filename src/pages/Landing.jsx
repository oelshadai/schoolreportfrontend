import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaRocket, FaChartLine, FaUsers, FaShieldAlt, FaGraduationCap, FaChalkboardTeacher, FaSchool, FaStar, FaQuoteLeft, FaArrowRight, FaCheck, FaPlay, FaGithub, FaTwitter, FaLinkedin, FaUserTie, FaUserGraduate, FaUser, FaMicrochip, FaTasks, FaClipboardList, FaClock, FaFileAlt } from 'react-icons/fa'

export default function Landing() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640)
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const userTypes = [
    {
      icon: <FaUserTie size={24} />,
      title: 'School Administrator',
      description: 'Manage school settings, teachers, classes, and generate comprehensive reports',
      link: '/login',
      color: '#3ecf8e'
    },
    {
      icon: <FaChalkboardTeacher size={24} />,
      title: 'Teacher',
      description: 'Create assignments, quizzes, projects and manage virtual classroom activities',
      link: '/login',
      color: '#2dd4bf'
    },
    {
      icon: <FaUserGraduate size={24} />,
      title: 'Student',
      description: 'Access assignments, submit work, take quizzes and view academic progress',
      link: '/student-login',
      color: '#06d6a0'
    },
    {
      icon: <FaUser size={24} />,
      title: 'Parent/Guardian',
      description: 'Monitor child\'s assignments, grades and academic performance',
      link: '/student-login',
      color: '#4ecdc4'
    }
  ]

  const features = [
    {
      icon: <FaGraduationCap size={20} />,
      title: 'Report Card Generation',
      description: 'Automatically generate professional report cards with customizable templates and grading systems.'
    },
    {
      icon: <FaChartLine size={20} />,
      title: 'Grade Management',
      description: 'Comprehensive grade tracking with term-based assessments and continuous evaluation support.'
    },
    {
      icon: <FaUsers size={20} />,
      title: 'Class & Student Management',
      description: 'Organize students by classes, subjects, and academic terms with detailed profile management.'
    },
    {
      icon: <FaShieldAlt size={20} />,
      title: 'Secure Data Storage',
      description: 'Protected student records and academic data with role-based access control and encryption.'
    },
    {
      icon: <FaChalkboardTeacher size={20} />,
      title: 'Virtual Classroom',
      description: 'Interactive online classroom with assignments, timed tasks, announcements, and real-time collaboration.'
    },
    {
      icon: <FaSchool size={20} />,
      title: 'Multi-Term Support',
      description: 'Handle multiple academic terms, semesters, and yearly progressions seamlessly.'
    }
  ]

  const testimonials = [
    {
      name: 'Mrs. Sarah Johnson',
      role: 'Principal, Greenwood High School',
      content: 'Report card generation used to take our teachers weeks. Now it\'s done in minutes with professional results every time.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Mr. Michael Chen',
      role: 'Mathematics Teacher, Central Academy',
      content: 'The grade management system is intuitive and saves me hours of work. My students love accessing their progress online.',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Ms. Emily Rodriguez',
      role: 'Academic Coordinator, Riverside School',
      content: 'Finally, a system that understands how schools actually work. Report generation has never been this easy.',
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
          padding: isMobile ? '12px 16px' : '16px 20px',
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
              <FaMicrochip size={16} color="white" />
            </div>
            <span style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'white'
            }}>Elite Tech</span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20
          }}>
            {!isMobile && (
              <>
                <Link 
                  to="/login" 
                  style={{
                    color: '#a1a1aa',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                    transition: 'color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <FaUserTie size={14} />
                  Staff Login
                </Link>
                <Link 
                  to="/student-login" 
                  style={{
                    color: '#a1a1aa',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                    transition: 'color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <FaUserGraduate size={14} />
                  Student Login
                </Link>
              </>
            )}
            <Link 
              to="/register-school" 
              style={{
                background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(62, 207, 142, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <FaSchool size={14} />
              Register Your School
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
            fontSize: isMobile ? 36 : isTablet ? 56 : 80,
            fontWeight: 700,
            margin: '0 0 24px',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Modern School Management
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #3ecf8e 0%, #2dd4bf 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>& Virtual Classroom</span>
          </h1>
          
          <p style={{
            fontSize: isMobile ? 16 : isTablet ? 18 : 20,
            color: '#a1a1aa',
            maxWidth: isMobile ? '100%' : '600px',
            margin: isMobile ? '0 auto 32px' : '0 auto 48px',
            lineHeight: 1.6,
            fontWeight: 400,
            padding: isMobile ? '0 16px' : 0
          }}>
            Complete school management platform with report card generation, virtual classroom, 
            assignments, grade tracking, and interactive learning tools.
          </p>
          
          <div style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            maxWidth: isMobile ? '400px' : 'none',
            margin: '0 auto 80px'
          }}>
            <Link 
              to="/register-school" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: 12,
                textDecoration: 'none',
                fontSize: 16,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(62, 207, 142, 0.4)'
              }}
            >
              <FaRocket size={18} />
              Register Now
            </Link>
            <a 
              href="#login-options" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'transparent',
                color: '#3ecf8e',
                padding: '16px 32px',
                borderRadius: 12,
                textDecoration: 'none',
                fontSize: 16,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                border: '2px solid #3ecf8e'
              }}
            >
              <FaPlay size={16} />
              Try Virtual Classroom
            </a>
          </div>
        </div>
      </section>

      {/* Login Options Section */}
      <section id="login-options" style={{
        padding: '80px 20px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{
              fontSize: isMobile ? 32 : 48,
              fontWeight: 700,
              margin: '0 0 16px',
              background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Choose Your Portal</h2>
            <p style={{
              fontSize: 18,
              color: '#a1a1aa',
              maxWidth: '600px',
              margin: '0 auto'
            }}>Access your personalized dashboard based on your role in the education system</p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: isMobile ? 16 : 24
          }}>
            {userTypes.map((user, index) => (
              <Link
                key={index}
                to={user.link}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid rgba(62, 207, 142, 0.2)`,
                  borderRadius: 16,
                  padding: isMobile ? 24 : 32,
                  textDecoration: 'none',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${user.color}, ${user.color}dd)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20
                }}>
                  {user.icon}
                </div>
                <h3 style={{
                  fontSize: isMobile ? 18 : 20,
                  fontWeight: 600,
                  margin: '0 0 12px',
                  color: user.color
                }}>{user.title}</h3>
                <p style={{
                  fontSize: 14,
                  color: '#a1a1aa',
                  margin: 0,
                  lineHeight: 1.5
                }}>{user.description}</p>
                <div style={{
                  marginTop: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: user.color,
                  fontSize: 14,
                  fontWeight: 500
                }}>
                  Login Now <FaArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Teacher & Student Workflow Section */}
      <section style={{
        padding: '80px 20px',
        background: 'rgba(62, 207, 142, 0.02)',
        borderTop: '1px solid rgba(62, 207, 142, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{
              fontSize: isMobile ? 32 : 48,
              fontWeight: 700,
              margin: '0 0 16px',
              background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Assignment Management Made Easy</h2>
            <p style={{
              fontSize: 18,
              color: '#a1a1aa',
              maxWidth: '600px',
              margin: '0 auto'
            }}>Streamlined workflow for teachers to create and students to complete assignments</p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr 1fr',
            gap: isMobile ? 24 : 40,
            alignItems: 'start'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(45, 212, 191, 0.2)',
              borderRadius: 16,
              padding: isMobile ? 20 : 32
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 24
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #2dd4bf, #06d6a0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaChalkboardTeacher size={20} color="white" />
                </div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 600,
                  margin: 0,
                  color: '#2dd4bf'
                }}>For Teachers</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'rgba(45, 212, 191, 0.1)',
                  borderRadius: 8
                }}>
                  <FaTasks size={16} color="#2dd4bf" />
                  <span style={{ color: '#e5e7eb', fontSize: 14 }}>Create assignments with multiple question types</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'rgba(45, 212, 191, 0.1)',
                  borderRadius: 8
                }}>
                  <FaClipboardList size={16} color="#2dd4bf" />
                  <span style={{ color: '#e5e7eb', fontSize: 14 }}>Design quizzes with auto-grading</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'rgba(45, 212, 191, 0.1)',
                  borderRadius: 8
                }}>
                  <FaFileAlt size={16} color="#2dd4bf" />
                  <span style={{ color: '#e5e7eb', fontSize: 14 }}>Assign projects with file uploads</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'rgba(45, 212, 191, 0.1)',
                  borderRadius: 8
                }}>
                  <FaClock size={16} color="#2dd4bf" />
                  <span style={{ color: '#e5e7eb', fontSize: 14 }}>Set deadlines and timed assessments</span>
                </div>
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(6, 214, 160, 0.2)',
              borderRadius: 16,
              padding: isMobile ? 20 : 32
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 24
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #06d6a0, #4ecdc4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaUserGraduate size={20} color="white" />
                </div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 600,
                  margin: 0,
                  color: '#06d6a0'
                }}>For Students</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'rgba(6, 214, 160, 0.1)',
                  borderRadius: 8
                }}>
                  <FaCheck size={16} color="#06d6a0" />
                  <span style={{ color: '#e5e7eb', fontSize: 14 }}>Access assignments from teacher portal</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'rgba(6, 214, 160, 0.1)',
                  borderRadius: 8
                }}>
                  <FaPlay size={16} color="#06d6a0" />
                  <span style={{ color: '#e5e7eb', fontSize: 14 }}>Take quizzes with instant feedback</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'rgba(6, 214, 160, 0.1)',
                  borderRadius: 8
                }}>
                  <FaRocket size={16} color="#06d6a0" />
                  <span style={{ color: '#e5e7eb', fontSize: 14 }}>Submit projects and track progress</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'rgba(6, 214, 160, 0.1)',
                  borderRadius: 8
                }}>
                  <FaChartLine size={16} color="#06d6a0" />
                  <span style={{ color: '#e5e7eb', fontSize: 14 }}>View grades and performance analytics</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? 16 : 24,
            marginTop: isMobile ? 40 : 60,
            padding: isMobile ? '20px' : '32px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: isMobile ? 24 : isTablet ? 32 : 36,
                fontWeight: 700,
                color: '#3ecf8e',
                marginBottom: 8
              }}>500+</div>
              <div style={{
                fontSize: isMobile ? 12 : 14,
                color: '#a1a1aa'
              }}>Assignments Created</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: isMobile ? 24 : isTablet ? 32 : 36,
                fontWeight: 700,
                color: '#2dd4bf',
                marginBottom: 8
              }}>1,200+</div>
              <div style={{
                fontSize: isMobile ? 12 : 14,
                color: '#a1a1aa'
              }}>Quizzes Completed</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: isMobile ? 24 : isTablet ? 32 : 36,
                fontWeight: 700,
                color: '#06d6a0',
                marginBottom: 8
              }}>95%</div>
              <div style={{
                fontSize: isMobile ? 12 : 14,
                color: '#a1a1aa'
              }}>Student Engagement</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: isMobile ? 24 : isTablet ? 32 : 36,
                fontWeight: 700,
                color: '#4ecdc4',
                marginBottom: 8
              }}>24/7</div>
              <div style={{
                fontSize: isMobile ? 12 : 14,
                color: '#a1a1aa'
              }}>Platform Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: isMobile ? '60px 16px' : '80px 20px',
        background: 'rgba(62, 207, 142, 0.02)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{
              fontSize: isMobile ? 28 : isTablet ? 36 : 48,
              fontWeight: 700,
              margin: '0 0 16px',
              background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Powerful Features</h2>
            <p style={{
              fontSize: 18,
              color: '#a1a1aa',
              maxWidth: '600px',
              margin: '0 auto'
            }}>Everything you need to manage your school reports efficiently</p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: isMobile ? 20 : 32
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                padding: isMobile ? 20 : 32,
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 600,
                  margin: '0 0 12px',
                  color: 'white'
                }}>{feature.title}</h3>
                <p style={{
                  fontSize: 14,
                  color: '#a1a1aa',
                  margin: 0,
                  lineHeight: 1.6
                }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" style={{
        padding: isMobile ? '60px 16px' : '80px 20px',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{
              fontSize: isMobile ? 28 : isTablet ? 36 : 48,
              fontWeight: 700,
              margin: '0 0 16px',
              background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Trusted by Educators</h2>
            <p style={{
              fontSize: 18,
              color: '#a1a1aa',
              maxWidth: '600px',
              margin: '0 auto'
            }}>See what education professionals are saying about our platform</p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: isMobile ? 20 : 32
          }}>
            {testimonials.map((testimonial, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                padding: isMobile ? 20 : 32,
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  color: 'rgba(62, 207, 142, 0.3)',
                  fontSize: 48
                }}>
                  <FaQuoteLeft />
                </div>
                <div style={{
                  display: 'flex',
                  gap: 4,
                  marginBottom: 16
                }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} size={16} color="#3ecf8e" />
                  ))}
                </div>
                <p style={{
                  fontSize: 16,
                  color: '#e5e5e5',
                  margin: '0 0 24px',
                  lineHeight: 1.6,
                  fontStyle: 'italic'
                }}>"{testimonial.content}"</p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'white'
                  }}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'white',
                      margin: '0 0 4px'
                    }}>{testimonial.name}</div>
                    <div style={{
                      fontSize: 14,
                      color: '#a1a1aa',
                      margin: 0
                    }}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, rgba(62, 207, 142, 0.1), rgba(45, 212, 191, 0.05))',
        borderTop: '1px solid rgba(62, 207, 142, 0.2)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? 32 : 48,
            fontWeight: 700,
            margin: '0 0 16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Ready to Transform Your School?</h2>
          <p style={{
            fontSize: 18,
            color: '#a1a1aa',
            margin: '0 0 40px',
            lineHeight: 1.6
          }}>Join thousands of educators who have already modernized their school management with our platform</p>
          <div style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center'
          }}>
            <Link 
              to="/register-school" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: 12,
                textDecoration: 'none',
                fontSize: 16,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(62, 207, 142, 0.4)'
              }}
            >
              <FaRocket size={18} />
              Register Now
            </Link>
            <a 
              href="#login-options" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'transparent',
                color: '#3ecf8e',
                padding: '16px 32px',
                borderRadius: 12,
                textDecoration: 'none',
                fontSize: 16,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                border: '2px solid #3ecf8e'
              }}
            >
              <FaUsers size={16} />
              Existing User? Login
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 20px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 20
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
              <FaMicrochip size={16} color="white" />
            </div>
            <span style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'white'
            }}>Elite Tech</span>
          </div>
          <p style={{
            color: '#a1a1aa',
            margin: '0 0 20px',
            fontSize: 14
          }}>Empowering education through elite technology solutions</p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 20,
            marginBottom: 20
          }}>
            <a href="#" style={{ color: '#a1a1aa', fontSize: 20, transition: 'color 0.2s' }}>
              <FaGithub />
            </a>
            <a href="#" style={{ color: '#a1a1aa', fontSize: 20, transition: 'color 0.2s' }}>
              <FaTwitter />
            </a>
            <a href="#" style={{ color: '#a1a1aa', fontSize: 20, transition: 'color 0.2s' }}>
              <FaLinkedin />
            </a>
          </div>
          <p style={{
            color: '#666',
            margin: 0,
            fontSize: 12
          }}>© 2024 Elite Tech. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}