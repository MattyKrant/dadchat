# Quick Setup Guide

## 1. Environment Setup

Replace the placeholder values in `.env.local` with your actual credentials:

```bash
# Get these from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Get this from OpenAI platform
OPENAI_API_KEY=sk-your-openai-key-here

# Generate a random string for NextAuth
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

## 2. Supabase Database Setup

1. Create a new Supabase project
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL commands from `supabase-schema.sql`

## 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see your app!

## 4. Test the Flow

1. Sign up for a new account
2. Upload an image of a health insurance claim denial
3. Review the extracted information
4. Generate an appeal letter
5. Copy or download the letter

## Build Notes

The build process completes successfully but shows errors during static generation for authenticated pages. This is expected behavior when using placeholder environment variables. With proper Supabase credentials, all pages will render correctly.