import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Goal {
  id?: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  progress_percent: number;
  remaining_amount: number;
  status: string;
  priority: string;
  category?: string;
  icon?: string;
  color?: string;
  deadline?: string;
  created_at?: string;
}

export interface GoalTransaction {
  id?: string;
  goal_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description?: string;
  date?: string;
}

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private api = inject(ApiService);

  getAll(status?: string): Observable<Goal[]> {
    return this.api.get<Goal[]>('/api/goals', status ? { status } : undefined);
  }

  get(id: string): Observable<Goal> {
    return this.api.get<Goal>(`/api/goals/${id}`);
  }

  create(data: Partial<Goal>): Observable<Goal> {
    return this.api.post<Goal>('/api/goals', data);
  }

  update(id: string, data: Partial<Goal>): Observable<Goal> {
    return this.api.put<Goal>(`/api/goals/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/api/goals/${id}`);
  }

  addTransaction(goalId: string, data: Partial<GoalTransaction>): Observable<any> {
    return this.api.post(`/api/goals/${goalId}/transactions`, data);
  }

  getTransactions(goalId: string): Observable<GoalTransaction[]> {
    return this.api.get<GoalTransaction[]>(`/api/goals/${goalId}/transactions`);
  }
}