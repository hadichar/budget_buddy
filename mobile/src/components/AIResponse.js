function AIResponse(userMessage, userData) {
  const lowerMessage = userMessage.toLowerCase();
  const { accounts, transactions, totalBalance, totalExpenses, totalIncome, expenses, income } = userData;
  
  if (lowerMessage.includes('balance') || lowerMessage.includes('money') || lowerMessage.includes('total')) {
    const accountText = accounts.length === 1 ? 'account' : 'accounts';
    const balanceMessage = totalBalance >= 0 
      ? 'Great job maintaining a positive balance!' 
      : 'Consider reviewing your expenses to improve your balance.';
    return `Your total balance across all accounts is $${totalBalance.toFixed(2)}. You have ${accounts.length} ${accountText}. ${balanceMessage}`;
  }
  
  if (lowerMessage.includes('expense') || lowerMessage.includes('spending') || lowerMessage.includes('spent')) {
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const expenseText = expenses.length === 1 ? 'expense' : 'expenses';
    const warning = totalExpenses > totalIncome 
      ? '⚠️ Your expenses exceed your income. Consider creating a budget to track spending.' 
      : 'Your spending looks manageable compared to your income.';
    return `You have ${expenses.length} ${expenseText} totaling $${totalExpenses.toFixed(2)}. Your average expense is $${avgExpense.toFixed(2)}. ${warning}`;
  }
  
  if (lowerMessage.includes('income') || lowerMessage.includes('earning') || lowerMessage.includes('revenue')) {
    const avgIncome = income.length > 0 ? totalIncome / income.length : 0;
    const incomeText = income.length === 1 ? 'income transaction' : 'income transactions';
    const advice = totalIncome > totalExpenses 
      ? 'Great! You\'re earning more than you spend. Consider saving the difference!' 
      : 'Try to increase your income or reduce expenses to improve your financial health.';
    return `You have ${income.length} ${incomeText} totaling $${totalIncome.toFixed(2)}. Your average income is $${avgIncome.toFixed(2)}. ${advice}`;
  }
  
  if (lowerMessage.includes('budget') || lowerMessage.includes('save') || lowerMessage.includes('saving')) {
    const savings = totalIncome - totalExpenses;
    const savingsMessage = savings > 0 
      ? `You're saving $${savings.toFixed(2)}! Consider setting aside 20% for savings.` 
      : `You're spending $${Math.abs(savings).toFixed(2)} more than you earn. Create a budget to track where your money goes.`;
    return `Based on your data: Income: $${totalIncome.toFixed(2)}, Expenses: $${totalExpenses.toFixed(2)}, Net: $${savings.toFixed(2)}. ${savingsMessage}`;
  }
  
  if (lowerMessage.includes('account') || lowerMessage.includes('accounts')) {
    if (accounts.length === 0) {
      return 'You don\'t have any accounts yet. Add your first bank account to start tracking your finances!';
    }
    const accountInfo = accounts.map(acc => 
      `${acc.account_name} (${acc.account_type}): $${parseFloat(acc.balance || 0).toFixed(2)}`
    ).join(', ');
    const accountText = accounts.length === 1 ? 'account' : 'accounts';
    return `You have ${accounts.length} ${accountText}: ${accountInfo}. Total balance: $${totalBalance.toFixed(2)}.`;
  }
  
  if (lowerMessage.includes('transaction') || lowerMessage.includes('transactions')) {
    const transactionText = transactions.length === 1 ? 'transaction' : 'transactions';
    const expenseText = expenses.length === 1 ? 'expense' : 'expenses';
    const message = transactions.length === 0 
      ? 'Start adding transactions to track your spending and income!' 
      : 'Keep tracking your transactions to understand your spending habits better.';
    return `You have ${transactions.length} total ${transactionText}: ${income.length} income and ${expenses.length} ${expenseText}. ${message}`;
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return 'I can help you with:\n• Your account balances and totals\n• Spending and expense analysis\n• Income tracking\n• Budgeting advice\n• Financial insights\n\nTry asking: "What\'s my balance?", "How much did I spend?", "Give me budgeting tips", or "Analyze my finances"';
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return 'Hello! I\'m your AI financial assistant. I can help you understand your finances, analyze your spending, and provide budgeting tips. What would you like to know?';
  }
  
  return 'I can help you with your finances! Try asking about your balance, expenses, income, or budgeting. Type "help" for more options.';
}

export default AIResponse;
