# BudgetBuddy+ - Personal Finance Tracker

A full-stack personal finance application that helps you track income, expenses, and spending goals. Create budgets, monitor transactions, and get visual alerts when you exceed your spending limits. Built with Node.js, Express, MySQL, and  JavaScript.

## Setup Steps

### Prerequisites
- MySQL Server installed and running
- Node.js (v14+) and npm installed

### 1. Database Setup
1. Open MySQL Workbench
2. Run `database/schema.sql` to create the database and tables
3. Run `database/seed.sql` to insert sample data

### 2. API Server Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   DB_NAME=finance_tracker
   PORT=3000
   ```

## How to Run the API

1. Start the server:
   ```bash
   npm start
   ```

2. The server will run on `http://localhost:3000`

3. Access the web client at `http://localhost:3000` in your browser

## API Endpoints

**Users CRUD:** `GET/POST/PUT/DELETE /api/users`  
**Transactions CRUD:** `GET/POST/PUT/DELETE /api/transactions`  
**Advanced Queries:**
- `GET /api/transactions/join` - JOIN query
- `GET /api/users/:id/monthly-summary` - VIEW query
- `GET /api/users/:id/spending-by-category` - Stored procedure

## Data Model Overview

The database consists of five main tables:

1. **users** - User accounts (user_id, username, email, password, created_date)
2. **bank_accounts** - Bank accounts linked to users (account_id, user_id, account_name, balance, account_type, bank_name)
3. **categories** - Transaction categories (category_id, category_name, description, icon)
4. **transactions** - Financial transactions (transaction_id, account_id, user_id, category_id, transaction_date, amount, description, transaction_type, status)
5. **goals** - Spending and savings goals (goal_id, user_id, goal_name, target_amount, current_amount, goal_type, period, start_date, end_date)

**Relationships:**
- Users can have multiple bank accounts (one-to-many)
- Users can have multiple transactions (one-to-many)
- Users can have multiple goals (one-to-many)
- Bank accounts can have multiple transactions (one-to-many)
- Categories can have multiple transactions (one-to-many)
- Transactions link users, accounts, and categories together

**Key Features:**
- Transactions default to 'pending' status and can be updated to 'approved'
- Balance automatically updates when transactions are created/updated/deleted
- Supports both income and expense transaction types
- Goals track spending limits and savings targets with automatic progress calculation
- Visual alerts (red indicators) when spending exceeds goal limits
