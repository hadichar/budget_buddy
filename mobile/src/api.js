// Update this to your computer's IP address when testing on a physical device
// For iOS simulator/Android emulator, use 'localhost' or '10.0.2.2' for Android emulator
// For physical device, use your computer's local IP (e.g., '192.168.1.100')
const API_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // For simulator/emulator
  : 'http://localhost:3000/api';  // Update with your server IP for physical device

async function fetchAPI(endpoint) {
  try {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return { 
      ok: response.ok,
      data: data
    };
  } catch (error) {
    console.error('API Error:', error);
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

export async function login(username, password) {
  try {
    const url = `${API_URL}/login`;
    const requestData = { username: username, password: password };
    const requestBody = JSON.stringify(requestData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    
    const data = await response.json();
    
    return { 
      ok: response.ok,
      data: data
    };
  } catch (error) {
    console.error('Login Error:', error);
    return { 
      ok: false, 
      error: error.message 
    };
  }
}

export async function getUsers() {
  return await fetchAPI('/users');
}

export async function getGoals(userId) {
  try {
    const url = `${API_URL}/goals?user_id=${userId}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return { 
      ok: response.ok,
      data: data
    };
  } catch (error) {
    console.error('Goals API Error:', error);
    return { 
      ok: false, 
      error: error.message 
    };
  }
}
