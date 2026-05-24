# Cloudflare Analytics Worker (4 counters)

This worker provides two endpoints:

- `POST /collect` increments visit counters
- `GET /stats` returns:
  - `total_visits`
  - `total_bot_visits`
  - `today_visits`
  - `today_bot_visits`

## 1) Create D1 database

```bash
wrangler d1 create kaalveniiz_analytics
```

Copy the returned `database_id` into `wrangler.toml`.

## 2) Apply schema

```bash
wrangler d1 execute kaalveniiz_analytics --file=./schema.sql --remote
```

## 3) Deploy worker

```bash
wrangler deploy
```

You will get a URL like:

`https://kaalveniiz-analytics.<your-subdomain>.workers.dev`

## 4) Wire to Hugo

In `config.toml` set:

```toml
[params]
  analyticsEndpoint = "https://kaalveniiz-analytics.<your-subdomain>.workers.dev"
```

Then commit and push your Hugo repo.

## Notes

- If worker is down, blog pages still load normally.
- Bot detection is user-agent based (best-effort).
