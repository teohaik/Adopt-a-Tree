# Adopt a Tree - Thermi, Thessaloniki

A web application that enables community members to adopt and care for trees in Thermi, Thessaloniki.

## Overview

Adopt a Tree is a community engagement platform that allows residents to:
- Select tree locations on an interactive map
- Commit to caring for specific trees
- Receive automatic email confirmations
- Track adopted trees across the community

## Key Features

### User Features
- **Interactive Map**: Google Maps integration centered on Thermi, Thessaloniki
- **Pin Placement**: Click anywhere on the map to adopt a tree
- **User Registration**: Simple form to collect adopter information
- **Email Confirmation**: Automatic emails with tree details and responsibilities
- **Real-time Updates**: See all adopted trees on the map

### Admin Features
- **Dashboard**: View all tree adoptions in a comprehensive table
- **Statistics**: Track total adoptions, unique adopters, and recent activity
- **Export**: Download adoption data as CSV for planning
- **Google Maps Integration**: Quick links to view trees on Google Maps

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Map**: Google Maps JavaScript API
- **Database**: Vercel Postgres
- **Email**: Resend
- **Deployment**: Vercel

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see SETUP.md)
4. Run development server: `npm run dev`
5. Open http://localhost:3000

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## Project Structure

```
src/
├── app/
│   ├── api/pins/          # API routes for pin management
│   ├── admin/             # Admin dashboard
│   ├── page.tsx           # Main map interface
│   └── layout.tsx         # Root layout
├── components/
│   ├── TreeMap.tsx        # Google Maps component
│   └── PinForm.tsx        # Tree adoption form
└── lib/
    ├── db.ts              # Database functions
    └── email.ts           # Email service
```

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `POSTGRES_URL` - Vercel Postgres connection string
- `RESEND_API_KEY` - Resend email API key
- `EMAIL_FROM` - Sender email address
- `NEXT_PUBLIC_APP_URL` - Application URL

See `.env.local.example` for a complete list.

## Usage

### Adopting a Tree

1. Click on the map where you'd like to adopt a tree
2. Fill in your name, email, and a label for the tree
3. Submit the form
4. Receive a confirmation email with tree details

### Admin Access

Navigate to `/admin` to access the admin dashboard where you can:
- View all adoptions
- See statistics
- Export data to CSV
- Access Google Maps links for each tree

## Contributing

This is a community project. Contributions are welcome!

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
