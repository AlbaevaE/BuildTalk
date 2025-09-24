# BuildTalk

## Overview

BuildTalk is a community platform inspired by Threads, focused exclusively on construction, furniture, and related services. The application serves as a social forum where construction professionals, homeowners, DIY enthusiasts, and service providers can start discussions, share experiences, ask for advice, and discover services. The platform features thread-based discussions with nested comments, user profiles with role-based badges, and category-based content organization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation using @hookform/resolvers
- **Theme System**: CSS variables-based theming with light/dark mode support

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Centralized schema definition in shared directory using Drizzle-Zod integration
- **API Pattern**: RESTful API with proper error handling and validation middleware
- **Development**: Hot module replacement with Vite integration for seamless development

### Data Model
- **Users**: Basic authentication with username/password, role-based profiles
- **Threads**: Discussion posts with title, content, category, author info, and upvote system
- **Comments**: Nested replies to threads with similar structure to threads
- **Categories**: Three main categories - construction, furniture, services
- **Roles**: Five user types - contractor, homeowner, supplier, architect, diy

### Design System
- **Color Palette**: Neutral base with construction orange accent, supporting light/dark themes
- **Typography**: Inter font family with consistent sizing scale
- **Components**: Modular component library with hover effects and elevation states
- **Layout**: Responsive design with sidebar navigation and card-based content layout
- **Spacing**: Consistent spacing units using Tailwind's spacing scale

### Authentication & Authorization
- Currently implements basic username/password authentication
- Role-based user identification with visual badges
- Session management prepared for future implementation

## External Dependencies

### Database & ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless database connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **drizzle-kit**: Database migration and schema management tools

### UI Components & Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives for dialogs, dropdowns, navigation, and form controls
- **tailwindcss**: Utility-first CSS framework for responsive design
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library for consistent iconography

### State Management & API
- **@tanstack/react-query**: Server state management with caching and synchronization
- **react-hook-form**: Form state management with validation
- **zod**: Schema validation for forms and API data

### Development Tools
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast bundling for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development environment integration

### Utilities
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class management
- **nanoid**: Unique ID generation
- **cmdk**: Command palette functionality

### Build & Development
- **vite**: Modern build tool with hot module replacement
- **@vitejs/plugin-react**: React integration for Vite
- **postcss & autoprefixer**: CSS processing pipeline