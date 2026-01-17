import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FaRocket,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaSchool,
  FaStar,
  FaQuoteLeft,
  FaArrowRight,
  FaCheck,
  FaTrophy,
  FaLightbulb,
  FaBolt,
  FaHome,
} from 'react-icons/fa'
import '../styles/professional-landing.css'

export default function ProfessionalLanding() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [visibleTestimonials, setVisibleTestimonials] = useState([0, 1, 2])

  // Features with icons
  const features = [
    {
      icon: <FaGraduationCap />,
      title: 'Smart Report Generation',
      description: 'Generate professional report cards in seconds. Customize templates, grading scales, and academic periods to match your institution\'s standards.',
      benefits: ['Automated calculations', 'Multi-format export', 'Customizable templates']
    },
    {
      icon: <FaChartLine />,
      title: 'Advanced Grade Management',
      description: 'Comprehensive grade tracking with real-time analytics. Monitor student performance across terms, subjects, and assessments effortlessly.',
      benefits: ['Real-time insights', 'Term-based tracking', 'Performance analytics']
    },
    {
      icon: <FaUsers />,
      title: 'Complete Class Management',
      description: 'Organize and manage students by classes, subjects, and academic terms. Detailed profiles and progress tracking in one unified platform.',
      benefits: ['Multi-level organization', 'Detailed profiles', 'Easy enrollment']
    },
    {
      icon: <FaChalkboardTeacher />,
      title: 'Virtual Classroom',
      description: 'Interactive online learning space with assignments, quizzes, announcements, and real-time collaboration tools for seamless teaching.',
      benefits: ['Live interactions', 'Assignment management', 'Student engagement']
    },
    {
      icon: <FaShieldAlt />,
      title: 'Enterprise Security',
      description: 'Military-grade encryption and role-based access control. Your student data is protected with the highest security standards.',
      benefits: ['End-to-end encryption', 'Access control', 'Data compliance']
    },
    {
      icon: <FaSchool />,
      title: 'Multi-Institutional Support',
      description: 'Manage multiple schools, campuses, and departments. Each institution maintains its own data with complete isolation and control.',
      benefits: ['Multi-tenant', 'Flexible structure', 'Centralized control']
    },
  ]

  // Testimonials
  const testimonials = [
    {
      name: 'Sarah Johnson',
      title: 'Principal, Greenwood Academy',
      content: 'This platform transformed how we manage academic records. Report card generation that used to take weeks now takes minutes. Highly recommended!',
      rating: 5,
      initials: 'SJ',
      color: '#3ecf8e'
    },
    {
      name: 'Michael Chen',
      title: 'Mathematics Teacher, Central Institute',
      content: 'The grade management system is intuitive and saves me hours of work. Students can track their progress in real-time, which motivates them tremendously.',
      rating: 5,
      initials: 'MC',
      color: '#2dd4bf'
    },
    {
      name: 'Emily Rodriguez',
      title: 'School Administrator, Vista High',
      content: 'The virtual classroom feature has been a game-changer for our institution. Teachers love it, students are more engaged, and parents appreciate the transparency.',
      rating: 5,
      initials: 'ER',
      color: '#06d6a0'
    },
  ]

  // Stats
  const stats = [
    { number: '50K+', label: 'Students Served' },
    { number: '2K+', label: 'Schools Using' },
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '24/7', label: 'Support' },
  ]

  return (
    <div className="professional-landing" style={{ paddingTop: 0, margin: 0 }}>
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
            <Link to="/student-login" style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              textDecoration: 'none',
              background: 'transparent',
              color: '#2dd4bf',
              border: '2px solid #2dd4bf'
            }}>
              Student Login
            </Link>
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
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <FaBolt size={14} /> Welcome to the Future of School Management
            </div>
            <h1 className="hero-title">
              Streamline Your School's Academic Operations
            </h1>
            <p className="hero-subtitle">
              All-in-one platform for report card generation, grade management, and virtual classrooms.
              Trusted by over 2,000 schools worldwide.
            </p>
            <div className="hero-buttons">
              <Link to="/register-school" className="btn btn-primary btn-large">
                Start Free Trial
                <FaArrowRight />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                Sign In to Dashboard
              </Link>
            </div>
            <div className="hero-stats">
              {stats.map((stat, idx) => (
                <div key={idx} className="stat-item">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-placeholder">
              <div className="floating-card card-1">
                <div className="card-icon">📊</div>
                <p>Real-time Analytics</p>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">✅</div>
                <p>Auto Report Generation</p>
              </div>
              <div className="floating-card card-3">
                <div className="card-icon">👥</div>
                <p>Class Management</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Powerful Features</h2>
            <p>Everything you need to manage your school's academic journey</p>
          </div>

          <div className="features-grid">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="feature-card"
                onMouseEnter={() => setActiveFeature(idx)}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-benefits">
                  {feature.benefits.map((benefit, i) => (
                    <div key={i} className="benefit-item">
                      <FaCheck size={12} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Simple setup, powerful results</p>
          </div>

          <div className="steps-grid">
            {[
              {
                number: '01',
                title: 'Sign Up',
                description: 'Create your school account in minutes. No credit card required.',
                icon: '🚀'
              },
              {
                number: '02',
                title: 'Setup Your Data',
                description: 'Import or add your classes, teachers, and students. We provide templates.',
                icon: '📝'
              },
              {
                number: '03',
                title: 'Configure Settings',
                description: 'Customize grading scales, report templates, and academic calendars.',
                icon: '⚙️'
              },
              {
                number: '04',
                title: 'Go Live',
                description: 'Start managing grades and generating reports with your team.',
                icon: '✨'
              },
            ].map((step, idx) => (
              <div key={idx} className="step-card">
                <div className="step-number">{step.number}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Trusted by Educators</h2>
            <p>See what school leaders say about SchoolReport</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-avatar" style={{ backgroundColor: testimonial.color }}>
                    {testimonial.initialvbnjmvs}
                  </div>
                  <div className="testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.title}</p>
                  </div>
                </div>
                <div className="testimonial-stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} size={14} />
                  ))}
                </div>
                <p className="testimonial-content">
                  <FaQuoteLeft size={16} className="quote-icon" />
                  {testimonial.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Simple, Transparent Pricing</h2>
            <p>Start free, upgrade as you grow</p>
          </div>

          <div className="pricing-grid">
            {[
              {
                name: 'Starter',
                price: 'Free',
                description: 'Perfect for small schools',
                features: ['Up to 100 students', 'Basic reporting', 'Email support', 'Single school']
              },
              {
                name: 'Professional',
                price: '$99',
                period: '/month',
                description: 'For growing institutions',
                features: ['Up to 1,000 students', 'Advanced analytics', 'Priority support', 'Multiple schools'],
                highlighted: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large organizations',
                features: ['Unlimited students', 'Custom features', '24/7 support', 'Dedicated account manager']
              },
            ].map((plan, idx) => (
              <div key={idx} className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}>
                {plan.highlighted && <div className="plan-badge">MOST POPULAR</div>}
                <h3>{plan.name}</h3>
                <div className="price">
                  {plan.price}
                  {plan.period && <span className="period">{plan.period}</span>}
                </div>
                <p className="plan-description">{plan.description}</p>
                <Link to="/register-school" className="btn btn-primary btn-block">
                  Get Started
                </Link>
                <div className="plan-features">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="feature-item">
                      <FaCheck size={14} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <h2>Ready to Transform Your School?</h2>
          <p>Join thousands of schools using SchoolReport to streamline their operations</p>
          <div className="cta-buttons">
            <Link to="/register-school" className="btn btn-primary btn-large">
              Start Your Free Trial
            </Link>
            <a href="#features" className="btn btn-secondary btn-large">
              Learn More
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
