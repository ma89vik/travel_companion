import type {
  AuthResponse,
  User,
  ChecklistTemplate,
  Checklist,
  Family,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/travel/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(response.token);
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Templates
  async getTemplates(): Promise<ChecklistTemplate[]> {
    return this.request<ChecklistTemplate[]>('/templates');
  }

  async getTemplate(id: string): Promise<ChecklistTemplate> {
    return this.request<ChecklistTemplate>(`/templates/${id}`);
  }

  // Checklists
  async getChecklists(): Promise<Checklist[]> {
    return this.request<Checklist[]>('/checklists');
  }

  async getChecklist(id: string): Promise<Checklist> {
    return this.request<Checklist>(`/checklists/${id}`);
  }

  async createChecklist(templateId: string, name?: string): Promise<Checklist> {
    return this.request<Checklist>('/checklists', {
      method: 'POST',
      body: JSON.stringify({ templateId, name }),
    });
  }

  async toggleItem(checklistId: string, itemId: string, checked: boolean): Promise<void> {
    await this.request(`/checklists/${checklistId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ checked }),
    });
  }

  async deleteChecklist(id: string): Promise<void> {
    await this.request(`/checklists/${id}`, {
      method: 'DELETE',
    });
  }

  async addItem(checklistId: string, name: string, nameEn?: string): Promise<void> {
    await this.request(`/checklists/${checklistId}/items`, {
      method: 'POST',
      body: JSON.stringify({ name, nameEn }),
    });
  }

  async deleteItem(checklistId: string, itemId: string): Promise<void> {
    await this.request(`/checklists/${checklistId}/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Family
  async getFamily(): Promise<{ family: Family | null }> {
    return this.request<{ family: Family | null }>('/family');
  }

  async createFamily(name?: string): Promise<{ family: Family }> {
    return this.request<{ family: Family }>('/family/create', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async joinFamily(code: string): Promise<{ family: Family }> {
    return this.request<{ family: Family }>('/family/join', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async leaveFamily(): Promise<void> {
    await this.request('/family/leave', {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
