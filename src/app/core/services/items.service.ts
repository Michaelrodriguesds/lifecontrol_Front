// src/app/core/services/items.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Item {
  id?:            string;
  name:           string;
  type:           string;
  description?:   string;
  // ⚠️ PROBLEMA CORRIGIDO:
  // O backend usa "purchase_value" (não "purchase_price").
  // O componente já usava o nome correto, mas o items.service.ts
  // antigo tinha URL errada ("/items" sem o prefixo "/api/").
  purchase_value?: number;
  current_value?:  number;
  purchase_date?:  string;
  brand?:          string;
  model?:          string;
  year?:           number;
  plate?:          string;
  mileage?:        number;
  tags?:           string[];
  is_active?:      boolean;
}

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // "getAll" para compatibilidade com o componente existente
  getAll(): Observable<Item[]> {
    // ⚠️ URL CORRIGIDA: antes estava "/items" (sem /api/), agora "/api/items/"
    return this.http.get<Item[]>(`${this.base}/api/items/`);
  }

  create(data: Partial<Item>): Observable<Item> {
    return this.http.post<Item>(`${this.base}/api/items/`, data);
  }

  update(id: string, data: Partial<Item>): Observable<Item> {
    return this.http.put<Item>(`${this.base}/api/items/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/items/${id}`);
  }
}