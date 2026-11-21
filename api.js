/**
 * CampusFix API Client
 */

const API_BASE = '';

const api = {
  // Token management
  getToken() {
    return localStorage.getItem('cf_token');
  },
  setToken(token) {
    if (token) localStorage.setItem('cf_token', token);
    else localStorage.removeItem('cf_token');
  },
  getUser() {
    const u = localStorage.getItem('cf_user');
    return u ? JSON.parse(u) : null;
  },
  setUser(user) {
    if (user) localStorage.setItem('cf_user', JSON.stringify(user));
    else localStorage.removeItem('cf_user');
  },

  // Headers helper
  getHeaders(contentType = 'application/json') {
    const headers = {};
    if (contentType) headers['Content-Type'] = contentType;
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  },

  // Generic request
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = this.getHeaders(options.contentType);
    delete options.contentType;

    const config = {
      ...options,
      headers: { ...headers, ...(options.headers || {}) }
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error on [${config.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  },

  // Auth Endpoints
  async login(email, password) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    this.setToken(res.token);
    this.setUser(res.user);
    return res;
  },

  async register(userData) {
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: userData
    });
    this.setToken(res.token);
    this.setUser(res.user);
    return res;
  },

  async getMe() {
    if (!this.getToken()) return null;
    try {
      const res = await this.request('/api/auth/me');
      this.setUser(res.user);
      return res.user;
    } catch (e) {
      this.logout();
      return null;
    }
  },

  async getDemoAccounts() {
    return this.request('/api/auth/demo-accounts');
  },

  logout() {
    this.setToken(null);
    this.setUser(null);
  },

  // Complaints Endpoints
  async getComplaints(params = {}) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') {
        qs.append(k, v);
      }
    }
    const queryStr = qs.toString() ? `?${qs.toString()}` : '';
    return this.request(`/api/complaints${queryStr}`);
  },

  async getComplaint(id) {
    return this.request(`/api/complaints/${id}`);
  },

  async createComplaint(complaintData) {
    return this.request('/api/complaints', {
      method: 'POST',
      body: complaintData
    });
  },

  async updateComplaintStatus(id, updateData) {
    return this.request(`/api/complaints/${id}/status`, {
      method: 'PATCH',
      body: updateData
    });
  },

  async upvoteComplaint(id) {
    return this.request(`/api/complaints/${id}/upvote`, {
      method: 'POST'
    });
  },

  async addComment(id, comment) {
    return this.request(`/api/complaints/${id}/comments`, {
      method: 'POST',
      body: { comment }
    });
  },

  async uploadPhoto(imageBase64, filename) {
    return this.request('/api/complaints/upload-photo', {
      method: 'POST',
      body: { image_base64: imageBase64, filename }
    });
  },

  // AI Endpoints
  async analyzeWithAI(title, description, location) {
    return this.request('/api/ai/analyze', {
      method: 'POST',
      body: { title, description, location }
    });
  },

  // Analytics Endpoints
  async getAnalyticsOverview() {
    return this.request('/api/analytics/overview');
  },

  async getAnalyticsCategories() {
    return this.request('/api/analytics/categories');
  },

  async getAnalyticsPriorities() {
    return this.request('/api/analytics/priorities');
  },

  async getAnalyticsHotspots() {
    return this.request('/api/analytics/hotspots');
  }
};

window.cfApi = api;
