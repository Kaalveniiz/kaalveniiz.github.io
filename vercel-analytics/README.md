# Vercel Analytics Backend (4 counters)

This backend exposes:

- `POST /api/collect`
- `GET /api/stats`

Returns:

- `total_visits`
- `total_bot_visits`
- `today_visits`
- `today_bot_visits`

## 1) Create free Upstash Redis

- Go to Upstash and create a Redis database (free tier).
- Copy:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

## 2) Deploy this folder to Vercel

```bash
cd vercel-analytics
vercel
```

(If first time, install CLI: `npm i -g vercel`)

## 3) Set environment variables in Vercel project

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Then redeploy:

```bash
vercel --prod
```

## 4) Test endpoints

```bash
curl -X POST https://<your-vercel-domain>/api/collect
curl https://<your-vercel-domain>/api/stats
```

## 5) Wire to Hugo

In root `config.toml`:

```toml
[params]
  analytics_endpoint = "https://<your-vercel-domain>/api"
```

Then push Hugo repo.
