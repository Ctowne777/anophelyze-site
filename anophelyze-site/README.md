# Anophelyze — Placeholder Site

A single-page "coming soon" placeholder for [anophelyze.com](https://anophelyze.com). Clean scientific/biotech aesthetic with an animated SVG line-art mosquito. No dependencies.

## Files

- `index.html` — the page (self-contained: styles + SVG inline)
- `server.js` — zero-dependency Node static server (honors Railway's `PORT`)
- `package.json` — `npm start` runs the server
- `railway.json` — Railway build/deploy config with `/healthz` health check

## Run locally

```bash
npm start
# open http://localhost:3000
```

No `npm install` needed — there are no dependencies.

## Deploy to Railway

**Option A — from GitHub (recommended)**

1. Push this folder to a GitHub repo.
2. In Railway: **New Project → Deploy from GitHub repo** → pick the repo.
3. Railway auto-detects Node, runs `npm start`, and assigns a URL. Done.

**Option B — from the CLI**

```bash
npm i -g @railway/cli
railway login
railway init        # create a new project
railway up          # build & deploy this directory
```

## Point anophelyze.com at it

1. In your Railway service: **Settings → Networking → Custom Domain** → add `anophelyze.com` (and `www.anophelyze.com`).
2. Railway shows a CNAME (and for the root domain, either an A record or a CNAME/ALIAS, depending on your DNS provider).
3. Add those records at your domain registrar. HTTPS is provisioned automatically once DNS resolves.

## Editing later

Everything visual lives in `index.html`. To swap the mosquito, replace the inline `<svg>` in the `.mark` div. To change the accent color, edit `--accent` in the `:root` block.
