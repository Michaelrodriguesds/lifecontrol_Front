import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface DashboardData {
  total_spent: number;
  total_invested: number;
  goals_completed: number;
  goals_total: number;
  monthly_spent: number;
  by_category: Record<string, number>;
  monthly_evolution: Record<string, number>;
  upcoming_expenses: any[];
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private api = inject(ApiService);
  getDashboard(): Observable<DashboardData> { return this.api.get<DashboardData>('/analytics/dashboard'); }
}
