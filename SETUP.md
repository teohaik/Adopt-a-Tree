# Adopt a Tree - Setup Guide

This guide will help you set up the Adopt a Tree application with all required services.

## Features

- Interactive Google Map focused on Thermi, Thessaloniki
- Click-to-place pins for tree adoption
- User form to collect name, email, and tree label
- Automatic email notifications to adopters
- Admin dashboard to view and export all adoptions
- Vercel Postgres database for storing pins and user data

## Prerequisites

1. Node.js 18+ installed
2. A Vercel account
3. A Google Cloud Platform account
4. A Resend account (for email)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the "Maps JavaScript API"
4. Create credentials (API Key)
5. Restrict the API key to your domain (optional but recommended)
6. Copy the API key

### 3. Set Up Vercel Postgres

#### Option A: Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. In your Vercel project settings, go to "Storage"
4. Click "Create Database" and select "Postgres"
5. The environment variables will be automatically added to your project

#### Option B: Local Development

1. Create a Vercel Postgres database in your Vercel project
2. Go to your project settings > Environment Variables
3. Copy all POSTGRES_* variables
4. Add them to your `.env.local` file

### 4. Set Up Resend for Email

1. Sign up at [Resend](https://resend.com)
2. Verify your domain or use the resend.dev domain for testing
3. Generate an API key from the [API Keys page](https://resend.com/api-keys)
4. Copy the API key

### 5. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in all the values in `.env.local`:
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
   - `POSTGRES_*`: Your Vercel Postgres credentials (auto-filled if deployed to Vercel)
   - `RESEND_API_KEY`: Your Resend API key
   - `EMAIL_FROM`: Your verified sender email (e.g., `Adopt a Tree <noreply@yourdomain.com>`)
   - `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., `https://yourdomain.com` or `http://localhost:3000`)

### 6. Initialize the Database

The database will be automatically initialized when you make your first API call. The table will be created if it doesn't exist.

Alternatively, you can manually initialize it by making a GET request to `/api/pins`.

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Using the Application

### For Users

1. Click anywhere on the map to place a pin
2. Fill in your name, email, and a label for your tree
3. Submit the form
4. You'll receive a confirmation email with a link to your tree's location

### For Admins

1. Navigate to `/admin` to view the admin dashboard
2. See all adopted trees in a table
3. Export the data to CSV for planning tree planting
4. View tree locations on Google Maps

## Email Template

Users receive an email with:
- Confirmation of their tree adoption
- Tree details (label and location)
- Their responsibilities as a tree caretaker
- Links to view the tree on the app and Google Maps

## Database Schema

The `tree_pins` table has the following structure:

```sql
CREATE TABLE tree_pins (
  id SERIAL PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  tree_label VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(latitude, longitude)
);
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add the required environment variables in Vercel project settings
4. Deploy!

The app will automatically use Vercel Postgres if you've set it up in your Vercel project.

## Troubleshooting

### Map not loading
- Check that your Google Maps API key is correct
- Make sure the Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for errors

### Database errors
- Verify all POSTGRES_* environment variables are set correctly
- Check that your Vercel Postgres database is active
- Look at the Vercel logs for detailed error messages

### Emails not sending
- Verify your Resend API key is correct
- Check that your sender email is verified in Resend
- For production, use a verified domain instead of resend.dev

## Future Enhancements

- Restrict pin placement to designated areas
- Add authentication for admin dashboard
- Add photos of trees
- Add tree species information
- Send reminder emails to water trees
- Track tree health status
- Mobile app version
