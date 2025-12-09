# Design Guidelines: VPN/V2Ray Support Platform

## Design Approach: Material Design 3
**Rationale**: Material Design 3 provides excellent support for information-dense content, strong accessibility, RTL language support (Persian), and professional admin interfaces. Its elevation system and clear component patterns create trustworthy, functional experiences.

## Core Design Elements

### Typography
**Font Family**: Inter (Google Fonts)
- **Headings**: Inter 600-700 (semi-bold to bold)
  - H1: 2.5rem (40px) desktop / 2rem mobile
  - H2: 2rem (32px) desktop / 1.75rem mobile  
  - H3: 1.5rem (24px)
- **Body Text**: Inter 400 (regular), 16px line-height 1.6
- **UI Labels**: Inter 500 (medium), 14px
- **Code/Technical**: 'Fira Code' or monospace for code snippets

### Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- **Container**: max-w-7xl with px-4 md:px-8
- **Section Padding**: py-12 md:py-16
- **Card Padding**: p-6 md:p-8
- **Element Gaps**: gap-4 for tight grouping, gap-6 for cards, gap-8 for sections

### Component Library

**Navigation**
- **Top Navigation Bar**: Fixed header with logo, language toggle (EN/FA flags), theme toggle (sun/moon icon), subtle shadow
- **Admin Sidebar**: Collapsible sidebar (256px) with icon + label menu items, active state highlight

**Cards & Containers**
- **Announcement Cards**: Elevated cards (shadow-md) with date badge, title, preview text, "Read More" link
- **Platform Cards**: Grid layout with platform icon, name, app count indicator, subtle hover elevation
- **Tutorial Cards**: Includes thumbnail/icon, title, duration/type badge (text/video), description preview

**Forms & Inputs**
- **Admin Login**: Centered card (max-w-md) with input fields, password visibility toggle, prominent login button
- **Rich Text Editor**: Toolbar with formatting options, preview pane for tutorial creation
- **Input Fields**: Outlined style with floating labels, clear error states

**Data Display**
- **Application Lists**: Table or card grid showing app name, version, platform icon, download button
- **Notification Archive**: Timeline-style list with chronological ordering, expand/collapse for full content
- **Tutorial Browser**: Left sidebar categories, main content area with breadcrumb navigation

**Buttons & Actions**
- **Primary CTA**: Solid filled buttons with subtle shadow for downloads/submissions
- **Secondary**: Outlined buttons for cancel/back actions
- **Icon Buttons**: For theme toggle, language switch, admin actions
- **Download Buttons**: Include platform icon + "Download" text, prominent placement

**Overlays**
- **Modals**: For delete confirmations, quick previews (max-w-2xl, backdrop blur)
- **Toasts**: Top-right position for success/error notifications
- **Dropdowns**: For language selection, admin menu actions

**Special Components**
- **Video Embed**: Responsive YouTube embed with 16:9 aspect ratio, thumbnail preview
- **Code Blocks**: Syntax highlighting, copy button, proper monospace formatting
- **RTL Support**: Mirror layouts for Persian language, maintain logical flow

### Layout Structure

**Homepage**
- Hero section (h-auto, not forced viewport): Platform logo, tagline, language/theme toggles in header
- **Latest Announcements Section**: 2-column grid (1 column mobile) featuring the two most recent announcements with dates, titles, and summaries
- Platform quick links: 3-4 column grid with icon cards
- Featured tutorials: Horizontal scroll or grid of popular guides

**Platform Pages**
- Breadcrumb navigation
- Platform header with icon and description
- Applications grid: 2-3 columns showing each app with download links
- Related tutorials section below

**Tutorial Pages**
- Sidebar navigation (categories/related tutorials)
- Main content area with proper text hierarchy
- Video embeds with proper spacing (mb-8)
- Step-by-step sections with numbered indicators

**Admin Panel**
- Left sidebar navigation (always visible on desktop)
- Top bar with admin name, logout button
- Main content area: Dashboard widgets or CRUD interfaces
- Form layouts: Single column, generous spacing, clear submit/cancel actions

**Notifications Archive**
- Header with search/filter options
- Full-width list of all announcements (not cards - simpler list view)
- Pagination or infinite scroll for many items

### Images
- **Homepage Hero**: No large hero image - keep minimalistic with just logo and clean header
- **Platform Icons**: Use SVG icons from Heroicons for each platform (device-mobile, computer-desktop, etc.)
- **Tutorial Thumbnails**: Placeholder rectangles with aspect-ratio-video for video tutorials
- **Admin Panel**: No decorative images - focus on functionality

### Animations
**Minimal & Purposeful**:
- Card hover: subtle elevation change (transition-shadow duration-200)
- Modal entry: fade + slight scale (opacity-0 scale-95 to opacity-100 scale-100)
- Page transitions: Simple fade between views
- **No scroll-triggered animations** - prioritize content accessibility

### Accessibility
- WCAG 2.1 AA compliance minimum
- Keyboard navigation throughout (especially admin panel)
- Proper ARIA labels for icon buttons and toggles
- Focus indicators on all interactive elements
- RTL support with proper `dir` attribute switching