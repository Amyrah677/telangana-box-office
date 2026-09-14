# Telangana Box Office — Collector Ready

This build keeps the working Supabase/Vercel dashboard and adds a normalized collector.

## What is included
- `/api/collector` — POST normalized show/seat snapshots into Supabase.
- `/api/cron` — 15-minute Vercel Cron hook.
- `vercel.json` — `*/15 * * * *`.
- `snapshot_view` — dashboard-friendly view.
- Source status fields so observed/estimated data is not presented as verified ticket sales.

## Important source rule
Do not bypass CAPTCHA, login, anti-bot controls, robots restrictions, private endpoints, or other access controls.
For BookMyShow, the official Partner app is restricted to registered cinema partners and provides real-time ticket sales/revenue, show/movie/seat details. Connect an authorized source endpoint when one is available.

## Collector payload example
POST `/api/collector`:
```json
{
  "movie":"Mandaadi",
  "language":"Telugu",
  "district":"Karimnagar",
  "centre":"Karimnagar",
  "theatre":"Asian Paradise",
  "screen":"Screen 1",
  "show_time":"2026-09-14T21:45:00+05:30",
  "ticket_price":200,
  "total_seats":250,
  "available_seats":90,
  "source":"authorized_partner",
  "source_status":"verified"
}
```

The endpoint calculates occupancy and estimated tickets/gross when enough fields are supplied.

## Deploy
1. Run `supabase/schema.sql` in the fresh Supabase project's SQL Editor if the schema is not already there.
2. Keep the existing Vercel Supabase URL and publishable key.
3. Deploy this project to the same Vercel project.
4. Add `COLLECTOR_CRON_SECRET`.
5. Only after receiving an authorized source endpoint, add `COLLECTOR_SOURCE_URL` and optional `COLLECTOR_SOURCE_TOKEN`.

## Note
The 15-minute cron is ready, but it cannot magically obtain private BookMyShow/District data without an authorized source. Once such a source is connected, the cron will fetch JSON and ingest it automatically.
