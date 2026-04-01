# KLPro Pvt Ltd - Design System & Color Palette

## 🎨 Official Color Palette

### Primary Colors

```
Primary Purple (Main Brand Color)
  Hex: #7b2cbf
  RGB: (123, 44, 191)
  Usage: Primary buttons, links, active states, main headings

Secondary Pink/Red (Accent Color)
  Hex: #ff006e
  RGB: (255, 0, 110)
  Usage: Call-to-action buttons, highlights, hover states

Tertiary Orange (Secondary Accent)
  Hex: #fb5607
  RGB: (251, 86, 7)
  Usage: Promotional elements, special offers, tertiary actions
```

### Accent Colors

```
Gold/Yellow (Highlight/Badge)
  Hex: #ffbe0b
  RGB: (255, 190, 11)
  Usage: "SPECIAL", "HOT", "NEW" badges, special highlights

Success Green
  Hex: #28a745
  RGB: (40, 167, 69)
  Usage: "Instant" availability badges, success states
```

### Neutral Colors

```
Light Gray Background
  Hex: #f8f9fa
  RGB: (248, 249, 250)
  Usage: Section backgrounds, secondary areas

Text Dark
  Hex: #2c3e50
  RGB: (44, 62, 80)
  Usage: Main text, headings

Text Light Gray
  Hex: #666666
  RGB: (102, 102, 102)
  Usage: Secondary text, descriptions

Border Gray
  Hex: #e9ecef
  RGB: (233, 236, 239)
  Usage: Border lines, dividers
```

---

## 🎯 Gradient Combinations

### Primary Gradient (Hero Sections, Main Actions)

```css
background: linear-gradient(135deg, #7b2cbf 0%, #ff006e 100%);
```

Purple → Pink gradient at 135° angle

### Secondary Gradient (Stats, Major Sections)

```css
background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
```

Light Purple → Dark Purple gradient at 90° angle

### Tertiary Gradient (CTAs, Promotions)

```css
background: linear-gradient(135deg, #ff006e, #fb5607);
```

Pink → Orange gradient at 135° angle

---

## 📐 Typography Scale

### Heading Sizes

```
h1: 2.5em (40px)    - Page titles
h2: 2em (32px)      - Section headings
h3: 1.5em (24px)    - Subsection headings
h4: 1.25em (20px)   - Card titles
p:  1em (16px)      - Body text
small: 0.85em (13px) - Fine print
```

### Font Weights

- Regular: 400 - Body text
- Medium: 600 - UI elements, buttons
- Bold: 700 - Headings, emphatic text

---

## 🎯 Component Styles

### Button Styles

**Primary Button (Main CTA)**

```css
Background: linear-gradient(135deg, #7b2cbf, #ff006e)
Color: white
Padding: 12px 30px
Border-radius: 8px
Font-weight: 600
Hover: Transform scale(1.05), shadow added
```

**Secondary Button (Alternative)**

```css
Background: white
Color: #7b2cbf
Border: 2px solid #7b2cbf
Padding: 12px 30px
Border-radius: 8px
Hover: Background becomes #7b2cbf, color becomes white
```

**Badge Styles**

```css
SPECIAL Badge: Gold background (#ffbe0b), dark text
HOT Badge: Pink background (#ff006e), white text
NEW Badge: Gold background (#ffbe0b), dark text
Instant Badge: Green background (#28a745), white text
```

---

## 🌟 Component Specifications

### Hero Section

- **Height**: 80px padding top/bottom
- **Gradient**: Primary (purple to pink)
- **Background Effects**: Circular blur elements (opacity 0.1)
- **Text Color**: White
- **Search Bar**: White background, rounded, shadow on focus

### Service Cards

- **Dimensions**: Min 200px width, responsive
- **Border-radius**: 12px
- **Shadow**: 0 2px 8px on normal, 0 10px 25px on hover
- **Image Area**: 150px height with gradient
- **Hover Effect**: translateY(-8px)
- **Discount Badge**: Positioned top-right, pink background

### Buttons

- **Border-radius**: 8px for standard, 50px for pill-shaped
- **Padding**: 8-15px for various sizes
- **Transition**: 0.3s ease for all properties
- **Hover State**: Lift effect, shadow increase

### Cards

- **Border-radius**: 12-15px
- **Shadow**: Subtle (2px) normally, stronger on hover
- **Border**: 1px solid #e9ecef or transparent
- **Padding**: 15-30px depending on size

---

## 📱 Responsive Breakpoints

### Desktop (> 1200px)

- Full width layouts
- Multi-column grids
- Maximum content width: 1200px

### Tablet (768px - 1200px)

- Adjusted font sizes (-10-15%)
- Grid columns reduced
- Controlled spacing

### Mobile (< 768px)

- Single or 2-column layouts
- Reduced font sizes (-20%)
- Increased touch targets (40px min)
- Horizontal scrolling for carousels

### Small Mobile (< 480px)

- Full single column
- Minimal padding (15px)
- Adjusted margins
- Hamburger menu ready

---

## ✨ Animation Specifications

### Hover Animations

```css
Default: 0.3s ease transition
Transform: scale(1.05) on buttons
Transform: translateY(-5px or similar) on cards
```

### Transitions

```css
All properties: 0.3s ease (default)
Color changes: 0.3s ease
Transform: 0.3s ease
Opacity: 0.3s ease
```

### Animations

```css
Fade In: opacity 0→1, transform translateY(10px)→0
Slide In: opacity 0→1, transform translateX(-20px)→0
Duration: 0.3s ease-in
```

---

## 🎨 Shadow Depths

### Subtle Shadow (Cards, default)

```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
```

### Medium Shadow (Hover)

```css
box-shadow: 0 8px 20px rgba(123, 44, 191, 0.15);
```

### Deep Shadow (Active)

```css
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
```

---

## 📊 Spacing System

### Standard Spacing (8px base)

- xs: 4px (half unit)
- sm: 8px (1 unit)
- md: 16px (2 units)
- lg: 24px (3 units)
- xl: 32px (4 units)
- 2xl: 40px (5 units)
- 3xl: 48px (6 units)
- 4xl: 60px (7.5 units)
- 5xl: 80px (10 units)

### Common Usages

- Padding: 15px, 20px, 30px, 60px
- Margin: 15px, 20px, 30px, 40px, 50px, 60px
- Gap: 10px, 15px, 20px, 30px, 40px

---

## 🔍 Detail Specifications

### Border Styles

```css
Standard Border: 1px solid #e9ecef
Active Border: 2px solid #7b2cbf
Gradient Border: Linear gradient effect
```

### Opacity Levels

```css
Full: 1 (100%)
Hover: 0.95 (95%)
Disabled: 0.5 (50%)
Subtle: 0.1 (10%)
```

### Icon Usage

- Emoji for quick visual identification
- Sizing: 1.5em - 3em depending on context
- Color: Match text color unless specified

---

## 🎯 Brand Guidelines

### Logo Area

- Base size: 45px × 45px
- Minimum size: 35px × 35px
- Hover effect: scale(1.05)
- Clear space: 10px around logo

### Typography Hierarchy

1. Page Title (h1) - 40px, bold
2. Section Title (h2) - 32px, bold
3. Card Title (h3/h4) - 20-24px, bold
4. Body Text (p) - 16px, regular
5. Helper Text - 13-14px, light gray

### Color Combinations

```
Text Dark on Light: Full contrast ✅
Text Dark on Primary Gradient: White or Light (on gradient) ✅
Text Light Gray on Light: Reduced contrast, use for secondary ✅
White Text on Dark: Full contrast ✅
Primary Color as accent: Always use for action items ✅
```

---

## 🚀 Implementation Notes

1. **CSS Variables**: Always use CSS custom properties for colors
2. **Responsive**: Test at all breakpoints (480, 768, 1024, 1200+)
3. **Performance**: Minimize repaints with will-change sparingly
4. **Accessibility**: Ensure 4.5:1 contrast ratio for WCAG compliance
5. **Consistency**: Use defined colors, don't add new ones arbitrarily
6. **Gradients**: Use 135° (northeast) as default angle
7. **Transitions**: Always include for smooth UX
8. **Mobile First**: Design mobile first, then enhance for desktop

---

## License

KLPro Pvt Ltd Design System © 2024
