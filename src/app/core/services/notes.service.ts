import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Note {
  id?: string;
  title: string;
  content: string;
  note_type: string;
  color?: string;
  tags: string[];
  is_pinned: boolean;
  is_archived?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotesService {
  private api = inject(ApiService);
  getAll(): Observable<Note[]> { return this.api.get<Note[]>('/notes'); }
  create(n: Partial<Note>): Observable<Note> { return this.api.post<Note>('/notes', n); }
  update(id: string, n: Partial<Note>): Observable<Note> { return this.api.put<Note>(`/notes/${id}`, n); }
  delete(id: string): Observable<void> { return this.api.delete<void>(`/notes/${id}`); }
}
