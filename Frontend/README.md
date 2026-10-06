# Expense Tracker frontend

Responsive React application for tracking income, expenses, and monthly budgets. The dashboard includes cash-flow charts, category summaries, monthly net-savings reporting, and CSV/PDF exports.

## Requirements

- Node.js 24.x
- npm
- The Expense Tracker backend API

## Local development

Create `Frontend/.env.local` to point the app to a local API:

```dotenv
REACT_APP_API_URL=http://localhost:8000
```

Install and start:

```powershell
npm install
npm start
```

The app runs at `http://localhost:3000`. If `REACT_APP_API_URL` is not set, requests use the hosted API configured as the project default.

## Scripts

- `npm start` — run the development server.
- `npm test -- --watchAll=false` — run Jest tests once.
- `npm run build` — create an optimized production build in `build/`.

## Application structure

- `src/Pages/` — sign-in, registration, and dashboard pages.
- `src/Components/` — finance forms, lists, charts, budgets, reports, and exports.
- `src/Feature/Auth/` and `src/App/` — Redux Toolkit authentication state and store.
- `src/Constant/Backend/` — API client, base URL, and request/response handling.
- `src/utils/` — shared finance calculations.

The client sends JWT bearer tokens to protected routes. For local setup, run the backend separately and configure its `CORS_ORIGINS` to include `http://localhost:3000`.

The dashboard includes explainable, server-calculated spending insights. Expense-category suggestions use the signed-in user's transaction history and simple description keywords; they are suggestions only and require user confirmation. No external AI provider receives transaction data.

## Production build configuration

Set `REACT_APP_API_URL` in the frontend hosting provider before building to select the deployed API. Keep the frontend API origin on HTTPS in production.
