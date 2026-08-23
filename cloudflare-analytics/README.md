# Cloudflare human visitors and AI reads

This Worker exposes:

- `POST /collect` records a browser visitor once per Hong Kong calendar day.
- A daily scheduled task imports AI request counts from Cloudflare AI Crawl Control.
- `GET /stats` returns completed-day and overall totals for human visitors and AI reads.

Raw IP addresses, page paths, referrers, and crawler user agents are never stored. The Worker creates a keyed HMAC from the incoming IP address and user agent, then stores only that digest. Declared AI crawlers and bots are excluded from the human visitor counter.

AI reads are stored only as daily aggregate counts in three categories:

- `crawler`: automated collection or training crawlers
- `search`: AI search crawlers
- `assistant`: user-directed AI assistants

An AI read is a successful request for one of the blog's trailing-slash page URLs, identified using Cloudflare's published AI user-agent list. Assets, `robots.txt`, and feeds are therefore excluded. It is a request count, not a unique AI identity, and user agents can be spoofed on Cloudflare plans without Bot Management.

All public totals are calculated only through the last completed Hong Kong day, so they remain unchanged during the day and advance automatically after midnight.

## 1. Apply the D1 schema

The configured database already exists. From this directory, run:

```bash
wrangler d1 execute kaalveniiz_analytics --file=./schema.sql --remote
```

The new tables coexist with the legacy counter tables. Applying this schema does not delete the old data, but the old page-view totals are not imported because they used different counting semantics.

## 2. Create the HMAC secret

Generate a random value locally:

```bash
openssl rand -hex 32
```

Copy it, then store it as a Worker secret:

```bash
wrangler secret put VISITOR_HASH_SECRET
```

Do not put the value in `wrangler.toml` or commit it. Changing this secret later changes every visitor identifier and will cause returning visitors to be counted again in the overall total.

## 3. Connect a Cloudflare zone for AI reads

AI crawlers commonly fetch HTML without running JavaScript. Their requests can only be measured if the blog uses a custom domain proxied through Cloudflare; the `kaalveniiz.github.io` hostname cannot provide this edge data to your Cloudflare account.

After the custom domain is active, copy its Cloudflare zone ID into `wrangler.toml`:

```toml
CLOUDFLARE_ZONE_ID = "your-zone-id"
```

Create a Cloudflare API token with permission to read zone analytics, then store it as a Worker secret:

```bash
wrangler secret put CLOUDFLARE_API_TOKEN
```

The cron expression runs at 00:15 Hong Kong time and imports only the previous completed day. It overwrites those three daily aggregate rows if it is retried, so retries do not double-count reads.

## 4. Confirm allowed origins

`wrangler.toml` currently allows the canonical site, its `www` redirect, and the old GitHub Pages origin during migration:

```toml
ALLOWED_ORIGINS = "https://kaalveniiz.net,https://www.kaalveniiz.net,https://kaalveniiz.github.io"
```

If you add a custom domain, use a comma-separated list containing both exact origins while migrating.

## 5. Deploy

```bash
wrangler deploy
```

The Worker URL will look like:

`https://kaalveniiz-analytics.<your-subdomain>.workers.dev`

## 6. Connect Hugo

Set the deployed Worker URL in the root `config.toml`:

```toml
[params]
  analytics_endpoint = "https://kaalveniiz-analytics.<your-subdomain>.workers.dev"
```

Until this value is set, the blog does not send analytics requests.

## Response format

```json
{
  "yesterday_visitors": 12,
  "total_visitors": 345,
  "ai_reads": {
    "yesterday": { "crawler": 8, "search": 3, "assistant": 1, "total": 12 },
    "overall": { "crawler": 80, "search": 30, "assistant": 10, "total": 120 }
  },
  "day": "2026-08-22"
}
```

Human counts are approximate: shared networks, changing IP addresses, browser updates, VPNs, and multiple devices can merge or split identities. AI counts are best-effort request totals, not unique models or users.
