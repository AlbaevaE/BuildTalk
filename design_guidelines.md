# BuildTalk Design Guidelines

## Design Approach
**Hybrid Approach**: Minimal design system inspired by **Linear's** clean interface and **Notion's** content-first philosophy, optimized for calm, distraction-free discussions.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light mode: 210 8% 25% (muted slate)
- Dark mode: 210 8% 75% (soft gray)

**Background Colors:**
- Light mode: 210 8% 97% (soft white)
- Dark mode: 210 8% 12% (charcoal)

**Accent Colors:**
- Muted construction: 25 35% 50% (soft terracotta)
- Success: 140 25% 50% (calm green)
- Warning: 45 40% 55% (gentle amber)

### B. Typography
**Primary Font:** Inter (Google Fonts)
- Discussion titles: 500 weight, text-lg
- Body text: 400 weight, text-base
- Meta info: 400 weight, text-sm
- UI labels: 500 weight, text-sm

### C. Layout System
**Spacing Units:** Tailwind units of 2, 3, 4, 6, 8
- Component padding: p-3, p-4
- Content gaps: gap-3, gap-4
- Section spacing: py-6, py-8
- Container margins: px-4 (mobile), px-6 (desktop)

### D. Component Library

**Header:**
- Minimal sticky header with logo and user avatar only
- No hero section - direct focus on content
- Search integrated as subtle expandable field

**Discussion Feed:**
- Clean list layout with minimal card styling
- Subtle dividing lines instead of heavy borders
- Compact layout prioritizing readability
- Voting arrows positioned left of content
- Category tags as subtle text indicators

**Thread Layout:**
- Generous line spacing for comfortable reading
- Minimal reply indentation using thin left borders
- Subdued metadata (timestamps, usernames)
- Clean reply forms without visual noise

**Navigation:**
- Simplified sidebar with essential categories only
- Bottom tab navigation (mobile) with 4 key sections
- No decorative elements or heavy styling

**Forms:**
- Minimal input styling with subtle focus states
- Primary actions use muted construction color
- Clean, borderless textarea for discussions

### E. Visual Treatments

**Minimalist Construction Theme:**
- Remove blueprint patterns and decorative elements
- Use simple line dividers instead of themed separators
- Minimal iconography - prefer text labels
- Subdued tool icons only where functionally necessary

**Content Hierarchy:**
- Rely on typography scale and spacing for hierarchy
- Minimal use of background colors
- Clean whitespace-driven layout
- Consistent, calm visual rhythm

### Images
**No Hero Section:** Landing directly on discussion feed for immediate content access

**User Avatars:** Small, circular profile images with no decorative borders

**Content Images:** Simple, responsive embedding within discussions without fancy grid layouts

**Category Indicators:** Text-based categories instead of icon-heavy approach, with optional small icons for quick recognition

This refined approach creates a serene, focused environment that prioritizes content consumption and contribution while maintaining professional credibility through clean, purposeful design choices.