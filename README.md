# Kraakman Auto Platform - Complete Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Development Setup](#development-setup)
3. [Technical Architecture](#technical-architecture)
4. [Database Structure](#database-structure)
5. [Authentication & Authorization](#authentication--authorization)
6. [File Structure & Components](#file-structure--components)
7. [Supabase Integration](#supabase-integration)
8. [Edge Functions](#edge-functions)
9. [Deployment](#deployment)
10. [Supabase MCP Integration](#supabase-mcp-integration)
11. [Future Development](#future-development)

---

## Project Overview

**Kraakman** is a full-stack automotive dealership platform built with React and Supabase. The application serves as both a public-facing car showroom and an administrative management system for vehicle inventory.

### Key Features
- **Public**: Browse vehicle inventory, filter/search cars, view detailed information, request test drives
- **Admin**: Complete CRUD operations for vehicles, image management, status tracking, user role management
- **Authentication**: Secure admin login with role-based access control
- **Media**: Image upload/management with Supabase Storage
- **Communication**: Automated email notifications via Edge Functions

---

## Development Setup

### Prerequisites
- Node.js (v18+) and npm
- Git
- Supabase CLI (optional, for local development)

### Installation & Development
```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd Kraakman

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run preview
```

### Environment Variables
The project uses Supabase configuration in `src/integrations/supabase/client.ts`:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_PUBLISHABLE_KEY`: Public API key for client-side access

---

## Technical Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/ui components
- **State Management**: React hooks + TanStack Query for server state
- **Routing**: React Router DOM
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Build Tool**: Vite with SWC

### Architecture Pattern
- **Client-First**: Direct database access from frontend via Supabase
- **Security**: Row Level Security (RLS) policies for data protection
- **Type Safety**: Auto-generated TypeScript types from Supabase schema
- **Component-Based**: Modular React components with clear separation of concerns

### Data Flow
```
User Interface → React Components → Supabase Client → RLS Policies → PostgreSQL Database
                                     ↓
                              Authentication Check → User Roles Table
                                     ↓
                              File Upload → Supabase Storage → Database References
```

---

## Database Structure

### Tables

#### `cars` (Main vehicle catalog)
**Purpose**: Central repository for all vehicle information
**Key Fields**:
- `id` (UUID, Primary Key, auto-generated)
- `merk` (TEXT) - Vehicle brand
- `model` (TEXT) - Vehicle model
- `type` (TEXT, nullable) - Vehicle type/submodel
- `bouwjaar` (INTEGER) - Manufacturing year
- `prijs` (NUMERIC) - Price in euros
- `status` (ENUM: 'aanbod'|'verkocht') - Vehicle status
- `kilometerstand` (INTEGER, nullable) - Mileage
- `transmissie`, `kleur`, `brandstof_type` (TEXT, nullable) - Basic specs
- `motor_cc`, `vermogen_pk`, `topsnelheid_kmh`, `acceleratie_0_100` (NUMERIC, nullable) - Performance specs
- `voertuig_type`, `zitplaatsen`, `deuren` (INTEGER/TEXT, nullable) - Physical specs
- `btw_auto` (BOOLEAN) - VAT applicability
- `omschrijving` (TEXT, nullable) - Description
- `opties` (TEXT[], nullable) - Options/features array
- `created_at`, `updated_at` (TIMESTAMP) - Timestamps

#### `car_images` (Vehicle images)
**Purpose**: Stores image URLs and display order for each vehicle
**Key Fields**:
- `id` (UUID, Primary Key, auto-generated)
- `car_id` (UUID, Foreign Key → cars.id)
- `url` (TEXT) - Image URL (from Supabase Storage)
- `display_order` (INTEGER) - Sort order for images
- `created_at` (TIMESTAMP)

#### `user_roles` (Role management)
**Purpose**: Maps Supabase auth users to application roles
**Key Fields**:
- `id` (UUID, Primary Key, auto-generated)
- `user_id` (UUID, Foreign Key → auth.users.id)
- `role` (ENUM: 'admin'|'user') - User role
- `created_at` (TIMESTAMP)

### Database Functions

#### `is_admin(user_id UUID) RETURNS BOOLEAN`
**Purpose**: Security function to check if user has admin privileges
**Implementation**: Queries `user_roles` table for admin role
**Security Level**: `SECURITY DEFINER` (runs with database owner privileges)

### Row Level Security (RLS) Policies

**Public Access**:
- Anyone can `SELECT` from cars and car_images (view inventory)
- No `INSERT/UPDATE/DELETE` permissions for public users

**Admin Access** (via `is_admin()` function):
- Full CRUD operations on all tables
- Policy checks: `is_admin(auth.uid())` returns true for authorized users

---

## Authentication & Authorization

### Authentication Flow
1. **Admin Login** (`/admin` route):
   - Standard Supabase `signInWithPassword()`
   - Successful login triggers admin role verification
   - Uses `supabase.rpc('is_admin', {user_id})` to check permissions

2. **Session Management**:
   - Sessions stored in localStorage
   - Auto-refresh tokens enabled
   - Auth state change listeners for reactive UI updates

3. **Authorization Checks**:
   - Frontend: Route guards and component-level auth checks
   - Backend: RLS policies enforce database-level security
   - Function-based: `is_admin()` centralizes permission logic

### Role System
- **Admin**: Full vehicle management, image uploads, status changes
- **Public**: Browse inventory, view details, request test drives

---

## File Structure & Components

### Core Application Files

#### `src/App.tsx`
**Purpose**: Root application component with routing configuration
**Routes Defined**:
- `/` → Home (landing page)
- `/aanbod` → Available vehicles (status = 'aanbod')
- `/verkocht` → Sold vehicles (status = 'verkocht')
- `/lpg` → LPG vehicles page
- `/reviews` → Customer reviews
- `/contact` → Contact page
- `/auto/:id` → Vehicle detail page
- `/admin` → Admin login
- `/admin/dashboard` → Admin dashboard

#### `src/integrations/supabase/`
**client.ts**:
- Supabase client configuration
- Database connection settings
- Authentication configuration (localStorage, persistSession, autoRefresh)

**types.ts**:
- Auto-generated TypeScript types from Supabase schema
- Complete type definitions for all tables, functions, and enums
- Ensures type safety across the application

### Page Components

#### `src/pages/Admin.tsx`
**Purpose**: Admin authentication interface
**Key Features**:
- Email/password login form
- Post-login admin role verification
- Automatic redirect to dashboard on success
- Error handling for invalid credentials/permissions

#### `src/pages/AdminDashboard.tsx`
**Purpose**: Complete vehicle management interface
**Key Features**:
- Vehicle listing with sorting/filtering
- CRUD operations for vehicles
- Image management integration
- Form handling for all vehicle fields
- Status management (aanbod/verkocht)
- Logout functionality

#### `src/pages/Aanbod.tsx`
**Purpose**: Public vehicle catalog
**Key Features**:
- Fetches vehicles with `status = 'aanbod'`
- Dynamic filtering (brand, price range, year)
- Grid layout with vehicle cards
- Integration with search functionality

### UI Components

#### `src/components/CarCard.tsx`
**Purpose**: Vehicle display card for catalog listings
**Key Features**:
- Image carousel with navigation controls
- Vehicle information display
- Pricing and basic specifications
- Link to detailed vehicle page
- Responsive design with hover effects

#### `src/components/CarFilters.tsx`
**Purpose**: Dynamic filtering component for vehicle catalog
**Key Features**:
- Brand filtering (dynamically populated)
- Price range slider
- Year range selection
- Search functionality across brand/model/type

#### `src/components/Navigation.tsx`
**Purpose**: Site navigation component
**Key Features**:
- Main navigation menu
- Admin section (hidden for non-admins)
- Responsive mobile menu

---

## Supabase Integration

### Database Operations

#### Vehicle Queries
```typescript
// Fetch available vehicles with images
const { data } = await supabase
  .from('cars')
  .select(`
    *,
    car_images (url)
  `)
  .eq('status', 'aanbod')
  .order('created_at', { ascending: false });
```

#### Image Upload Process
1. File selection in frontend form
2. Upload to Supabase Storage bucket `car-images`
3. Generate public URL for each uploaded image
4. Insert image records into `car_images` table with display order

#### Authentication Flow
```typescript
// Admin login with role verification
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Check admin privileges
const { data: isAdminData } = await supabase.rpc('is_admin', {
  user_id: data.user.id
});
```

### Storage Configuration
- **Bucket**: `car-images`
- **Access**: Public URLs for vehicle images
- **File Path Structure**: `{carId}/{randomName}.{extension}`

### Real-time Capabilities
- Auth state change listeners
- Potential for real-time inventory updates
- Session management with automatic token refresh

---

## Edge Functions

### `send-testdrive-request` (`supabase/functions/send-testdrive-request/index.ts`)
**Purpose**: Handle test drive requests and send email notifications

**Functionality**:
- Accepts POST requests with test drive details
- Sends email to business (info@autoservicevanderwaals.nl)
- Sends confirmation email to customer
- Uses Resend API for email delivery
- CORS enabled for cross-origin requests

**Request Schema**:
```typescript
interface TestDriveRequest {
  name: string;
  email: string;
  carBrand: string;
  carModel: string;
}
```

**Environment Variables**:
- `RESEND_API_KEY`: API key for Resend email service

---

## Deployment

### Local Development
```bash
npm run dev          # Development server with hot reload
npm run build        # Production build
npm run preview      # Preview production build locally
```

### Production Deployment
The application can be deployed to any static hosting service:
- Vercel
- Netlify
- Supabase Hosting
- GitHub Pages (with configuration)
- AWS S3 + CloudFront

### Environment Configuration
- Supabase URL and keys are embedded in the client configuration
- Edge functions require environment variables (RESEND_API_KEY)
- No additional build configuration needed

---

## Supabase MCP Integration

### Project Information
- **Project ID**: `olmfshnswumcehnpclgz`
- **Database**: PostgreSQL 17.6.1.036
- **Region**: EU North-1
- **Status**: Active and Healthy

### MCP (Model Context Protocol) Capabilities

#### Database Management via MCP
The Supabase MCP server enables AI assistants to perform database operations:

**Schema Exploration**:
```bash
# List all tables
mcp__supabase__list_tables(project_id="olmfshnswumcehnpclgz")

# List database extensions
mcp__supabase__list_extensions(project_id="olmfshnswumcehnpclgz")
```

**Data Operations**:
```bash
# Execute SQL queries
mcp__supabase__execute_sql(
  project_id="olmfshnswumcehnpclgz",
  query="SELECT COUNT(*) FROM cars WHERE status = 'aanbod';"
)
```

**Security Analysis**:
```bash
# Review RLS policies
mcp__supabase__execute_sql(
  project_id="olmfshnswumcehnpclgz",
  query="SELECT * FROM pg_policies WHERE schemaname = 'public';"
)
```

#### Development Workflow with MCP

**1. Schema Modifications**:
- Add new tables/columns via SQL execution
- Update RLS policies for new features
- Modify user role system

**2. Data Analysis**:
- Query vehicle inventory statistics
- Analyze user activity patterns
- Generate reports from database

**3. Debugging & Maintenance**:
- Check database performance
- Review query execution plans
- Manage user roles and permissions

**4. Migration Management**:
```bash
# List migrations
mcp__supabase__list_migrations(project_id="olmfshnswumcehnpclgz")

# Apply new migration
mcp__supabase__apply_migration(
  project_id="olmfshnswumcehnpclgz",
  name="add_vehicle_features",
  query="ALTER TABLE cars ADD COLUMN features JSONB;"
)
```

### MCP Server Configuration
The project uses the Supabase MCP server with these capabilities:
- **HTTP Transport**: `https://mcp.supabase.com/mcp`
- **Authentication**: OAuth-based (connected to your account)
- **Project Access**: Full administrative access to Kraakman project

---

## Future Development

### Suggested Enhancements

#### Technical Improvements
1. **Advanced Search**: Implement full-text search with PostgreSQL FTS
2. **Image Optimization**: Add image compression and responsive variants
3. **Caching Strategy**: Implement React Query caching for better performance
4. **Real-time Updates**: WebSocket integration for live inventory changes
5. **API Layer**: Add backend API for complex business logic

#### Feature Additions
1. **Customer Management**: Extend user_roles for customer accounts
2. **Appointment System**: Calendar integration for test drives
3. **Analytics Dashboard**: Vehicle views, inquiries, conversion tracking
4. **Multi-language Support**: Internationalization framework
5. **Mobile App**: React Native or PWA implementation

#### Database Extensions
1. **Vehicle History**: Add service history and documentation tracking
2. **Customer Reviews**: Review system with ratings
3. **Price History**: Track price changes and market trends
4. **Location Management**: Multiple dealership locations
5. **Integration APIs**: Connect to external vehicle databases

#### MCP-Powered Development
1. **Automated Testing**: Generate test cases from schema analysis
2. **Documentation**: Auto-generate API documentation
3. **Performance Analysis**: Query optimization suggestions
4. **Security Audits**: Automated RLS policy validation
5. **Data Migration**: AI-assisted schema migrations

### Development Guidelines
1. **Type Safety**: Always use generated TypeScript types
2. **Security**: Implement RLS policies for all new tables
3. **Testing**: Write unit tests for business logic
4. **Performance**: Monitor database query performance
5. **Documentation**: Keep README and code comments updated

This technical documentation provides a complete understanding of the Kraakman platform's architecture, implementation details, and development workflows. The Supabase MCP integration enables powerful AI-assisted development and database management capabilities.