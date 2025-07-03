//
// Core API client for backend integration (OpenAPI-driven).
// Handles JWT storing, refresh, auth checks, and all main app flows.
//
/**
 * PUBLIC_INTERFACE
 * API_BASE_URL - Base URL for backend API.
 * 
 * - Uses REACT_APP_BACKEND_URL from .env if available.
 * - Fallbacks to current running backend container host: https://vscode-internal-3415-beta.beta01.cloud.kavia.ai:3001
 * 
 * To override in development, create a .env file at the project root:
 * 
 *   REACT_APP_BACKEND_URL=https://vscode-internal-3415-beta.beta01.cloud.kavia.ai:3001
 */
export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "https://vscode-internal-2193-beta.beta01.cloud.kavia.ai:3001";

// PUBLIC_INTERFACE
export function getToken() {
  // Get JWT access token from localStorage.
  return localStorage.getItem('access_token');
}

// PUBLIC_INTERFACE
export function setToken(token) {
  // Save the JWT to localStorage for authenticated requests.
  localStorage.setItem('access_token', token);
}

// PUBLIC_INTERFACE
export function clearToken() {
  // Remove auth from storage.
  localStorage.removeItem('access_token');
}

// PUBLIC_INTERFACE
export async function apiFetch(endpoint, opts={}) {
  /**
   * Universal function for backend requests with JWT and error handling.
   * - Throws if request fails.
   * - Handles 401/403 to allow logout or re-login flow.
   *
   * @param endpoint string e.g. "/users/me"
   * @param opts fetch options
   * @returns Promise<parsed response>
   */
  const token = getToken();
  const headers = Object.assign(
    {
      'Accept': 'application/json',
    },
    opts.headers || {},
    token ? { 'Authorization': 'Bearer ' + token } : {},
  );
  let fetchOpts = Object.assign({}, opts, { headers });
  const url = endpoint.startsWith('http') ? endpoint : API_BASE_URL + endpoint;

  let res;
  try {
    res = await fetch(url, fetchOpts);
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        clearToken();
        throw { code: res.status, message: 'Unauthorized. Please log in.' };
      }
      let errBody;
      try { errBody = await res.json(); } catch { /* ignore */ }
      throw {
        code: res.status,
        message: `API error: ${res.status}`,
        error: errBody
      };
    }
    if (res.status === 204) return {};
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return await res.json();
    }
    return await res.text();
  } catch (err) {
    // Re-throw to calling component.
    throw err;
  }
}

// PUBLIC_INTERFACE
export async function login(username, password) {
  /**
   * Authenticate user, store JWT token.
   * Returns user details on success, throws on failure.
   */
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);
  params.append('grant_type', 'password');
  const tokenResp = await apiFetch('/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  setToken(tokenResp.access_token);
  return getCurrentUser();
}

// PUBLIC_INTERFACE
export async function register(userObj) {
  /**
   * Register a new user per OpenAPI spec. Returns user on success.
   * userObj: {email, password, full_name?, role?}
   */
  await apiFetch('/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userObj)
  });
  // After registration, perform login
  return login(userObj.email, userObj.password);
}

// PUBLIC_INTERFACE
export async function getCurrentUser() {
  // Returns the logged-in user profile if authenticated.
  return await apiFetch('/users/me');
}

// PUBLIC_INTERFACE
export async function logout() {
  clearToken();
}

// PUBLIC_INTERFACE
export async function updateUserRole(userId, newRole) {
  // Admin: change another user's role.
  return await apiFetch(`/users/${userId}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_role: newRole })
  });
}

// PUBLIC_INTERFACE
export async function createPet(formData) {
  // Create pet listing. Requires multipart/form-data; formData must be FormData object.
  return await apiFetch('/pets/', {
    method: 'POST',
    body: formData
  });
}

// PUBLIC_INTERFACE
export async function listPets(filters={}) {
  // List/search pets (with all filters).
  const params = new URLSearchParams();
  for (let key in filters) {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  }
  return await apiFetch(`/pets/?${params.toString()}`);
}

// PUBLIC_INTERFACE
export async function getPet(petId) {
  // Get pet detail by id.
  return await apiFetch(`/pets/${petId}`);
}

// PUBLIC_INTERFACE
export async function updatePet(petId, updateObj) {
  // Edit pet listing. updateObj is JSON payload.
  return await apiFetch(`/pets/${petId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateObj)
  });
}

// PUBLIC_INTERFACE
export async function deletePet(petId) {
  // Delete pet listing by id.
  return await apiFetch(`/pets/${petId}`, { method: 'DELETE' });
}

// PUBLIC_INTERFACE
export async function updatePetLocation(petId, lat, lng) {
  // Update a pet's location by id.
  return await apiFetch(`/pets/${petId}/location`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location_lat: lat, location_lng: lng })
  });
}

// PUBLIC_INTERFACE
export async function sendMessage(receiver_id, content) {
  // Send a message (contact/interest etc).
  return await apiFetch('/messages/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiver_id, content })
  });
}

// PUBLIC_INTERFACE
export async function getInbox() {
  // Get user's messages inbox.
  return await apiFetch('/messages/inbox');
}

// PUBLIC_INTERFACE
export async function getFlaggedMessages() {
  // Admin: fetch flagged messages.
  return await apiFetch('/messages/flagged');
}

// PUBLIC_INTERFACE
export async function getAnalytics() {
  // Admin: get analytic stats.
  return await apiFetch('/admin/analytics');
}

// PUBLIC_INTERFACE
export async function flagContent(type, item_id, flagged_reason="") {
  // Admin: flag a content item for review.
  return await apiFetch('/admin/flag_content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, item_id, flagged_reason })
  });
}

// PUBLIC_INTERFACE
export async function getFlaggedContent() {
  // Admin: list all flagged content.
  return await apiFetch('/admin/flagged');
}
