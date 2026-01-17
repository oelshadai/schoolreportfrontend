# 🎨 SchoolReport SaaS - Professional Design System

## Overview
This document outlines the professional design system used in the SchoolReport SaaS platform. It includes color palette, typography, spacing, components, and responsive design guidelines.

---

## 📐 Design Principles

1. **Minimalism** - Clean, uncluttered interfaces
2. **Consistency** - Unified look and feel across all pages
3. **Accessibility** - WCAG 2.1 AA standards
4. **Responsiveness** - Mobile-first approach
5. **Performance** - Smooth animations and transitions
6. **Trust** - Professional, enterprise-grade appearance

---

## 🎨 Color Palette

### Primary Colors
- **Primary Green**: `#3ecf8e`
  - Main action color
  - Buttons, links, highlights
  - Hover state: `#2db876`

- **Secondary Teal**: `#2dd4bf`
  - Accent color
  - Secondary actions
  - Gradients

- **Accent Green**: `#06d6a0`
  - Tertiary accent
  - Success states
  - Highlights

### Neutral Colors
- **Text Dark**: `#1a202c` - Primary text
- **Text Light**: `#718096` - Secondary text
- **Text Lighter**: `#a0aec0` - Tertiary text
- **Background Light**: `#f7fafc` - Light backgrounds
- **Background Lighter**: `#edf2f7` - Lighter backgrounds
- **Background White**: `#ffffff` - Primary background
- **Border**: `#e2e8f0` - Borders and dividers

### Status Colors
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Red)
- **Info**: `#3b82f6` (Blue)

---

## 📝 Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
             'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Font Sizes & Weights
- **Display**: 3.5rem / 800 weight (Hero titles)
- **Heading 1**: 2.5rem / 800 weight (Section titles)
- **Heading 2**: 1.75rem / 700 weight (Subsections)
- **Heading 3**: 1.3rem / 700 weight (Card titles)
- **Body Large**: 1.2rem / 400 weight (Subtitles)
- **Body**: 1rem / 400 weight (Default text)
- **Body Small**: 0.9rem / 400 weight (Labels)
- **Caption**: 0.75rem / 600 weight (Badges)

### Line Heights
- Headings: 1.2
- Body: 1.6
- UI Elements: 1.5

---

## 📏 Spacing System

Based on 4px baseline grid:

```
xs:  4px  (0.25rem)
sm:  8px  (0.5rem)
md:  12px (0.75rem)
lg:  16px (1rem)
xl:  24px (1.5rem)
2xl: 32px (2rem)
3xl: 48px (3rem)
4xl: 64px (4rem)
5xl: 80px (5rem)
```

### Common Spacing Combinations
- **Section padding**: 5rem top/bottom, 1.5rem left/right
- **Card padding**: 2rem
- **Button padding**: 0.875rem 1.5rem (regular), 1rem 2rem (large)
- **Gap in grids**: 2rem

---

## 🔘 Components

### Buttons

#### Primary Button
```css
background: #3ecf8e;
color: white;
padding: 0.875rem 1.5rem;
border-radius: 0.5rem;
font-weight: 600;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

**States:**
- Normal: `#3ecf8e`
- Hover: `#2db876` + shadow + translateY(-2px)
- Active: Scale 0.98
- Disabled: Opacity 0.5

#### Secondary Button
```css
background: transparent;
color: #3ecf8e;
border: 2px solid #3ecf8e;
padding: 0.875rem 1.5rem;
```

**Hover:**
- Background: `#3ecf8e`
- Color: white

### Cards

**Base Styles:**
- Background: white
- Border: 1px solid `#e2e8f0`
- Border Radius: 0.875rem
- Padding: 2rem
- Box Shadow: `0 10px 15px -3px rgba(0, 0, 0, 0.1)`

**Hover States:**
- Border Color: `#3ecf8e`
- Transform: translateY(-8px)
- Box Shadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1)`

### Forms

**Input Styling:**
- Border: 1px solid `#e2e8f0`
- Border Radius: 0.5rem
- Padding: 0.75rem 1rem
- Font Size: 1rem
- Focus Border: `#3ecf8e`
- Focus Shadow: `0 0 0 3px rgba(62, 207, 142, 0.1)`

---

## 📱 Responsive Breakpoints

### Mobile-First Approach
```css
/* Mobile (default) */
0px - 480px

/* Small Mobile */
@media (max-width: 480px)

/* Medium Mobile / Small Tablet */
@media (max-width: 640px)

/* Tablet */
@media (max-width: 768px)

/* Large Tablet / Small Desktop */
@media (max-width: 1024px)

/* Desktop */
@media (min-width: 1024px)

/* Large Desktop */
@media (min-width: 1280px)
```

### Responsive Grid Patterns

**Features Grid:**
```css
grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
gap: 2rem;
```

**Testimonials Grid:**
```css
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
gap: 2rem;
```

---

## ✨ Animations & Transitions

### Standard Transition
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Easing Functions
- **Smooth**: `cubic-bezier(0.4, 0, 0.2, 1)` - Default
- **Ease In**: `ease-in`
- **Ease Out**: `ease-out`
- **Spring**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`

### Common Animations
- **Hover Lift**: `transform: translateY(-2px)` or `translateY(-4px)`
- **Button Hover**: `transform: translateY(-2px)` + shadow increase
- **Card Hover**: `transform: translateY(-8px)` + border change
- **Float Animation**: Subtle up/down movement (3s loop)

---

## 🌊 Shadow System

```css
/* Small */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Medium */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Large */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

/* Extra Large */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

---

## 🎯 Component Hierarchy

### Landing Page Sections
1. **Navigation Bar** - Sticky header
2. **Hero Section** - Large headline with CTA
3. **Features Section** - 6-column grid of features
4. **How It Works** - 4-step process cards
5. **Testimonials** - 3-column review grid
6. **Pricing** - 3-column pricing cards
7. **CTA Section** - Large call-to-action
8. **Footer** - Multi-column footer with links

---

## 🎨 Gradient Usage

### Primary Gradient
```css
background: linear-gradient(135deg, #3ecf8e 0%, #2dd4bf 100%);
```

### Light Gradient (Backgrounds)
```css
background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
```

### Radial Accent
```css
background: radial-gradient(circle, rgba(62, 207, 142, 0.1) 0%, transparent 70%);
```

---

## ♿ Accessibility Standards

### Color Contrast
- Normal Text: Minimum 4.5:1 ratio
- Large Text: Minimum 3:1 ratio
- UI Components: Minimum 3:1 ratio

### Keyboard Navigation
- Tab order follows visual order
- Focus indicators visible
- All interactive elements keyboard accessible

### Screen Readers
- Semantic HTML used
- ARIA labels where needed
- Alt text for images
- Form labels associated with inputs

---

## 🚀 Component Usage Examples

### Button Component
```jsx
<Link to="/register-school" className="btn btn-primary btn-large">
  Start Free Trial
  <FaArrowRight />
</Link>
```

### Feature Card
```jsx
<div className="feature-card">
  <div className="feature-icon">{icon}</div>
  <h3>Feature Title</h3>
  <p>Feature description...</p>
  <div className="feature-benefits">
    {benefits.map(benefit => (
      <div key={benefit} className="benefit-item">
        <FaCheck size={12} />
        <span>{benefit}</span>
      </div>
    ))}
  </div>
</div>
```

### Testimonial Card
```jsx
<div className="testimonial-card">
  <div className="testimonial-header">
    <div className="testimonial-avatar">{initials}</div>
    <div className="testimonial-info">
      <h4>{name}</h4>
      <p>{title}</p>
    </div>
  </div>
  <div className="testimonial-stars">
    {[...Array(rating)].map((_, i) => (
      <FaStar key={i} size={14} />
    ))}
  </div>
  <p className="testimonial-content">{content}</p>
</div>
```

---

## 📋 File Structure

```
frontend/src/
├── components/
│   └── ProfessionalNavbar.jsx      # Navigation component
├── pages/
│   └── ProfessionalLanding.jsx     # Landing page
└── styles/
    ├── professional-navbar.css      # Navbar styles
    └── professional-landing.css     # Landing page styles
```

---

## 🔄 Updates & Maintenance

### CSS Variables
All colors and spacing use CSS variables for easy updates:
```css
:root {
  --primary-color: #3ecf8e;
  --primary-dark: #2db876;
  /* ... more variables */
}
```

To update colors globally, modify the `:root` variables.

---

## 📚 Resources

- **Figma**: [Design System Link]
- **Component Library**: Available in React components
- **Brand Guidelines**: See brand-guidelines.md

---

**Last Updated**: January 2026
**Version**: 1.0
**Maintained By**: Design Team
