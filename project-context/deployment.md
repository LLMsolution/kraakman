# Kraakman - Deployment Guide

## 🚀 Deployment Architectuur

**Kraakman** is gebouwd voor moderne cloud deployment met Vercel als primary hosting platform en Supabase als backend-as-a-service. De architectuur ondersteunt CI/CD, environment management, en schaalbare infrastructuur.

## 📁 Project Structuur voor Deployment

```
kraakman/
├── project-context/          # 📚 Documentation
│   ├── README.md
│   ├── architecture.md
│   ├── database.md
│   ├── components.md
│   ├── security.md
│   ├── data-flow.md
│   └── deployment.md
├── src/                     # 🎨 Source code
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── integrations/
│   └── styles/
├── public/                  # 📦 Static assets
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── supabase/               # 🗄️ Database migrations
├── package.json            # 📦 Dependencies
├── vite.config.ts          # ⚙️ Build config
├── vercel.json             # 🌐 Deployment config
└── .env.example            # 🔐 Environment template
```

## 🌐 Vercel Deployment

### Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "name": "kraakman-automotive",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=86400"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/admin",
      "destination": "/admin",
      "permanent": false
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

### Environment Variables

```bash
# .env.production
VITE_SUPABASE_URL=https://olmfshnswumcehnpclgz.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Analytics and monitoring
VITE_GA_TRACKING_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=SENTRY_DSN_HERE
```

### Package Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "build:analyze": "npm run build && npx vite-bundle-analyzer dist/stats.html"
  }
}
```

## 🗄️ Supabase Setup

### Project Configuration

```toml
# supabase/config.toml
[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]

[db]
port = 54322
shadow_port = 54320
major_version = 15

[storage]
enabled = true
file_size_limit = "50MiB"

[auth]
enabled = true
site_url = "https://kraakman-auto.vercel.app"
additional_redirect_urls = ["https://www.kraakman-auto.vercel.app"]

[functions]
enabled = false
```

### Database Migrations

```sql
-- supabase/migrations/20251106193114_initial_schema.sql
-- Create cars table
CREATE TYPE car_status AS ENUM ('aanbod', 'verkocht');

CREATE TABLE cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merk TEXT NOT NULL,
  model TEXT NOT NULL,
  type TEXT,
  bouwjaar INTEGER NOT NULL,
  transmissie TEXT,
  kleur TEXT,
  kilometerstand INTEGER,
  prijs DECIMAL(10,2) NOT NULL,
  status car_status NOT NULL DEFAULT 'aanbod',
  opties TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access" ON cars FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON cars FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));
```

### Storage Setup

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-images',
  'car-images',
  true,
  '52428800', -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (
  bucket_id = 'car-images' AND auth.role() = 'anon'
);

CREATE POLICY "Admin write access" ON storage.objects FOR ALL USING (
  bucket_id = 'car-images' AND auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run tests
        run: npm run test

      - name: Build project
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Pre-deployment Checks

```bash
# scripts/pre-deploy.sh
#!/bin/bash

echo "🚀 Starting pre-deployment checks..."

# 1. Type checking
echo "📋 Type checking..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ Type check failed"
  exit 1
fi

# 2. Linting
echo "🔍 Linting..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed"
  exit 1
fi

# 3. Testing
echo "🧪 Testing..."
npm run test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

# 4. Build
echo "🏗️ Building..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

# 5. Bundle analysis
echo "📊 Analyzing bundle size..."
npm run build:analyze

echo "✅ All pre-deployment checks passed!"
```

## 🔧 Environment Management

### Development Environment

```bash
# Local development setup
git clone https://github.com/your-org/kraakman.git
cd kraakman
npm install
cp .env.example .env.local

# Start local development
npm run dev
```

### Environment Files

```bash
# .env.example (don't commit actual .env)
# Supabase configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Analytics
VITE_GA_TRACKING_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=https://your-sentry-dsn

# Optional: Feature flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false
```

### Production Environment Setup

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Test production build locally
npm install -g serve
serve -s dist -l 3000
```

## 📈 Performance Optimization

### Build Optimization

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    host: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
  },
})
```

### Bundle Analysis

```json
// package.json
{
  "scripts": {
    "build:analyze": "npm run build && npx vite-bundle-analyzer dist/stats.html",
    "build:stats": "npm run build && npx vite-bundle-analyzer dist/stats.html --mode json"
  }
}
```

### Caching Strategy

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false
        return failureCount < 3
      },
    },
  },
})
```

## 🔐 Security Configuration

### HTTPS & Security Headers

```typescript
// vite.config.ts - Security headers in development
export default defineConfig({
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
})
```

### Content Security Policy

```html
<!-- public/index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https://*.supabase.co;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
">
```

## 📊 Monitoring & Analytics

### Google Analytics

```typescript
// src/analytics.ts
import { useEffect } from 'react'
import { VITE_GA_TRACKING_ID } from './env'

export const useAnalytics = () => {
  useEffect(() => {
    if (!VITE_GA_TRACKING_ID) return

    // Load gtag script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${VITE_GA_TRACKING_ID}`
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function (...args: any[]) {
      window.dataLayer.push(args)
    }
    window.gtag('js', new Date())
    window.gtag('config', VITE_GA_TRACKING_ID, {
      page_location: window.location.href,
    })
  }, [])
}
```

### Error Tracking

```typescript
// src/errorTracking.ts
import { VITE_SENTRY_DSN } from './env'
import * as Sentry from '@sentry/react'

if (VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0,
    beforeSend: (event) => {
      // Filter out certain errors
      if (event.exception?.message?.includes('ResizeObserver')) {
        return null
      }
      return event
    },
  })
}
```

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] ESLint no errors
- [ ] Build successful
- [ ] Bundle size acceptable
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Supabase RLS policies tested

### Post-Deployment

- [ ] Website loads correctly
- [ ] All pages accessible
- [ ] Authentication working
- [ ] Admin dashboard functional
- [ ] Image uploads working
- [ ] Responsive design tested
- [ ] Performance metrics collected
- [ ] Error monitoring active
- [ ] Analytics tracking working

### Production Monitoring

```bash
# Health check script
#!/bin/bash

echo "🏥 Performing health checks..."

# Check website availability
response=$(curl -s -o /dev/null -w "%{http_code}" https://kraakman-auto.vercel.app)

if [ "$response" = "200" ]; then
  echo "✅ Website is accessible"
else
  echo "❌ Website is not accessible (HTTP $response)"
  exit 1
fi

# Check API endpoints
api_response=$(curl -s -o /dev/null -w "%{http_code}" "https://olmfshnswumcehnpclgz.supabase.co/rest/v1/cars?select=count")

if [ "$api_response" = "200" ]; then
  echo "✅ Database API is accessible"
else
  echo "❌ Database API is not accessible (HTTP $api_response)"
  exit 1
fi

echo "✅ All health checks passed!"
```

## 📝 Deployment Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview                # Preview production build

# Testing
npm run test                   # Run unit tests
npm run test:coverage         # Run tests with coverage
npm run lint                   # Run ESLint
npm run lint:fix               # Fix linting issues

# Analysis
npm run build:analyze         # Analyze bundle size
npm run type-check             # Type checking

# Deployment
vercel --prod                  # Deploy to Vercel
vercel logs                     # View deployment logs
vercel --debug                 # Debug deployment issues
```

## 🔄 Rollback Strategy

### Quick Rollback

```bash
# Rollback to previous deployment
vercel rollback --previous

# Rollback to specific deployment
vercel rollback --deployment-id <deployment-id>

# Check deployment history
vercel list
```

### Database Rollback

```sql
-- Supabase migration rollback
supabase db reset --confirm

# Revert specific migration
supabase db push --schema-only
```

---

De deployment setup van Kraakman is geconfigureerd voor betrouwbaarheid, schaalbaarheid en continue delivery met automated testing en monitoring.