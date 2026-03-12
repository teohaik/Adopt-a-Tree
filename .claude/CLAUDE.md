# Adopt a Tree - Project Context

## Overview
Community engagement platform for residents of Thermi, Thessaloniki, Greece. Enables users to adopt trees via an interactive Google Maps interface, track adoptions, and receive email confirmations.

## Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript 5, Tailwind CSS 3
- **Maps**: Google Maps JavaScript API, Google Places API
- **Backend**: Next.js API Routes, Node.js 18+
- **Database**: Vercel Postgres
- **Email**: Resend
- **Hosting**: Vercel

## Project Structure
```
src/
├── app/
│   ├── page.tsx                    # Main map interface
│   ├── layout.tsx                  # Root layout with Footer & LanguageProvider
│   ├── guide/page.tsx              # Watering guide (bilingual)
│   ├── opengraph-image.tsx         # OG image
│   ├── api/
│   │   ├── pins/route.ts           # Tree CRUD (GET/POST/PATCH/DELETE)
│   │   ├── zones/route.ts          # Planting zone CRUD
│   │   ├── zones/update-roads/route.ts
│   │   ├── tree-types/route.ts     # Tree type CRUD (admin)
│   │   └── auth/login|logout       # Session management
│   └── admin/
│       ├── page.tsx                # Dashboard (list + zone-grouped views)
│       ├── zones/page.tsx          # Zone management with map drawing
│       ├── tree-types/page.tsx     # Tree species management
│       └── login/page.tsx
├── components/
│   ├── TreeMap.tsx                 # Google Maps component
│   ├── PinForm.tsx                 # Tree adoption form (with tree_exists toggle)
│   ├── LanguageToggle.tsx          # El/En language switcher (flag emojis)
│   └── Footer.tsx
├── middleware.ts                   # Protects /admin/* routes
└── lib/
    ├── db.ts                       # Database operations
    ├── auth.ts                     # Admin auth (HMAC-SHA256)
    ├── apiAuth.ts                  # API auth verification
    ├── email.ts                    # Resend email service
    ├── plantingZones.ts            # Ray-casting geospatial validation
    ├── nearestRoads.ts             # Geocoding utilities
    └── i18n/
        ├── translations.ts         # Greek/English translation strings
        └── LanguageContext.tsx     # Language state management
```

## Key Features
1. Click-to-place tree adoption on interactive map
2. Ray-casting polygon validation for zone restrictions
3. HTML email confirmations via Resend (bilingual)
4. Email-based filter to view your trees
5. Admin dashboard: stats, CSV export, delete, tree-type assignment, zone-grouped view
6. HMAC-SHA256 session tokens (7-day, HTTP-only cookie)
7. Greek/English i18n with flag-emoji toggle + browser language detection
8. Tree type management (admin CRUD, pre-seeded with Greek species)
9. Zone management with polygon drawing on map
10. Vercel Analytics
11. `tree_exists` flag: users declare if tree already exists or needs planting; admin can update via checkbox per row and filter "Προς Φύτευση"

## Database Tables
- `tree_pins` — id, latitude, longitude, user_name, user_email, tree_label, zone_id (FK), tree_type_id (FK), tree_exists (boolean, default true), created_at
- `planting_zones` — id, name, description, coordinates (JSONB), enabled, nearest_roads, created_at
- `tree_types` — id, name, description, created_at

## DB Migrations Pattern
`initDatabase()` in `db.ts` runs `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for each new column — safe to re-run on every cold start.

## Map Center
Thermi: 40.5463°N, 23.0176°E

## Current Version
v0.11.0

## Recent Commits
- b157fa6: Add tree_exists field to distinguish existing trees from trees to be planted (v0.11.0)
- 8c1a9ef: Add tree type management with dedicated admin page (v0.10.0)
- 0a771a0: Bump version to 0.9.0
- 0ba82ca: Add zone-grouped view tab to admin dashboard
- 13dd2cf: Store zone_id in tree_pins and add backfill endpoint
