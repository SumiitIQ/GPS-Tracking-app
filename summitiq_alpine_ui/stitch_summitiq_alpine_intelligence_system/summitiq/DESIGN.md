---
name: SummitIQ
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#44474a'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#75777a'
  outline-variant: '#c5c6ca'
  surface-tint: '#5d5e61'
  primary: '#000101'
  on-primary: '#ffffff'
  primary-container: '#1a1c1e'
  on-primary-container: '#838486'
  inverse-primary: '#c6c6c9'
  secondary: '#a33800'
  on-secondary: '#ffffff'
  secondary-container: '#cd4800'
  on-secondary-container: '#fffbff'
  tertiary: '#000200'
  on-tertiary: '#ffffff'
  tertiary-container: '#00220b'
  on-tertiary-container: '#009949'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e5'
  primary-fixed-dim: '#c6c6c9'
  on-primary-fixed: '#1a1c1e'
  on-primary-fixed-variant: '#454749'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb59a'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#802a00'
  tertiary-fixed: '#64ff92'
  tertiary-fixed-dim: '#30e375'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#005224'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  metric-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  metric-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 48px
---

## Brand & Style

The brand personality, "Alpine Intelligence," balances the raw, rugged nature of high-altitude exploration with the surgical precision of modern data science. The design system prioritizes clarity under duress, ensuring that critical route data is legible in bright sunlight or low-light mountain environments.

The visual style is **Minimalist-Technical**. It utilizes heavy whitespace to separate dense data points, high-contrast ratios for immediate recognition, and a utilitarian aesthetic that feels like a piece of high-end mountaineering equipment. The interface avoids decorative flourishes, relying instead on structural integrity, sharp geometry, and professional outdoor photography to evoke an aspirational yet grounded emotional response.

## Colors

The palette is rooted in the "Basalt" primary color (#1A1C1E), providing a deep, near-black foundation for high-contrast typography. "Stone" (#F2F4F7) and "Slate" (#E2E8F0) serve as secondary surface layers to differentiate content modules without adding visual noise.

"Summit Orange" (#FF5C00) is used exclusively for primary actions, emergency alerts, and critical route markers, ensuring high visibility against both map backgrounds and UI surfaces. "Alpine Green" (#00D166) indicates safety, completed milestones, and positive progress. Difficulty ratings follow a standard traffic-light system but utilize slightly desaturated tones to maintain the premium, professional feel of the app.

## Typography

This design system utilizes **Inter** for all primary communication due to its exceptional legibility and neutral, technical character. For all quantitative data—such as elevation gain, coordinates, and distance—**JetBrains Mono** is employed. Its monospaced, tabular numerals ensure that fluctuating metrics do not cause layout shifts and remain easy to scan during active movement.

Text styles follow a strict hierarchy. Display and Headline levels use tighter tracking and heavier weights to command attention, while labels for metadata use uppercase styling with increased letter spacing to create a technical, "instrumental" feel.

## Layout & Spacing

The layout philosophy is based on a **fixed-grid system** for tablet and desktop, and a **fluid-margin system** for mobile. A 4px baseline grid ensures vertical rhythm across all metric tiles and text blocks. 

On mobile devices, a 20px outer margin is maintained to keep touch targets away from screen edges, particularly important when wearing gloves. Content is organized into "Precision Tiles"—modular blocks that stack vertically on mobile and reflow into a 12-column grid on larger screens. Spacing between related data points is kept tight (8px), while sections are separated by generous whitespace (40px+) to maintain a high-end, editorial feel.

## Elevation & Depth

To maintain a "rugged" and "technical" feel, the design system avoids soft, diffused shadows. Depth is communicated through **Tonal Layering** and **Low-Contrast Outlines**.

1.  **Base Layer:** The map or primary photography serves as the floor.
2.  **Surface Level:** Content cards use the "Stone" (#F2F4F7) color with a subtle 1px border in "Slate" (#E2E8F0) to define edges.
3.  **Floating Level:** Draggable bottom sheets and active tooltips use a slightly more pronounced, crisp shadow (4px blur, 10% opacity) to indicate interactivity.
4.  **Glassmorphism:** Navigation bars and map controls use a heavy backdrop blur (20px) with 80% opacity "Basalt" or "Stone" backgrounds, allowing the terrain colors to bleed through while maintaining text legibility.

## Shapes

The shape language is **Soft (Level 1)**. This subtle rounding (0.25rem for standard elements) provides a precision-engineered look that feels more modern than sharp 90-degree angles but more technical and "instrument-like" than overly bubbly or rounded designs. 

Metric tiles and data containers use the standard 0.25rem radius. Larger containers, like the map view or photo galleries, use the `rounded-lg` (0.5rem) setting to gently frame the organic shapes of nature.

## Components

### Buttons & Inputs
Primary CTAs use the "Summit Orange" background with white text, utilizing bold weights. Secondary buttons are "Basalt" outlines. Input fields are rectangular with 1px Slate borders, turning Basalt on focus.

### Draggable Bottom Sheets
Used for route details. These feature a centered 32px drag handle at the top. The sheet should feel "heavy" and tactile, utilizing spring-based physics (low bounce, high tension) for transitions.

### Precision Metric Tiles
Small, modular containers for data (e.g., "Wind: 12km/h"). They feature a "Label-Caps" header in Slate and a "Metric-LG" value in Basalt. These tiles have a 1px border and no shadow.

### Terrain-Aware Map Cards
Cards that overlay the map should be semi-transparent with a backdrop-filter (blur). They use a high-contrast white or black text depending on the underlying terrain brightness, managed via a smart overlay tint.

### Difficulty Badges
Small, pill-shaped badges (radius: 100px) that use a low-opacity background of the difficulty color (Green, Amber, Red) with high-opacity text of the same hue for maximum readability and a premium look.