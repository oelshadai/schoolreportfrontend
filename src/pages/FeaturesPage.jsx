import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaGraduationCap,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaChalkboardTeacher,
  FaSchool,
  FaCheck,
  FaArrowRight,
  FaPlay,
  FaHome,
} from 'react-icons/fa'
import '../styles/professional-landing.css'

export default function FeaturesPage() {
  const [expandedFeature, setExpandedFeature] = useState(0)

  const features = [
    {
      title: 'Smart Report Generation',
      description: 'Automatically generate professional report cards in seconds',
      longDescription: 'Say goodbye to manual report card creation. Our intelligent system automatically calculates grades, generates customizable reports, and exports in multiple formats. Support for term-based, semester-based, and yearly progressions.',
      icon: <FaGraduationCap />,
      benefits: [
        'Auto-calculated grades',
        'Multi-format export (PDF, Excel)',
        'Customizable templates',
        'Bulk generation',
        'Email distribution',
        'Print-ready layouts'
      ],
      color: '#3ecf8e'
    },
    {
      title: 'Advanced Grade Management',
      description: 'Real-time grade tracking with powerful analytics',
      longDescription: 'Manage grades efficiently with our comprehensive grading system. Track scores across assessments, subjects, and terms with real-time analytics and performance insights.',
      icon: <FaChartLine />,
      benefits: [
        'Real-time grade entry',
        'Multiple grading scales',
        'Performance analytics',
        'Trend analysis',
        'Comparative reports',
        'Grade distribution'
      ],
      color: '#2dd4bf'
    },
    {
      title: 'Complete Class Management',
      description: 'Organize students, teachers, and subjects seamlessly',
      longDescription: 'Streamlined class management with support for multiple classes, subjects, and student groups. Easy enrollment, attendance tracking, and detailed progress monitoring.',
      icon: <FaUsers />,
      benefits: [
        'Multi-level organization',
        'Student enrollment',
        'Class scheduling',
        'Subject mapping',
        'Attendance tracking',
        'Progress monitoring'
      ],
      color: '#06d6a0'
    },
    {
      title: 'Virtual Classroom',
      description: 'Interactive online learning environment',
      longDescription: 'Engage students with an interactive virtual classroom. Create assignments, conduct quizzes, share announcements, and facilitate real-time collaboration.',
      icon: <FaChalkboardTeacher />,
      benefits: [
        'Assignment creation',
        'Quiz management',
        'Live announcements',
        'File sharing',
        'Student submissions',
        'Feedback system'
      ],
      color: '#4ecdc4'
    },
    {
      title: 'Enterprise Security',
      description: 'Military-grade security for student data protection',
      longDescription: 'Your data security is our top priority. End-to-end encryption, role-based access control, regular backups, and full compliance with international data protection standards.',
      icon: <FaShieldAlt />,
      benefits: [
        'End-to-end encryption',
        'Role-based access',
        'Regular backups',
        'Data compliance',
        'Audit logs',
        'Two-factor auth'
      ],
      color: '#f59e0b'
    },
    {
      title: 'Multi-Institution Support',
      description: 'Manage multiple schools from one platform',
      longDescription: 'Scale your operations with multi-tenant architecture. Each institution maintains complete data isolation while benefiting from centralized management and reporting.',
      icon: <FaSchool />,
      benefits: [
        'Multiple schools',
        'Data isolation',
        'Centralized control',
        'Consolidated reports',
        'Bulk operations',
        'Institution branding'
      ],
      color: '#8b5cf6'
    },
  ]

  return (
    <div className="professional-landing">
      {/* Elite Tech Navbar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 999,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 0',
        width: '100vw',
        margin: 0
      }}>
        <div style={{
          width: '100%',
          margin: 0,
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '1.25rem',
            color: '#1a202c'
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaHome size={18} color="white" />
            </div>
            <span>Elite Tech</span>
          </Link>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <Link to="/login" style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              textDecoration: 'none',
              background: 'transparent',
              color: '#3ecf8e',
              border: '2px solid #3ecf8e'
            }}>
              Sign In
            </Link>
            <Link to="/register-school" style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              textDecoration: 'none',
              background: '#3ecf8e',
              color: 'white',
              border: 'none'
            }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" style={{ paddingTop: '6rem' }}>
        <div className="section-container">
          <div className="section-header">
            <h1 className="hero-title">Powerful Features Built for Educators</h1>
            <p className="hero-subtitle">
              Everything you need to manage your school's academic operations efficiently and professionally
            </p>
          </div>
        </div>
      </section>

      {/* Features Detailed Section */}
      <section className="features-section" style={{ paddingBottom: '5rem' }}>
        <div className="section-container">
          <div className="detailed-features">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="detailed-feature-card"
                style={{ borderLeftColor: feature.color }}
              >
                <div className="feature-header" onClick={() => setExpandedFeature(expandedFeature === idx ? -1 : idx)}>
                  <div className="feature-header-left">
                    <div className="feature-icon-large" style={{ color: feature.color }}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                  <div className="expand-icon">
                    <FaArrowRight style={{ transform: expandedFeature === idx ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                  </div>
                </div>
                {expandedFeature === idx && (
                  <div className="feature-expanded">
                    <p className="expanded-description">{feature.longDescription}</p>
                    <div className="benefits-list">
                      {feature.benefits.map((benefit, i) => (
                        <div key={i} className="benefit-badge">
                          <FaCheck size={14} />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Why Choose SchoolReport?</h2>
            <p>Compare with traditional methods</p>
          </div>

          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>SchoolReport</th>
                  <th>Manual Process</th>
                  <th>Basic Software</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="feature-name">Report Generation</td>
                  <td className="check"><FaCheck color="#3ecf8e" /></td>
                  <td className="x">✗</td>
                  <td className="check"><FaCheck color="#3ecf8e" /></td>
                </tr>
                <tr>
                  <td className="feature-name">Time to Generate Reports</td>
                  <td className="time">Seconds</td>
                  <td className="time">Weeks</td>
                  <td className="time">Hours</td>
                </tr>
                <tr>
                  <td className="feature-name">Grade Analytics</td>
                  <td className="check"><FaCheck color="#3ecf8e" /></td>
                  <td className="x">✗</td>
                  <td className="x">✗</td>
                </tr>
                <tr>
                  <td className="feature-name">Virtual Classroom</td>
                  <td className="check"><FaCheck color="#3ecf8e" /></td>
                  <td className="x">✗</td>
                  <td className="x">✗</td>
                </tr>
                <tr>
                  <td className="feature-name">Security & Encryption</td>
                  <td className="check"><FaCheck color="#3ecf8e" /></td>
                  <td className="x">✗</td>
                  <td className="check"><FaCheck color="#3ecf8e" /></td>
                </tr>
                <tr>
                  <td className="feature-name">24/7 Support</td>
                  <td className="check"><FaCheck color="#3ecf8e" /></td>
                  <td className="x">✗</td>
                  <td className="x">✗</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Seamless Integrations</h2>
            <p>Connect with tools you already use</p>
          </div>

          <div className="integrations-grid">
            {[
              { name: 'Google Workspace', icon: '🔗' },
              { name: 'Microsoft 365', icon: '📊' },
              { name: 'Email Services', icon: '📧' },
              { name: 'Learning Platforms', icon: '🎓' },
              { name: 'Cloud Storage', icon: '☁️' },
              { name: 'Payment Systems', icon: '💳' },
            ].map((integration, idx) => (
              <div key={idx} className="integration-card">
                <div className="integration-icon">{integration.icon}</div>
                <h4>{integration.name}</h4>
                <p>Coming Soon</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <h2>Experience the Difference</h2>
          <p>Try all features free for 30 days. No credit card required.</p>
          <div className="cta-buttons">
            <Link to="/register-school" className="btn btn-primary btn-large">
              Start Free Trial
              <FaArrowRight />
            </Link>
            <a href="#" className="btn btn-secondary btn-large">
              Schedule Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>SchoolReport</h4>
              <p>Streamlining education management worldwide.</p>
            </div>
            <div className="footer-section">
              <h5>Product</h5>
              <ul>
                <li><Link to="/">Features</Link></li>
                <li><Link to="/">Pricing</Link></li>
                <li><Link to="/">Security</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h5>Company</h5>
              <ul>
                <li><Link to="/">About</Link></li>
                <li><Link to="/">Blog</Link></li>
                <li><Link to="/">Contact</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h5>Legal</h5>
              <ul>
                <li><Link to="/">Privacy</Link></li>
                <li><Link to="/">Terms</Link></li>
                <li><Link to="/">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 SchoolReport. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
