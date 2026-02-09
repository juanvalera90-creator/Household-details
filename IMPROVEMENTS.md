# Improvements & Optimizations

Suggestions for further improving the household expenses app, beyond what was already applied.

---

## Already applied (this pass)

- **Shared API URL and formatCurrency** – `frontend/src/lib/api.ts` and `frontend/src/lib/format.ts`; components use these instead of duplicating constants.
- **Single Prisma instance** – `backend/src/db.ts` exports one `PrismaClient`; all routes import it (avoids multiple connection pools).
- **Export CSV error handling** – Group page checks `response.ok` before reading the blob and shows a proper error message on failure.
- **Tabs refactor** – Group page tabs are driven by an array and mapped, so adding/removing tabs is easier.

---

## Frontend

### Performance
- **Summary/Charts data** – Both tabs call the same summary API. Consider caching the last summary (by `groupId` + `selectedMonth`) so switching between Summary and Charts doesn’t refetch when the period is unchanged.
- **Recorded list** – If a group has many expenses, the list is all in memory. For very large lists, consider virtualized scrolling (e.g. `react-window`) or pagination by month.
- **Images / PWA** – If you add images or more assets, use Next.js `Image` and ensure the service worker caches only what’s needed.

### UX & accessibility
- **Loading / error states** – Group page shows “Loading...” but doesn’t show errors in the UI (e.g. “Couldn’t load group”). Consider error state + retry for `loadGroup`, `loadExpenses`, `loadBalances`.
- **Focus management** – When opening Edit on an expense, focus the first input. When closing a modal or going back, restore focus where appropriate.
- **Keyboard / screen readers** – Tab buttons could use `role="tab"`, `aria-selected`, and `aria-controls` for the panel; collapse buttons could use `aria-expanded`.
- **Empty states** – Add short guidance when there are no groups, no expenses, or no data for the selected month (some exist; keep them consistent and friendly).

### Code quality
- **Typing** – Replace `expenses: any[]` and similar in the group page with a proper `Expense` type (e.g. from a shared `types` file or from the component that owns the shape).
- **Refresh after mutation** – After add/edit/delete expense, Summary and Charts don’t refetch; they rely on the parent’s `expenses`/`balances`. If you want Summary/Charts to reflect new data without switching tabs, trigger a refetch or invalidate cached summary when `handleExpenseAdded` / `handleExpenseUpdated` / `handleExpenseDeleted` run.

---

## Backend

### Robustness
- **Expenses GET `month`** – Normalize `req.query.month` (e.g. string vs array and trim) like in `summary` and `export`, so `?month=all` or repeated params don’t break.
- **Validation** – Use a validation layer (e.g. Zod, Joi) for request bodies and query params (create group, create/update expense, summary/export month). Return 400 with clear messages for invalid input.
- **PUT expense** – Return 404 when the expense id doesn’t exist instead of letting Prisma throw; catch and map to a consistent JSON error response.
- **Idempotency / duplicates** – If needed, consider idempotency for create-group or create-expense (e.g. idempotency key header) to avoid duplicate creation on retries.

### Performance
- **Indexes** – Prisma schema already has `@@index([date])` on Expense; if you add filters by `groupId` + `date` often, a composite index may help. Measure before adding.
- **Summary response size** – Summary currently returns the full `expenses` array. If the list is huge for “all months”, consider omitting it or paginating when not needed by the client.

### Security / ops
- **Rate limiting** – Add rate limiting (e.g. `express-rate-limit`) on public or write endpoints to reduce abuse.
- **CORS** – Restrict `cors()` origin in production to your frontend origin(s) instead of allowing all.
- **Env** – Ensure production uses a single `DATABASE_URL` and that secrets are not committed.

---

## DevOps / DX

- **API types** – Generate a shared OpenAPI spec or TypeScript types from the backend and consume them in the frontend to keep request/response types in sync.
- **E2E tests** – Add a few Playwright/Cypress flows (e.g. create group → add expense → see Summary) to protect regressions.
- **Error tracking** – In production, send frontend and backend errors to a service (e.g. Sentry) for debugging.

---

## Optional features

- **Default “All months”** – Make the default period “All months” in Summary/Charts so first-time users see full history.
- **Date range** – Allow “from–to” date range in addition to single month and “all”.
- **Recurring expenses** – Model and UI for recurring entries (e.g. rent monthly).
- **Offline** – Use the existing service worker to cache GETs and queue POSTs when offline, then sync when back online.

You can tackle these in order of impact (e.g. error handling and validation first, then caching and performance).
