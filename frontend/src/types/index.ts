export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TemplateItem {
  id: string;
  name: string;
  category: string | null;
  orderIndex: number;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  isDefault: boolean;
  items: TemplateItem[];
  _count?: {
    items: number;
  };
}

export interface ChecklistItemWithState {
  id: string;
  name: string;
  category: string | null;
  orderIndex: number;
  checked: boolean;
  checkedAt: string | null;
  stateId: string | null;
}

export interface ChecklistProgress {
  total: number;
  checked: number;
  percentage: number;
}

export interface Checklist {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  template: {
    id: string;
    name: string;
    icon: string | null;
  };
  items?: ChecklistItemWithState[];
  progress: ChecklistProgress;
  itemStates?: unknown[];
}
