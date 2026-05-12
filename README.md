# Coupon & Reorder Management

Internal tool for issuing and tracking customer compensation coupons.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **SQLite** via `better-sqlite3` — data stored in `./data/coupons.db`

## Getting started

```bash
cd coupon-management

# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The database is created and seeded automatically on first run — no setup required.

## Key pages

| Route       | Description                          |
|-------------|--------------------------------------|
| `/`         | Homepage — select a coupon type      |
| `/issue`    | Coupon request form (add `?type=...`)|
| `/success`  | Confirmation + coupon code display   |
| `/admin`    | Records table with search/filter     |

## Important files

```
lib/
  db.ts          — SQLite setup, schema, seed data
  constants.ts   — Coupon types, problem sources, categories
  types.ts       — TypeScript interfaces

app/
  page.tsx                  — Homepage
  issue/IssueForm.tsx       — Form client component
  issue/page.tsx            — Form page (server wrapper)
  success/page.tsx          — Success page
  admin/page.tsx            — Admin records table
  api/issue-coupon/route.ts — POST: assign coupon & save record
  api/reorders/route.ts     — GET: list records with filters
```

## How coupon assignment works

1. Staff selects a coupon type and fills in the form.
2. On submit, `POST /api/issue-coupon` runs a **SQLite transaction**:
   - Queries `SELECT ... WHERE type = ? AND is_used = 0 ORDER BY id ASC LIMIT 1`
   - Creates the `reorders` record
   - Updates the coupon: `is_used = 1, used_at = now, assigned_reorder_id = <new id>`
3. The transaction is atomic — no race conditions.
4. The coupon code is returned only in the success response and never shown before submission.

## Adding coupon codes

Currently you can add codes directly to the SQLite database:

```sql
INSERT INTO coupons (code, type, country, discount_value, discount_type)
VALUES ('GGP-MY-25RM-NEWCODE', 'GGP MY RM25', 'MY', 25, 'fixed');
```

A CSV import feature is planned for a future version.

## Future improvements (not yet built)

- Google SSO / user authentication
- User roles (admin vs. staff)
- Import coupon codes from CSV
- Export records to CSV
- Analytics dashboard
- Email notification on coupon issue
- Ecommerce system integration
- Pagination for large record sets
