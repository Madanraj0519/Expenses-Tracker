# Expense Tracker

A full-stack personal finance application for recording income and expenses, tracking budgets, and reviewing monthly cash flow. This project is built with React, Redux Toolkit, Express, and MongoDB.

## Features

- JWT-protected accounts and user-scoped finance records.
- Create, edit, search, sort, filter, paginate, and delete income and expenses.
- Income and expense totals updated alongside transaction changes in MongoDB transactions.
- Monthly overall and category budgets with progress indicators and 80%/100% threshold warnings.
- Dashboard charts for monthly income/expense trends and category spending.
- Monthly report with income, expenses, net savings, and savings rate.
- Explainable spending insights for budget pace, month-over-month changes, and unusual activity.
- Optional expense category suggestions based on the user's own history and conservative merchant keywords; suggestions require confirmation.
- Month-scoped CSV and PDF exports.
- Responsive dashboard, light/dark themes, and accessible form controls.
- Automatic region-aware currency display and entry for India (INR), United States (USD), United Kingdom (GBP), Eurozone (EUR), Canada (CAD), Australia (AUD), and Japan (JPY).

## Project structure

```text
Backend/    Express API, Mongoose models, controllers, routes, and Node tests
Frontend/   React application, dashboard components, and Jest tests
```

The API separates authentication, transactions, and budgets into route/controller/model layers. Transaction creation, editing, and deletion use MongoDB sessions so transaction records and denormalized user totals succeed or roll back together. For this to work, configure MongoDB as a replica set (MongoDB Atlas provides this by default).

## Requirements

- Node.js 24.x (the frontend package specifies this runtime)
- npm
- MongoDB running as a replica set

## Run locally

1. Configure `Backend/.env`:

   ```dotenv
   PORT=8000
   MONGO_BD=mongodb://127.0.0.1:27017/expenses_tracker?replicaSet=rs0
   JWT_SECRET_TOKEN=replace-with-a-long-random-secret
   CORS_ORIGINS=http://localhost:3000
   ```

   Do not commit `.env` or real credentials. `MONGO_BD` must point to a replica-set-enabled MongoDB deployment.

2. Configure `Frontend/.env.local`:

   ```dotenv
   REACT_APP_API_URL=http://localhost:8000
   ```

   If omitted, the frontend uses the currently configured hosted API endpoint.

3. Start the API in one terminal:

   ```powershell
   cd Backend
   npm install
   npm run dev
   ```

4. Start the frontend in another terminal:

   ```powershell
   cd Frontend
   npm install
   npm start
   ```

   The app runs at `http://localhost:3000`; the API health endpoint is `http://localhost:8000/`.

## Tests and production build

Run backend validation tests:

```powershell
cd Backend
npm test
```

Run frontend tests and create a production build:

```powershell
cd Frontend
npm test -- --watchAll=false
npm run build
```

GitHub Actions runs backend tests, frontend tests, and the frontend production build for pushes and pull requests.

## API overview

All transaction and budget routes below require `Authorization: Bearer <access-token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/registerUser` | Create an account |
| POST | `/api/auth/loginUser` | Authenticate and receive a JWT |
| GET | `/api/income/getIncome` | Search and paginate income records |
| GET | `/api/income/getIncomeChart` | Fetch aggregated monthly/category income |
| POST / PUT / DELETE | `/api/income/addIncome`, `/api/income/updateIncome/:id`, `/api/income/deleteIncome/:id` | Manage income records |
| GET | `/api/expense/getExpense` | Filter, search, sort, and paginate expenses |
| GET | `/api/expense/getExpenseChart` | Fetch aggregated monthly/category expenses |
| POST / PUT / DELETE | `/api/expense/addExpense`, `/api/expense/updateExpense/:id`, `/api/expense/deleteExpense/:id` | Manage expense records |
| GET / PUT | `/api/budget?month=YYYY-MM`, `/api/budget` | Read or create/update a monthly budget |
| DELETE | `/api/budget/:id` | Remove a budget |
| GET | `/api/insights/spending?month=YYYY-MM` | Read explainable, user-scoped monthly spending insights |
| POST | `/api/insights/category-suggestion` | Suggest an expense category from a description and the authenticated user's history |

Transaction list endpoints accept `page`, `limit` (maximum 100), `search`, and supported filters such as `category`, date range, amount range, and sort order. Budget writes accept a `month` in `YYYY-MM` format, a positive `amount`, and an optional `category` (`null` or omitted means overall budget).

## Smart insights and privacy

The spending insight engine currently uses transparent server-side calculations rather than an external LLM: it compares budget usage and daily spending pace, flags month-over-month category changes only when the difference is material, and suppresses unusual-spending claims until there are at least two historical months and seven elapsed days. Category suggestions use the authenticated user's own saved descriptions first, followed by a small keyword map. The displayed match strength is a heuristic, not a calibrated probability. Suggestions never overwrite a transaction automatically, and no financial data is sent to a third-party AI service. This keeps the feature useful and explainable while leaving room for an opt-in model integration later.

## Regional currencies

The dashboard detects a supported region from the browser locale (India/INR is the fallback) and provides a region selector to override it. Supported currencies are INR, USD, GBP, EUR, CAD, AUD, and JPY. Live USD-base rates are fetched from [open.er-api.com](https://open.er-api.com/) and refreshed at least every 24 hours; the last saved rate remains available with a stale-rate indicator if the service cannot be reached. If there is no usable rate, local-currency entry is disabled instead of saving an incorrectly converted value.

Amounts already stored by the app are treated as USD base amounts. New transaction and budget amounts entered in the selected currency are converted to USD before saving; charts, totals, budgets, insights, reports, and exports convert that base amount to the selected currency for presentation. Existing records are not rewritten. Displayed conversions use the latest available rate, not the exchange rate on the transaction date; changing the selected region does not change stored account balances in base USD.

## Deployment configuration

- Set `MONGO_BD` and `JWT_SECRET_TOKEN` in the backend host's secret/environment settings.
- Set `CORS_ORIGINS` to a comma-separated list of exact trusted frontend origins. In development, `http://localhost:3000` is additionally allowed.
- Set `REACT_APP_API_URL` to the deployed backend origin when building the frontend.
- Keep the frontend and backend on HTTPS in production.

## Portfolio walkthrough

When presenting this project, focus on how authenticated user scoping is enforced, how database transactions keep totals consistent, how pagination and indexes support growing transaction history, how monthly budget usage is calculated, and how tests cover validation and report calculations.
