// src/app/core/services/goals.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Goal {
  id?:               string;
  title:             string;
  description?:      string;
  category?:         string;
  target_amount:     number;
  current_amount:    number;
  remaining_amount:  number;
  // ⚠️ PROBLEMA CORRIGIDO:
  // O backend agora usa strings para priority ('low','medium','high','critical')
  // em vez de inteiros (1-5). O frontend já usava strings — agora estão alinhados.
  priority:          'low' | 'medium' | 'high' | 'critical';
  status:            'active' | 'completed' | 'paused' | 'cancelled';
  progress_percent:  number;
  deadline?:         string;
  color?:            string;
  icon?:             string;
  tags?:             string[];
}

export interface Transaction {
  amount:            number;
  // ⚠️ PROBLEMA CORRIGIDO:
  // O componente mandava { type: 'deposit' } mas o backend esperava
  // { transaction_type: 'deposit' }. O service agora faz o mapeamento correto.
  transaction_type:  'deposit' | 'withdrawal';
  description?:      string;
}

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // "getAll" para compatibilidade com o componente existente
  getAll(): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.base}/api/goals/`);
  }

  create(data: Partial<Goal>): Observable<Goal> {
    return this.http.post<Goal>(`${this.base}/api/goals/`, data);
  }

  update(id: string, data: Partial<Goal>): Observable<Goal> {
    return this.http.put<Goal>(`${this.base}/api/goals/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/goals/${id}`);
  }

  addTransaction(goalId: string, tx: {
    amount: number;
    type: 'deposit' | 'withdrawal';
    description?: string;
  }): Observable<any> {
    // Mapeia "type" para "transaction_type" que o backend espera
    const payload: Transaction = {
      amount:           tx.amount,
      transaction_type: tx.type,
      description:      tx.description,
    };
    return this.http.post(`${this.base}/api/goals/${goalId}/transactions`, payload);
  }
}