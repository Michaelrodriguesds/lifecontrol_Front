// src/app/core/services/work.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CacheService } from './cache.service';

export interface WorkDayData {
  id?:          string;
  date:         string;    // YYYY-MM-DD
  worked:       boolean;
  daily_rate:   number;    // 250 / 230 / 220 — valor da diária escolhido
  fuel_amount:  number;    // valor REAL gasto com combustível
  pnr_amount:   number;
  notes?:       string;
  net_amount?:  number;
}

export interface PeriodSummary {
  days_worked:    number;
  gross:          number;
  fuel_deduction: number;
  pnr_deduction:  number;
  net:            number;
  payment_date:   string;
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
  private http  = inject(HttpClient);
  private cache = inject(CacheService);
  private base  = environment.apiUrl;

  getDays(month: string): Observable<WorkDayData[]> {
    const key    = `work_days_${month}`;
    const cached = this.cache.get<WorkDayData[]>(key);

    if (cached) {
      this.http.get<WorkDayData[]>(`${this.base}/api/work/days`, { params: { month } })
        .pipe(tap(d => this.cache.set(key, d)), catchError(() => of(cached)))
        .subscribe();
      return of(cached);
    }

    return this.http.get<WorkDayData[]>(
      `${this.base}/api/work/days`, { params: { month } }
    ).pipe(tap(d => this.cache.set(key, d)));
  }

  saveDay(data: WorkDayData): Observable<WorkDayData> {
    return this.http.post<WorkDayData>(`${this.base}/api/work/days`, data).pipe(
      tap(() => {
        const month = data.date.substring(0, 7);
        this.cache.invalidate(`work_days_${month}`);
        this.cache.invalidate(`work_summary_${month}`);
      })
    );
  }

  deleteDay(date: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/work/days/${date}`).pipe(
      tap(() => {
        const month = date.substring(0, 7);
        this.cache.invalidate(`work_days_${month}`);
        this.cache.invalidate(`work_summary_${month}`);
      })
    );
  }

  getSummary(month: string): Observable<MonthlySummary> {
    const key    = `work_summary_${month}`;
    const cached = this.cache.get<MonthlySummary>(key);

    if (cached) {
      this.http.get<MonthlySummary>(`${this.base}/api/work/summary`, { params: { month } })
        .pipe(tap(d => this.cache.set(key, d)), catchError(() => of(cached)))
        .subscribe();
      return of(cached);
    }

    return this.http.get<MonthlySummary>(
      `${this.base}/api/work/summary`, { params: { month } }
    ).pipe(tap(d => this.cache.set(key, d)));
  }
}