# Deployment Split Guide (Frontend + Backend)

This project can be deployed with frontend and backend separated.

## Recommended split

- Frontend apps:
  - `frontend/customer-storefront`
  - `frontend/admin-panel`
- Backend stack:
  - `services/api-gateway`
  - `services/user-service`
  - other services + `postgres` + `redis`

## Option A (easiest free path)

- Deploy backend on one free VM (Oracle Cloud Always Free) with Docker Compose.
- Deploy frontends on static hosts (Vercel/Netlify/Cloudflare Pages).

## Backend host setup

1. Run backend services on VM with Docker Compose.
2. Expose only gateway publicly (`api.yourdomain.com`).
3. Keep DB/Redis private (no public ports).
4. Set env vars:
   - `USER_SERVICE_URL=http://user-service:3001`
   - `DATABASE_URL=<your-supabase-connection-string>?sslmode=require`
   - `CUSTOMER_STOREFRONT_URL=https://shop.yourdomain.com`
   - `ADMIN_PANEL_URL=https://admin.yourdomain.com`
5. Use HTTPS (Let's Encrypt via Nginx/Caddy).

## Frontend host setup

Set environment variable on both frontend deployments:

- `REACT_APP_API_URL=https://api.yourdomain.com`

Customer storefront URL:

- `https://shop.yourdomain.com`

Admin panel URL:

- `https://admin.yourdomain.com`

## Supabase env template

- Use `.env.supabase.example` as a starting point.
- Copy it to `.env.supabase` and run compose with:
  - `docker compose --env-file .env.supabase up -d --build`

## SQL migrations without Prisma

- Use `scripts/migrate.sh` for SQL migration tracking via `schema_migrations`.
- First run (baseline):
  - `DATABASE_URL='<supabase-url>' ./scripts/migrate.sh --baseline`
- Apply incremental migrations from `database/migrations/*.sql`:
  - `DATABASE_URL='<supabase-url>' ./scripts/migrate.sh`
- Check status:
  - `DATABASE_URL='<supabase-url>' ./scripts/migrate.sh --status`

## CORS updates

In `services/api-gateway/src/server.js`, ensure CORS `origin` includes your real frontend domains.

## Share links and OG previews

- Merchant share links should use gateway endpoint:
  - `https://api.yourdomain.com/shop/<store-slug>`
- This endpoint serves OG tags and redirects to storefront.

## Production checklist

- Set strong secrets (`JWT_SECRET`, DB passwords).
- For Supabase, ensure DB URL includes `sslmode=require`.
- Set PayFast credentials in backend env.
- Turn off dev settings and debug logs.
- Add backups for Postgres.
