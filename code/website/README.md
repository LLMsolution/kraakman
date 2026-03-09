# Kraakman Automotive Platform

🚗 **Professionele auto showroom en administratief platform**

---

## 📚 Documentatie Overzicht

Deze README is een verwijzing naar complete project documentatie. Voor diepgaande informatie over architectuur, componenten, database, security en development, zie de **[project-context](./project-context)** map.

### 📖 Belangrijke Documentatie

| Document | Doel | Wanneer lezen |
|---------|------|--------------|
| [**Project Context**](./project-context/README.md) | Volledig project overzicht | **Eerst lezen** |
| [**Architectuur**](./project-context/architecture.md) | Systeemarchuur & data flow diagram's | Na inleiding |
| [**Database**](./project-context/database.md) | Database schema & RLS policies | Bij data wijzigingen |
| [**Componenten**](./project-context/components.md) | UI componenten & patterns | Bij component ontwikkeling |
| [**Security**](./project-context/security.md) | Auth & security implementatie | Bij security vraagstukken |
| [**Data Flow**](./project-context/data-flow.md) | API patterns & state management | Bij data issues |
| [**Deployment**](./project-context/deployment.md) | Deployment & CI/CD setup | Bij deploy problemen |
| [**Development**](./project-context/development.md) | Setup & development gids | Bij development starten |

---

## 🎯 Snel Start

### Prerequisites
- **Node.js** 18.x of hoger
- **npm** 9.x of hoger
- **Git** 2.40+ (voor hooks en features)

### Installatie

```bash
# Clone repository
git clone <repository-url>
cd kraakman

# Installeer dependencies
npm install

# Start development server
npm run dev
```

Bezoek `http://localhost:8080` voor de ontwikkelversomgeving.

### Environment Setup

```bash
# Kopieer environment template
cp .env.example .env.local

# Vul Supabase credentials in
code .env.local
```

---

## 🚀 Project Overzicht

**Kraakman** is een full-stack automotive dealership platform gebouwd met React + TypeScript + Supabase. Het dient als zowel een publiekgerichte auto showroom als een administratief beheersysteem voor voertuiginventaris met geavanceerde afbeeldingbeheer, authenticatie en rol-gebaseerde toegangscontrole.

### 🏗️ Architectuur Patroon

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Security**: Row Level Security (RLS) + Role-Based Access Control
- **Type Safety**: Auto-generated TypeScript types van Supabase schema

### 📊 Kern Features

#### **Publieke Functionaliteiten:**
- Bladeren door auto inventaris met filteren/zoek mogelijkheden
- Gedetailleerde voertuiginformatie met afbeeldinggalerijen
- Proefrit aanvragen via Edge Functions
- Klant reviews sectie

#### **Admin Functionaliteiten:**
- Complete CRUD operaties voor voertuigen
- Afbeelding upload/beheer met Supabase Storage
- Status tracking (aanbod/verkocht)
- Gebruikersrol management en authenticatie
- Admin dashboard met sorteren/filteren

---

## 🔧 Componenten Systeem

Het project gebruikt een gestandaardiseerde componenten architectuur met Shadcn/ui als basis:

```typescript
// Voorbeeld: Gestandaardiseerde Button
import { Button } from "@/components/ui/button"

<Button variant="secondary" size="lg" onClick={handleAction}>
  <Plus className="w-4 h-4 mr-2" />
  Nieuwe Auto
</Button>
```

**Key Componenten:**
- **CarCard**: Voertuig display met afbeelding carousel
- **CarFilters**: Geavanceerd filter interface
- **Navigation**: Responsive navigatie met mobile menu
- **AdminDashboard**: Compleet administratief interface
- **PhotoManager**: Afbeelding beheer met drag & drop

---

## 🔐 Database Structuur

### Hoofd Tabellen

```sql
-- Auto catalogus met volledige specificaties
CREATE TABLE cars (
  id UUID PRIMARY KEY,
  merk TEXT NOT NULL,           -- bv. BMW, Volkswagen
  model TEXT NOT NULL,          -- bv. 3 Series, Golf
  bouwjaar INTEGER NOT NULL,       -- Productiejaar
  prijs DECIMAL(10,2) NOT NULL,      -- Prijs in EUR
  status car_status DEFAULT 'aanbod',  -- 'aanbod' | 'verkocht'
  opties TEXT[],                -- Opties als array
  -- ... technische specificaties
);

-- Afbeeldingen met display order
CREATE TABLE car_images (
  id UUID PRIMARY KEY,
  car_id UUID REFERENCES cars(id),
  url TEXT NOT NULL,           -- Image URL
  display_order INTEGER DEFAULT 0    -- Sorteer volgorde
);

-- Rol-gebaseerde toegangscontrole
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id),
  role app_role DEFAULT 'user',      -- 'admin' | 'user'
);
```

### Security Model

**Row Level Security (RLS)** zorgt voor database-level toegangscontrole:
- **Publieke leestoegang**: Iedereen kan auto's en afbeeldingen bekijken
- **Admin only schrijfrechten**: Alleen admins kunnen data wijzigen

---

## 🚀 Deployment

### Development

```bash
npm run dev      # Development server
npm run build    # Productie build
npm run preview  # Preview productie build
```

### Productie

De applicatie is geconfigureerd voor Vercel deployment met:
- **Automatische CI/CD** via GitHub Actions
- **Environment management** met secrets
- **Performance monitoring** met analytics
- **HTTPS/security** headers automatisch

---

## 🔗 Project Structuur

```
src/
├── components/          # Herbruikbare UI componenten
│   ├── ui/             # Shadcn/ui basis componenten
│   ├── CarCard.tsx    # Auto display component
│   ├── CarFilters.tsx # Filter interface
│   └── Navigation.tsx # Site navigatie
├── pages/             # App pagina's
│   ├── Aanbod.tsx     # Beschikbare auto's
│   ├── CarDetail.tsx  # Auto detail pagina
│   ├── Admin.tsx      # Admin login
│   └── AdminDashboard.tsx # Admin dashboard
├── services/          # Business logic laag
│   └── carService.ts  # Auto data operaties
├── integrations/       # Externe services
│   └── supabase/      # Supabase client & types
└── styles/            # CSS & design system
```

---

## 🤝 Support

- **Issues**: Meld problemen via GitHub issues
- **Documentation**: Bekijk [project-context](./project-context/) voor technische details
- **Development**: Volg [Development Guide](./project-context/development.md)