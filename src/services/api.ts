
const API_BASE_URL = '/api';

export async function post(endpoint: string, body: any = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`Mocking POST request to ${endpoint} (Backend not reachable in preview)`);
    // In a real app, we would throw here. For this preview, we might return mock data
    // or let the caller handle the error.
    throw error;
  }
}

export async function get(endpoint: string) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`Mocking GET request to ${endpoint} (Backend not reachable in preview)`);
    throw error;
  }
}

export async function put(endpoint: string, body: any = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`Mocking PUT request to ${endpoint}`);
    throw error;
  }
}

export async function del(endpoint: string) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`Mocking DELETE request to ${endpoint}`);
    throw error;
  }
}
