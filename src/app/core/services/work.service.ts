// src/app/core/services/work.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WorkDayData {
  id?:         string;
  date:        string;   // YYYY-MM-DD
  worked:      boolean;
  fueled:      boolean;
  pnr_amount:  number;
  notes?:      string;
  net_amount?: number;
}

export interface PeriodSummary {
  days_worked:    number;
  gross:          number;
  fuel_deduction: number;
  pnr_deduction:  number;
  net:            number;
  payment_date:   string;  // DD/MM/YYYY
}

export interface MonthlySummary {
  month:        string;
  period1:      PeriodSummary;
  period2:      PeriodSummary;
  total_worked: number;
  total_net:    number;
}

@Injectable({ providedIn: 'root' })
export class WorkService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getDays(month: string): Observable<WorkDayData[]> {
    return this.http.get<WorkDayData[]>(
      `${this.base}/api/work/days`, { params: { month } }
    );
  }

  saveDay(data: WorkDayData): Observable<WorkDayData> {
    return this.http.post<WorkDayData>(`${this.base}/api/work/days`, data);
  }

  deleteDay(date: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/work/days/${date}`);
  }

  getSummary(month: string): Observable<MonthlySummary> {
    return this.http.get<MonthlySummary>(
      `${this.base}/api/work/summary`, { params: { month } }
    );
  }
}