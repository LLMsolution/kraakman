# Kraakman Automotive - Spacing System Guidelines

## Overview
This document defines the complete spacing system used across all Kraakman Automotive components. All spacing is based on a 4px unit system for consistency and maintainability.

## Base Units (4px increments)
- `--space-0`: 0px
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 20px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-10`: 40px
- `--space-12`: 48px
- `--space-16`: 64px
- `--space-20`: 80px
- `--space-24`: 96px

## Semantic Spacing Tokens

### Micro Spacing (for tight elements)
- `--spacing-micro`: 4px - Between tightly related elements
- `--spacing-tight`: 8px - Tight spacing
- `--spacing-snug`: 12px - Comfortable tight
- `--spacing-normal`: 16px - Default spacing
- `--spacing-relaxed`: 20px - Relaxed spacing
- `--spacing-loose`: 24px - Loose spacing
- `--spacing-spread`: 32px - Spread spacing

### Component Internal Spacing
- `--spacing-component-xs`: 8px - Tight component spacing
- `--spacing-component-sm`: 12px - Small component spacing
- `--spacing-component-md`: 16px - Regular component spacing
- `--spacing-component-lg`: 24px - Large component spacing
- `--spacing-component-xl`: 32px - Extra large component spacing
- `--spacing-component-2xl`: 48px - Huge component spacing

### Layout & Section Spacing
- `--spacing-section-xs`: 16px - Minimal section spacing
- `--spacing-section-sm`: 24px - Small section spacing
- `--spacing-section-md`: 32px - Medium section spacing
- `--spacing-section-lg`: 48px - Large section spacing
- `--spacing-section-xl`: 64px - Extra large section spacing
- `--spacing-section-2xl`: 80px - Huge section spacing
- `--spacing-section-3xl`: 96px - Hero section spacing

### Container & Layout Spacing
- `--spacing-container-xs`: 8px - Tiny container
- `--spacing-container-sm`: 16px - Small container
- `--spacing-container-md`: 24px - Medium container
- `--spacing-container-lg`: 32px - Large container
- `--spacing-container-xl`: 48px - Extra large container

## Component-Specific Spacing Rules

### Navigation & Header
- `--spacing-nav-padding`: 16px - Nav container padding
- `--spacing-nav-item-gap`: 24px - Gap between nav items
- `--spacing-nav-logo-margin`: 12px - Logo margin
- `--spacing-header-gap`: 32px - Header to content gap

### Hero Sections
- `--spacing-hero-padding`: 96px - Hero vertical padding
- `--spacing-hero-title-gap`: 16px - Hero title to subtitle
- `--spacing-hero-subtitle-gap`: 32px - Subtitle to content

### Card Components
- `--spacing-card-padding`: 24px - Card internal padding
- `--spacing-card-gap`: 24px - Gap between cards
- `--spacing-card-element-gap`: 16px - Gap between card elements
- `--spacing-card-header-gap`: 12px - Card header to content

### Button Spacing
- `--spacing-button-gap`: 16px - Gap between buttons
- `--spacing-button-padding`: 32px - Padding around button groups
- `--spacing-button-icon-gap`: 8px - Gap between button text and icon

### Form Elements
- `--spacing-form-gap`: 24px - Gap between form fields
- `--spacing-form-group-gap`: 32px - Gap between form groups
- `--spacing-form-padding`: 32px - Form container padding
- `--spacing-form-label-gap`: 8px - Label to field gap
- `--spacing-form-field-padding`: 12px - Form field internal padding

### Review System
- `--spacing-review-carousel-padding`: 32px - Carousel top padding
- `--spacing-review-carousel-gap`: 24px - Gap between reviews
- `--spacing-review-carousel-bottom`: 24px - Carousel bottom padding
- `--spacing-review-card-padding`: 24px - Review card padding
- `--spacing-review-element-gap`: 12px - Gap between review elements

### Contact & CTA Sections
- `--spacing-contact-padding`: 48px - Contact section padding
- `--spacing-contact-card-gap`: 24px - Gap between contact cards
- `--spacing-contact-card-padding`: 32px - Contact card padding
- `--spacing-cta-padding`: 64px - CTA section padding

### Content Sections
- `--spacing-content-header`: 16px - After headers
- `--spacing-content-paragraph`: 24px - After paragraphs
- `--spacing-content-element`: 16px - Between content elements
- `--spacing-content-list-gap`: 8px - List item gap
- `--spacing-content-block-gap`: 32px - Between content blocks

### Modal & Popup Spacing
- `--spacing-modal-padding`: 32px - Modal internal padding
- `--spacing-modal-gap`: 24px - Gap between modal elements
- `--spacing-modal-header-gap`: 16px - Modal header to content
- `--spacing-modal-close-offset`: 16px - Close button offset

### Footer
- `--spacing-footer-padding`: 48px - Footer padding
- `--spacing-footer-section-gap`: 32px - Gap between footer sections
- `--spacing-footer-item-gap`: 8px - Gap between footer items

### List & Grid Spacing
- `--spacing-list-gap`: 12px - Gap between list items
- `--spacing-grid-gap`: 24px - Gap between grid items
- `--spacing-carousel-gap`: 24px - Carousel item gap

### Special Elements
- `--spacing-star-gap`: 4px - Gap between stars
- `--spacing-icon-gap`: 8px - Gap between icon and text
- `--spacing-badge-gap`: 8px - Gap between badge and text
- `--spacing-separator-gap`: 32px - Gap around separators

## Usage Examples

### CSS Usage
```css
/* Instead of: padding: 24px; */
padding: var(--spacing-form-gap);

/* Instead of: gap: 16px; */
gap: var(--spacing-button-gap);

/* Instead of: margin-bottom: 32px; */
margin-bottom: var(--spacing-section-md);
```

### React/Inline Style Usage
```jsx
<div style={{
  padding: 'var(--spacing-modal-padding)',
  gap: 'var(--spacing-star-gap)',
  marginBottom: 'var(--spacing-form-gap)'
}}>
```

### Responsive Adjustments
The spacing system automatically adjusts for mobile and tablet devices:

**Mobile (≤640px):**
- Reduced nav padding: 12px
- Smaller hero padding: 64px
- Tighter card padding: 16px
- Smaller containers: 24px

**Tablet (641px-1024px):**
- Adjusted hero padding: 80px
- Medium card padding: 20px

## Implementation Status

✅ **Completed:**
- Comprehensive spacing system created
- InfiniteReviewCarousel updated
- Reviews page updated (buttons, sections, content blocks)
- ReviewPopup modal updated (modal padding, form gaps, star gaps)
- Spacing system imported into main CSS

🔄 **In Progress:**
- Contact page spacing
- Footer component spacing
- Navigation component spacing
- Hero sections spacing
- Card components spacing
- Form components spacing

## Benefits

1. **Consistency**: All spacing follows the same 4px base unit
2. **Maintainability**: Change spacing globally by updating variables
3. **Semantic**: Clear naming like `--spacing-form-gap` instead of arbitrary numbers
4. **Responsive**: Automatic adjustments for different screen sizes
5. **Scalable**: Easy to add new spacing tokens as needed
6. **Developer Experience**: Clear documentation and predictable patterns

## Migration Guide

When updating existing components:

1. **Identify current spacing values** (e.g., `p-6`, `mb-4`, `gap-2`)
2. **Convert to semantic tokens** (e.g., `--spacing-form-gap`, `--spacing-component-md`)
3. **Update CSS classes or inline styles**
4. **Test visual appearance**
5. **Ensure responsive behavior**

All new components should use the spacing system from the start to maintain consistency across the entire Kraakman Automotive website.