import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MySQL database
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'SoccerMan316;',
  database: process.env.DB_NAME || 'finance_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT 1 as test');
    res.json({ 
      success: true, 
      message: 'Database connection successful!',
      database: process.env.DB_NAME || 'finance_tracker'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      hint: 'Make sure the database exists and the password is correct'
    });
  }
});

// USERS 


// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT user_id, username, email, created_date FROM users ORDER BY user_id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await db.execute('SELECT user_id, username, email, created_date FROM users WHERE user_id = ?', [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password || null;
    const created_date = req.body.created_date;
    
    if (!username || !email || !created_date) {
      return res.status(400).json({ error: 'Missing required fields: username, email, created_date' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, created_date) VALUES (?, ?, ?, ?)',
      [username, email, password, created_date]
    );
    
    res.status(201).json({ 
      message: 'User created successfully',
      user_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user
app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    
    // Build the UPDATE query based on what fields are provided
    let query = 'UPDATE users SET ';
    const values = [];
    
    if (username) {
      query += 'username = ?';
      values.push(username);
    }
    if (email) {
      if (values.length > 0) query += ', ';
      query += 'email = ?';
      values.push(email);
    }
    if (password) {
      if (values.length > 0) query += ', ';
      query += 'password = ?';
      values.push(password);
    }
    
    if (values.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    query += ' WHERE user_id = ?';
    values.push(userId);
    
    const [result] = await db.execute(query, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'User updated successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const [result] = await db.execute('DELETE FROM users WHERE user_id = ?', [userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'User deleted successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// TRANSACTIONS 

// Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM transactions ORDER BY transaction_date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one transaction by ID
app.get('/api/transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    const [rows] = await db.execute('SELECT * FROM transactions WHERE transaction_id = ?', [transactionId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const account_id = req.body.account_id;
    const user_id = req.body.user_id;
    const category_id = req.body.category_id;
    const transaction_date = req.body.transaction_date;
    const amount = parseFloat(req.body.amount);
    const description = req.body.description || null;
    const transaction_type = req.body.transaction_type;
    
    if (!account_id || !user_id || !category_id || !transaction_date || !amount || !transaction_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create the transaction (status defaults to 'pending')
    const [result] = await db.execute(
      'INSERT INTO transactions (account_id, user_id, category_id, transaction_date, amount, description, transaction_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [account_id, user_id, category_id, transaction_date, amount, description, transaction_type, 'pending']
    );
    
    // Update bank account balance
    // Expense subtracts from balance, income adds to balance
    let balanceChange = amount;
    if (transaction_type === 'expense') {
      balanceChange = -amount; // Subtract for expenses
    }
    
    await db.execute(
      'UPDATE bank_accounts SET balance = balance + ? WHERE account_id = ?',
      [balanceChange, account_id]
    );
    
    res.status(201).json({ 
      message: 'Transaction created successfully',
      transaction_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a transaction
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    
    // Get the current transaction to know old amount and type
    const [oldTrans] = await db.execute('SELECT account_id, amount, transaction_type FROM transactions WHERE transaction_id = ?', [transactionId]);
    
    if (oldTrans.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const oldAmount = parseFloat(oldTrans[0].amount);
    const oldType = oldTrans[0].transaction_type;
    const account_id = oldTrans[0].account_id;
    
    // Reverse the old balance change
    let oldBalanceChange = oldAmount;
    if (oldType === 'expense') {
      oldBalanceChange = -oldAmount; // Was subtracted, so add it back
    } else {
      oldBalanceChange = oldAmount; // Was added, so subtract it
    }
    
    // Update bank account balance (reverse old change)
    await db.execute(
      'UPDATE bank_accounts SET balance = balance - ? WHERE account_id = ?',
      [oldBalanceChange, account_id]
    );
    
    // Build the UPDATE query
    const amount = req.body.amount;
    const description = req.body.description;
    const transaction_type = req.body.transaction_type;
    const transaction_date = req.body.transaction_date;
    const status = req.body.status;
    
    let query = 'UPDATE transactions SET ';
    const values = [];
    
    if (amount !== undefined) {
      query += 'amount = ?';
      values.push(amount);
    }
    if (description !== undefined) {
      if (values.length > 0) query += ', ';
      query += 'description = ?';
      values.push(description);
    }
    if (transaction_type) {
      if (values.length > 0) query += ', ';
      query += 'transaction_type = ?';
      values.push(transaction_type);
    }
    if (transaction_date) {
      if (values.length > 0) query += ', ';
      query += 'transaction_date = ?';
      values.push(transaction_date);
    }
    if (status) {
      if (values.length > 0) query += ', ';
      query += 'status = ?';
      values.push(status);
    }
    
    if (values.length === 0) {
      // If no fields to update, restore the balance and return
      await db.execute(
        'UPDATE bank_accounts SET balance = balance + ? WHERE account_id = ?',
        [oldBalanceChange, account_id]
      );
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    query += ' WHERE transaction_id = ?';
    values.push(transactionId);
    
    const [result] = await db.execute(query, values);
    
    // Get the new transaction values
    const newAmount = parseFloat(amount !== undefined ? amount : oldAmount);
    const newType = transaction_type || oldType;
    
    // Apply the new balance change
    let newBalanceChange = newAmount;
    if (newType === 'expense') {
      newBalanceChange = -newAmount; // Subtract for expenses
    }
    
    await db.execute(
      'UPDATE bank_accounts SET balance = balance + ? WHERE account_id = ?',
      [newBalanceChange, account_id]
    );
    
    res.json({ 
      message: 'Transaction updated successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    
    // Get the transaction before deleting to know amount and type
    const [trans] = await db.execute('SELECT account_id, amount, transaction_type FROM transactions WHERE transaction_id = ?', [transactionId]);
    
    if (trans.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const amount = parseFloat(trans[0].amount);
    const transaction_type = trans[0].transaction_type;
    const account_id = trans[0].account_id;
    
    // Delete the transaction
    const [result] = await db.execute('DELETE FROM transactions WHERE transaction_id = ?', [transactionId]);
    
    // Reverse the balance change
    // Expense was subtracted, so add it back
    // Income was added, so subtract it
    let balanceChange = amount;
    if (transaction_type === 'expense') {
      balanceChange = amount; // Was subtracted, so add it back
    } else {
      balanceChange = -amount; // Was added, so subtract it
    }
    
    await db.execute(
      'UPDATE bank_accounts SET balance = balance + ? WHERE account_id = ?',
      [balanceChange, account_id]
    );
    
    res.json({ 
      message: 'Transaction deleted successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADVANCED SQL QUERIES ====================

// JOIN Query: Get transactions with user and category details
app.get('/api/transactions/join', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        t.transaction_id,
        t.transaction_date,
        t.amount,
        t.description,
        t.transaction_type,
        t.status,
        u.username,
        u.email,
        c.category_name,
        ba.account_name
      FROM transactions t
      JOIN users u ON t.user_id = u.user_id
      JOIN categories c ON t.category_id = c.category_id
      JOIN bank_accounts ba ON t.account_id = ba.account_id
      ORDER BY t.transaction_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VIEW Query: Get user monthly summary
app.get('/api/users/:id/monthly-summary', async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await db.execute(`
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m-01') AS month_start,
        SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) AS total_expense,
        SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) -
        SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) AS net_change
      FROM transactions
      WHERE user_id = ?
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m-01')
      ORDER BY month_start DESC
    `, [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stored Procedure Query: Get spending by category
app.get('/api/users/:id/spending-by-category', async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await db.execute(`
      SELECT 
        c.category_name,
        SUM(t.amount) AS total_spent,
        COUNT(t.transaction_id) AS transaction_count
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.user_id = ? AND t.transaction_type = 'expense'
      GROUP BY c.category_id, c.category_name
      ORDER BY total_spent DESC
    `, [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// CATEGORIES 



// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories ORDER BY category_name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bank accounts
app.get('/api/accounts', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM bank_accounts ORDER BY account_name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GOALS

// Get all goals for a user
app.get('/api/goals', async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ error: 'user_id query parameter required' });
    }
    
    const [rows] = await db.execute(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY start_date DESC',
      [userId]
    );
    
    // Calculate current spending for each goal
    const goalsWithProgress = await Promise.all(rows.map(async (goal) => {
      let currentAmount = 0;
      
      if (goal.goal_type === 'spending_limit') {
        // Calculate total expenses for the period
        const startDate = goal.start_date;
        const endDate = goal.end_date || new Date().toISOString().split('T')[0];
        
        const [spending] = await db.execute(`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM transactions
          WHERE user_id = ? 
            AND transaction_type = 'expense'
            AND transaction_date >= ?
            AND transaction_date <= ?
        `, [userId, startDate, endDate]);
        
        currentAmount = parseFloat(spending[0].total || 0);
      } else if (goal.goal_type === 'savings_target') {
        // For savings, use the current_amount field
        currentAmount = parseFloat(goal.current_amount || 0);
      }
      
      return {
        ...goal,
        current_amount: currentAmount,
        is_over_budget: currentAmount > goal.target_amount
      };
    }));
    
    res.json(goalsWithProgress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one goal by ID
app.get('/api/goals/:id', async (req, res) => {
  try {
    const goalId = req.params.id;
    const [rows] = await db.execute('SELECT * FROM goals WHERE goal_id = ?', [goalId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new goal
app.post('/api/goals', async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const goal_name = req.body.goal_name;
    const target_amount = parseFloat(req.body.target_amount);
    const goal_type = req.body.goal_type || 'spending_limit';
    const period = req.body.period || 'monthly';
    const start_date = req.body.start_date;
    
    if (!user_id || !goal_name || !target_amount || !start_date) {
      return res.status(400).json({ error: 'Missing required fields: user_id, goal_name, target_amount, start_date' });
    }
    
    // Calculate end_date based on period if not provided
    let end_date = null;
    if (period === 'weekly') {
      const end = new Date(start_date);
      end.setDate(end.getDate() + 7);
      end_date = end.toISOString().split('T')[0];
    } else if (period === 'monthly') {
      const end = new Date(start_date);
      end.setMonth(end.getMonth() + 1);
      end_date = end.toISOString().split('T')[0];
    } else if (period === 'yearly') {
      const end = new Date(start_date);
      end.setFullYear(end.getFullYear() + 1);
      end_date = end.toISOString().split('T')[0];
    }
    
    const [result] = await db.execute(
      'INSERT INTO goals (user_id, goal_name, target_amount, goal_type, period, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, goal_name, target_amount, goal_type, period, start_date, end_date]
    );
    
    res.status(201).json({ 
      message: 'Goal created successfully',
      goal_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a goal
app.put('/api/goals/:id', async (req, res) => {
  try {
    const goalId = req.params.id;
    
    const goal_name = req.body.goal_name;
    const target_amount = req.body.target_amount;
    const current_amount = req.body.current_amount;
    const goal_type = req.body.goal_type;
    const period = req.body.period;
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;
    
    let query = 'UPDATE goals SET ';
    const values = [];
    
    if (goal_name) {
      query += 'goal_name = ?';
      values.push(goal_name);
    }
    if (target_amount !== undefined) {
      if (values.length > 0) query += ', ';
      query += 'target_amount = ?';
      values.push(target_amount);
    }
    if (current_amount !== undefined) {
      if (values.length > 0) query += ', ';
      query += 'current_amount = ?';
      values.push(current_amount);
    }
    if (goal_type) {
      if (values.length > 0) query += ', ';
      query += 'goal_type = ?';
      values.push(goal_type);
    }
    if (period) {
      if (values.length > 0) query += ', ';
      query += 'period = ?';
      values.push(period);
    }
    if (start_date) {
      if (values.length > 0) query += ', ';
      query += 'start_date = ?';
      values.push(start_date);
    }
    if (end_date !== undefined) {
      if (values.length > 0) query += ', ';
      query += 'end_date = ?';
      values.push(end_date);
    }
    
    if (values.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    query += ' WHERE goal_id = ?';
    values.push(goalId);
    
    const [result] = await db.execute(query, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json({ 
      message: 'Goal updated successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a goal
app.delete('/api/goals/:id', async (req, res) => {
  try {
    const goalId = req.params.id;
    const [result] = await db.execute('DELETE FROM goals WHERE goal_id = ?', [goalId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json({ 
      message: 'Goal deleted successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new bank account
app.post('/api/accounts', async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const account_name = req.body.account_name;
    const balance = req.body.balance || 0.00;
    const account_type = req.body.account_type;
    const bank_name = req.body.bank_name;
    
    if (!user_id || !account_name || !account_type || !bank_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO bank_accounts (user_id, account_name, balance, account_type, bank_name) VALUES (?, ?, ?, ?, ?)',
      [user_id, account_name, balance, account_type, bank_name]
    );
    
    res.status(201).json({ 
      message: 'Bank account created successfully',
      account_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BudgetBuddy+ API server running on port ${PORT}`);
  console.log(`Website available at http://localhost:${PORT}`);
});
