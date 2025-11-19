# Kraakman Automotive Platform - Project Documentation

## 📋 Inhoudsopgave

1. [Project Overzicht](README.md#project-overzicht)
2. [Architectuur Diagram](./architecture.md)
3. [Database Structuur](./database.md)
4. [Componenten Systeem](./components.md)
5. [Authenticatie & Security](./security.md)
6. [API Data Flow](./data-flow.md)
7. [Deployment](./deployment.md)
8. [Development Guide](./development.md)

## 🎯 Project Overzicht

**Kraakman** is een full-stack automotive dealership platform gebouwd met modern web technologie. Het dient als zowel een publiekgerichte auto showroom als een administratief beheersysteem voor voertuiginventaris met afbeeldingbeheer, authenticatie, en rol-gebaseerde toegangscontrole.

### 🚀 Kernfunctionaliteiten

#### **Publieke Functies:**
- Bladeren door auto inventaris met filteren/zoek mogelijkheden
- Gedetailleerde voertuiginformatie met afbeeldinggalerijen
- Proefrit aanvragen via Supabase Edge Functions
- Klant reviews sectie

#### **Admin Functies:**
- Complete CRUD operaties voor voertuigen
- Afbeelding upload/beheer met Supabase Storage
- Status tracking (aanbod/verkocht)
- Gebruikersrol management en authenticatie
- Admin dashboard met sorteren/filteren

### 🛠️ Technologie Stack

#### **Frontend:**
- **Framework**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/ui components
- **State Management**: React hooks + TanStack Query
- **Routing**: React Router DOM
- **Build Tool**: Vite met SWC

#### **Backend:**
- **Database**: PostgreSQL 17.6.1.036 via Supabase
- **Auth**: Supabase Auth met rol-gebaseerde toegangscontrole
- **Storage**: Supabase Storage voor auto afbeeldingen
- **Edge Functions**: Supabase Edge Functions voor email notificaties
- **RLS**: Row Level Security policies voor data bescherming

### 🏗️ Architectuur Patroon

**Client-First** architectuur met directe database toegang via Supabase:

```
Frontend (React) → Supabase Client → PostgreSQL Database
                ↘ Supabase Storage → Afbeeldingen
                ↘ Supabase Auth → Gebruikers management
                ↘ Supabase Edge Functions → Email verzending
```

### 📁 Project Structuur

```
Kraakman/
├── src/
│   ├── components/          # Herbruikbare UI componenten
│   │   ├── ui/             # Shadcn/ui basis componenten
│   │   ├── CarCard.tsx    # Auto display component
│   │   ├── CarFilters.tsx # Filter interface
│   │   ├── PhotoManager.tsx # Afbeelding beheer
│   │   └── Navigation.tsx # Site navigatie
│   ├── pages/             # Hoofd applicatie pagina's
│   │   ├── Aanbod.tsx     # Beschikbare auto's pagina
│   │   ├── CarDetail.tsx  # Auto detail pagina
│   │   ├── Admin.tsx      # Admin login
│   │   ├── AdminDashboard.tsx # Admin beheer interface
│   │   └── ...
│   ├── services/          # Business logic laag
│   │   └── carService.ts  # Auto data operaties
│   ├── types/             # TypeScript type definities
│   ├── integrations/       # Externe service integraties
│   │   └── supabase/      # Supabase client & types
│   ├── styles/            # CSS en design tokens
│   │   ├── colors.css     # Kleur system
│   │   ├── spacing.css    # Spacing system
│   │   └── components.css # Component styling
│   └── hooks/             # Custom React hooks
├── supabase/              # Database schema & migrations
└── public/               # Static assets
```

### 🎨 Design System

Het project gebruikt een uitgebreid design system met:

- **Kleur System**: Gecentraliseerde CSS custom properties voor consistentie
- **Spacing System**: 4px base unit met responsive breakpoints
- **Component Library**: Gestandaardiseerde UI componenten via Shadcn/ui
- **Typography**: Consistent lettertype en schaal
- **Responsive Design**: Mobile-first aanpak met iPad en desktop varianten

### 🔐 Security Model

- **Row Level Security (RLS)**: Database-level access control
- **Role-Based Access**: Admin vs user rollen via `user_roles` tabel
- **Session Management**: Supabase Auth met localStorage persistence
- **Data Validation**: TypeScript types + database constraints

---

**Volgende stap**: Lees de [Architecture](./architecture.md) voor een diepgaande blik op de systeemarchitectuur en data flow.