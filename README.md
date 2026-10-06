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

## Deployment configuration

- Set `MONGO_BD` and `JWT_SECRET_TOKEN` in the backend host's secret/environment settings.
- Set `CORS_ORIGINS` to a comma-separated list of exact trusted frontend origins. In development, `http://localhost:3000` is additionally allowed.
- Set `REACT_APP_API_URL` to the deployed backend origin when building the frontend.
- Keep the frontend and backend on HTTPS in production.

## Portfolio walkthrough

When presenting this project, focus on how authenticated user scoping is enforced, how database transactions keep totals consistent, how pagination and indexes support growing transaction history, how monthly budget usage is calculated, and how tests cover validation and report calculations.
