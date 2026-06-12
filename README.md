# Royal Sanitary House — Stock Ledger (POC)

A simple inventory tracking app: item master, stock in/out logging, search,
low-stock dashboard, and an activity log. Built with React + Vite + Tailwind,
data stored in Supabase (free Postgres), deployable on Vercel for free.

## 1. Set up Supabase (free database)

1. Go to https://supabase.com and create a free account / project.
2. Once your project is ready, open **SQL Editor** → **New query**.
3. Copy the contents of `supabase_schema.sql` (in this folder) and run it.
   This creates the `items` and `stock_movements` tables, sets up access
   policies, and adds 3 sample items.
4. Go to **Project Settings → API**. Copy:
   - **Project URL** → this is `VITE_SUPABASE_URL`
   - **anon public key** → this is `VITE_SUPABASE_ANON_KEY`

## 2. Run locally

```bash
npm install
cp .env.example .env
# edit .env and paste your Supabase URL + anon key
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## 3. Deploy to Vercel (free)

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com → **Add New Project** → import the repo.
3. Vercel auto-detects Vite. Before deploying, add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (Project Settings → Environment Variables — add for Production, Preview, and Development)
4. Click **Deploy**. You'll get a live URL like `your-app.vercel.app`.

That's it — share that URL with the merchant's staff. Works on mobile browsers.

## How to use it

- **Items tab**: search any item, see stock level vs. low-stock threshold
  (red gauge = needs reorder), tap **+** to log stock in (purchase/restock)
  or **−** to log stock out (sale/usage). Tap the pencil to edit an item or
  change its low-stock threshold.
- **Dashboard**: quick stats, a "Needs reordering" list, and recently moved
  items — use this for your baseline/success metrics.
- **Activity**: a running log of every stock movement with timestamps.

## Notes for the 3-week POC

- Seed the `items` table with your top 50–100 SKUs (edit directly in the
  Supabase Table Editor, or add via the app's "Add item" button).
- The anon-key policy in `supabase_schema.sql` allows full read/write —
  fine for an internal POC. If you later need per-staff logins, add
  Supabase Auth and tighten the row-level security policies.
- To measure your success metric (time to confirm stock), time a few staff
  searches before rollout vs. after.
