---
name: Finora Design System
colors:
  surface: '#faf8fe'
  surface-dim: '#dbd9de'
  surface-bright: '#faf8fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f8'
  surface-container: '#efedf2'
  surface-container-high: '#e9e7ed'
  surface-container-highest: '#e3e2e7'
  on-surface: '#1a1b1f'
  on-surface-variant: '#44464f'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f2f0f5'
  outline: '#757780'
  outline-variant: '#c5c6d1'
  surface-tint: '#465d94'
  primary: '#001540'
  on-primary: '#ffffff'
  primary-container: '#0f2a5f'
  on-primary-container: '#7d93ce'
  inverse-primary: '#b1c5ff'
  secondary: '#3755c3'
  on-secondary: '#ffffff'
  secondary-container: '#708cfd'
  on-secondary-container: '#00217a'
  tertiary: '#001d11'
  on-tertiary: '#ffffff'
  tertiary-container: '#003421'
  on-tertiary-container: '#00a975'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001946'
  on-primary-fixed-variant: '#2e457b'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c4ff'
  on-secondary-fixed: '#001453'
  on-secondary-fixed-variant: '#173bab'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1440px
  sidebar-width: 280px
  gutter: 24px
---

## Brand & Style
The brand personality is authoritative yet innovative, blending the reliability of traditional finance with the speed of AI-driven automation. The design style follows a **Modern Corporate** aesthetic—heavily inspired by the precision of Linear and the polished clarity of Stripe. 

The interface prioritizes information density and functional elegance. It utilizes a vast amount of whitespace, subtle micro-interactions, and a sophisticated layering system to ensure that complex financial data remains legible and actionable. The emotional response should be one of confidence, calm, and high-performance efficiency.

## Colors
The palette is rooted in a deep "Primary Navy" to establish institutional trust. "Secondary Blue" is reserved for interactive elements and primary actions, while "Accent Emerald" and "Teal" are used strategically for financial growth indicators, success states, and AI-powered insights.

The background uses a cool-toned slate gray to reduce eye strain during long sessions, while the surface remains pure white to create a clear "card-on-canvas" hierarchy. Status colors should follow standard financial conventions: Emerald for credit/paid, and a soft red (to be derived from the palette) for debit/overdue.

## Typography
The system uses **Plus Jakarta Sans** for headings to provide a modern, slightly rounded character that feels approachable. **Inter** is used for all body text, UI labels, and data entry to ensure maximum legibility and a neutral, systematic tone.

For the Arabic localization, **Cairo** should be swapped as the headline font and **IBM Plex Sans Arabic** as the body font to maintain the same weight and vertical rhythm as the English counterparts. All numerical data, especially in tables, should utilize tabular figures (monospace-width numbers) to ensure columns of currency align perfectly.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. The sidebar remains fixed at 280px, while the main content area occupies the remaining width up to a maximum of 1440px. A 12-column grid is used for dashboard layouts, while forms and document views (like invoices) use a centered, narrow container (800px) for readability.

**Bi-directional Support (LTR/RTL):** The layout engine must mirror the horizontal axis. In Arabic mode, the sidebar moves to the right, and the chevron icons, progress bars, and data-flow directions are flipped. Padding and margins use logical properties (e.g., `padding-inline-start` instead of `padding-left`).

## Elevation & Depth
Depth is achieved through **Tonal Layers** and extremely soft, ambient shadows. There are three primary levels:
1. **Level 0 (Canvas):** The `#F8FAFC` background.
2. **Level 1 (Surface):** White cards with a 1px `#E2E8F0` border. No shadow.
3. **Level 2 (Raised):** Used for active cards and hover states. Add a soft shadow: `0px 4px 12px rgba(15, 23, 42, 0.05)`.
4. **Level 3 (Overlay):** Modals and dropdowns. Use a more pronounced shadow: `0px 12px 32px rgba(15, 23, 42, 0.1)`.

AI-powered components should use a subtle glow effect (2px blur) using a low-opacity teal tint to differentiate "automated" insights from manual data entry.

## Shapes
The design system uses a consistent **12px (0.75rem)** radius for cards and major containers to balance professional structure with modern softness. Small components like buttons and input fields follow a **8px (0.5rem)** radius. Status badges and chips use a fully rounded/pill shape to distinguish them from interactive buttons.

## Components
### Standard UI
- **Buttons:** Primary buttons use `#1E40AF` with white text. Secondary buttons use a white fill with a `#E2E8F0` border.
- **Inputs:** Focus states must use a 2px ring of `#1E40AF` with a 20% opacity.
- **Tables:** Rows have a minimum height of 52px. Use subtle horizontal dividers only; avoid vertical borders. The header row should have a light gray background (`#F1F5F9`).

### Accounting-Specific
- **Stat Cards:** Must include a "Trend Indicator" (small sparkline or percentage change) in the top right corner.
- **Amount Display:** Primary currency values should use `semibold` weight. Decimals should be slightly reduced in opacity (70%) to emphasize the main figure.
- **Invoice Status Badges:** 
    - *Paid:* Emerald background (10% opacity) with Emerald text.
    - *Overdue:* Rose background (10% opacity) with Rose text.
    - *Draft:* Slate background (10% opacity) with Slate text.
- **AI Credits Progress:** A linear progress bar using a gradient from `#14B8A6` to `#10B981`, indicating the remaining automated processing capacity.
- **Language Switcher:** A ghost-style button in the header displaying the current locale with a globe icon.