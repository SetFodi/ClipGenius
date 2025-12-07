# ClipGenius

AI-powered gaming shorts generator. Turn your Twitch VODs, YouTube videos, and gaming streams into viral vertical clips with automatic transcription and captions.

## Features

- **Upload & Transcribe**: Upload gaming videos (up to 250MB, 20 min) and get AI-powered transcription
- **Select Highlights**: Browse transcript, click timestamps to seek, and mark clip start/end points
- **Auto-Generate Clips**: Vertical 9:16 clips with burned-in captions, ready for TikTok/Reels/Shorts
- **Gaming-Optimized**: Dark theme UI designed for gaming creators

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Worker**: Node.js on Railway (FFmpeg + Groq Whisper API)
- **AI**: Groq Whisper for transcription

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Groq API key (free tier)
- Railway account (for worker deployment)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/clipgenius.git
cd clipgenius
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Create storage buckets:
   - `videos` (private)
   - `clips` (public)
4. Set up storage policies (see migration file for examples)

### 3. Configure Environment

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Groq
GROQ_API_KEY=your_groq_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy Worker to Railway

1. Create a new Railway project
2. Add a new service from the `worker/` directory
3. Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GROQ_API_KEY`
4. Deploy

## Project Structure

```
clipgenius/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── api/               # API routes
│   ├── clips/             # Clips listing page
│   ├── dashboard/         # Main dashboard
│   ├── upload/            # Video upload page
│   └── video/[id]/        # Video detail + transcript
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # App-specific components
├── lib/                   # Utilities and configs
│   ├── supabase/         # Supabase client setup
│   └── ...
├── worker/               # Railway worker service
│   ├── src/
│   │   ├── jobs/        # Job handlers
│   │   ├── services/    # FFmpeg, Groq, Supabase
│   │   └── index.ts     # Main worker loop
│   └── Dockerfile
└── supabase/
    └── migrations/       # Database schema
```

## How It Works

1. **Upload**: User uploads a video → stored in Supabase Storage
2. **Transcribe**: Worker downloads video, extracts audio, sends to Groq Whisper
3. **Select**: User views transcript, marks clip start/end times
4. **Generate**: Worker creates vertical clips with FFmpeg, burns in captions
5. **Download**: User downloads ready clips for social media

## Free Tier Limits

| Service  | Free Tier                    | Notes                      |
|----------|------------------------------|----------------------------|
| Vercel   | 100GB bandwidth              | Plenty for MVP             |
| Supabase | 500MB DB, 1GB storage        | ~4-5 videos                |
| Railway  | $5/month credit              | ~40-50 hours worker time   |
| Groq     | 14,400 requests/day          | ~50+ transcriptions/day    |

## License

MIT

