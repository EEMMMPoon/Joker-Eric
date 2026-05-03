# Cap. 621 Daily Test PWA

A Progressive Web App for daily practice of **Cap. 621 — Residential Properties (First-hand Sales) Ordinance** (Hong Kong).

Each day the app serves **6 questions** seeded by the Hong Kong date:
- 3 × Basic
- 2 × Practical
- 1 × Tricky

Questions rotate so you see every question before repeats begin.

---

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173/Joker-Eric/`.

---

## Frontend Deployment (GitHub Pages)

The project is pre-configured for GitHub Pages at `/<repo-name>/`:

```bash
npm run build          # outputs to dist/
```

Push `dist/` to the `gh-pages` branch, or use the GitHub Actions workflow from the [Vite docs](https://vitejs.dev/guide/static-deploy.html#github-pages).

> **`base`** in `vite.config.ts` is set to `'/Joker-Eric/'`. Change this if your repo name differs.

---

## Cloudflare Worker — Push Notification Backend

### 1. Install Wrangler

```bash
cd worker
npm install
```

### 2. Create KV Namespace

```bash
npx wrangler kv namespace create SUBSCRIPTIONS
npx wrangler kv namespace create SUBSCRIPTIONS --preview
```

Copy the returned `id` and `preview_id` values into `worker/wrangler.toml`.

### 3. Set Secrets

```bash
npx wrangler secret put VAPID_PRIVATE_KEY
# Paste: ZvuJlaHmLeglmnCuIKe4FJz7EyCxGOPqbp8C4qrToKA

npx wrangler secret put SEND_SECRET
# Paste a strong random string, e.g.: openssl rand -hex 32
```

Also update `VAPID_EMAIL` in `worker/wrangler.toml`:

```toml
[vars]
VAPID_EMAIL = "mailto:your@email.com"
```

### 4. Deploy Worker

```bash
cd worker
npm run deploy
```

Note the Worker URL (e.g., `https://cap621-push-worker.<your-subdomain>.workers.dev`).

### 5. Set Frontend Environment Variable

Set `VITE_WORKER_URL` at build time so the frontend knows where to send subscriptions:

```bash
VITE_WORKER_URL=https://cap621-push-worker.<subdomain>.workers.dev npm run build
```

Or add it to your CI/CD secrets and reference it in your GitHub Actions workflow.

---

## GitHub Actions — Daily Push

The workflow at `.github/workflows/daily-push.yml` fires at **10:30 UTC (18:30 HKT)** daily.

### Required Secrets (GitHub → Settings → Secrets → Actions)

| Secret | Value |
|--------|-------|
| `WORKER_URL` | Your Cloudflare Worker URL |
| `PUSH_SEND_SECRET` | The `SEND_SECRET` you set via Wrangler |

You can also trigger the workflow manually from the **Actions** tab → **Daily Push Notification** → **Run workflow**.

---

## VAPID Keys

The public key is baked into the frontend:

```
BGHC4LEgcSRLCwSR6ZgPfpwfgNcy_Iftn7McC5HFqg6OlTVdkuB-UwuwGSzJsEfpVZaKIIxYtWo3wqz1WiFWO3k
```

The private key must **only** be stored as a Worker secret — never committed to source control.

---

## iOS Notes

Safari on iOS does not support the Web Push API unless the PWA is **installed to the Home Screen**:

1. Open the app in Safari.
2. Tap the **Share** button → **Add to Home Screen**.
3. Re-open from the Home Screen icon.
4. The **Subscribe** button will then be able to request push permission.

---

## Project Structure

```
src/
  data/questions.ts          # 90+ Cap. 621 questions (30 per category)
  lib/
    dateUtils.ts             # HK date + seeded RNG helpers
    questionSelector.ts      # Daily 6-question picker
    storage.ts               # localStorage helpers
    pushUtils.ts             # VAPID push subscription
  components/
    QuestionCard.tsx         # Card with Show/Hide Answer
    NotificationSetup.tsx    # Permission + subscribe UI
  App.tsx                    # Main app shell
worker/
  src/index.ts               # Cloudflare Worker (subscribe + send)
  wrangler.toml
.github/workflows/
  daily-push.yml             # Scheduled push trigger
```
