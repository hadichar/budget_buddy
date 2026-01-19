# BudgetBuddy+ React Client

A simple React version of the dashboard that makes the budget app more user-friendly.

## What This Does

This adds React components to show:
- **Dashboard Stats**: Total accounts, transactions, and balance
- **Transaction List**: A clean list of all your transactions

## How to Run

1. **First, make sure the backend server is running:**
   ```bash
   cd ../server
   npm start
   ```

2. **Install dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Start the React app:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - The React app will run on `http://localhost:5173`
   - The original app is still at `http://localhost:3000`

## How It Works

- The React app reads the logged-in user from `localStorage` (set by the original app)
- It shows a simple dashboard with stats and transactions
- All components are beginner-friendly with clear comments

## Files

- `src/App.jsx` - Main app component
- `src/components/DashboardStats.jsx` - Shows statistics cards
- `src/components/TransactionList.jsx` - Shows list of transactions
- `src/components/StatCard.jsx` - Reusable stat card component
- `src/api.js` - Simple API helper functions
