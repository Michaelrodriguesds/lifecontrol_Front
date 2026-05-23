import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

// ─── EXPENSES ────────────────────────────────────────────────────────────────
export interface Expense {
  id?: string;
  title: string;
  amount: number;
  category_id?: string;
  category_name?: string;
  description?: string;
  date?: string;
  tags?: string[];
  is_recurring?: boolean;
}

export interface Category {
  id?: string;
  name: string;
  color: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private api = inject(ApiService);

  list(params?: any): Observable<Expense[]> {
    return this.api.get<Expense[]>('/api/expenses', params);
  }

  create(data: Partial<Expense>): Observable<Expense> {
    return this.api.post<Expense>('/api/expenses', data);
  }

  update(id: string, data: Partial<Expense>): Observable<Expense> {
    return this.api.put<Expense>(`/api/expenses/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/api/expenses/${id}`);
  }

  monthlySummary(year?: number): Observable<any[]> {
    return this.api.get<any[]>('/api/expenses/summary/monthly', year ? { year } : undefined);
  }

  categorySummary(): Observable<any[]> {
    return this.api.get<any[]>('/api/expenses/summary/by-category');
  }

  listCategories(): Observable<Category[]> {
    return this.api.get<Category[]>('/api/expenses/categories');
  }

  createCategory(data: Partial<Category>): Observable<Category> {
    return this.api.post<Category>('/api/expenses/categories', data);
  }
}


// ─── NOTES ───────────────────────────────────────────────────────────────────
export interface Note {
  id?: string;
  title: string;
  content?: string;
  type: 'free' | 'markdown' | 'checklist';
  checklist?: { text: string; completed: boolean }[];
  tags?: string[];
  color?: string;
  is_pinned?: boolean;
  reminder_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class NotesService {
  private api = inject(ApiService);

  list(params?: any): Observable<Note[]> {
    return this.api.get<Note[]>('/api/notes', params);
  }

  create(data: Partial<Note>): Observable<Note> {
    return this.api.post<Note>('/api/notes', data);
  }

  update(id: string, data: Partial<Note>): Observable<Note> {
    return this.api.put<Note>(`/api/notes/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/api/notes/${id}`);
  }
}


// ─── ANALYTICS ───────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private api = inject(ApiService);

  dashboard(): Observable<any> {
    return this.api.get<any>('/api/analytics/dashboard');
  }
}


// ─── ITEMS ───────────────────────────────────────────────────────────────────
export interface Item {
  id?: string;
  name: string;
  type: string;
  description?: string;
  purchase_price?: number;
  current_value?: number;
  purchase_date?: string;
  status?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  icon?: string;
  tags?: string[];
}

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private api = inject(ApiService);

  list(): Observable<Item[]> {
    return this.api.get<Item[]>('/api/items');
  }

  create(data: Partial<Item>): Observable<Item> {
    return this.api.post<Item>('/api/items', data);
  }

  update(id: string, data: Partial<Item>): Observable<Item> {
    return this.api.put<Item>(`/api/items/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/api/items/${id}`);
  }
}
