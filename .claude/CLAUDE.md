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
│   ├── unsubscribe/page.tsx        # Public opt-out from broadcasts (confirm button, POSTs /api/unsubscribe)
│   ├── opengraph-image.tsx         # OG image
│   ├── api/
│   │   ├── pins/route.ts           # Tree CRUD (GET/POST/PATCH/DELETE; PATCH: type, tree_exists, move location, contact details; GET is public but returns only id/lat/lng/label/mine unless admin)
│   │   ├── pins/reject/route.ts    # Reject adoption (emails adopter, deletes pin)
│   │   ├── zone-suggestions/route.ts # User zone suggestions (GET/POST/PATCH/DELETE)
│   │   ├── emails/send/route.ts    # Broadcast send (admin): resolves emails server-side from pin IDs, max 100 recipients/call, batch via Resend; test mode -> ADMIN_EMAIL
│   │   ├── emails/history|optouts  # Broadcast log / opted-out emails (admin)
│   │   ├── unsubscribe/route.ts    # Public: GET redirects to page, POST opts out (HMAC token, also List-Unsubscribe one-click)
│   │   ├── zones/route.ts          # Planting zone CRUD
│   │   ├── zones/update-roads/route.ts
│   │   ├── tree-types/route.ts     # Tree type CRUD (admin)
│   │   └── auth/login|logout       # Session management
│   └── admin/
│       ├── page.tsx                # Master-detail dashboard (list + zone-grouped views, zone suggestions)
│       ├── emails/page.tsx         # Mass emailer: recipients, EL/EN composer, preview, test, send, history
│       ├── zones/page.tsx          # Zone management with map drawing
│       ├── tree-types/page.tsx     # Tree species management
│       └── login/page.tsx
├── components/
│   ├── TreeMap.tsx                 # Google Maps component
│   ├── PinForm.tsx                 # Tree adoption form (phone, tree_exists toggle)
│   ├── AdminPinDetail.tsx          # Admin detail panel (contact edit, type, tree_exists, move, reject)
│   ├── AdminPinMover.tsx           # Map UI to relocate a pin
│   ├── LanguageToggle.tsx          # El/En language switcher (flag emojis)
│   └── Footer.tsx
├── middleware.ts                   # Protects /admin/* routes
└── lib/
    ├── db.ts                       # Database operations
    ├── auth.ts                     # Admin auth (HMAC-SHA256)
    ├── apiAuth.ts                  # API auth verification
    ├── email.ts                    # Resend emails: confirmation, zone approval, rejection, sendBroadcastBatch
    ├── broadcast.ts                # Pure: groupRecipients (1 per email), placeholders, escaped HTML template
    ├── unsubscribe.ts              # HMAC (SESSION_SECRET) unsubscribe tokens + URLs
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
11. `tree_exists` flag: users declare if tree already exists or needs planting; admin can update in the detail panel and filter "Προς Φύτευση"
12. Required phone number on adoption (`user_phone`), shown in admin and CSV export
13. Master-detail admin: click a row for detail panel; move pin on map; reject adoption with reason (emails adopter, deletes pin); edit adopter name/email/phone
14. Admin list table: email column, header checkbox filters ("Προς φύτευση", "Χωρίς τηλέφωνο"), row checkboxes, "Αντιγραφή CSV" copies checked (or all visible) rows; CSV export respects filters
15. Mass emailer: recipients from table selection / all / filters, one email per adopter, per-language (EL/EN) text with {name} {tree_count} {tree_labels}, required test send, unsubscribe link + List-Unsubscribe header
16. Zone suggestions: users suggest new planting locations; admin reviews, which sends an approval email (CC `ADMIN_EMAIL`, optional)

## Database Tables
- `tree_pins` — id, latitude, longitude, user_name, user_email, user_phone, tree_label, zone_id (FK), tree_type_id (FK), tree_exists (boolean, default true), lang ('el'|'en', default 'el'), created_at
- `planting_zones` — id, name, description, coordinates (JSONB), enabled, nearest_roads, created_at
- `tree_types` — id, name, description, created_at
- `zone_suggestions` — id, latitude, longitude, user_name, user_email, description, status ('pending'|'reviewed'), created_at
- `email_optouts` — email (PK, lowercase), created_at (broadcasts only; transactional emails ignore it)
- `email_broadcasts` — id, subject_el, subject_en, recipient_count, sent_count, failed_count, created_at

## DB Migrations Pattern
`initDatabase()` in `db.ts` runs `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for each new column — safe to re-run on every cold start.

## Map Center
Thermi: 40.5463°N, 23.0176°E

## Current Version
1.1.2

## Recent Commits
- (1.1.2): HTML-escape user input (name, tree label, description, rejection reason) in transactional emails; prod NEXT_PUBLIC_APP_URL must be https://mytree.epi-thermi.gr (Gmail blocked mail linking to vercel.app)
- a8e77aa: Security: public GET /api/pins no longer returns names/emails/phones (admin-only); public gets a server-computed `mine` flag via ?email=
- 241d21c: Mass emailer at /admin/emails, per-adopter language, unsubscribe flow (v1.1.0)
- dd4e456: Admin can edit adopter name/email/phone in detail panel; fix "Στοιχεία Αναδόχου" heading
- 103d9fd: Admin table: email column, header checkbox filters (to plant, no phone), row selection + copy as CSV
