const API_BASE = '/api';
let currentUser = null;

window.onload = () => checkLoginStatus();

// ==================== HELPER FUNCTIONS ====================
const $ = id => document.getElementById(id);
const hideAllScreens = () => document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
const filterUserData = (data, userId) => data.filter(item => item.user_id == userId);
const apiCall = async (endpoint, options = {}) => {
    const res = await fetch(API_BASE + endpoint, { headers: { 'Content-Type': 'application/json' }, ...options });
    return { ok: res.ok, data: await res.json() };
};

// ==================== AUTHENTICATION ====================
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        localStorage.getItem('setupComplete') === 'true' ? showApp() : showSetup();
    } else {
        showLogin();
    }
}

function showLogin() {
    hideAllScreens();
    $('login-screen').classList.add('active');
    $('login-form-view').style.display = 'block';
    $('signup-form-view').style.display = 'none';
}

function showSignup() {
    $('login-form-view').style.display = 'none';
    $('signup-form-view').style.display = 'block';
}

async function handleLogin(event) {
    event.preventDefault();
    try {
        const { data: users } = await apiCall('/users');
        const foundUser = users.find(u => u.username === $('login-username').value);
        if (foundUser) {
            currentUser = foundUser;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.getItem('setupComplete') === 'true' ? showApp() : showSetup();
        } else {
            alert('Username not found. Please sign up first.');
        }
    } catch (error) {
        alert('Error logging in: ' + error.message);
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const userData = {
        username: $('signup-username').value,
        email: $('signup-email').value,
        password: $('signup-password').value,
        created_date: $('signup-date').value
    };
    try {
        const { ok, data } = await apiCall('/users', { method: 'POST', body: JSON.stringify(userData) });
        if (ok) {
            const { data: newUser } = await apiCall('/users/' + data.user_id);
            currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.removeItem('setupComplete');
            alert('Account created successfully!');
            showSetup();
        } else {
            alert('Error creating account: ' + data.error);
        }
    } catch (error) {
        alert('Error creating account: ' + error.message);
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('setupComplete');
        showLogin();
    }
}

// ==================== SETUP WIZARD ====================
function showSetup() {
    hideAllScreens();
    $('setup-screen').classList.add('active');
    loadDropdowns();
}

async function addBankAccount(event) {
    event.preventDefault();
    if (!currentUser) return alert('Please login first');
    const accountData = {
        user_id: currentUser.user_id,
        account_name: $('account-name').value,
        account_type: $('account-type').value,
        bank_name: $('bank-name').value,
        balance: parseFloat($('account-balance').value)
    };
    try {
        const { ok, data } = await apiCall('/accounts', { method: 'POST', body: JSON.stringify(accountData) });
        if (ok) {
            alert('Bank account added successfully!');
            event.target.reset();
            finishSetup();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error adding account: ' + error.message);
    }
}

function finishSetup() {
    localStorage.setItem('setupComplete', 'true');
    showApp();
}

// ==================== MAIN APP ====================
function showApp() {
    hideAllScreens();
    $('app-screen').classList.add('active');
    showScreen('dashboard');
}

function showScreen(screenName) {
    document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    $(screenName + '-screen').classList.add('active');
    document.querySelector(`[onclick="showScreen('${screenName}')"]`)?.classList.add('active');
    
    const loaders = { dashboard: loadDashboard, transactions: loadTransactions, profile: loadProfile };
    loaders[screenName]?.();
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
    if (!currentUser) return;
    try {
        const [{ data: allAccounts }, { data: allTransactions }] = await Promise.all([
            apiCall('/accounts'),
            apiCall('/transactions')
        ]);
        const userAccounts = filterUserData(allAccounts, currentUser.user_id);
        const userTransactions = filterUserData(allTransactions, currentUser.user_id);
        const totalBalance = userAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
        
        $('total-accounts').textContent = userAccounts.length;
        $('total-balance').textContent = '$' + totalBalance.toFixed(2);
        $('total-transactions').textContent = userTransactions.length;
        $('current-username').textContent = currentUser.username;
        await loadGoals();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ==================== GOALS ====================
async function loadGoals() {
    if (!currentUser) return;
    try {
        const { data: goals } = await apiCall(`/goals?user_id=${currentUser.user_id}`);
        const goalsList = $('goals-list');
        
        if (goals.length === 0) {
            goalsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No goals yet. Create your first goal to start tracking!</p>';
            return;
        }
        
        goalsList.innerHTML = goals.map(goal => {
            const current = parseFloat(goal.current_amount || 0);
            const target = parseFloat(goal.target_amount);
            const percentage = Math.min((current / target) * 100, 100);
            const isOver = goal.is_over_budget;
            const statusClass = isOver ? 'goal-over' : (percentage >= 80 ? 'goal-warning' : 'goal-ok');
            const statusIcon = isOver ? '🔴' : (percentage >= 80 ? '🟡' : '🟢');
            
            return `
                <div class="goal-card ${statusClass}">
                    <div class="goal-header">
                        <div>
                            <h4>${statusIcon} ${goal.goal_name}</h4>
                            <p class="goal-meta">${goal.goal_type === 'spending_limit' ? 'Spending Limit' : 'Savings Target'} • ${goal.period}</p>
                        </div>
                        <button onclick="deleteGoal(${goal.goal_id})" class="btn btn-danger btn-small">Delete</button>
                    </div>
                    <div class="goal-progress">
                        <div class="goal-amounts">
                            <span class="goal-current">$${current.toFixed(2)}</span>
                            <span class="goal-separator">/</span>
                            <span class="goal-target">$${target.toFixed(2)}</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${percentage}%; background-color: ${isOver ? '#dc3545' : (percentage >= 80 ? '#ffc107' : '#28a745')};"></div>
                        </div>
                        <div class="goal-status">
                            ${isOver 
                                ? `<span class="status-over">⚠️ Over budget by $${(current - target).toFixed(2)}</span>`
                                : `<span class="status-remaining">$${Math.max(0, target - current).toFixed(2)} remaining</span>`
                            }
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading goals:', error);
        $('goals-list').innerHTML = '<p style="color: #dc3545;">Error loading goals. Please try again.</p>';
    }
}

function showAddGoal() {
    $('add-goal-form').style.display = 'block';
    $('goal-start-date').value = new Date().toISOString().split('T')[0];
}

function hideAddGoal() {
    $('add-goal-form').style.display = 'none';
    $('add-goal-form').querySelector('form').reset();
}

async function createGoal(event) {
    event.preventDefault();
    if (!currentUser) return;
    const goalData = {
        user_id: currentUser.user_id,
        goal_name: $('goal-name').value,
        target_amount: $('goal-target').value,
        goal_type: $('goal-type').value,
        period: $('goal-period').value,
        start_date: $('goal-start-date').value
    };
    try {
        const { ok, data } = await apiCall('/goals', { method: 'POST', body: JSON.stringify(goalData) });
        if (ok) {
            hideAddGoal();
            await loadGoals();
            alert('Goal created successfully!');
        } else {
            alert('Error creating goal: ' + data.error);
        }
    } catch (error) {
        alert('Error creating goal: ' + error.message);
    }
}

async function deleteGoal(goalId) {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
        const { ok, data } = await apiCall(`/goals/${goalId}`, { method: 'DELETE' });
        if (ok) {
            await loadGoals();
            alert('Goal deleted successfully!');
        } else {
            alert('Error deleting goal: ' + data.error);
        }
    } catch (error) {
        alert('Error deleting goal: ' + error.message);
    }
}

// ==================== TRANSACTIONS ====================
async function loadTransactions() {
    if (!currentUser) return;
    try {
        const { data: allTransactions } = await apiCall('/transactions');
        const userTransactions = filterUserData(allTransactions, currentUser.user_id);
        const container = $('transactions-list');
        
        if (userTransactions.length === 0) {
            container.innerHTML = '<p class="loading">No transactions found. Click "Add Transaction" to create one!</p>';
            return;
        }
        
        container.innerHTML = userTransactions.map(trans => {
            const badgeClass = trans.transaction_type === 'expense' ? 'badge-expense' : 'badge-income';
            return `
                <div class="data-item">
                    <div class="data-item-info">
                        <strong>$${parseFloat(trans.amount).toFixed(2)} 
                            <span class="badge ${badgeClass}">${trans.transaction_type}</span>
                        </strong>
                        <div>${trans.description || 'No description'}</div>
                        <div>Date: ${trans.transaction_date}</div>
                    </div>
                    <div class="data-item-actions">
                        <button onclick="editTransaction(${trans.transaction_id})" class="btn btn-edit">Edit</button>
                        <button onclick="deleteTransaction(${trans.transaction_id})" class="btn btn-danger">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        alert('Error loading transactions: ' + error.message);
    }
}

function showAddTransaction() {
    $('add-transaction-form').style.display = 'block';
    $('add-transaction-form').scrollIntoView({ behavior: 'smooth' });
}

function hideAddTransaction() {
    $('add-transaction-form').style.display = 'none';
}

async function createTransaction(event) {
    event.preventDefault();
    if (!currentUser) return alert('Please login first');
    const transactionData = {
        account_id: parseInt(event.target.account_id.value),
        user_id: currentUser.user_id,
        category_id: parseInt(event.target.category_id.value),
        transaction_date: event.target.transaction_date.value,
        amount: parseFloat(event.target.amount.value),
        description: event.target.description.value,
        transaction_type: event.target.transaction_type.value
    };
    try {
        const { ok, data } = await apiCall('/transactions', { method: 'POST', body: JSON.stringify(transactionData) });
        if (ok) {
            alert('Transaction created successfully!');
            event.target.reset();
            hideAddTransaction();
            loadTransactions();
            loadDashboard();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error creating transaction: ' + error.message);
    }
}

async function editTransaction(transactionId) {
    try {
        const { data: transaction } = await apiCall(`/transactions/${transactionId}`);
        const modal = $('edit-modal');
        $('modal-title').textContent = 'Edit Transaction';
        $('modal-body').innerHTML = `
            <form onsubmit="updateTransaction(event, ${transactionId})">
                <div class="form-group">
                    <label>Amount:</label>
                    <input type="number" step="0.01" name="amount" value="${transaction.amount}" required>
                </div>
                <div class="form-group">
                    <label>Description:</label>
                    <input type="text" name="description" value="${transaction.description || ''}">
                </div>
                <div class="form-group">
                    <label>Type:</label>
                    <select name="transaction_type" required>
                        <option value="expense" ${transaction.transaction_type === 'expense' ? 'selected' : ''}>Expense</option>
                        <option value="income" ${transaction.transaction_type === 'income' ? 'selected' : ''}>Income</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Date:</label>
                    <input type="date" name="transaction_date" value="${transaction.transaction_date}" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Update Transaction</button>
                    <button type="button" onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                </div>
            </form>
        `;
        modal.style.display = 'block';
    } catch (error) {
        alert('Error loading transaction: ' + error.message);
    }
}

async function updateTransaction(event, transactionId) {
    event.preventDefault();
    const transactionData = {
        amount: parseFloat(event.target.amount.value),
        description: event.target.description.value,
        transaction_type: event.target.transaction_type.value,
        transaction_date: event.target.transaction_date.value
    };
    try {
        const { ok, data } = await apiCall(`/transactions/${transactionId}`, { method: 'PUT', body: JSON.stringify(transactionData) });
        if (ok) {
            alert('Transaction updated successfully!');
            closeModal();
            loadTransactions();
            loadDashboard();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error updating transaction: ' + error.message);
    }
}

async function deleteTransaction(transactionId) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
        const { ok, data } = await apiCall(`/transactions/${transactionId}`, { method: 'DELETE' });
        if (ok) {
            alert('Transaction deleted successfully!');
            loadTransactions();
            loadDashboard();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error deleting transaction: ' + error.message);
    }
}

// ==================== PROFILE ====================
async function loadProfile() {
    if (!currentUser) return;
    try {
        $('profile-username').textContent = currentUser.username;
        $('profile-email').textContent = currentUser.email;
        
        const [{ data: allTransactions }, { data: allAccounts }] = await Promise.all([
            apiCall('/transactions'),
            apiCall('/accounts')
        ]);
        const userTransactions = filterUserData(allTransactions, currentUser.user_id);
        const userAccounts = filterUserData(allAccounts, currentUser.user_id);
        
        $('profile-transactions').textContent = userTransactions.length;
        $('profile-accounts').textContent = userAccounts.length;
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function showEditProfile() {
    if (!currentUser) return;
    editUser(currentUser.user_id);
}

async function editUser(userId) {
    try {
        const { data: user } = await apiCall(`/users/${userId}`);
        const modal = $('edit-modal');
        $('modal-title').textContent = 'Edit Profile';
        $('modal-body').innerHTML = `
            <form onsubmit="updateUser(event, ${userId})">
                <div class="form-group">
                    <label>Username:</label>
                    <input type="text" name="username" value="${user.username}" required>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" value="${user.email}" required>
                </div>
                <div class="form-group">
                    <label>Password (leave blank to keep current):</label>
                    <input type="password" name="password">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Update Profile</button>
                    <button type="button" onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                </div>
            </form>
        `;
        modal.style.display = 'block';
    } catch (error) {
        alert('Error loading profile: ' + error.message);
    }
}

async function updateUser(event, userId) {
    event.preventDefault();
    const userData = {
        username: event.target.username.value,
        email: event.target.email.value
    };
    if (event.target.password.value) userData.password = event.target.password.value;
    
    try {
        const { ok, data } = await apiCall(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(userData) });
        if (ok) {
            const { data: updatedUser } = await apiCall(`/users/${userId}`);
            currentUser = updatedUser;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            alert('Profile updated successfully!');
            closeModal();
            loadProfile();
            loadDashboard();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error updating profile: ' + error.message);
    }
}

async function loadProfileMonthlySummary() {
    if (!currentUser) return;
    try {
        const { data: results } = await apiCall(`/users/${currentUser.user_id}/monthly-summary`);
        const container = $('profile-monthly-results');
        
        if (results.length === 0) {
            container.innerHTML = '<p class="loading">No data found</p>';
            return;
        }
        
        container.innerHTML = '<table><thead><tr><th>Month</th><th>Total Income</th><th>Total Expenses</th><th>Net Change</th></tr></thead><tbody>' +
            results.map(r => `
                <tr>
                    <td>${r.month_start}</td>
                    <td>$${parseFloat(r.total_income).toFixed(2)}</td>
                    <td>$${parseFloat(r.total_expense).toFixed(2)}</td>
                    <td>$${parseFloat(r.net_change).toFixed(2)}</td>
                </tr>
            `).join('') + '</tbody></table>';
    } catch (error) {
        alert('Error loading monthly summary: ' + error.message);
    }
}

// ==================== DROPDOWNS ====================
async function loadDropdowns() {
    if (!currentUser) return;
    try {
        const [{ data: allAccounts }, { data: categories }] = await Promise.all([
            apiCall('/accounts'),
            apiCall('/categories')
        ]);
        const userAccounts = filterUserData(allAccounts, currentUser.user_id);
        
        $('account-select').innerHTML = userAccounts.map(acc => 
            `<option value="${acc.account_id}">${acc.account_name} (${acc.account_type})</option>`
        ).join('');
        
        $('category-select').innerHTML = categories.map(cat => 
            `<option value="${cat.category_id}">${cat.category_name}</option>`
        ).join('');
    } catch (error) {
        console.error('Error loading dropdowns:', error);
    }
}

// ==================== UTILITY ====================
function closeModal() {
    $('edit-modal').style.display = 'none';
}

window.onclick = event => {
    if (event.target === $('edit-modal')) closeModal();
};
