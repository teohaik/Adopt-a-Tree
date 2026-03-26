# Adopt a Tree - Thermi, Thessaloniki

**Current Version: 1.0.4** | [mytree.epi-thermi.gr](https://mytree.epi-thermi.gr)

A community engagement platform enabling residents of Thermi, Thessaloniki to adopt and care for trees via an interactive map.

An initiative by [Σύλλογος ΕΠΙ](https://epi-thermi.gr/).

## Overview

Adopt a Tree allows residents to:
- Select tree locations on an interactive Google Maps interface
- Adopt existing trees or request new ones to be planted
- Receive bilingual (Greek/English) email confirmations
- Track their adopted trees by email filter
- Browse all community adoptions on the map

## Key Features

### User Features
- **Interactive Map**: Google Maps centered on Thermi, Thessaloniki (40.5463°N, 23.0176°E)
- **Placement Mode**: Click to place a pin within valid planting zones
- **Tree Exists Toggle**: Declare whether the tree already exists or needs to be planted
- **Tree Types**: Select from pre-seeded Greek tree species
- **Email Filter**: View your own adopted trees highlighted on the map
- **Email Confirmation**: Automatic bilingual confirmation on adoption
- **Bilingual UI**: Greek/English toggle with browser language detection
- **Watering Guide**: `/guide` page with care instructions

### Admin Features
- **Dashboard**: List view, zone-grouped view, and zone suggestions tabs
- **Statistics**: Total adoptions, unique adopters, recent activity
- **Tree Exists Filter**: Filter "Προς Φύτευση" (to be planted) entries
- **Tree Type Assignment**: Assign species per tree row
- **Zone Management**: Draw planting zones on map with polygon tool
- **Tree Type Management**: Full CRUD for tree species
- **CSV Export**: Download adoption data for planning
- **Secure Auth**: HMAC-SHA256 session tokens, 7-day HTTP-only cookie

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript 5, Tailwind CSS 3
- **Map**: Google Maps JavaScript API, Google Places API
- **Database**: Vercel Postgres
- **Email**: Resend
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main map interface
│   ├── layout.tsx                  # Root layout with Footer & LanguageProvider
│   ├── guide/page.tsx              # Watering guide (bilingual)
│   ├── api/
│   │   ├── pins/route.ts           # Tree CRUD (GET/POST/PATCH/DELETE)
│   │   ├── zones/route.ts          # Planting zone CRUD
│   │   ├── tree-types/route.ts     # Tree type CRUD
│   │   └── auth/                   # Session management
│   └── admin/
│       ├── page.tsx                # Dashboard
│       ├── zones/page.tsx          # Zone management
│       └── tree-types/page.tsx     # Tree species management
├── components/
│   ├── TreeMap.tsx                 # Google Maps component
│   ├── PinForm.tsx                 # Tree adoption form
│   ├── LanguageToggle.tsx          # El/En switcher
│   └── Footer.tsx
└── lib/
    ├── db.ts                       # Database operations
    ├── auth.ts                     # Admin auth
    ├── email.ts                    # Resend email service
    ├── plantingZones.ts            # Ray-casting geospatial validation
    └── i18n/                       # Greek/English translations
```

## Database Tables

- `tree_pins` — id, latitude, longitude, user_name, user_email, tree_label, zone_id, tree_type_id, tree_exists, created_at
- `planting_zones` — id, name, description, coordinates (JSONB), enabled, nearest_roads, created_at
- `tree_types` — id, name, description, created_at

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see below)
4. Run development server: `npm run dev`
5. Open http://localhost:3000

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `POSTGRES_URL` | Vercel Postgres connection string |
| `RESEND_API_KEY` | Resend email API key |
| `EMAIL_FROM` | Sender email address |
| `ADMIN_PASSWORD` | Admin dashboard password |
| `AUTH_SECRET` | HMAC secret for session tokens |

## Usage

### Adopting a Tree

1. Click **"Πρόσθεσε Δέντρο"** to enter placement mode
2. Click on the map within a valid planting zone
3. Fill in your name, email, tree label, type, and whether the tree exists
4. Submit — you'll receive a confirmation email

### Admin Access

Navigate to `/admin/login` to access the dashboard where you can:
- View all adoptions (list or zone-grouped)
- Manage planting zones (draw polygons on map)
- Manage tree species
- Export data to CSV
- Review zone suggestions from users

## License

MIT — Open Source
