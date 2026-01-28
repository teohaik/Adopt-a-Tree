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
│   ├── page.tsx              # Main map interface
│   ├── layout.tsx            # Root layout with Footer
│   ├── api/
│   │   ├── pins/route.ts     # Tree CRUD (POST/GET)
│   │   ├── zones/route.ts    # Planting zones
│   │   └── auth/             # Admin authentication
│   └── admin/
│       ├── page.tsx          # Admin dashboard
│       ├── zones/page.tsx    # Zone management
│       └── login/page.tsx    # Admin login
├── components/
│   ├── TreeMap.tsx           # Google Maps component
│   ├── PinForm.tsx           # Tree adoption form
│   └── Footer.tsx            # Footer component
└── lib/
    ├── db.ts                 # Database operations
    ├── email.ts              # Email service
    ├── plantingZones.ts      # Geospatial utilities (ray-casting)
    ├── auth.ts               # Admin auth (HMAC-SHA256)
    └── apiAuth.ts            # API authentication
```

## Key Features
1. Click-to-place tree adoption on interactive map
2. Geospatial validation with polygon-based zone restrictions
3. HTML email confirmations via Resend
4. Email-based filtering to view your adopted trees
5. Admin dashboard with statistics and CSV export
6. HMAC-SHA256 signed session tokens (7-day duration)
7. Zone data caching (5-second TTL)

## Database Tables
- `tree_pins` - Adopted trees (name, email, label, lat, lng, zone)
- `planting_zones` - Allowed planting areas (polygon boundaries)

## Map Center
Thermi: 40.5463°N, 23.0176°E

## Recent Commits
- 1d18aeb: added footer
- 9e23fa6: added favicon
- ec726b9: fix build errors
- 9f40ae1: fix encoding bug
