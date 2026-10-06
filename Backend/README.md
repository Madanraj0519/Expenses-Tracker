# Expense Tracker API

Express and MongoDB API for account authentication, income and expense records, and monthly budgets. Controllers are grouped by feature, with Mongoose schemas in `Model/`, routes in `Router/`, and shared validation/error helpers in `utils/`.

## Setup

Requires Node.js 24.x and a replica-set-enabled MongoDB deployment. Transaction create/update/delete operations use MongoDB sessions to keep user totals and transaction records atomic.

Create `Backend/.env`:

```dotenv
PORT=8000
MONGO_BD=mongodb://127.0.0.1:27017/expenses_tracker?replicaSet=rs0
JWT_SECRET_TOKEN=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:3000
```

Install and start:

```powershell
npm install
npm run dev
```

The API listens on port 8000 by default. `GET /` is the health endpoint.

## Scripts

- `npm start` — start the API.
- `npm run dev` — start with nodemon.
- `npm test` — run Node's built-in test runner.

## Routes

- `/api/auth` — registration and login.
- `/api/income` — authenticated income CRUD and aggregated chart data.
- `/api/expense` — authenticated expense CRUD and aggregated chart data.
- `/api/budget` — authenticated monthly overall/category budgets.
- `/api/insights/spending?month=YYYY-MM` — user-scoped, explainable monthly budget-pace and category trend insights.
- `/api/insights/category-suggestion` — conservative expense category suggestions from the signed-in user's history and common description keywords.

Transaction list routes accept pagination (`page`, `limit`), search, and filtering. All transaction queries are scoped to the authenticated user.

Smart insights are computed from the user's expense aggregates; no external AI provider is called. Month-over-month changes require at least a 30% and $20 difference; unusual-spending comparisons require two previous months with category activity, at least seven elapsed days, and a 50%/$50 projected difference. Category suggestions are advisory, the displayed match strength is heuristic rather than calibrated, and users must accept a suggestion before saving.

Never commit `.env` or credentials. In production, configure exact comma-separated frontend origins in `CORS_ORIGINS`.
