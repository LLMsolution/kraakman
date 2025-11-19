# Kraakman - System Architecture

## 🏗️ Hoog-Niveau Architectuur

```mermaid
graph TB
    subgraph "Client Side"
        USER[Gebruiker]
        BROWSER[Browser/Device]
        REACT[React App]

        USER --> BROWSER
        BROWSER --> REACT
    end

    subgraph "Supabase Backend"
        AUTH[Supabase Auth]
        DB[(PostgreSQL DB)]
        STORAGE[Supabase Storage]
        EDGE[Edge Functions]
    end

    subgraph "External Services"
        EMAIL[Email Service]
        PAYMENTS[Payment Providers]
    end

    REACT --> AUTH
    REACT --> DB
    REACT --> STORAGE
    REACT --> EDGE

    EDGE --> EMAIL
    REACT -.-> PAYMENTS

    classDef user fill:#e1f5fe
    classDef frontend fill:#f3e5f5
    classDef backend fill:#e8f5e8
    classDef external fill:#fff3e0

    class USER,BROWSER user
    class REACT frontend
    class AUTH,DB,STORAGE,EDGE backend
    class EMAIL,PAYMENTS external
```

## 🔄 Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as Gebruiker
    participant R as React App
    participant A as Supabase Auth
    participant DB as PostgreSQL
    participant S as Supabase Storage

    Note over U,S: Public Data Flow (Iedereen)
    U->>R: Bezoekt website
    R->>DB: Query cars (RLS: Public read)
    DB-->>R: Cars data
    R->>S: Vraag car images
    S-->>R: Image URLs
    R-->>U: Toont car listings

    Note over U,S: Admin Data Flow (Alleen Admins)
    U->>R: Admin login
    R->>A: Authenticate
    A-->>R: Session + User role
    R->>DB: Check is_admin() function
    DB-->>R: Admin bevestiging
    U->>R: Voegt auto toe
    R->>DB: INSERT car (RLS: Admin only)
    R->>S: Upload afbeeldingen
    S-->>R: Image URLs
    R->>DB: INSERT car_images
    R-->>U: Success bevestiging
```

## 🗄️ Database Relatie Schema

```mermaid
erDiagram
    auth.users ||--o{ user_roles : has
    cars ||--o{ car_images : has

    auth.users {
        uuid id PK
        email text
        created_at timestamptz
    }

    user_roles {
        uuid id PK
        uuid user_id FK
        enum role
        timestamptz created_at
    }

    cars {
        uuid id PK
        text merk
        text model
        integer bouwjaar
        decimal prijs
        enum status
        text[] opties
        timestamptz created_at
        timestamptz updated_at
    }

    car_images {
        uuid id PK
        uuid car_id FK
        text url
        integer display_order
        timestamptz created_at
    }

    %% Storage Bucket Relatie
    cars ||--o{ "car-images bucket" : stored_in
```

## 🎨 Component Architecture

```mermaid
graph TD
    subgraph "Layout Components"
        NAV[Navigation]
        FOOTER[Footer]
        CONTAINER[Container]
    end

    subgraph "Page Components"
        HOME[Home]
        AANBOD[Aanbod]
        CARDETAIL[CarDetail]
        ADMIN[Admin]
        DASHBOARD[AdminDashboard]
    end

    subgraph "Feature Components"
        CARCARD[CarCard]
        CARFILTERS[CarFilters]
        PHOTOMANAGER[PhotoManager]
        TAGINPUT[TagInput]
    end

    subgraph "UI Foundation"
        BUTTON[Button]
        INPUT[Input]
        DIALOG[Dialog]
        BADGE[Badge]
        SELECT[Select]
    end

    subgraph "Services & Hooks"
        CARSERVICE[carService]
        AUTHHOOK[useAuth]
        QUERYHOOK[useQuery]
        TOAST[useToast]
    end

    HOME --> CARCARD
    AANBOD --> CARCARD
    AANBOD --> CARFILTERS
    CARDETAIL --> CARCARD
    DASHBOARD --> PHOTOMANAGER
    DASHBOARD --> CARCARD
    ADMIN --> CONTAINER

    CARCARD --> BUTTON
    CARFILTERS --> BUTTON
    PHOTOMANAGER --> BUTTON
    NAV --> BUTTON
    DASHBOARD --> BUTTON

    CARCARD --> CARSERVICE
    AANBOD --> CARSERVICE
    CARDETAIL --> CARSERVICE

    classDef layout fill:#e3f2fd
    classDef pages fill:#f3e5f5
    classDef features fill:#e8f5e8
    classDef ui fill:#fff3e0
    classDef services fill:#fce4ec

    class NAV,FOOTER,CONTAINER layout
    class HOME,AANBOD,CARDETAIL,ADMIN,DASHBOARD pages
    class CARCARD,CARFILTERS,PHOTOMANAGER,TAGINPUT features
    class BUTTON,INPUT,DIALOG,BADGE,SELECT ui
    class CARSERVICE,AUTHHOOK,QUERYHOOK,TOAST services
```

## 🔐 Security Architecture Flow

```mermaid
flowchart TD
    START[Gebruiker Request] --> AUTH_CHECK{Is Authenticated?}

    AUTH_CHECK -->|Nee| PUBLIC_ACCESS[Public Data Only]
    AUTH_CHECK -->|Ja| ROLE_CHECK{Check User Role}

    ROLE_CHECK -->|User| USER_ACCESS[Read + Limited Write]
    ROLE_CHECK -->|Admin| ADMIN_ACCESS[Full CRUD Access]

    PUBLIC_ACCESS --> RLS_PUBLIC[RLS: Public Policies]
    USER_ACCESS --> RLS_USER[RLS: User Policies]
    ADMIN_ACCESS --> RLS_ADMIN[RLS: Admin Policies]

    RLS_PUBLIC --> DB_READ[Read Cars/Images]
    RLS_USER --> DB_LIMITED[Limited Operations]
    RLS_ADMIN --> DB_FULL[Full Operations]

    DB_READ --> SUCCESS[Return Data]
    DB_LIMITED --> SUCCESS
    DB_FULL --> SUCCESS

    classDef secure fill:#ffebee
    classDef public fill:#e8f5e8
    classDef user fill:#fff3e0
    classDef admin fill:#e3f2fd

    class AUTH_CHECK,ROLE_CHECK,RLS_PUBLIC,RLS_USER,RLS_ADMIN secure
    class PUBLIC_ACCESS,DB_READ public
    class USER_ACCESS,DB_LIMITED user
    class ADMIN_ACCESS,DB_FULL admin
```

## 📱 Responsive Architecture

```mermaid
graph LR
    subgraph "Mobile (< 640px)"
        MOBILE_NAV[Mobile Menu]
        MOBILE_GRID[Single Column]
        MOBILE_FILTERS[Collapsible Filters]
        MOBILE_CARDS[Full Width Cards]
    end

    subgraph "Tablet (640px - 1024px)"
        TABLET_NAV[Tablet Navigation]
        TABLET_GRID[2 Column Grid]
        TABLET_FILTERS[Inline Filters]
        TABLET_CARDS[Medium Cards]
    end

    subgraph "Desktop (> 1024px)"
        DESKTOP_NAV[Desktop Navigation]
        DESKTOP_GRID[3 Column Grid]
        DESKTOP_FILTERS[Always Visible Filters]
        DESKTOP_CARDS[Large Cards]
    end

    subgraph "Shared Components"
        CAR_DATA[Car Data Service]
        AUTH_SERVICE[Auth Service]
        STYLE_SYSTEM[CSS Variables]
    end

    MOBILE_NAV --> STYLE_SYSTEM
    TABLET_NAV --> STYLE_SYSTEM
    DESKTOP_NAV --> STYLE_SYSTEM

    MOBILE_GRID --> CAR_DATA
    TABLET_GRID --> CAR_DATA
    DESKTOP_GRID --> CAR_DATA

    classDef mobile fill:#ffebee
    classDef tablet fill:#fff3e0
    classDef desktop fill:#e8f5e8
    classDef shared fill:#e3f2fd

    class MOBILE_NAV,MOBILE_GRID,MOBILE_FILTERS,MOBILE_CARDS mobile
    class TABLET_NAV,TABLET_GRID,TABLET_FILTERS,TABLET_CARDS tablet
    class DESKTOP_NAV,DESKTOP_GRID,DESKTOP_FILTERS,DESKTOP_CARDS desktop
    class CAR_DATA,AUTH_SERVICE,STYLE_SYSTEM shared
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DEV_ENV[Local Development]
        DEV_DB[Local Supabase]
        VITE_DEV[Vite Dev Server]
    end

    subgraph "Production"
        VERCEL[Frontend on Vercel]
        PROD_DB[Supabase Production]
        PROD_STORAGE[Supabase Storage]
        EDGE_FUNCS[Edge Functions]
    end

    subgraph "CI/CD Pipeline"
        GITHUB[GitHub Repository]
        VERCEL_BUILD[Automatic Build]
        DEPLOY[Auto Deploy]
    end

    DEV_ENV --> GITHUB
    GITHUB --> VERCEL_BUILD
    VERCEL_BUILD --> VERCEL
    VERCEL --> PROD_DB
    VERCEL --> PROD_STORAGE
    VERCEL --> EDGE_FUNCS

    classDef dev fill:#e8f5e8
    classDef prod fill:#ffebee
    classDef pipeline fill:#fff3e0

    class DEV_ENV,DEV_DB,VITE_DEV dev
    class VERCEL,PROD_DB,PROD_STORAGE,EDGE_FUNCS prod
    class GITHUB,VERCEL_BUILD,DEPLOY pipeline
```

## 🔄 State Management Flow

```mermaid
graph TD
    subgraph "Client State"
        LOCAL_STATE[React Local State]
        QUERY_CACHE[TanStack Query Cache]
        SESSION[Auth Session]
    end

    subgraph "Server State"
        POSTGRES[(PostgreSQL)]
        STORAGE_FILES[Storage Files]
        EDGE_CACHE[Edge Functions Cache]
    end

    subgraph "State Updates"
        USER_ACTION[User Interaction]
        API_CALL[Supabase Query]
        REALTIME[Realtime Subscriptions]
    end

    USER_ACTION --> LOCAL_STATE
    LOCAL_STATE --> API_CALL
    API_CALL --> POSTGRES
    API_CALL --> STORAGE_FILES

    REALTIME --> QUERY_CACHE
    POSTGRES -.-> REALTIME
    QUERY_CACHE --> LOCAL_STATE

    classDef client fill:#e3f2fd
    classDef server fill:#e8f5e8
    classDef updates fill:#fff3e0

    class LOCAL_STATE,QUERY_CACHE,SESSION client
    class POSTGRES,STORAGE_FILES,EDGE_CACHE server
    class USER_ACTION,API_CALL,REALTIME updates
```

---

Deze architectuur documentatie laat zien hoe het Kraakman platform is opgebouwd met moderne, schaalbare technologieën en best practices voor security en performance.