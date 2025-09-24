# BuildTalk Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from **Linear** and **Notion** for their clean, professional interfaces that balance utility with visual appeal. These platforms successfully serve technical communities while maintaining excellent usability.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light mode: 220 15% 15% (deep slate)
- Dark mode: 220 15% 85% (light slate)

**Background Colors:**
- Light mode: 0 0% 98% (warm white)
- Dark mode: 220 15% 8% (deep charcoal)

**Accent Colors:**
- Construction orange: 25 85% 55%
- Success green: 140 65% 45%
- Warning amber: 45 90% 50%

### B. Typography
**Primary Font:** Inter (Google Fonts)
- Headings: 600-700 weight
- Body text: 400-500 weight
- UI elements: 500 weight

**Sizes:**
- Hero/Page titles: text-3xl
- Section headers: text-xl
- Body text: text-base
- UI labels: text-sm

### C. Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, m-2
- Standard spacing: p-4, gap-4
- Section spacing: py-8, my-12
- Page margins: px-6 (mobile), px-16 (desktop)

### D. Component Library

**Navigation:**
- Clean header with logo, search, and profile
- Bottom tab navigation (mobile)
- Sidebar navigation (desktop)

**Discussion Threads:**
- Card-based layout with subtle borders
- Avatar + username + timestamp header
- Rich text content with media previews
- Action buttons (reply, upvote) with icons
- Nested reply indentation using left borders

**Forms:**
- Rounded input fields with subtle shadows
- Primary button: construction orange background
- Secondary buttons: outline style with theme colors
- File upload areas with drag-and-drop styling

**Feed Components:**
- Infinite scroll with skeleton loading states
- Category tags as rounded badges
- Upvote counters with heart/arrow icons
- Media attachments in responsive grids

**Modals & Overlays:**
- Backdrop blur effects
- Centered modals with rounded corners
- Sheet-style modals (mobile)

### E. Visual Treatments

**Professional Construction Theme:**
- Subtle grid patterns in backgrounds
- Blueprint-inspired dotted lines as dividers
- Tool icons for categories (hammer, wrench, etc.)
- Before/after photo layouts for project showcases

**Content Hierarchy:**
- Clear visual separation between thread levels
- Consistent spacing for readability
- Strategic use of background colors for grouping

### Images
**Hero Section:** Large construction site or workshop image with overlay text and call-to-action buttons (variant="outline" with blurred backgrounds)

**Category Icons:** Tool-based iconography throughout (use Heroicons construction/tool subset)

**User-Generated Content:** Responsive image grids for project photos, blueprint previews, and progress updates

**Profile Pictures:** Circular avatars with colored borders indicating user roles (orange for contractors, blue for homeowners, green for suppliers)

This design approach creates a professional, trustworthy platform that appeals to construction professionals while remaining accessible to DIY enthusiasts and homeowners.