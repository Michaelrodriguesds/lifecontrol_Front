import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Expense {
  id?: string;
  title: string;
  amount: number;
  category_name?: string;
  category_id?: string;
  expense_type: string;
  date: string;
  description?: string;
  tags: string[];
  is_recurring: boolean;
}

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<Expense[]> { return this.api.get<Expense[]>('/expenses', params); }
  create(e: Partial<Expense>): Observable<Expense> { return this.api.post<Expense>('/expenses', e); }
  update(id: string, e: Partial<Expense>): Observable<Expense> { return this.api.put<Expense>(`/expenses/${id}`, e); }
  delete(id: string): Observable<void> { return this.api.delete<void>(`/expenses/${id}`); }
  monthlySummary(year: number): Observable<any> { return this.api.get<any>('/expenses/summary/monthly', { year }); }
}
