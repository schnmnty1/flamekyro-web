# FlameKyro Web

Official website for **FlameKyro** — gaming creator site with live YouTube status, latest uploads, creator stats, and social connect.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Framer Motion

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Required | Purpose |
|---|---|---|
| `YOUTUBE_API_KEY` | Yes | Server-only YouTube Data API key for live status, videos, and stats |
| `NEXT_PUBLIC_SITE_URL` | Recommended in production | Canonical origin for SEO (`https://your-domain.com`) |

## Optional assets

Place the theme track at:

```
public/audio/theme.mp3
```

If the file is missing, the music UI stays hidden (no broken chrome).

## Scripts

```bash
npm run dev      # http://localhost:3000
npm run build
npm run start
npm run lint
```

## Notes

- YouTube data is fetched via `/api/youtube` (server-side key; never expose `YOUTUBE_API_KEY` to the client).
- The Social Carousel geometry is locked — do not change unless fixing a reported bug.
