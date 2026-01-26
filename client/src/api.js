const API_URL = 'http://localhost:3000/api';

async function fetchAPI(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    
    const data = await response.json();
    
    return { 
      ok: response.ok,
      data: data
    };
  } catch (error) {
    return { 
      ok: false, 
      error: error.message 
    };
  }
}

export async function getTransactions() {
  return await fetchAPI('/transactions');
}

export async function getAccounts() {
  return await fetchAPI('/accounts');
}

export async function getUsers() {
  return await fetchAPI('/users');
}
