# kaalveniiz.github.io
blog

## Hugo quick start

1. Create a new post:
   `hugo new posts/my-new-post.md`
2. Run local preview:
   `hugo server -D`
3. Build static files:
   `hugo`

## Notes

- RSS is disabled in `config.toml`.
- First post is at `content/posts/hello-world.md`.

## Easy post tool

Use this helper to create a post without manually editing front matter:

```bash
./tools/new-post.sh "Your Post Title"
```

Or run without a title and it will ask:

```bash
./tools/new-post.sh
```

It will ask for tags, ask if it should be a draft, then let you paste your post text.
Press `Ctrl-D` to finish pasting.
After that, you can choose to add images by dragging files into Terminal.

### Image flow with the tool

1. Run `./tools/new-post.sh`
2. Paste your post text, then press `Ctrl-D`
3. Type `y` for "Add images now?"
4. Drag and drop photo files into Terminal and press Enter

The tool will:
- copy images into `static/images/`
- auto-insert Markdown like `![name](/images/file.jpg)` into your post

## Web helper editor

Open:

- `tools/editor.html`

Features:

- fill title/tags/draft/date
- default slug is current time (`DD-MM-YYYY HH:MM:SS`)
- paste post content
- drag/drop images
- generate/copy/download Markdown
- optional direct save into `content/posts/` and `static/images/` (Chrome/Edge on `https://` or `http://localhost`)

## Deployment

- GitHub Actions workflow at `.github/workflows/hugo-pages.yml` builds and deploys Hugo on every push to `main`.
- New posts in `content/posts/` appear on the site after the Actions run finishes.

## Clean structure (single source of truth)

Only edit these for content/design:

- `content/posts/*.md` (your posts)
- `content/about.md`
- `layouts/` (templates)
- `static/` (assets)
- `config.toml`

Do not manually edit generated output:

- `public/` (local build output only; ignored by git)
- root HTML/XML output files

## Safe publish checklist

1. Add/edit post in `content/posts/`
2. Ensure front matter has:
   - `draft = false`
   - slug with dashes only (no spaces/colon)
3. Preview locally: `hugo server -D`
4. Commit + push to `main`
5. Wait for GitHub Actions deploy to finish

## Analytics

The project includes a privacy-conscious Cloudflare Worker and D1 counter for unique human visitors and aggregate AI reads. It is currently disabled by default.

- Frontend integration kept in repo:
  - `content/stats.md`
  - `layouts/_default/stats.html`
  - `static/js/analytics.js`
  - `layouts/partials/sidebar-tree.html` (Stats link)
  - `layouts/_default/baseof.html` (analytics script hook)
- Active backend implementation:
  - `cloudflare-analytics/`
- Archived alternative, not used:
  - `vercel-analytics/`

Current status:

- `config.toml` uses `analytics_endpoint = ""` (disabled).
- If endpoint is empty, blog works normally and stats calls are skipped.

After deploying the Worker, enable it with:

```toml
[params]
  analytics_endpoint = "https://kaalveniiz-analytics.<your-subdomain>.workers.dev"
```

The public Stats page shows unique human visitors plus AI crawler, AI search, and AI assistant reads for the last completed Hong Kong day and overall through that day. The backend stores only keyed HMAC visitor identifiers and daily AI category totals, never raw IP addresses or crawler identities. AI measurement requires a custom domain proxied through Cloudflare. See `cloudflare-analytics/README.md` for setup and deployment.
