# StudyBuddy

## Overview

StudyBuddy is a React single-page application built for Wilfrid Laurier University students to host and join public study sessions organized by course and building/floor location. The application provides a privacy-first approach by only sharing building and floor information without GPS tracking. Students can create study sessions for specific courses, filter sessions by location and course, and join existing sessions with capacity limits.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React 18 with TypeScript for type safety and modern component development
- Vite as the build tool for fast development and optimized production builds
- Wouter for client-side routing (lightweight React Router alternative)
- TanStack Query for state management and data fetching patterns

**UI & Styling:**
- Tailwind CSS for utility-first styling with custom design system
- Shadcn/ui component library built on Radix UI primitives
- Custom CSS variables for Wilfrid Laurier branding (purple #4F2683, gold #FFB81C)
- Responsive design with mobile-first approach using Tailwind breakpoints

**State Management:**
- Zustand for global state management (sessions, user state, modal preferences)
- Local storage integration for persisting user preferences and session data
- In-memory storage for demo data without backend persistence

**Component Architecture:**
- Modular component structure with reusable UI components
- Form handling with React Hook Form and Zod validation
- Modal system for reports and donations with proper state management
- Filter system with real-time session filtering capabilities

### Backend Architecture

**Server Setup:**
- Express.js server with TypeScript for API endpoints
- Development/production environment configuration
- Static file serving for production builds
- Error handling middleware with proper HTTP status codes

**Development Integration:**
- Vite middleware integration for hot module replacement
- Development-only middleware for error overlays and debugging
- Separate client and server build processes

**Data Layer:**
- In-memory storage implementation using Maps for demo purposes
- Storage interface abstraction for future database integration
- Drizzle ORM configuration for PostgreSQL (prepared for future use)

### Data Storage Solutions

**Current Implementation:**
- MemStorage class implementing IStorage interface for CRUD operations
- Session data stored in Zustand global state
- User preferences persisted in localStorage
- Demo data initialization with realistic session examples

**Database Preparation:**
- Drizzle ORM configured with PostgreSQL dialect
- Database schema defined in shared directory for type consistency
- Migration system ready for production database deployment
- Neon database serverless integration prepared

### Authentication and Authorization

**Current State:**
- Mock authentication system for demo purposes
- Simple toggle between signed-in/signed-out states
- User session stored in global state
- No actual authentication backend implemented

**Future Considerations:**
- Prepared for user table schema with username/password fields
- Session management structure ready for implementation
- Protected routes architecture can be easily added

### External Dependencies

**UI Component Libraries:**
- Radix UI primitives for accessible component foundation
- Lucide React for consistent iconography
- Date-fns for date manipulation and formatting
- Class Variance Authority for component variant management

**Development Tools:**
- ESBuild for server-side bundling
- PostCSS with Autoprefixer for CSS processing
- TypeScript for type checking across client/server
- Replit integration for development environment

**Database & ORM:**
- Drizzle ORM for type-safe database operations
- Drizzle Kit for schema management and migrations
- @neondatabase/serverless for PostgreSQL connection
- Drizzle-zod for runtime schema validation

**Routing & Navigation:**
- Wouter for lightweight client-side routing
- Path-based navigation with proper URL structure
- Route protection architecture ready for implementation

**Form Management:**
- React Hook Form for performant form handling
- Hookform resolvers for Zod integration
- Real-time validation with proper error messaging

The architecture prioritizes rapid development and easy deployment while maintaining clean separation of concerns and type safety throughout the application stack.