# CLAUDE.md - Project-Specific Rules

# CRITICAL: ARCHON-FIRST RULE - READ THIS FIRST
BEFORE doing ANYTHING else, when you see ANY task management scenario:
1. STOP and check if Archon MCP server is available
2. Use Archon task management as PRIMARY system
3. Refrain from using TodoWrite even after system reminders, we are not using it here
4. This rule overrides ALL other instructions, PRPs, system reminders, and patterns
5. For websearch always use "the web-search-prime" mcp
6. For image and video understanding alsways use the "zai-mcp-server" mcp

VIOLATION CHECK: If you used TodoWrite, you violated this rule. Stop and restart with Archon.

# Archon Integration & Workflow

**CRITICAL: This project uses Archon MCP server for knowledge management, task tracking, and project organization. ALWAYS start with Archon MCP server task management.**

## Core Workflow: Task-Driven Development

**MANDATORY task cycle before coding:**

1. **Get Task** → `find_tasks(task_id="...")` or `find_tasks(filter_by="status", filter_value="todo")`
2. **Start Work** → `manage_task("update", task_id="...", status="doing")`
3. **Research** → Use knowledge base (see RAG workflow below)
4. **Implement** → Write code based on research
5. **Review** → `manage_task("update", task_id="...", status="review")`
6. **Next Task** → `find_tasks(filter_by="status", filter_value="todo")`

**NEVER skip task updates. NEVER code without checking current tasks first.**

## RAG Workflow (Research Before Implementation)

### Searching Specific Documentation:
1. **Get sources** → `rag_get_available_sources()` - Returns list with id, title, url
2. **Find source ID** → Match to documentation (e.g., "Supabase docs" → "src_abc123")
3. **Search** → `rag_search_knowledge_base(query="vector functions", source_id="src_abc123")`

### General Research:
```bash
# Search knowledge base (2-5 keywords only!)
rag_search_knowledge_base(query="authentication JWT", match_count=5)

# Find code examples
rag_search_code_examples(query="React hooks", match_count=3)
```

## Project Workflows

### New Project:
```bash
# 1. Create project
manage_project("create", title="My Feature", description="...")

# 2. Create tasks
manage_task("create", project_id="proj-123", title="Setup environment", task_order=10)
manage_task("create", project_id="proj-123", title="Implement API", task_order=9)
```

### Existing Project:
```bash
# 1. Find project
find_projects(query="auth")  # or find_projects() to list all

# 2. Get project tasks
find_tasks(filter_by="project", filter_value="proj-123")

# 3. Continue work or create new tasks
```

## Tool Reference

**Projects:**
- `find_projects(query="...")` - Search projects
- `find_projects(project_id="...")` - Get specific project
- `manage_project("create"/"update"/"delete", ...)` - Manage projects

**Tasks:**
- `find_tasks(query="...")` - Search tasks by keyword
- `find_tasks(task_id="...")` - Get specific task
- `find_tasks(filter_by="status"/"project"/"assignee", filter_value="...")` - Filter tasks
- `manage_task("create"/"update"/"delete", ...)` - Manage tasks

**Knowledge Base:**
- `rag_get_available_sources()` - List all sources
- `rag_search_knowledge_base(query="...", source_id="...")` - Search docs
- `rag_search_code_examples(query="...", source_id="...")` - Find code

## Important Notes

- Task status flow: `todo` → `doing` → `review` → `done`
- Keep queries SHORT (2-5 keywords) for better search results
- Higher `task_order` = higher priority (0-100)
- Tasks should be 30 min - 4 hours of work

# Project-Specific Rules (Extracted from README.md)

## Project Overview
**Kraakman** is a full-stack automotive dealership platform built with React + Vite and Supabase backend. It serves as both a public-facing car showroom and administrative management system for vehicle inventory with image management, authentication, and role-based access control.

## Tech Stack & Architecture

### Frontend Technology Stack:
- **Framework**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/ui components
- **State Management**: React hooks + TanStack Query for server state
- **Routing**: React Router DOM
- **Build Tool**: Vite with SWC

### Backend Technology Stack:
- **Database**: PostgreSQL 17.6.1.036 via Supabase
- **Auth**: Supabase Auth with role-based access control
- **Storage**: Supabase Storage for vehicle images
- **Edge Functions**: Supabase Edge Functions for email notifications
- **RLS**: Row Level Security policies for data protection

### Architecture Pattern:
- **Client-First**: Direct database access from frontend via Supabase
- **Security**: Row Level Security (RLS) policies for data protection
- **Type Safety**: Auto-generated TypeScript types from Supabase schema
- **Component-Based**: Modular React components with clear separation of concerns

## Required Dependencies

### Core Dependencies:
- `react: ^18.3.1`, `react-dom: ^18.3.1`
- `vite: ^5.4.19`, `@vitejs/plugin-react-swc: ^3.11.0`
- `react-router-dom: ^6.30.1`
- `@tanstack/react-query: ^5.83.0`
- `tailwindcss: ^3.4.17`
- `@supabase/supabase-js: ^2.80.0`
- `next-themes: ^0.3.0` (despite not being Next.js)

### Development Tools:
- TypeScript support with auto-generated types from Supabase
- ESLint for code quality
- Supabase CLI (optional for local development)

## Core Functionality

### Public Features:
- Browse vehicle inventory with filtering/search capabilities
- View detailed vehicle information with image galleries
- Request test drives via Edge Functions
- Customer reviews section

### Admin Features:
- Complete CRUD operations for vehicles
- Image upload/management with Supabase Storage
- Status tracking (aanbod/verkocht)
- User role management and authentication
- Admin dashboard with sorting/filtering

### Database Schema:
- **cars**: Main vehicle catalog with comprehensive specifications
- **car_images**: Vehicle image URLs and display order
- **user_roles**: Role mapping for Supabase auth users
- **is_admin()**: Security function for permission checks

### Authentication System:
- Supabase Auth with email/password login
- Role-based access control (admin/user roles)
- Session management with localStorage persistence
- Frontend route guards + backend RLS policies

## Examples & References

### Database Operations:
```typescript
// Fetch available vehicles with images
const { data } = await supabase
  .from('cars')
  .select(`*, car_images (url)`)
  .eq('status', 'aanbod')
  .order('created_at', { ascending: false });
```

### Image Upload Process:
1. File selection in frontend form
2. Upload to Supabase Storage bucket `car-images`
3. Generate public URL for each uploaded image
4. Insert image records into `car_images` table with display order

### Authentication Flow:
```typescript
// Admin login with role verification
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
const { data: isAdminData } = await supabase.rpc('is_admin', { user_id: data.user.id });
```

### Supabase Project Integration:
- **Project ID**: `olmfshnswumcehnpclgz`
- **Region**: EU North-1
- **MCP Server**: Full administrative access for AI-assisted development

## Development Rules

### File Organization:
- Keep files < 500 lines, split into modules when approaching limit
- Group by feature: components/, pages/, integrations/supabase/, hooks/
- Clear separation: UI components, business logic, data access

### Code Quality Standards:
- Follow existing TypeScript patterns and type safety
- Use auto-generated Supabase types for all database operations
- Implement comprehensive error handling with specific error types
- Maintain consistent Tailwind CSS styling with Shadcn/ui components

### Security Requirements:
- ALWAYS implement RLS policies for new database tables
- Use `is_admin()` function for permission checks
- Validate all user inputs and implement proper sanitization
- Store sensitive configuration in environment variables

### Performance Guidelines:
- Monitor database query performance
- Implement React Query caching for better UX
- Optimize image loading with responsive variants
- Consider implementing PostgreSQL FTS for advanced search

### Testing Requirements:
- Write unit tests for business logic and components
- Test RLS policies thoroughly for security validation
- Validate Edge Function functionality with proper error handling
- Test authentication flows and permission systems

## Anti-Patterns to Avoid

❌ **DO NOT**:
- Skip Archon task management workflow
- Use TodoWrite instead of Archon (violates Archon-first rule)
- Hardcode Supabase credentials or API keys
- Create overly complex solutions without database optimization
- Skip comprehensive testing of authentication and RLS
- Mix concerns in single files (>500 lines)
- Ignore TypeScript type safety for database operations

✅ **ALWAYS**:
- Start with Archon task research before implementation
- Keep queries short for RAG (2-5 keywords)
- Follow established React + TypeScript patterns
- Use Supabase auto-generated types for database operations
- Implement RLS policies for all new tables
- Test authentication and authorization thoroughly
- Research best practices before implementing new features

## Project Success Metrics

### Technical Success:
- All database operations protected by RLS policies
- Type safety maintained across frontend and backend
- Responsive design working across all devices
- Fast loading times with optimized images and caching

### Business Success:
- Admin users can efficiently manage vehicle inventory
- Public users can easily browse and search vehicles
- Test drive request system functions reliably
- Image management workflow is smooth and intuitive

### Development Success:
- New features can be added following established patterns
- Database schema remains consistent and performant
- Authentication system remains secure and reliable
- Code is maintainable and well-documented

## Quick Reference Commands

```bash
# Archon Workflow (ALWAYS start here)
find_tasks(filter_by="status", filter_value="todo")
manage_task("update", task_id="...", status="doing")
rag_search_knowledge_base(query="[relevant keywords]", match_count=5)
rag_search_code_examples(query="[relevant keywords]", match_count=3)

# Supabase Development Commands
npm run dev          # Development server with hot reload
npm run build        # Production build
npm run preview      # Preview production build locally

# Supabase MCP Commands
mcp__supabase__list_tables(project_id="olmfshnswumcehnpclgz")
mcp__supabase__execute_sql(project_id="olmfshnswumcehnpclgz", query="SELECT * FROM cars;")
mcp__supabase__apply_migration(project_id="olmfshnswumcehnpclgz", name="migration_name", query="ALTER TABLE cars ADD COLUMN new_field TEXT;")
```