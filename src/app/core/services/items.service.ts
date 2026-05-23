import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Item {
  id?: string;
  name: string;
  type: string;
  description?: string;
  purchase_value?: number;
  current_value?: number;
  brand?: string;
  model?: string;
  year?: number;
  plate?: string;
  mileage?: number;
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private api = inject(ApiService);
  getAll(): Observable<Item[]> { return this.api.get<Item[]>('/items'); }
  getById(id: string): Observable<Item> { return this.api.get<Item>(`/items/${id}`); }
  create(i: Partial<Item>): Observable<Item> { return this.api.post<Item>('/items', i); }
  update(id: string, i: Partial<Item>): Observable<Item> { return this.api.put<Item>(`/items/${id}`, i); }
  delete(id: string): Observable<void> { return this.api.delete<void>(`/items/${id}`); }
}
